from fsrs import Scheduler, Rating, Card
from datetime import timedelta
import pandas as pd

def initializeUser ():
        
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
        desired_retention = 0.9,
        learning_steps = (timedelta(minutes=1), timedelta(minutes=10)),
        relearning_steps = (timedelta(minutes=5), timedelta(minutes=10)),
        maximum_interval = 36500,
        enable_fuzzing = True,
    )
    
    words = pd.read_csv("data.csv")

    cards = []

    for i, word in words.iterrows():
        cards.append(Card(
            card_id=word["id"],
            difficulty = word["difficulty"]
        ))

    print(words)

    return {"scheduler": Scheduler.to_dict(scheduler), "cards": Card.to_dict(cards)}
