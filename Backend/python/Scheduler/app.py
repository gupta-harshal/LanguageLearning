from utils.initializer import initializeUser
from utils.reviewer import review
import time
from utils.wordSelector import wordSelector
import random 
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
def home():
    return JSONResponse(content={"message":"Hello World"}, status_code=200)

@app.get("/health")
def healtcheck():
    return JSONResponse(content={"status" : "OK"}, status_code=200)

app.post("/")