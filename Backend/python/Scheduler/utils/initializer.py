from fsrs import Scheduler, Rating, Card
from datetime import timedelta
import pandas as pd
from data.data import getWords

def initializeUser (maxTime : timedelta, experience : int):
        
    words = getWords()
    scheduler = Scheduler(
            parameters = (
                0.2172,
                1.1771,
                3.2602,
                16.1507,
                7.0114,
                0.57,
                2.0966,
                0.0069,
                1.5261,
                0.112,
                1.0178,
                1.849,
                0.1133,
                0.3127,
                2.2934,
                0.2191,
                3.0004,
                0.7536,
                0.3332,
                0.1437,
                0.2,
        ),
        desired_retention = 0.95,
        learning_steps = (timedelta(minutes=1), maxTime),
        relearning_steps = (maxTime,),
        maximum_interval = words.shape[0] / 6,
        enable_fuzzing = True,
    )

    cards = {}

    for i, word in words.iterrows():
        cards[word["id"]] = Card.to_dict(Card(
            card_id=word["id"],
            difficulty = max(0, word["difficulty"] - experience * 0.5),
            stability = 0.6 #Add better logic later
        ))

    return {"scheduler": Scheduler.to_dict(scheduler), "words": cards}
