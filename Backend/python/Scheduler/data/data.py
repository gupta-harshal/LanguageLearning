import pandas as pd

words = pd.DataFrame()

wordsDict = {}

def getWords():
    global words
    global wordsDict
    if words.empty:
        print("Fetching")
        words = pd.read_csv("data/data.csv")
        for i, row in words.iterrows():
            wordsDict[str(row["id"])] = row
    return words
    
def getWordsSorted(column : str):
    global words
    getWords()
    if not column in words.columns:
        raise ValueError("Incorrect column name")
    return words.sort_values("frequency", ascending=False)

def getWordID(id : str):
    global wordsDict
    global words
    getWords()

    # print(wordsDict.keys())
    # print(5808 in wordsDict.keys())


    if id in wordsDict.keys():
        return wordsDict[id]
    else:
        raise ValueError("Invalid ID")

