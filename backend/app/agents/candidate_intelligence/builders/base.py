from abc import ABC, abstractmethod
from typing import Any

class Builder(ABC):
    """
    Base contract for all builders.
    Enforces a consistent build -> validate -> serialize lifecycle if needed.
    """
    
    @abstractmethod
    def build(self, *args, **kwargs) -> Any:
        pass
