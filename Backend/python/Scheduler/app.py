from utils.initializer import initializeUser
from utils.reviewer import review
from utils.wordSelector import wordSelector
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import schema.initializer as initializeSchema
import schema.reviewer as reviewerSchema
import schema.wordSelector as wordSelectorSchema
import numpy as np

app = FastAPI()

@app.get("/")
def home():
    return JSONResponse(content={"message":"Hello World"}, status_code=200)

@app.get("/health")
def healtcheck():
    return JSONResponse(content={"status" : "OK"}, status_code=200)

@app.post("/initialize", response_model=initializeSchema.Output)
def initialize(data : initializeSchema.Input):
    return JSONResponse(content=initializeUser(data.preference.maximumTime, data.preference.experience), status_code=200)

@app.post("/review", response_model=reviewerSchema.Output)
def review_data(data : reviewerSchema.Input):
    return JSONResponse(content=review(data.scheduler, data.words, data.results), status_code=200)

@app.post("/getCards", response_model=wordSelectorSchema.Output)
def getCards(data : wordSelectorSchema.Input):
    results, completed = wordSelector(data.completed, data.words) 

    for result in results:
        if type(result["furigana"]) != str:
            result["furigana"] = ""
        result["level"] = int(result["level"])
        result["id"] = int(result["id"])
        result["difficulty"] = float(result["difficulty"])

        print(result)

    res = {
        "result" : results,
        "completed" : completed
    }
    return JSONResponse(content=res, status_code=200)