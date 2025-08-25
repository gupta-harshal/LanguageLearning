from pydantic import BaseModel, Field, field_validator
from typing import Dict, Annotated, List
from datetime import timedelta

class _Preference(BaseModel):
    maximumTime : Annotated[timedelta, Field(title="Maximum time that can be alotted to study in one session")]
    experience : Annotated[int, Field(title="Experiencr in japanese")]

    @field_validator("experience")
    @classmethod
    def experienceValidator(cls, value):
        if value > 2 or value < 0:
            raise ValueError("Invalid Experience Input")
        return value
    
    @field_validator("maximumTime", mode="before")
    @classmethod
    def maximumTimeValidator(cls, value):
        if isinstance(value, int) and value in [10, 15, 20]:
            return timedelta(minutes=value)
        raise ValueError("The maximumTime should be an integer and 10 or 15 or 20")

class Input(BaseModel):
    preference : _Preference

class Output(BaseModel):
    scheduler : Annotated[Dict, Field(title="A Scheduler JSON which can be used to define the scheduler")]
    words : Annotated[List[Dict], Field(title="A Card JSON which can be used to define the card")]

