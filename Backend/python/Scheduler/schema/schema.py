from pydantic import BaseModel, Field, field_validator
from typing import Dict, Annotated
from datetime import timedelta

class _Preference(BaseModel):
    maximumTime : Annotated[timedelta, Field(title="Maximum time that can be alotted to study in one session")]
    frequency : Annotated[int, Field(gt=0, lt=8, title="Number of time practice in week")]
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

class Initialize(BaseModel):
    preference : _Preference

