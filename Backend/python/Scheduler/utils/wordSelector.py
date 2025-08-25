from fsrs import Scheduler, Card
from datetime import datetime, timezone
from data.data import getWordsSorted, getWordID
import random


def wordSelector(completed : list, words : dict):
    """
    Inputs:
        completed: the dict returned from review, initially []
        words : the Cards of the user
    """
    completed_id = {x["id"] for x in completed}
    revision = revisedWordSelector(completed, words)
    result = []
    resultID = set()

    frequent_words = getWordsSorted(column="frequency")
    newWordsLimit, randomWordsLimit, revisionLimit = findWordsLimit()

    maxIter = 10
    currIter = 0

    while len(result) < randomWordsLimit and currIter < maxIter:
        i = random.randint(0, len(frequent_words) - 1)
        currIter += 1
        id = frequent_words.iloc[i]["id"]
        if id not in completed_id and id not in resultID:
            result.append(frequent_words.iloc[i])
            resultID.add(frequent_words.iloc[i]["id"])

    for i, row in frequent_words.iterrows():
        if row["id"] in completed_id or row["id"] in resultID:
            continue
        else:
            result.append(row)
            resultID.add(row["id"])
            if len(result) - randomWordsLimit >= newWordsLimit:
                break
    
    result.extend([getWordID(x["id"]) for i, x in enumerate(revision) if i < revisionLimit])

    return result, completed[revisionLimit : ]

def findWordsLimit():
    # Add some logic based on level and frequency and last accessed and preference
    return 4, 2, 6

def revisedWordSelector(completed : list, words : dict):
    revision = [x for x in completed if Card.from_dict(words[x["id"]]).due <= datetime.now(timezone.utc)]
    return revision