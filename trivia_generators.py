import random
from typing import Tuple, List

# Category names you can show publicly
CATEGORIES = [
    "american_music",
    "pop_culture",
    "old_ads",
]

def get_categories() -> List[str]:
    return CATEGORIES

def generate_question(category: str, level: int) -> Tuple[str, str]:
    """Return (question, answer) for a given category and difficulty 1–5."""
    if category == "american_music":
        return _american_music(level)
    elif category == "pop_culture":
        return _pop_culture(level)
    elif category == "old_ads":
        return _old_ads(level)
    else:
        # fallback if someone passes an unknown category
        return _pop_culture(level)

# ——— American Bands / Music (US-focused) ———
def _american_music(level: int):
    bank = {
        1: [
            ("Which city is known as the birthplace of Motown Records?", "detroit"),
            ("Who sang 'Born in the U.S.A.'?", "bruce springsteen"),
            ("Which US state is Nashville in?", "tennessee"),
        ],
        2: [
            ("What US band recorded 'Hotel California'?", "eagles"),
            ("Who is the 'Queen of Pop' famous for 'Like a Virgin'?", "madonna"),
            ("Which rap group released 'Straight Outta Compton'?", "nwa"),
        ],
        3: [
            ("Which American guitarist is famed for the 1969 Woodstock 'Star-Spangled Banner'?", "jimi hendrix"),
            ("Which band did Dave Grohl form after Nirvana?", "foo fighters"),
            ("Which US city launched the 'grunge' movement?", "seattle"),
        ],
        4: [
            ("Which American singer released the 1971 album 'Blue'?", "joni mitchell"),
            ("Which band’s drummer is Neil Peart’s US counterpart in Rush? Trick: Rush is Canadian—name their American power-trio peer behind 'Tom Sawyer' chart era.", "this is a trick"),
            ("Which American producer pioneered the 'Wall of Sound'?", "phil spector"),
        ],
        5: [
            ("Name the American composer of 'Appalachian Spring'.", "aaron copland"),
            ("Which experimental composer created '4′33″'?", "john cage"),
            ("Who founded Sub Pop Records?", "bruce pavitt"),
        ],
    }
    return random.choice(bank.get(_clamp(level), bank[1]))

# ——— Pop Culture (film/TV/internet/games) ———
def _pop_culture(level: int):
    bank = {
        1: [
            ("What wizarding school does Harry Potter attend?", "hogwarts"),
            ("Which streaming service launched 'Stranger Things'?", "netflix"),
            ("Which Italian plumber is Nintendo’s mascot?", "mario"),
        ],
        2: [
            ("What 1997 film features the quote 'I'm the king of the world!'?", "titanic"),
            ("Which social media app uses 'tweets' historically?", "twitter"),
            ("In 'The Mandalorian', what nickname is given to Grogu?", "baby yoda"),
        ],
        3: [
            ("Which 80s film features the DeLorean time machine?", "back to the future"),
            ("What TV show popularized the 'Central Perk' coffee shop?", "friends"),
            ("Which game series introduced 'Master Chief'?", "halo"),
        ],
        4: [
            ("Which director made 'Pulp Fiction'?", "quentin tarantino"),
            ("What anime features a notebook that can kill anyone?", "death note"),
            ("Which artist created the surprise album 'Lemonade' visual film?", "beyonce"),
        ],
        5: [
            ("Which 1939 film used early three-strip Technicolor to reveal Oz?", "the wizard of oz"),
            ("What 1999 sci-fi film popularized bullet time?", "the matrix"),
            ("Name the creator of 'Twin Peaks'.", "david lynch"),
        ],
    }
    return random.choice(bank.get(_clamp(level), bank[1]))

# ——— Old Advertising / Commercials ———
def _old_ads(level: int):
    bank = {
        1: [
            ("Finish the jingle: 'Like a good neighbor, ____ is there.'", "state farm"),
            ("Which cereal mascot says, 'They’re grrreat!'?", "tony the tiger"),
            ("'Got Milk?' advertised which product?", "milk"),
        ],
        2: [
            ("'Melts in your mouth, not in your hand'—which candy?", "m&ms"),
            ("'Just Do It' is the slogan of which brand?", "nike"),
            ("Which brand used the 'Where’s the beef?' catchphrase?", "wendy's"),
        ],
        3: [
            ("Which razor brand introduced 'The best a man can get'?", "gillette"),
            ("Which camera company popularized 'You press the button, we do the rest'?", "kodak"),
            ("'Plop plop, fizz fizz' advertised what product?", "alka seltzer"),
        ],
        4: [
            ("Which cola used polar bears in winter ads?", "coca cola"),
            ("'Share a Coke' began in which decade? (answer as a decade number like '2010s')", "2010s"),
            ("Who is the animated mascot for Michelin?", "bibendum"),
        ],
        5: [
            ("Which cigarette brand used the 'Torches of Freedom' PR campaign in 1929?", "lucky strike"),
            ("What agency created the 'Think Small' VW Beetle campaign?", "doyle dane bernbach"),
            ("Which detergent claimed to be '99 and 44/100% pure'?", "ivory"),
        ],
    }
    return random.choice(bank.get(_clamp(level), bank[1]))

def _clamp(level: int) -> int:
    return max(1, min(5, int(level)))

