from pydantic import BaseModel, field_validator, Field
from fsrs import Scheduler, Card
from typing import Dict, Annotated, List, Optional
from datetime import datetime
from schema.initializer import Preference
class UserInfo(BaseModel):
    preferences : Preference

class Result(BaseModel):
    id : str
    clicks : int
    time : int
    mouse_movements : Optional[float] = 0.0
    tab_change : Optional[bool] = False
    submission : bool

    @field_validator("id", mode="before")
    @classmethod
    def idConvertor(cls, value):
        if type(value) != str:
            return str(value)

class Input(BaseModel):     
    scheduler : Dict
    completed : Dict
    results : List[Result]
    user : UserInfo

    
class Output(BaseModel):
    completed : Annotated[Dict, Field(title="Dict storing \"id\", \"retrievability\" and \"due\"")]
    scheduler : Annotated[Dict, Field(title="A Scheduler JSON which can be used to define the scheduler")]
    review_logs : Annotated[Dict, Field(title="A JSON which can be used to define the review_logs", description="To be used to optimize after a data set is collected")]