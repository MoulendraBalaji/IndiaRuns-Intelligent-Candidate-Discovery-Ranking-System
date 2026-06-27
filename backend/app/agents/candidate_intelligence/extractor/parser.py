import logging
from app.schemas.extraction import ExtractedEntities
from app.schemas.document import ResumeDocument
from app.infrastructure.llm.gemini_client import GeminiClient
from .prompt_loader import PromptLoader
from .response_mapper import ResponseMapper

logger = logging.getLogger(__name__)

class CandidateParser:
    def __init__(self, api_key: str = None):
        self.client = GeminiClient(api_key=api_key)
        self.prompt_loader = PromptLoader()

    async def parse(self, document: ResumeDocument) -> ExtractedEntities:
        """
        Orchestrates the extraction of a Candidate profile from a ResumeDocument.
        """
        prompt = self.prompt_loader.load_prompt("candidate", "v1")
        
        try:
            # We assume the LLM just needs the full raw text for now.
            # In a more advanced implementation, we could pass structured sections if available.
            json_response = await self.client.generate_structured_extraction(
                prompt=prompt,
                text_input=document.raw_text,
                response_schema=ExtractedEntities
            )
            
            entities = ResponseMapper.map_to_schema(json_response, ExtractedEntities)
            return entities
            
        except Exception as e:
            logger.error(f"Failed to parse resume: {e}")
            raise
