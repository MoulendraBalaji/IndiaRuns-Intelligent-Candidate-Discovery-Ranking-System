import os
import hashlib
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from pydantic import BaseModel

class GeminiClient:
    """
    Shared Gemini client for all agents. Handles API interaction, 
    rate limiting logic, and simple in-memory caching for deterministic requests.
    """
    # Simple in-memory cache to prevent redundant LLM calls for identical prompts/text
    _cache: Dict[str, str] = {}

    def __init__(self, api_key: str = None):
        self.key = api_key or os.environ.get("GEMINI_API_KEY")
        self.client = None
        if not self.key or self.key in ("mock", "your_gemini_api_key_here"):
            import logging
            logging.getLogger(__name__).warning("GEMINI_API_KEY is not set to a valid key. LLM actions will fail if called.")
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
        """
        if not self.client:
            raise ValueError("Gemini client is not initialized due to missing/invalid API key.")
        if use_cache:
            cache_key = self._generate_cache_key(prompt, text_input, response_schema.__name__)
            if cache_key in self._cache:
                return self._cache[cache_key]
                
        full_prompt = f"{prompt}\n\nTEXT:\n{text_input}"
        
        # We use gemini-2.5-flash for fast structure extraction
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.0, # Deterministic extraction
            ),
        )
        
        if use_cache:
            self._cache[cache_key] = response.text
            
        return response.text
