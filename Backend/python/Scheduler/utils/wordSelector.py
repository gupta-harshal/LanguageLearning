from fsrs import Scheduler, Card
from datetime import datetime, timezone


def wordSelector(completed : list, words : dict):
    completed_id = {x["id"] for x in completed}
    
    revision = revisedWordSelector(completed, words)
      
    newWords = []
    
    
    pass

def revisedWordSelector(completed : list, words : list):
    revision = [x for x in completed if Card.from_dict(words[x["id"]]).due < datetime.now(timezone.utc)]
    return revision