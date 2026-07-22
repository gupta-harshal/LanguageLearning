from fsrs import Card
from datetime import datetime, timezone
from data.data import getWordsSorted
import random


def normalize_completed(completed):
    """Accept review-style dict {id: Card.to_dict()} or a list of card dicts."""
    if completed is None:
        return []
    if isinstance(completed, dict):
        items = []
        for cid, card in completed.items():
            if isinstance(card, dict):
                entry = dict(card)
                entry["id"] = str(cid)
                items.append(entry)
            else:
                items.append({"id": str(cid)})
        return items
    if isinstance(completed, list):
        return completed
    return []


def wordSelector(completed):
    completed_list = normalize_completed(completed)
    completed_id = {str(x.get("id")) for x in completed_list}
    revision = revisedWordSelector(completed_list)
    result = []
    resultID = set()

    frequent_words = getWordsSorted(column="frequency")
    newWordsLimit, randomWordsLimit, revisionLimit = findWordsLimit()

    maxIter = 10
    currIter = 0

    while len(result) < randomWordsLimit and currIter < maxIter:
        i = random.randint(0, len(frequent_words) - 1)
        currIter += 1
        wid = frequent_words.iloc[i]["id"]
        if str(wid) not in completed_id and wid not in resultID:
            result.append(frequent_words.iloc[i].to_dict())
            resultID.add(wid)

    for _, row in frequent_words.iterrows():
        if str(row["id"]) in completed_id or row["id"] in resultID:
            continue
        result.append(row.to_dict())
        resultID.add(row["id"])
        if len(result) - randomWordsLimit >= newWordsLimit:
            break

    result.extend([x for i, x in enumerate(revision) if i < revisionLimit])

    return result, completed_list[revisionLimit:]


def findWordsLimit():
    return 4, 2, 6


def revisedWordSelector(completed: list):
    revision = []
    now = datetime.now(timezone.utc)
    for x in completed:
        try:
            card_dict = {k: v for k, v in x.items() if k != "id"}
            if "due" not in card_dict and "state" not in card_dict:
                continue
            card = Card.from_dict(card_dict)
            if card.due < now:
                revision.append(x)
        except Exception:
            continue
    return revision
