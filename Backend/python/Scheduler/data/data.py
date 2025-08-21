import pandas as pd

words = None

def getWords():
    global words
    if words == None:
        words = pd.read_csv("data.csv")
    return words
    
def getWordsSorted(column : str):
    global words
    if words == None:
        words = pd.read_csv("data.csv")
    if not column in words.columns:
        raise ValueError("Incorrect column name")
    return words.sort_values("frequency")