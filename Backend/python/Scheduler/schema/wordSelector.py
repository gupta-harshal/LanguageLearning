from pydantic import BaseModel, Field, field_validator
from typing import Dict, Annotated, List
from schema.reviewer import Completed
from fsrs import Card

class Input(BaseModel):
    completed : Annotated[List[Completed], Field(title="Dict storing \"id\", \"retrievability\" and \"due\"")]
    words : Annotated[Dict, Field(title="the cards json stored in db")]


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
    completed : List[Completed] 
