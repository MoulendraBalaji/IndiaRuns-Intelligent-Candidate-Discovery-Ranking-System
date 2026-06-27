import os
from google import genai
from google.genai import types
from pydantic import BaseModel

class GeminiClient:
    def __init__(self, api_key: str = None):
        key = api_key or os.environ.get("GEMINI_API_KEY")
        if not key:
            raise ValueError("GEMINI_API_KEY is not set.")
        self.client = genai.Client(api_key=key)

    async def generate_structured_extraction(
        self, 
        prompt: str, 
        text_input: str, 
        response_schema: type[BaseModel]
    ) -> str:
        """
        Calls Gemini to extract structured JSON based on the provided Pydantic schema.
        """
        full_prompt = f"{prompt}\n\nRESUME TEXT:\n{text_input}"
        
        # We use gemini-2.5-pro for complex extraction if accuracy is paramount, 
        # but gemini-2.5-flash is faster and cheaper for general parsing.
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=full_prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.0, # Deterministic extraction
            ),
        )
        return response.text
