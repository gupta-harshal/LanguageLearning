from utils.initializer import initializeUser
from utils.reviewer import review
import time
from utils.wordSelector import wordSelector
import random 


results = initializeUser()

print(results["scheduler"])
print(len(results["words"]))
print(results["words"][1])

print(type(results["scheduler"]))
print(type(results["words"]))

selectedWords, results["completed"] = wordSelector([], results["words"])

print("Selected WOrds")
print(selectedWords)

input = []

# solver 
for word in selectedWords:
    input.append({
        "id" : word["id"],
        "clicks" : random.randint(1, 10),
        "time" : random.randint(1, 20),
        "submission" : bool(random.randint(0,1))
    })

print("Input")
print(input)

results = review(results["scheduler"], words=results["words"], results=input)  


# print("Sleeping")
# time.sleep(60)
# print("Back Bitches")
# wordSelector(results["completedWords"], results["words"])

# print(results["scheduler"])
# print(len(results["words"]))
# print(results["completedWords"])

# print(type(results["scheduler"]))
# print(type(results["words"]))