import os
from pathlib import Path

class PromptLoader:
    def __init__(self, base_dir: str = "prompts"):
        self.base_dir = Path(os.getcwd()) / base_dir

    def load_prompt(self, domain: str, version: str) -> str:
        prompt_path = self.base_dir / domain / f"{version}.md"
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
