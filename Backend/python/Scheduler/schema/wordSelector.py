from pydantic import BaseModel, Field, field_validator
from typing import Dict, Annotated, List
from fsrs import Card

class Input(BaseModel):
    completed : Annotated[List[Dict], Field(title="Dict storing \"id\", \"retrievability\" and \"due\"")]

class Row(BaseModel):
    id : str
    word : str
    meaning : str
    furigana : str
    romaji : str
    level : float
    frequency : float
    difficuly : float

class Output(BaseModel):
    result : List[Row]
    completed : List[Dict] 
