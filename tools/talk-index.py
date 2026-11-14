#!/usr/bin/env python3
"""Talk types, first pass (talk1, Tom 2026-11-13): give every cast dialogue line that is plain talk one of the four talking poses.

Tom: "four talking poses ... only used when a character is talking and whatever they're saying does not really have a strong emotion",
plus the lines whose mood was "borderline" (tagged with a feeling only because there was no other pose).

The four talk types (frame order on the talking sheet, Art Library entry <id>-talk, docs/TALK_POSES.md):
  tell    explaining, describing, reporting what they see, a plan (open hand at chest height)
  point   pointing something out or directing people: "look", "over there", "stay close", "no touching, please", orders (arm out, pointing)
  ask     any question (head tilt, palms up)
  answer  short replies and quick one-liners, five words or fewer, or "okay / yeah / fine ..." (small shrug, loose hand)

Which lines become talk:
  - every row tagged `none` in docs/emotion-index-lines.tsv;
  - borderline moods: happy, loving, proud, surprised, unimpressed rows with no sign of the feeling in the words (no "!", no shouted
    word in capitals, none of that mood's cue words below). Sad, angry and scared always keep their mood. Nara is a dog: no talk poses.
    Unimpressed is Tom's deadpan voice and the comic beat, so it is demoted only when the line is an order or a plan.
The engine (engine/emotions.js) shows the talk pose instead of the mood pose only once that character's talking sheet is baked;
until then every line looks exactly as before.

Usage:
    python3 tools/talk-index.py --init     # (re)write docs/talk-lines.tsv from docs/emotion-index-lines.tsv (overwrites Tom's corrections: only for a fresh start)
    python3 tools/talk-index.py --add      # add rows for emotion-index lines that docs/talk-lines.tsv does not have yet (keeps every existing row)
Then: python3 tools/talk-apply.py   (builds data/talk-types.js)
The same rule for a line with no row is in engine/emotions.js (talkRule); keep the two in step.
"""
import csv, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'docs/emotion-index-lines.tsv')
OUT = os.path.join(ROOT, 'docs/talk-lines.tsv')
TYPES = ['tell', 'point', 'ask', 'answer']
COLS = ['chapter', 'file', 'line', 'character', 'mood', 'talk', 'text']
NO_TALK = {'Nara'}
STRONG = {'sad', 'angry', 'scared'}
ACRONYMS = {'TNB', 'OK', 'LA', 'TV', 'VCR', 'JFK', 'LAX', 'XP', 'HP', 'MP', 'DJ', 'NYC', 'USA', 'II', 'III', 'IV', 'DMV', 'CUT', 'BBQ'}
CUES = {
    'happy': r"\b(love|best|yay|ha|haha|hooray|yes|fun|favorite|so good|can't wait|thank|thanks|great|awesome|amazing|perfect|woo|whee|laugh|giggl|singing)",
    'loving': r"\b(love|moon|hug|miss|thank|kiss|sweet|honey|sweetie|proud of|excellent|gold star|good job|come here|heart|you can|i've got you|got you|i'm here|it's okay|it's ok|we'll fix|fix it|friend|home|family|my girls|bye|babe)",
    'proud': r"\b(i knew|told you|i did|in charge|mine|i decided|nobody stop|we did|did it|champion|expert|obviously|of course|forty years|i'm the|watch this|watch me|i can|i've got this|leave it to|my idea|genius|nailed|we always|i'll|we'll get|we're coming|all of us|never missed|natural|i won|i have run|photo face|good scrunchie|lanyard|i'm keeping|a chart|shows up)",
    'surprised': r"\b(wait|what|whoa|woah|oh|huh|no way|wow|how|bigger|biggest|ever seen|turned into|talks|talked|there's a man|it's her|no moon|stopped|candy|giggling|is moving|it moved)\b",
    'unimpressed': None,   # handled by the order/plan test below
}
ORDER = (r"^(look|over there|up there|down there|this way|that way|come on|let's|follow|stay|go |go,|grab|hurry|up,|up!|up\.|everybody|everyone|nobody|"
         r"over here|back to one|hold |get |in there|out there|put |give |take |be |don't |do not |no touching|hands |phone down|quiet|keep |"
         r"watch |use |bring |move|walk |sit|stand|cut\.|copy|halt|eat|wait here|then nobody|then we|here's the plan|rose\. |grace\. |girls\. )|"
         r"\b(look[,:.!]|look at|over there|up there|down there|in there|this way|that way|over here|right there|on the left|on the right|"
         r"follow me|stay close|stay behind|let's go|come on|no touching|behind me|with me\.|everybody to|hands to yourselves|nobody touches|nobody goes)\b")


def talk_type(text):
    """The talk type of a line (same rule as talkRule in engine/emotions.js)."""
    s = text.strip().replace('\u2019', "'"); low = s.lower(); words = len(re.findall(r"[A-Za-z']+", s))
    if '?' in s: return 'ask'
    if re.search(ORDER, low): return 'point'
    if words <= 5 or (words <= 9 and re.match(r"^(okay|ok|yeah|yep|nope|no|yes|fine|sure|right|got it|mm|hm|uh|well)\b", low)): return 'answer'
    return 'tell'


def shouted(text):
    return any(w not in ACRONYMS for w in re.findall(r"\b[A-Z]{2,}\b", text))


def classify(character, mood, text):
    """'' = keeps its mood; otherwise the talk type."""
    if character in NO_TALK or mood in STRONG: return ''
    if mood == 'none': return talk_type(text)
    if mood == 'unimpressed':
        t = talk_type(text)
        return t if t == 'point' or re.search(r"\b(we'd better|we had better|let's|we need|we have to|here's the plan)\b", text.replace('\u2019', "'").lower()) else ''
    low = text.replace('\u2019', "'").lower()
    if mood in CUES and ('!' in text or shouted(text) or re.search(CUES[mood], low)): return ''
    return talk_type(text) if mood in CUES else ''


def read(path):
    with open(path, newline='', encoding='utf-8') as fh:
        return list(csv.DictReader(fh, delimiter='\t', quoting=csv.QUOTE_NONE))


def write(rows):
    with open(OUT, 'w', newline='', encoding='utf-8') as fh:
        fh.write('\t'.join(COLS) + '\n')
        for r in rows: fh.write('\t'.join(r[c] for c in COLS) + '\n')


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ('--init', '--add'): sys.exit(__doc__)
    src = read(SRC); key = lambda r: (r['chapter'], r['character'], r['text'])
    have = {} if sys.argv[1] == '--init' or not os.path.exists(OUT) else {key(r): r for r in read(OUT)}
    rows, added = [], 0
    for r in src:
        k = key(r)
        if k in have: rows.append(have.pop(k)); continue
        rows.append({**{c: r[c] for c in COLS if c in r}, 'talk': classify(r['character'], r['mood'], r['text'])}); added += 1
    rows += list(have.values())   # rows Tom added by hand that the emotion index does not have
    write(rows)
    c = collections.Counter(r['talk'] for r in rows if r['talk']); d = collections.Counter(r['mood'] for r in rows if r['talk'])
    print('wrote', os.path.relpath(OUT, ROOT), len(rows), 'rows,', added, 'new; talk lines', sum(c.values()), dict(c), 'from moods', dict(d))


if __name__ == '__main__':
    main()
