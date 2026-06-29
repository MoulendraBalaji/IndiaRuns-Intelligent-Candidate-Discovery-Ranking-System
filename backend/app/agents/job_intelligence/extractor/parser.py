import logging
import json
from app.schemas.job_extraction import ExtractedJobEntities
from app.schemas.job_document import JobDocument
from app.infrastructure.llm.gemini_client import GeminiClient
from .prompt_loader import PromptLoader

logger = logging.getLogger(__name__)

class JobParser:
    def __init__(self, api_key: str | None = None):
        self.client = GeminiClient(api_key=api_key)
        self.prompt_loader = PromptLoader()

    async def parse(self, document: JobDocument) -> ExtractedJobEntities:
        """
        Orchestrates the extraction of job entities from a JobDocument.
        """
        prompt = self.prompt_loader.load_prompt("job", "v1")
        
        try:
            json_response = await self.client.generate_structured_extraction(
                prompt=prompt,
                text_input=document.raw_text,
                response_schema=ExtractedJobEntities,
                use_cache=True # Enable caching based on JD hash
            )
            
            # The client returns a JSON string, we need to map it to the schema
            data = json.loads(json_response)
            return ExtractedJobEntities(**data)
            
        except Exception as e:
            logger.error(f"Failed to parse job description: {e}")
            raise
