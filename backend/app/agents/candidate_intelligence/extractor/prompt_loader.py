import os
from pathlib import Path

class PromptLoader:
    def __init__(self, prompts_dir: str | None = None):
        if not prompts_dir:
            # Assume running from backend root, prompts are in app/prompts
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self.prompts_dir = base_dir / "prompts"
        else:
            self.prompts_dir = Path(prompts_dir)

    def load_prompt(self, domain: str, version: str = "v1") -> str:
        """
        Loads a markdown prompt from the prompts directory.
        Example: load_prompt("candidate", "v1") -> loads app/prompts/candidate/v1.md
        """
        prompt_path = self.prompts_dir / domain / f"{version}.md"
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found at {prompt_path}")
        
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
