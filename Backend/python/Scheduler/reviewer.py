from fsrs import Scheduler, Card, ReviewLog, Rating, Optimizer
from datetime import datetime, timezone


def review(scheduler_input : dict, words : dict, results : list):
    """
        results: 
        [{
            id : Words ID,
            clicks : number,
            time : Time taken in seconds, maybe timedelta,
            mouse_movements : ? Distance moved by mouse,
            tab_change : ? Boolean,
            submission : Boolean
        }]
    """
    scheduler = Scheduler.from_dict(scheduler_input)
    
    
    completedWords = []
    """
        compltedWords : 
        [{
            id : word ID,
            retrievability : something,
            due : datetime
        }]
    """
    
    review_logs = []
    
    for result in results:
        id = result["id"]
        
        # print(type(id))
        print("")
        
        if result["submission"] == True:
            if result["clicks"] > 5 or result["time"] > 30:
                print("Hard")
                rating = Rating.Hard
            elif result["clicks"] > 3 or result["time"] > 20:
                rating = Rating.Good
                print("Good")
            else:
                print("Easy")
                rating = Rating.Easy
        else:
            rating = Rating.Again
            print("Again")
            
        
        
        card, review_log = scheduler.review_card(Card.from_dict(words[id]), rating)
        
        print(card.due - datetime.now(timezone.utc))
        
        completedWords.append({
            "id" : id,
            "retrievability" : scheduler.get_card_retrievability(card=card),
            "repeat" : card.due - datetime.now(timezone.utc)
        })
        
        review_logs.append(review_log)
        words[id] = Card.to_dict(card)
        
    # optimizer = Optimizer(review_logs)
    
    # optimal_parameter = optimizer.compute_optimal_parameters()
    # optimal_retention = optimizer.compute_optimal_retention(optimal_parameter)
    
    # scheduler = Scheduler(optimal_parameter, optimal_retention)
    
    return {
        "scheduler" : Scheduler.to_dict(scheduler),
        "completedWords"  : completedWords,
        "words" : words,
        "review_logs" : review_logs
    }