from pydantic import BaseModel, field_validator, Field
from fsrs import Scheduler, Card
from typing import Dict, Annotated, List
from datetime import datetime

class Completed(BaseModel):
    id : str
    retrievability : float
    due : datetime

class Input(BaseModel):     
    scheduler : Dict
    words : Dict
    results : Dict

    
class Output(BaseModel):
    completed : Annotated[List[Completed], Field(title="Dict storing \"id\", \"retrievability\" and \"due\"")]
    scheduler : Annotated[Dict, Field(title="A Scheduler JSON which can be used to define the scheduler")]
    words : Annotated[Dict, Field(title="A Card JSON which can be used to define the card")]
    review_logs : Annotated[Dict, Field(title="A JSON which can be used to define the review_logs", description="To be used to optimize after a data set is collected")]