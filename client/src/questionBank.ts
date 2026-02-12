// client/src/questionBank.ts 
// Minimal, real questions; scales difficulty; guarantees NO repeats across play.
// If you later load bigger banks, just extend BANK[difficulty] arrays.
// @ts-ignore
console.log("EXTRAS PATH TEST");

// ⬇️ NEW: import the 180-question add-on set
import { EXTRA_BANK } from "./extras";


export type QA = { id: string; q: string; a: string | string[] };

export const PER_ROUND = 7;
export const QUESTION_SECONDS = 22;

// Difficulty mapping over 100 levels:
//  1–20 -> d1, 21–40 -> d2, 41–60 -> d3, 61–80 -> d4, 81–100 -> d5
export function levelToDifficulty(level: number) {
  return Math.min(5, Math.max(1, Math.ceil(level / 20)));
}

/** ------------------------------------------------------------------------
 *  BANK: at least 30 items per difficulty to start (expand anytime).
 *  IDs must be unique within each difficulty.
 *  You can freely extend these arrays; the no-repeat logic works automatically.
 *  ------------------------------------------------------------------------ */
const BANK: Record<number, QA[]> = {
  1: [
    { id: "1-001", q: "What color is the sky on a clear day?", a: "blue" },
    { id: "1-002", q: "How many days are in a week?", a: ["7", "seven"] },
    { id: "1-003", q: "What is 2 + 3?", a: ["5", "five"] },
    { id: "1-004", q: "What is the capital of the United States?", a: ["washington dc", "washington, dc", "dc"] },
    { id: "1-005", q: "Which animal says “meow”?", a: ["cat"] },
    { id: "1-006", q: "What do bees make?", a: "honey" },
    { id: "1-007", q: "What planet do we live on?", a: "earth" },
    { id: "1-008", q: "What season comes after spring?", a: "summer" },
    { id: "1-009", q: "How many letters are in the English alphabet?", a: ["26", "twenty six", "twenty-six"] },
    { id: "1-010", q: "What color are stop signs?", a: "red" },
    { id: "1-011", q: "What is H2O commonly called?", a: ["water"] },
    { id: "1-012", q: "What device do you use to call someone?", a: ["phone", "telephone", "cell phone", "cellphone"] },
    { id: "1-013", q: "What is the opposite of ‘up’?", a: "down" },
    { id: "1-014", q: "What is 10 − 7?", a: ["3", "three"] },
    { id: "1-015", q: "How many wheels does a bicycle have?", a: ["2", "two"] },
    { id: "1-016", q: "What gas do humans need to breathe?", a: ["oxygen", "o2"] },
    { id: "1-017", q: "What do cows drink when they’re calves?", a: ["milk"] },
    { id: "1-018", q: "What day comes after Friday?", a: "saturday" },
    { id: "1-019", q: "What shape has three sides?", a: ["triangle"] },
    { id: "1-020", q: "What fruit keeps the doctor away (per the saying)?", a: ["apple"] },
    { id: "1-021", q: "What do you call frozen water?", a: ["ice"] },
    { id: "1-022", q: "What is 4 × 3?", a: ["12", "twelve"] },
    { id: "1-023", q: "What is the opposite of ‘hot’?", a: "cold" },
    { id: "1-024", q: "What animal is the ‘King of the Jungle’?", a: "lion" },
    { id: "1-025", q: "Which month has 28 days (trick)?", a: ["all", "every month", "all months"] },
    { id: "1-026", q: "What’s the first month of the year?", a: "january" },
    { id: "1-027", q: "What is the color of grass?", a: "green" },
    { id: "1-028", q: "How many minutes are in an hour?", a: ["60", "sixty"] },
    { id: "1-029", q: "What do you wear on your feet?", a: ["shoes", "sneakers", "boots"] },
    { id: "1-030", q: "What’s 9 − 4?", a: ["5", "five"] },
  ],
  2: [
    { id: "2-001", q: "Who wrote 'Harry Potter'?", a: ["jk rowling", "j. k. rowling", "rowling"] },
    { id: "2-002", q: "Which ocean is off the California coast?", a: ["pacific", "pacific ocean"] },
    { id: "2-003", q: "What is the largest planet in our solar system?", a: ["jupiter"] },
    { id: "2-004", q: "What is 15 × 3?", a: ["45", "forty five", "forty-five"] },
    { id: "2-005", q: "Which state is nicknamed the ‘Sunshine State’?", a: "florida" },
    { id: "2-006", q: "What do we call molten rock after it erupts from a volcano?", a: ["lava"] },
    { id: "2-007", q: "What gas do plants absorb that humans exhale?", a: ["carbon dioxide", "co2"] },
    { id: "2-008", q: "What is the longest bone in the human body?", a: ["femur", "thigh bone"] },
    { id: "2-009", q: "How many continents are there?", a: ["7", "seven"] },
    { id: "2-010", q: "What is the chemical symbol for gold?", a: ["au"] },
    { id: "2-011", q: "Who painted the Mona Lisa?", a: ["leonardo da vinci", "da vinci"] },
    { id: "2-012", q: "What’s the square root of 81?", a: ["9", "nine"] },
    { id: "2-013", q: "What is the fastest land animal?", a: ["cheetah"] },
    { id: "2-014", q: "Who is known as the ‘Father of Computers’ (first concept)?", a: ["charles babbage", "babbage"] },
    { id: "2-015", q: "Which country gifted the Statue of Liberty to the U.S.?", a: ["france"] },
    { id: "2-016", q: "What is the capital of Japan?", a: ["tokyo"] },
    { id: "2-017", q: "How many degrees in a right angle?", a: ["90", "ninety"] },
    { id: "2-018", q: "Which element has atomic number 1?", a: ["hydrogen", "h"] },
    { id: "2-019", q: "What is the tallest mountain on Earth?", a: ["mount everest", "everest"] },
    { id: "2-020", q: "What organ pumps blood through the body?", a: ["heart"] },
    { id: "2-021", q: "What’s the largest ocean on Earth?", a: ["pacific", "pacific ocean"] },
    { id: "2-022", q: "What country is home to the kangaroo?", a: ["australia"] },
    { id: "2-023", q: "Which instrument has 88 keys?", a: ["piano"] },
    { id: "2-024", q: "What year did the Titanic sink? (nearest decade ok)", a: ["1912", "1910s", "1910"] },
    { id: "2-025", q: "What do you call a baby goat?", a: ["kid"] },
    { id: "2-026", q: "Who discovered penicillin?", a: ["alexander fleming", "fleming"] },
    { id: "2-027", q: "Which planet is known as the Red Planet?", a: ["mars"] },
    { id: "2-028", q: "Which language has the most native speakers?", a: ["mandarin", "mandarin chinese", "chinese"] },
    { id: "2-029", q: "What is 144 ÷ 12?", a: ["12", "twelve"] },
    { id: "2-030", q: "What do bees collect from flowers to make honey?", a: ["nectar"] },
  ],
  3: [
    { id: "3-001", q: "In music, how many notes are in a standard major scale?", a: ["7", "seven"] },
    { id: "3-002", q: "What is the powerhouse of the cell?", a: ["mitochondria", "mitochondrion"] },
    { id: "3-003", q: "Who developed the theory of general relativity?", a: ["albert einstein", "einstein"] },
    { id: "3-004", q: "Which U.S. amendment grants freedom of speech?", a: ["first", "1st", "amendment 1"] },
    { id: "3-005", q: "What is the capital of Canada?", a: ["ottawa"] },
    { id: "3-006", q: "In computing, what does ‘CPU’ stand for?", a: ["central processing unit"] },
    { id: "3-007", q: "Which metal is liquid at room temperature?", a: ["mercury"] },
    { id: "3-008", q: "In what year did World War II end?", a: ["1945"] },
    { id: "3-009", q: "What is the derivative of x²?", a: ["2x"] },
    { id: "3-010", q: "Who wrote ‘1984’?", a: ["george orwell", "orwell"] },
    { id: "3-011", q: "Which country hosted the 2016 Summer Olympics?", a: ["brazil"] },
    { id: "3-012", q: "What’s the capital of Switzerland?", a: ["bern", "berne"] },
    { id: "3-013", q: "Which element has the chemical symbol ‘Na’?", a: ["sodium"] },
    { id: "3-014", q: "In finance, what does ‘ROI’ stand for?", a: ["return on investment"] },
    { id: "3-015", q: "What is the longest river in Africa?", a: ["nile", "the nile"] },
    { id: "3-016", q: "Which composer wrote the ‘Moonlight Sonata’?", a: ["beethoven", "ludwig van beethoven"] },
    { id: "3-017", q: "What country’s flag is known as the Union Jack?", a: ["united kingdom", "uk", "great britain", "britain"] },
    { id: "3-018", q: "What gas is released by baking soda with vinegar?", a: ["carbon dioxide", "co2"] },
    { id: "3-019", q: "Who painted ‘Starry Night’?", a: ["vincent van gogh", "van gogh"] },
    { id: "3-020", q: "How many bits are in a byte?", a: ["8", "eight"] },
    { id: "3-021", q: "Which U.S. state has the most electoral votes?", a: ["california"] },
    { id: "3-022", q: "What is 11 × 13?", a: ["143", "one hundred forty three", "one hundred forty-three"] },
    { id: "3-023", q: "Which organ filters blood in the human body?", a: ["kidneys", "kidney"] },
    { id: "3-024", q: "What’s the chemical formula for table salt?", a: ["nacl", "na cl"] },
    { id: "3-025", q: "What is the capital of South Korea?", a: ["seoul"] },
    { id: "3-026", q: "Which ancient wonder stood in Babylon?", a: ["hanging gardens", "hanging gardens of babylon"] },
    { id: "3-027", q: "What is the smallest prime number?", a: ["2", "two"] },
    { id: "3-028", q: "Who discovered gravity (famous apple story)?", a: ["isaac newton", "newton"] },
    { id: "3-029", q: "Which artist is known for the Campbell’s Soup Cans?", a: ["andy warhol", "warhol"] },
    { id: "3-030", q: "In anatomy, what is the clavicle commonly called?", a: ["collarbone", "collar bone"] },
  ],
  4: [
    { id: "4-001", q: "What is the integral of 2x dx?", a: ["x^2", "x²", "x2"] },
    { id: "4-002", q: "Which country uses the won (₩) currency besides South Korea?", a: ["north korea", "dprk"] },
    { id: "4-003", q: "Who formulated the laws of planetary motion?", a: ["johannes kepler", "kepler"] },
    { id: "4-004", q: "In CS, what does ‘ACID’ stand for (databases)?", a: ["atomicity consistency isolation durability"] },
    { id: "4-005", q: "Which enzyme breaks down starch into sugars?", a: ["amylase"] },
    { id: "4-006", q: "Name the world’s deepest ocean trench.", a: ["mariana trench", "the mariana trench"] },
    { id: "4-007", q: "What is the capital of New Zealand?", a: ["wellington"] },
    { id: "4-008", q: "Who composed ‘The Rite of Spring’?", a: ["igor stravinsky", "stravinsky"] },
    { id: "4-009", q: "What law relates current, voltage, resistance?", a: ["ohm's law", "ohms law", "ohm law"] },
    { id: "4-010", q: "Which particle mediates the electromagnetic force?", a: ["photon"] },
    { id: "4-011", q: "Which author created Sherlock Holmes?", a: ["arthur conan doyle", "conan doyle", "doyle"] },
    { id: "4-012", q: "In which city is the Uffizi Gallery?", a: ["florence", "firenze"] },
    { id: "4-013", q: "What is the Heisenberg principle about?", a: ["uncertainty", "uncertainty principle"] },
    { id: "4-014", q: "What does the ‘S’ stand for in HTTPS?", a: ["secure", "security"] },
    { id: "4-015", q: "Which country colonized Angola and Mozambique?", a: ["portugal"] },
    { id: "4-016", q: "What’s the derivative of sin(x)?", a: ["cos x", "cosx", "cos(x)"] },
    { id: "4-017", q: "Who wrote ‘One Hundred Years of Solitude’?", a: ["gabriel garcia marquez", "garcía márquez", "marquez"] },
    { id: "4-018", q: "Which vitamin is synthesized by sunlight in skin?", a: ["vitamin d", "d"] },
    { id: "4-019", q: "Which dynasty built much of the Great Wall (Ming or Qin)?", a: ["ming", "ming dynasty"] },
    { id: "4-020", q: "What is the SI unit of pressure?", a: ["pascal", "pa"] },
    { id: "4-021", q: "Which composer wrote the ‘Goldberg Variations’?", a: ["j. s. bach", "johann sebastian bach", "bach"] },
    { id: "4-022", q: "What is the capital of Morocco?", a: ["rabat"] },
    { id: "4-023", q: "Name the process plants use to split water in photosynthesis (light-dependent reaction) — releases what gas?", a: ["oxygen", "o2"] },
    { id: "4-024", q: "Which war featured the Battle of Verdun?", a: ["world war i", "ww1", "wwi", "first world war"] },
    { id: "4-025", q: "What is the common logarithm base?", a: ["10", "ten"] },
    { id: "4-026", q: "What ancient script did the Rosetta Stone help decipher?", a: ["hieroglyphs", "egyptian hieroglyphs", "hieroglyphics"] },
    { id: "4-027", q: "Which organelle packages proteins (UPS of cell)?", a: ["golgi", "golgi apparatus", "golgi body"] },
    { id: "4-028", q: "In economics, MV = PY is whose equation of exchange?", a: ["irving fisher", "fisher"] },
    { id: "4-029", q: "Which element has the highest electrical conductivity?", a: ["silver", "ag"] },
    { id: "4-030", q: "Which philosopher wrote ‘Critique of Pure Reason’?", a: ["immanuel kant", "kant"] },
  ],
  5: [
    { id: "5-001", q: "Who proved Fermat’s Last Theorem (1994 proof)?", a: ["andrew wiles", "wiles"] },
    { id: "5-002", q: "Name the 4 fundamental forces of nature.", a: ["gravity electromagnetism strong nuclear weak nuclear", "gravitation electromagnetism strong weak"] },
    { id: "5-003", q: "Which experiment established the speed of light constancy leading to relativity?", a: ["michelson morley", "michelson-morley"] },
    { id: "5-004", q: "In CS, what problem class is believed to not equal P?", a: ["np", "np (not p)"] },
    { id: "5-005", q: "What is the Riemann Hypothesis about? Zeta function’s __________.", a: ["nontrivial zeros on the critical line", "zeros on real part 1/2", "critical line"] },
    { id: "5-006", q: "Who composed the opera ‘Tristan und Isolde’?", a: ["richard wagner", "wagner"] },
    { id: "5-007", q: "What is Schrödinger’s famous thought experiment about?", a: ["cat", "schrodingers cat", "schrödinger's cat"] },
    { id: "5-008", q: "Which painter created ‘Las Meninas’?", a: ["diego velazquez", "velázquez", "velazquez"] },
    { id: "5-009", q: "Which treaty ended the Thirty Years’ War (1648)?", a: ["peace of westphalia", "westphalia"] },
    { id: "5-010", q: "Which algorithm finds MST in a weighted graph (one of two classic answers)?", a: ["kruskal", "prim"] },
    { id: "5-011", q: "What’s the name of the quantum field theory combining EM with special relativity?", a: ["quantum electrodynamics", "qed"] },
    { id: "5-012", q: "Which empire built Machu Picchu?", a: ["inca", "incan empire"] },
    { id: "5-013", q: "What is the half-life of Carbon-14 closest to? (years)", a: ["5730", "5,730"] },
    { id: "5-014", q: "Name the mathematician behind ‘Foundations of Geometry’.", a: ["david hilbert", "hilbert"] },
    { id: "5-015", q: "Which novel opens with “Call me Ishmael.”?", a: ["moby dick", "mobydick"] },
    { id: "5-016", q: "Who discovered radioactivity (couple accepted)?", a: ["henri becquerel", "marie curie", "pierre curie", "curie", "becquerel"] },
    { id: "5-017", q: "What theorem guarantees a root in a continuous function with opposite signs at endpoints?", a: ["intermediate value theorem", "ivt"] },
    { id: "5-018", q: "Which city hosted the Council that split Catholic & Orthodox (1054 schism context)?", a: ["none", "trick", "no single council"] },
    { id: "5-019", q: "Which composer wrote ‘The Art of Fugue’?", a: ["j. s. bach", "bach"] },
    { id: "5-020", q: "What’s the main difference between RNA and DNA sugars?", a: ["ribose vs deoxyribose", "rna ribose dna deoxyribose"] },
    { id: "5-021", q: "Which proof technique assumes the negation and derives contradiction?", a: ["proof by contradiction", "reductio ad absurdum"] },
    { id: "5-022", q: "What is the main postulate of special relativity about inertial frames?", a: ["laws of physics identical", "same laws in all inertial frames"] },
    { id: "5-023", q: "Which economist wrote ‘General Theory of Employment, Interest and Money’?", a: ["john maynard keynes", "keynes"] },
    { id: "5-024", q: "Which structure protects plant cells but not animal cells?", a: ["cell wall", "cellwall"] },
    { id: "5-025", q: "Which 20th-century painter did the ‘Black Square’?", a: ["kazimir malevich", "malevich"] },
    { id: "5-026", q: "What’s the group of symmetries of a regular pentagon called?", a: ["dihedral group of order 10", "d10", "d5×2", "d_5"] },
    { id: "5-027", q: "Name the constant relating a photon’s energy to frequency.", a: ["planck constant", "h", "planck's constant"] },
    { id: "5-028", q: "Which mathematician solved the Königsberg bridges problem?", a: ["leonhard euler", "euler"] },
    { id: "5-029", q: "Which programming language introduced generics with type erasure (JVM)?", a: ["java"] },
    { id: "5-030", q: "Which ancient mathematician proved √2 is irrational?", a: ["pythagoreans", "hippasus", "pythagoras school"] },
  ],
};

