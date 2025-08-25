from random import randint

words = [
        {
            "id": 5923,
            "word": "縁",
            "meaning": "a means, e.g. of living",
            "furigana": "ふち",
            "romaji": "fuchi",
            "level": 3,
            "frequency": 4.45,
            "difficulty": 5.45
        },
        {
            "id": 1656,
            "word": "教員",
            "meaning": "teaching staff",
            "furigana": "きょういん",
            "romaji": "kyōin",
            "level": 1,
            "frequency": 4.14,
            "difficulty": 8.16
        },
        {
            "id": 5769,
            "word": "で",
            "meaning": "outflow, coming (going) out, graduate (of)",
            "furigana": "",
            "romaji": "de",
            "level": 3,
            "frequency": 7.31,
            "difficulty": 2.5900000000000007
        },
        {
            "id": 2808,
            "word": "し",
            "meaning": "10^24 (kanji is JIS X 0212 kuten 4906); septillion (American); quadrillion (British)",
            "furigana": "",
            "romaji": "shi",
            "level": 1,
            "frequency": 7.22,
            "difficulty": 5.080000000000001
        },
        {
            "id": 151,
            "word": "と",
            "meaning": "1.  if (conjunction); 2.  promoted pawn (shogi) (abbr)",
            "furigana": "",
            "romaji": "to",
            "level": 1,
            "frequency": 7.21,
            "difficulty": 5.090000000000001
        },
        {
            "id": 8196,
            "word": "する",
            "meaning": "to do",
            "furigana": "",
            "romaji": "suru",
            "level": 5,
            "frequency": 6.76,
            "difficulty": 0.7400000000000002
        }
    ]

result = []

"""
id : Words ID,
            clicks : number,
            time : Time taken in seconds, maybe timedelta,
            mouse_movements : ? Distance moved by mouse,
            tab_change : ? Boolean,
            submission : Boolean
    """

print("[")
for word in words:
    print(f"""{"{"}
            \"id\" : {word["id"]},
            \"clicks\" : {randint(1, 5)},
            \"time\" : {randint(10, 30)},
            \"submission\" : {bool(randint(0, 1))}
        {"}"},""")

print("]")