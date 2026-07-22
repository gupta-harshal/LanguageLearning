from utils.initializer import initializeUser
from utils.reviewer import review
from utils.wordSelector import wordSelector
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import schema.initializer as initializeSchema
import schema.reviewer as reviewerSchema
import schema.wordSelector as wordSelectorSchema
import math

app = FastAPI()

def scrub(value):
    """Make pandas / numpy values JSON-safe."""
    if value is None:
        return ""
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return ""
    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass
    return value

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
    return JSONResponse(content=review(data.scheduler, data.completed, data.results, data.user), status_code=200)

@app.post("/getCards", response_model=wordSelectorSchema.Output)
def getCards(data : wordSelectorSchema.Input):
    results, completed = wordSelector(data.completed)

    cleaned = []
    for result in results:
        row = {k: scrub(v) for k, v in dict(result).items()}
        furigana = row.get("furigana", "")
        if not isinstance(furigana, str):
            furigana = "" if furigana is None else str(furigana)
        try:
            level = int(float(row.get("level") or 0))
        except Exception:
            level = 0
        try:
            rid = int(float(row.get("id")))
        except Exception:
            rid = str(row.get("id"))
        try:
            difficulty = float(row.get("difficulty") or 0)
        except Exception:
            difficulty = 0.0
        cleaned.append({
            **row,
            "furigana": furigana,
            "level": level,
            "id": rid,
            "difficulty": difficulty,
            "word": str(row.get("word") or ""),
            "meaning": str(row.get("meaning") or ""),
            "romaji": str(row.get("romaji") or ""),
        })

    res = {
        "result" : cleaned,
        "completed" : completed
    }
    return JSONResponse(content=res, status_code=200)