// ⬇️ NEW: merge in the 180-question add-on set (IDs must stay unique per difficulty)
for (const d of Object.keys(EXTRA_BANK)) {
  const k = Number(d);
  BANK[k] = (BANK[k] || []).concat(EXTRA_BANK[k]);
}

/** Utility: Fisher–Yates shuffle (in place) */
function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Persistent no-repeat store (per difficulty) */
const DECK_KEY = "qaDeck_v2"; // bump to reset all players
type DeckState = Record<string, string[]>; // difficulty -> remaining ids

function loadDeck(): DeckState {
  try { return JSON.parse(localStorage.getItem(DECK_KEY) || "{}"); } catch { return {}; }
}
function saveDeck(state: DeckState) {
  try { localStorage.setItem(DECK_KEY, JSON.stringify(state)); } catch {}
}

/**
 * Return a round of questions for the given level’s difficulty.
 * Will exhaust through the difficulty pool before repeating.
 */
export function getRoundQuestions(level: number): QA[] {
  const d = levelToDifficulty(level);
  const pool = BANK[d] || [];
  if (pool.length === 0) return [];

  const state = loadDeck();
  const key = String(d);

  // Initialize remaining ids if absent or too few left
  if (!state[key] || state[key].length < PER_ROUND) {
    state[key] = pool.map(q => q.id);
    shuffle(state[key]);
  }

  // Take the next PER_ROUND ids from the remaining deck
  const takeIds = state[key].splice(0, PER_ROUND);
  saveDeck(state);

  // Map ids -> QA (order preserved)
  const byId = new Map(pool.map(q => [q.id, q] as const));
  const chosen: QA[] = [];
  for (const id of takeIds) {
    const row = byId.get(id);
    if (row) chosen.push(row);
  }
  return chosen;
}
