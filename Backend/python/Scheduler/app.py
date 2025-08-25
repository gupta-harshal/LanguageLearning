from utils.initializer import initializeUser
from utils.reviewer import review
from utils.wordSelector import wordSelector
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import schema.initializer as init

app = FastAPI()

@app.get("/")
def home():
    return JSONResponse(content={"message":"Hello World"}, status_code=200)

@app.get("/health")
def healtcheck():
    return JSONResponse(content={"status" : "OK"}, status_code=200)

@app.post("/initialize", response_model=init.Output)
def initialize(data : init.Input):
    return JSONResponse(content=initializeUser(experience=data.preference.experience, maxTime=data.preference.maximumTime), status_code=200)

@app.post("/review")
def review():
    pass

@app.post("/getCards")
def getCards():
    pass