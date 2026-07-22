from pydantic import BaseModel, Field
from typing import Annotated, List, Dict, Any, Union


class Input(BaseModel):
    # Accept either review-style map {id: card} or a list of card dicts
    completed: Annotated[
        Union[Dict[str, Any], List[Dict[str, Any]]],
        Field(default_factory=dict),
    ] = {}


class Row(BaseModel):
    id: Any
    word: str
    meaning: str
    furigana: str = ""
    romaji: str = ""
    level: float | int = 1
    frequency: float = 0
    difficulty: float = 0


class Output(BaseModel):
    result: List[Dict[str, Any]]
    completed: Union[List[Dict[str, Any]], Dict[str, Any]]
