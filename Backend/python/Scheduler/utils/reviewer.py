from fsrs import Scheduler, Card, ReviewLog, Rating, Optimizer
from datetime import datetime, timezone
from data.data import getWordID

def review(scheduler_input : dict, completed : dict, results : list, user):
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
        print(result)
        id = result.id
        
        # print(type(id))
        print("\n")
        
        if result.submission == True:
            if result.clicks > 5 or result.time > 30:
                print("Hard")
                rating = Rating.Hard
            elif result.clicks > 3 or result.time > 20:
                rating = Rating.Good
                print("Good")
            else:
                print("Easy")
                rating = Rating.Easy
        else:
            rating = Rating.Again
            print("Again")
            
        print(completed)
        print(completed.keys())
        if id not in completed.keys():
            new_word = getWordID(id=id)
            new_Card = Card(
                card_id=new_word["id"],
                difficulty = max(0, new_word["difficulty"] - user.preferences.experience * 0.5),
                stability = 0.6 #Add better logic later
            )

            completed[id] = Card.to_dict(new_Card)

        card, review_log = scheduler.review_card(Card.from_dict(completed[id]), rating)
        
        print(card.due - datetime.now(timezone.utc))
        print(f"Retrievability : {scheduler.get_card_retrievability(card=card, current_datetime=card.due)}")
        
        # completedWords.append({
        #     "id" : id,
        #     "retrievability" : scheduler.get_card_retrievability(card=card, current_datetime=card.due),
        #     "due" : str(card.due)
        # })
        
        review_logs.append(review_log.to_dict())
        
    # optimizer = Optimizer(review_logs)
    
    # optimal_parameter = optimizer.compute_optimal_parameters()
    # optimal_retention = optimizer.compute_optimal_retention(optimal_parameter)
    
    # scheduler = Scheduler(optimal_parameter, optimal_retention)
    
    return {
        "scheduler" : Scheduler.to_dict(scheduler),
        # "completedWords"  : completedWords,
        "completed" : completed,
        "review_logs" : review_logs
    }