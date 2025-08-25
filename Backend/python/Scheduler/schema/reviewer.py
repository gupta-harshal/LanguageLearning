from pydantic import BaseModel, field_validator
from fsrs import Scheduler, Card
from typing import Dict
from datetime import datetime

class Completed(BaseModel):
    id : str
    retrievability : float
    due : datetime

class Input(BaseModel):     
    scheduler : Dict
    words : Dict

    @field_validator("scheduler", mode="after")
    @classmethod
    def convertScheduler(cls, value):
        return Scheduler.from_dict(value)
    
    @field_validator("words", mode="after")
    @classmethod
    def convertScheduler(cls, value):
        for key, val in value:
            value[key] = Card.from_dict(val)
        return value

    
class Output(BaseModel):
    completed : Completed