import json
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError

T = TypeVar('T', bound=BaseModel)

class ResponseMapper:
    @staticmethod
    def map_to_schema(json_str: str, schema_class: Type[T]) -> T:
        """
        Takes a JSON string (typically from the LLM) and maps it to a Pydantic schema.
        Raises ValidationError if the output doesn't match the required schema.
        """
        try:
            data = json.loads(json_str)
            return schema_class(**data)
        except json.JSONDecodeError as e:
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except ValidationError as e:
            raise ValueError(f"LLM JSON does not match schema {schema_class.__name__}: {e}")
