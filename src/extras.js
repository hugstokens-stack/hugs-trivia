// client/src/extras.ts
// 180 new questions across 6 categories, 30 each (6 per difficulty level).
// Id prefixes: band|ad|pop|tech|movie|hist  + difficulty number + serial.

  // ───────────────────────────────── DIFFICULTY 1 (easy) ─────────────────────────────────
  1: [
    // American bands (6)
    { id: "band1-01", q: "Which American band recorded 'Hotel California'?", a: ["eagles", "the eagles"] },
    { id: "band1-02", q: "Which West Coast band sang 'Good Vibrations'?", a: ["the beach boys", "beach boys"] },
    { id: "band1-03", q: "Which New Jersey band sang 'Livin’ on a Prayer'?", a: ["bon jovi"] },
    { id: "band1-04", q: "Which rock band’s mascot is ‘Eddie’?", a: ["iron maiden"] }, // (UK… leave one fun curve)
    { id: "band1-05", q: "Which band popularized 'Sweet Home Alabama'?", a: ["lynyrd skynyrd", "skynyrd"] },
    { id: "band1-06", q: "Which Bay Area band wrote 'American Idiot'?", a: ["green day"] },

    // Old commercials (6)
    { id: "ad1-01", q: "Which brand’s slogan is 'Just Do It'?", a: ["nike"] },
    { id: "ad1-02", q: "'I’m Lovin’ It' is the slogan for which fast-food chain?", a: ["mcdonalds", "mcdonald's"] },
    { id: "ad1-03", q: "Which ad asked 'Got Milk?' ", a: ["got milk", "milk"] },
    { id: "ad1-04", q: "Which candy 'melts in your mouth, not in your hands'?", a: ["m&ms", "m&m's", "m and ms"] },
    { id: "ad1-05", q: "Which paper towel is 'the Quicker Picker Upper'?", a: ["bounty"] },
    { id: "ad1-06", q: "Which chicken chain says 'Finger lickin’ good'?", a: ["kfc", "kentucky fried chicken"] },

    // 60s–90s pop culture (6)
    { id: "pop1-01", q: "What color is Pac-Man?", a: ["yellow"] },
    { id: "pop1-02", q: "Which 1989 Nintendo handheld became a smash hit?", a: ["game boy", "gameboy"] },
    { id: "pop1-03", q: "Which sitcom features the catchphrase 'How you doin’?' ", a: ["friends"] },
    { id: "pop1-04", q: "Which boy band sang 'I Want It That Way' (1999)?", a: ["backstreet boys"] },
    { id: "pop1-05", q: "Which purple dinosaur loved you and me?", a: ["barney"] },
    { id: "pop1-06", q: "Which artist performed the 'Moonwalk' on TV in 1983?", a: ["michael jackson", "jackson"] },

    // Modern technology (6)
    { id: "tech1-01", q: "What does 'AI' stand for?", a: ["artificial intelligence"] },
    { id: "tech1-02", q: "Apple’s mobile operating system is called…", a: ["ios"] },
    { id: "tech1-03", q: "Google’s cloud file storage is called…", a: ["google drive", "drive"] },
    { id: "tech1-04", q: "What does the ‘G’ stand for in 5G?", a: ["generation"] },
    { id: "tech1-05", q: "What wearable counts your steps—Apple ____?", a: ["watch", "apple watch"] },
    { id: "tech1-06", q: "What’s the common name for computer malicious software?", a: ["malware", "virus"] },

    // Movie trivia (6)
    { id: "movie1-01", q: "Who played Forrest Gump?", a: ["tom hanks", "hanks"] },
    { id: "movie1-02", q: "Which 1975 film featured a killer shark?", a: ["jaws"] },
    { id: "movie1-03", q: "In Star Wars, who is Luke’s father?", a: ["darth vader", "vader", "anakin skywalker"] },
    { id: "movie1-04", q: "Which animated film features a talking snowman named Olaf?", a: ["frozen"] },
    { id: "movie1-05", q: "Which film repeated 'There’s no place like home'?", a: ["the wizard of oz", "wizard of oz"] },
    { id: "movie1-06", q: "Which movie series stars a fedora-wearing archaeologist?", a: ["indiana jones"] },

    // U.S. history (6)
    { id: "hist1-01", q: "Who was the first U.S. President?", a: ["george washington", "washington"] },
    { id: "hist1-02", q: "In which year was the Declaration of Independence signed?", a: ["1776"] },
    { id: "hist1-03", q: "Which side was called the North in the U.S. Civil War?", a: ["union"] },
    { id: "hist1-04", q: "Which document begins 'We the People'?", a: ["constitution", "u.s. constitution", "us constitution"] },
    { id: "hist1-05", q: "Which city was the first U.S. capital under the Constitution?", a: ["new york", "new york city", "nyc"] },
    { id: "hist1-06", q: "Which purchase doubled U.S. territory in 1803?", a: ["louisiana purchase"] },
  ],

  // ─────────────────────────────── DIFFICULTY 2 (moderate) ───────────────────────────────
  2: [
    // American bands
    { id: "band2-01", q: "Which band released 'Nevermind' in 1991?", a: ["nirvana"] },
    { id: "band2-02", q: "Which band’s drummer is Dave Grohl (post-Nirvana Foo frontman)?", a: ["nirvana"] },
    { id: "band2-03", q: "Which metal band recorded 'Enter Sandman'?", a: ["metallica"] },
    { id: "band2-04", q: "Which band fused rap and rock in 'Walk This Way' (w/ Run-DMC)?", a: ["aerosmith"] },
    { id: "band2-05", q: "Which Southern rock band wrote 'Ramblin’ Man'?", a: ["the allman brothers band", "allman brothers"] },
    { id: "band2-06", q: "Which band is known for 'Mr. Brightside'?", a: ["the killers", "killers"] },

    // Old commercials
    { id: "ad2-01", q: "Which brand promised 'The Breakfast of Champions'?", a: ["wheaties"] },
    { id: "ad2-02", q: "Which cleaner was pitched by 'Mr. Whipple'?", a: ["charmin"] },
    { id: "ad2-03", q: "Which gum encouraged 'Double your pleasure'?", a: ["doublemint", "wrigley’s doublemint", "wrigleys doublemint"] },
    { id: "ad2-04", q: "Which soft drink asked for 'The Real Thing'?", a: ["coca cola", "coke"] },
    { id: "ad2-05", q: "Which cereal had a tiger saying 'They’re grrreat!'?", a: ["frosted flakes", "kellogg's frosted flakes", "frosted flakes cereal"] },
    { id: "ad2-06", q: "Which snack asks 'Betcha can’t eat just one'?", a: ["lays", "lay's"] },

    // 60s–90s pop culture
    { id: "pop2-01", q: "Which console rivaled Sega Genesis in the early 90s?", a: ["super nintendo", "snes"] },
    { id: "pop2-02", q: "Which TV show starred Will Smith in Bel-Air?", a: ["the fresh prince of bel-air", "fresh prince"] },
    { id: "pop2-03", q: "What device did Sony release as a portable cassette player?", a: ["walkman", "sony walkman"] },
    { id: "pop2-04", q: "Which toy craze featured colorful virtual pets?", a: ["tamagotchi"] },
    { id: "pop2-05", q: "Which 90s website taught us to 'Get off the phone' for dial-up?", a: ["aol", "america online"] },
    { id: "pop2-06", q: "Which 80s film featured a DeLorean time machine?", a: ["back to the future"] },

    // Modern technology
    { id: "tech2-01", q: "What does 'SSD' stand for?", a: ["solid state drive", "solid-state drive"] },
    { id: "tech2-02", q: "Main markup language of the web?", a: ["html"] },
    { id: "tech2-03", q: "Which company makes the Galaxy line of phones?", a: ["samsung"] },
    { id: "tech2-04", q: "What does GPU stand for?", a: ["graphics processing unit"] },
    { id: "tech2-05", q: "Name the voice assistant on Amazon speakers.", a: ["alexa"] },
    { id: "tech2-06", q: "What protocol secures websites (lock icon)?", a: ["https"] },

    // Movie trivia
    { id: "movie2-01", q: "Who directed 'Jurassic Park' (1993)?", a: ["steven spielberg", "spielberg"] },
    { id: "movie2-02", q: "Which 1994 film features 'Zed’s dead, baby'?", a: ["pulp fiction"] },
    { id: "movie2-03", q: "Which film won Best Picture in 1998 about Shakespeare?", a: ["shakespeare in love"] },
    { id: "movie2-04", q: "Which series stars Keanu Reeves as Neo?", a: ["the matrix", "matrix"] },
    { id: "movie2-05", q: "What is the highest-grossing film about a sinking ship (1997)?", a: ["titanic"] },
    { id: "movie2-06", q: "Which Pixar film introduced Woody and Buzz?", a: ["toy story"] },

    // U.S. history
    { id: "hist2-01", q: "Who wrote the Declaration of Independence?", a: ["thomas jefferson", "jefferson"] },
    { id: "hist2-02", q: "Which doctrine warned Europe to stay out of the Americas (1823)?", a: ["monroe doctrine"] },
    { id: "hist2-03", q: "What 1804–06 expedition mapped the West?", a: ["lewis and clark", "lewis & clark"] },
    { id: "hist2-04", q: "Which 19th amendment granted women the vote?", a: ["19th", "nineteenth"] },
    { id: "hist2-05", q: "Who led the Union Army to victory in the Civil War (later President)?", a: ["ulysses s. grant", "grant"] },
    { id: "hist2-06", q: "Which purchase gained Alaska for the U.S.?", a: ["alaska purchase", "sewards folly", "seward's folly"] },
  ],

  // ─────────────────────────────── DIFFICULTY 3 (intermediate) ───────────────────────────────
  3: [
    // American bands
    { id: "band3-01", q: "Which band’s album 'Pet Sounds' influenced the Beatles?", a: ["the beach boys", "beach boys"] },
    { id: "band3-02", q: "Which American band is led by Anthony Kiedis?", a: ["red hot chili peppers", "rhcp"] },
    { id: "band3-03", q: "Which band made 'More Than a Feeling'?", a: ["boston"] },
    { id: "band3-04", q: "Which jam band is famous for 'Truckin’'?", a: ["grateful dead", "the grateful dead", "dead"] },
    { id: "band3-05", q: "Which duo released 'Sound of Silence'?", a: ["simon & garfunkel", "simon and garfunkel"] },
    { id: "band3-06", q: "Which band’s frontman is Axl Rose?", a: ["guns n' roses", "guns n roses", "gnr"] },

    // Old commercials
    { id: "ad3-01", q: "Which brand used the 'Where’s the beef?' catchphrase?", a: ["wendy's", "wendys"] },
    { id: "ad3-02", q: "Which battery brand had a pink bunny mascot (US TV)?", a: ["energizer"] },
    { id: "ad3-03", q: "Which cereal had the 'Cinnamon Toast Crunch' 'taste you can see'?", a: ["cinnamon toast crunch"] },
    { id: "ad3-04", q: "Which beverage teased 'Obey Your Thirst'?", a: ["sprite"] },
    { id: "ad3-05", q: "Which razor brand used 'The Best a Man Can Get'?", a: ["gillette"] },
    { id: "ad3-06", q: "Which car claimed 'The ultimate driving machine'?", a: ["bmw"] },

    // 60s–90s pop culture
    { id: "pop3-01", q: "Which 80s icon starred in 'Like a Virgin' and 'Vogue'?", a: ["madonna"] },
    { id: "pop3-02", q: "Which 90s handheld raised craze for colored monsters traded via link cable?", a: ["pokemon", "pokémon"] },
    { id: "pop3-03", q: "Which sketch show launched Mike Myers and Chris Farley?", a: ["snl", "saturday night live"] },
    { id: "pop3-04", q: "Which 80s show featured the phrase 'I pity the fool'?", a: ["the a-team", "a team", "a-team"] },
    { id: "pop3-05", q: "Which console introduced Mode 7 racing in 'F-Zero'?", a: ["snes", "super nintendo"] },
    { id: "pop3-06", q: "Which channel debuted with 'Video Killed the Radio Star'?", a: ["mtv"] },

    // Modern technology
    { id: "tech3-01", q: "Which company makes the Ryzen line of CPUs?", a: ["amd", "advanced micro devices"] },
    { id: "tech3-02", q: "What does 'API' stand for?", a: ["application programming interface"] },
    { id: "tech3-03", q: "Git command to create a new branch?", a: ["git branch", "git checkout -b", "git switch -c"] },
    { id: "tech3-04", q: "What does 'SSD TRIM' primarily improve?", a: ["performance", "longevity", "wear leveling"] },
    { id: "tech3-05", q: "What wireless standard is 802.11ax better known as?", a: ["wifi 6", "wi-fi 6"] },
    { id: "tech3-06", q: "Which database is known for 'document' storage (JSON-like)?", a: ["mongodb"] },

    // Movie trivia
    { id: "movie3-01", q: "Who directed 'The Dark Knight' trilogy?", a: ["christopher nolan", "nolan"] },
    { id: "movie3-02", q: "Which film features 'There is no spoon'?", a: ["the matrix", "matrix"] },
    { id: "movie3-03", q: "Which 1982 sci-fi film inspired cyberpunk visuals (Deckard)?", a: ["blade runner"] },
    { id: "movie3-04", q: "Which 1995 crime drama starred De Niro and Pacino (LA heist)?", a: ["heat"] },
    { id: "movie3-05", q: "Which Best Picture (1991) featured Hannibal Lecter?", a: ["the silence of the lambs", "silence of the lambs"] },
    { id: "movie3-06", q: "Which film franchise has a golden idol and a rolling boulder scene?", a: ["indiana jones", "raiders of the lost ark"] },

    // U.S. history
    { id: "hist3-01", q: "Which Supreme Court case established judicial review (1803)?", a: ["marbury v. madison", "marbury vs madison", "marbury v madison"] },
    { id: "hist3-02", q: "Which purchase added territory from Spain in 1819?", a: ["adams-onis treaty", "adams onis treaty", "florida cession"] },
    { id: "hist3-03", q: "Who gave the 'I Have a Dream' speech?", a: ["martin luther king jr", "mlk", "martin luther king"] },
    { id: "hist3-04", q: "Which U.S. war included the Battle of the Bulge?", a: ["world war ii", "ww2", "wwii"] },
    { id: "hist3-05", q: "Which scandal led to Nixon’s resignation?", a: ["watergate"] },
    { id: "hist3-06", q: "What 19th-century doctrine opposed European colonization and later justified intervention (variant)?", a: ["roosevelt corollary", "to the monroe doctrine"] },
  ],

  // ─────────────────────────────── DIFFICULTY 4 (hard) ───────────────────────────────
  4: [
    // American bands
    { id: "band4-01", q: "Which band released the 1970s concept album '2112'?", a: ["rush"] }, // (Canadian—trivia twist)
    { id: "band4-02", q: "Which band pioneered 'math rock' with 'Spiderland'?", a: ["slint"] },
    { id: "band4-03", q: "Which NYC band’s debut is 'Is This It'?", a: ["the strokes", "strokes"] },
    { id: "band4-04", q: "Which group recorded 'The Low End Theory'?", a: ["a tribe called quest", "tribe called quest"] },
    { id: "band4-05", q: "Which post-rock band made 'Lift Your Skinny Fists…'?", a: ["godspeed you black emperor", "gy!be", "godspeed you! black emperor"] },
    { id: "band4-06", q: "Which band created 'Yankee Hotel Foxtrot' after a label drop?", a: ["wilco"] },

    // Old commercials
    { id: "ad4-01", q: "Who was the 'Maytag Repairman' known as 'Ol’ Lonely'?", a: ["jesse white", "the maytag repairman", "ol lonely"] },
    { id: "ad4-02", q: "Which cola used the 'Pepsi Challenge' taste test?", a: ["pepsi"] },
    { id: "ad4-03", q: "Which cereal’s ad featured 'Coo-coo for Cocoa Puffs'?", a: ["cocoa puffs"] },
    { id: "ad4-04", q: "Which shaving brand had 'Take it off. Take it all off.' (60s)?", a: ["noxzema"] },
    { id: "ad4-05", q: "What product had 'Ancient Chinese secret, huh?' (Calgon)?", a: ["calgon", "calgon detergent"] },
    { id: "ad4-06", q: "Which camera popularized 'You press the button, we do the rest'?", a: ["kodak"] },

    // 60s–90s pop culture
    { id: "pop4-01", q: "Which artist created the 'Ziggy Stardust' persona?", a: ["david bowie", "bowie"] },
    { id: "pop4-02", q: "Which anime (90s) starred a bounty hunter crew aboard the Bebop?", a: ["cowboy bebop"] },
    { id: "pop4-03", q: "Which 80s RPG series introduced Hyrule and Ganon?", a: ["the legend of zelda", "zelda"] },
    { id: "pop4-04", q: "Which director made 'Blue Velvet' and 'Twin Peaks'?", a: ["david lynch", "lynch"] },
    { id: "pop4-05", q: "Which 90s show featured Agent Cooper in Twin Peaks?", a: ["twin peaks"] },
    { id: "pop4-06", q: "Which 90s singer released 'Jagged Little Pill'?", a: ["alanis morissette", "morissette"] },

    // Modern technology
    { id: "tech4-01", q: "What does CAP in CAP theorem stand for? (comma-separated)", a: ["consistency availability partition tolerance"] },
    { id: "tech4-02", q: "Which company created the CUDA platform?", a: ["nvidia"] },
    { id: "tech4-03", q: "What distributed version-control system predates Git at scale by Linus? (trick)", a: ["none", "trick", "git is the one by linus"] },
    { id: "tech4-04", q: "Which protocol and port does DNS primarily use?", a: ["udp 53", "tcp 53", "udp/tcp 53"] },
    { id: "tech4-05", q: "Name a consensus algorithm used by many blockchains besides PoW.", a: ["pos", "proof of stake", "pbft", "raft", "tendermint"] },
    { id: "tech4-06", q: "What is the asymptotic complexity of quicksort average case?", a: ["o(n log n)", "n log n"] },

    // Movie trivia
    { id: "movie4-01", q: "Who composed the original 'Star Wars' score?", a: ["john williams", "williams"] },
    { id: "movie4-02", q: "Which director is known for long takes in 'Children of Men' & 'Gravity'?", a: ["alfonso cuaron", "cuarón", "cuaron"] },
    { id: "movie4-03", q: "Which 1971 dystopian film featured ultra-violence?", a: ["a clockwork orange", "clockwork orange"] },
    { id: "movie4-04", q: "Which film movement birthed Scorsese, Coppola, De Palma (70s)?", a: ["new hollywood", "american new wave"] },
    { id: "movie4-05", q: "Which director made 'Do the Right Thing'?", a: ["spike lee"] },
    { id: "movie4-06", q: "Which film features 'tears in rain' monologue?", a: ["blade runner"] },

    // U.S. history
    { id: "hist4-01", q: "Which Supreme Court case declared segregation unconstitutional in schools (1954)?", a: ["brown v. board of education", "brown vs board", "brown v board"] },
    { id: "hist4-02", q: "Which 19th-century compromise admitted Missouri as a slave state and Maine free?", a: ["missouri compromise"] },
    { id: "hist4-03", q: "Which rebellion in 1794 protested a federal excise tax?", a: ["whiskey rebellion"] },
    { id: "hist4-04", q: "Which expedition reached the North Pole first (contested)?", a: ["peary", "robert peary"] },
    { id: "hist4-05", q: "Name the 1930s policy intended to combat the Great Depression.", a: ["new deal", "the new deal"] },
    { id: "hist4-06", q: "Which 1846–48 war resulted in the Mexican Cession?", a: ["mexican–american war", "mexican american war"] },
  ],

  // ─────────────────────────────── DIFFICULTY 5 (very hard) ───────────────────────────────
  5: [
    // American bands
    { id: "band5-01", q: "Which experimental band created 'Spiderland' in Louisville (1991)?", a: ["slint"] },
    { id: "band5-02", q: "Which D.C. hardcore band led by Ian MacKaye pre-Fugazi?", a: ["minor threat"] },
    { id: "band5-03", q: "Which collective pioneered alt-country with 'Anodyne' (1993)?", a: ["uncle tupelo"] },
    { id: "band5-04", q: "Which band’s album 'Daydream Nation' is a noise-rock landmark?", a: ["sonic youth"] },
    { id: "band5-05", q: "Which band founded the 'Paisley Underground' sound (LA 80s)?", a: ["the rain parade", "rain parade", "the dream syndicate", "the three o'clock"] },
    { id: "band5-06", q: "Which Athens, GA band fused post-punk & jangle on 'Murmur'?", a: ["r.e.m.", "rem"] },

    // Old commercials
    { id: "ad5-01", q: "Which brand ran 'Mean Joe Greene' jersey toss (1979 Super Bowl ad)?", a: ["coca cola", "coke"] },
    { id: "ad5-02", q: "Which perfume ad asked 'What becomes a legend most?'", a: ["blackglama"] },
    { id: "ad5-03", q: "Which car used the 'Think Small' campaign (DDB, 1959)?", a: ["volkswagen beetle", "vw beetle", "beetle"] },
    { id: "ad5-04", q: "Which agency coined 'The Man in the Hathaway Shirt'?", a: ["ogilvy", "ogilvy & mather"] },
    { id: "ad5-05", q: "Which brand’s 1984 Super Bowl ad introduced the Macintosh?", a: ["apple"] },
    { id: "ad5-06", q: "Which cereal used 'They’re Magically Delicious!'?", a: ["lucky charms"] },

    // 60s–90s pop culture
    { id: "pop5-01", q: "Which 1967 album is subtitled 'or How I Learned to Stop Worrying' by the Monkees?", a: ["headquarters"] },
    { id: "pop5-02", q: "Which director made 'The Last Temptation of Christ' (1988)?", a: ["martin scorsese", "scorsese"] },
    { id: "pop5-03", q: "Which 1995 game console launched with Ridge Racer in Japan?", a: ["sony playstation", "playstation", "ps1", "psx"] },
    { id: "pop5-04", q: "Which 70s show birthed the 'jump the shark' phrase?", a: ["happy days"] },
    { id: "pop5-05", q: "Which artist created the 'Love Symbol' name change in the 90s?", a: ["prince", "the artist formerly known as prince"] },
    { id: "pop5-06", q: "Which anime film by Otomo is set in Neo-Tokyo (1988)?", a: ["akira"] },

    // Modern technology
    { id: "tech5-01", q: "Which database uses the Raft consensus algorithm by default (KV store)?", a: ["etcd", "consul"] },
    { id: "tech5-02", q: "Name the Google paper that inspired MapReduce.", a: ["mapreduce: simplified data processing on large clusters", "mapreduce paper"] },
    { id: "tech5-03", q: "Which algorithm underpins modern transformer attention?", a: ["scaled dot-product attention", "self attention"] },
    { id: "tech5-04", q: "Name the security principle: least ________.", a: ["privilege"] },
    { id: "tech5-05", q: "Name the sharding strategy that keeps keys stable when nodes change.", a: ["consistent hashing"] },
    { id: "tech5-06", q: "What’s the time complexity of Dijkstra’s algorithm with a binary heap?", a: ["o((v + e) log v)", "o(e log v)"] },

    // Movie trivia
    { id: "movie5-01", q: "Who directed 'The Seventh Seal'?", a: ["ingmar bergman", "bergman"] },
    { id: "movie5-02", q: "Which film movement used jump cuts and Godard’s 'Breathless'?", a: ["french new wave", "nouvelle vague"] },
    { id: "movie5-03", q: "Which director made 'Stalker' and 'Andrei Rublev'?", a: ["andrei tarkovsky", "tarkovsky"] },
    { id: "movie5-04", q: "Which 1975 film won Best Picture and featured Nurse Ratched?", a: ["one flew over the cuckoo's nest", "one flew over the cuckoos nest"] },
    { id: "movie5-05", q: "Which script structure alternates multiple storylines in intercut climax (Griffith coined)?", a: ["cross cutting", "parallel editing", "intercutting"] },
    { id: "movie5-06", q: "Which director coined the 'Kuleshov effect' (editing theory)?", a: ["lev kuleshov", "kuleshov"] },

    // U.S. history
    { id: "hist5-01", q: "Which 1832 crisis involved a state attempting to nullify federal tariffs?", a: ["nullification crisis"] },
    { id: "hist5-02", q: "Which Chief Justice wrote McCulloch v. Maryland?", a: ["john marshall", "marshall"] },
    { id: "hist5-03", q: "Which 1913 act created the U.S. central banking system?", a: ["federal reserve act", "the federal reserve act"] },
    { id: "hist5-04", q: "Which WWII program supplied Allies before U.S. entry?", a: ["lend-lease", "lend lease"] },
    { id: "hist5-05", q: "Name the 1947 doctrine pledging aid against communism in Greece/Turkey.", a: ["truman doctrine"] },
    { id: "hist5-06", q: "Which 1965 act outlawed discriminatory voting practices?", a: ["voting rights act", "voting rights act of 1965"] },
  ],
};
