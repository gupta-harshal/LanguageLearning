from initializer import initializeUser
from reviewer import review
import time
from wordSelector import wordSelector


results = initializeUser()

print(results["scheduler"])
print(len(results["words"]))
print(results["words"][1])

print(type(results["scheduler"]))
print(type(results["words"]))

results = review(results["scheduler"], words=results["words"], results=[
    {
        "id" : 1,
        "clicks" : 10,
        "time" : 23,
        "submission" : False
    }, {
        "id" : 2,
        "clicks" : 2,
        "time" : 15,
        "submission" : True
    }, {
        "id" : 3,
        "clicks" : 2,
        "time" : 40,
        "submission" : False
    }, {
        "id" : 4,
        "clicks" : 1,
        "time" : 10,
        "submission" : True
    }, {
        "id" : 5,
        "clicks" : 2,
        "time" : 21,
        "submission" : True
    }, {
        "id" : 6,
        "clicks" : 6,
        "time" : 8,
        "submission" : True
    }
])  


# print("Sleeping")
# time.sleep(60)
# print("Back Bitches")
# wordSelector(results["completedWords"], results["words"])

# print(results["scheduler"])
# print(len(results["words"]))
# print(results["completedWords"])

# print(type(results["scheduler"]))
# print(type(results["words"]))