import os
import json
import hashlib
import logging
import typing
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from enum import Enum
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class MockModels:
    def generate_content(self, model: str, contents: str, config: Optional[Any] = None) -> Any:
        class MockResponse:
            def __init__(self, text: str):
                self.text = text
        
        # Conversational fallback answer for Recruiter Copilot
        ans = (
            "Based on the analysis, candidate John Doe has a strong alignment with the Machine Learning Engineer role. "
            "They possess Stanford education and 3+ years of experience with Python, PyTorch, and NLP. "
            "Their deterministic fit scores are high (Technical Fit: 0.85, Domain Fit: 0.80)."
        )
        return MockResponse(ans)

class MockClient:
    def __init__(self):
        self.models = MockModels()

def generate_mock_data(schema: type[BaseModel]) -> dict:
    """
    Recursively introspects a Pydantic schema to generate schema-valid high-fidelity mock data.
    """
    mock_dict = {}
    for name, field in schema.model_fields.items():
        annotation = field.annotation
        
        # Handle Union / Optional (e.g. str | None or Optional[str])
        origin = getattr(annotation, "__origin__", None)
        args = getattr(annotation, "__args__", None)
        
        if origin is typing.Union or (hasattr(typing, "_UnionGenericAlias") and isinstance(annotation, typing._UnionGenericAlias)) or (hasattr(types, "UnionType") and isinstance(annotation, types.UnionType)):
            non_none_args = [arg for arg in args if arg is not type(None)]
            if non_none_args:
                annotation = non_none_args[0]
                origin = getattr(annotation, "__origin__", None)
                args = getattr(annotation, "__args__", None)
        
        if isinstance(annotation, type) and issubclass(annotation, BaseModel):
            mock_dict[name] = generate_mock_data(annotation)
        elif origin is list:
            item_type = args[0] if args else str
            if isinstance(item_type, type) and issubclass(item_type, BaseModel):
                mock_dict[name] = [generate_mock_data(item_type)]
            elif item_type == str:
                if "skill" in name.lower():
                    mock_dict[name] = ["Python", "PyTorch", "Machine Learning", "FastAPI", "NLP"]
                elif "strength" in name.lower():
                    mock_dict[name] = ["Strong technical core", "Solid hands-on projects"]
                elif "weakness" in name.lower():
                    mock_dict[name] = ["Could improve direct domain expertise"]
                else:
                    mock_dict[name] = [f"Mock {name} Item"]
            elif item_type == int:
                mock_dict[name] = [2021]
            elif item_type == float:
                mock_dict[name] = [0.8]
            else:
                mock_dict[name] = []
        elif origin is dict:
            val_type = args[1] if (args and len(args) > 1) else str
            if isinstance(val_type, type) and issubclass(val_type, BaseModel):
                mock_dict[name] = {
                    "technical_fit": generate_mock_data(val_type),
                    "experience_fit": generate_mock_data(val_type),
                    "behavior_fit": generate_mock_data(val_type)
                }
            else:
                mock_dict[name] = {"key": "value"}
        elif annotation == str:
            if name == "first_name":
                mock_dict[name] = "Ira"
            elif name == "last_name":
                mock_dict[name] = "Vora"
            elif name == "email":
                mock_dict[name] = "candidate@example.com"
            elif "summary" in name.lower() or "description" in name.lower() or "reasoning" in name.lower():
                mock_dict[name] = "The candidate shows exceptional alignment with technical engineering requirements."
            elif name == "title":
                mock_dict[name] = "Senior Machine Learning Engineer"
            elif name == "company":
                mock_dict[name] = "AI Recruiter Co"
            elif name == "degree":
                mock_dict[name] = "Master of Science in Computer Science"
            elif name == "institution":
                mock_dict[name] = "Stanford University"
            elif name == "category":
                mock_dict[name] = "technical_skill"
            elif name == "priority":
                mock_dict[name] = "mandatory"
            else:
                mock_dict[name] = f"Mock {name}"
        elif isinstance(annotation, type) and issubclass(annotation, Enum):
            mock_dict[name] = list(annotation)[0].value
        elif annotation == int:
            mock_dict[name] = 3
        elif annotation == float:
            mock_dict[name] = 0.85
        elif annotation == bool:
            mock_dict[name] = True
        else:
            mock_dict[name] = None
            
    return mock_dict

class GeminiClient:
    """
    Shared Gemini client for all agents. Handles API interaction, 
    rate limiting logic, and simple in-memory caching for deterministic requests.
    Supports local mock fallback if API key is missing.
    """
    _cache: Dict[str, str] = {}

    def __init__(self, api_key: str | None = None):
        self.key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = None
        self.is_mock = False
        
        if not self.key or self.key in ("mock", "your_gemini_api_key_here"):
            logger.warning("GEMINI_API_KEY is not set to a valid key. Initializing Mock Client fallback.")
            self.client = MockClient()
            self.is_mock = True
        else:
            self.client = genai.Client(api_key=self.key)

    def _generate_cache_key(self, prompt: str, text: str, schema_name: str) -> str:
        content = f"{prompt}|{text}|{schema_name}"
        return hashlib.sha256(content.encode()).hexdigest()

    async def generate_structured_extraction(
        self, 
        prompt: str, 
        text_input: str, 
        response_schema: type[BaseModel],
        use_cache: bool = True
    ) -> str:
        """
        Calls Gemini to extract structured JSON based on the provided Pydantic schema.
        Falls back to local mock data generation if client is mock.
        """
        if self.is_mock:
            mock_data = generate_mock_data(response_schema)
            return json.dumps(mock_data)
            
        if use_cache:
            cache_key = self._generate_cache_key(prompt, text_input, response_schema.__name__)
            if cache_key in self._cache:
                return self._cache[cache_key]
                
        full_prompt = f"{prompt}\n\nTEXT:\n{text_input}"
        
        # Convert Pydantic model to json schema and resolve refs to build a flat schema dict
        schema_dict = response_schema.model_json_schema()
        
        def dereference_schema(schema, defs=None):
            if defs is None:
                defs = schema.get("$defs", {})
            if isinstance(schema, dict):
                if "$ref" in schema:
                    ref_path = schema["$ref"]
                    ref_name = ref_path.split("/")[-1]
                    ref_schema = dict(defs[ref_name])
                    resolved = dereference_schema(ref_schema, defs)
                    schema.pop("$ref")
                    schema.update(resolved)
                else:
                    for key, value in list(schema.items()):
                        schema[key] = dereference_schema(value, defs)
            elif isinstance(schema, list):
                for i, item in enumerate(schema):
                    schema[i] = dereference_schema(item, defs)
            if isinstance(schema, dict) and "$defs" in schema:
                schema.pop("$defs")
            return schema

        def strip_additional_properties(schema):
            if isinstance(schema, dict):
                schema.pop("additionalProperties", None)
                for key, value in list(schema.items()):
                    strip_additional_properties(value)
            elif isinstance(schema, list):
                for item in schema:
                    strip_additional_properties(item)

        dereference_schema(schema_dict)
        strip_additional_properties(schema_dict)
        
        # Instantiate standard google-genai types.Schema from stripped dict
        api_schema = types.Schema.model_validate(schema_dict)
        
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=api_schema,
                temperature=0.0,
            ),
        )
        
        if use_cache:
            self._cache[cache_key] = response.text
            
        return response.text
