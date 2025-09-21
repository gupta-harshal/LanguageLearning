from utils.initializer import initializeUser
from utils.reviewer import review
from datetime import timedelta, datetime

avgInit = 0.0
avgReview = 0.0

reps = 100


for i in range(reps):
    now = datetime.now()
    results = initializeUser()
    end = datetime.now()
    avgInit += (end - now).total_seconds()
    print(f"Time Elapsed Init {(end - now).total_seconds()}")

    # print(results["scheduler"])
    # print(len(results["words"]))
    # print(results["words"][1])

    # print(type(results["scheduler"]))
    # print(type(results["words"]))


    now = datetime.now()

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
    end = datetime.now()
    avgReview = (end - now).total_seconds()
    print(f"Time Elapsed Review {(end - now).total_seconds()}")


print(f"Init = {avgInit / reps}")
print(f"Review = {avgReview / reps}")

    # print(results["scheduler"])
    # print(len(results["words"]))
    # print(results["completedWords"])

    # print(type(results["scheduler"]))
    # print(type(results["words"]))