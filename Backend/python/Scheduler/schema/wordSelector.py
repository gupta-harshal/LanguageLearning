from pydantic import BaseModel, Field, field_validator
from typing import Dict, Annotated, List
from datetime import timedelta
from schema.reviewer import Completed

class Input(BaseModel):
    completed : Completed