#!/usr/bin/env python3
"""Write docs/NPC_EMOTION_INDEX.md from docs/npc-emotion-lines.tsv (npcemo1, npcemo2). Docs only; the game never loads either file.
    python3 tools/npc-emotion-index.py
"""
import csv, os, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOODS = ["happy", "loving", "sad", "angry", "scared", "surprised", "proud", "unimpressed"]
rows = list(csv.DictReader(open(os.path.join(ROOT, 'docs/npc-emotion-lines.tsv'), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE))
by = collections.OrderedDict()
for r in rows: by.setdefault(r['character'], []).append(r)
tot = collections.Counter(r['mood'] for r in rows)
o = ["# NPC emotion index: chapters 1 to 20 (npcemo1 to npcemo4)", "",
 "Fact: every line a person (not a monster) says in chapters 1 to 20 outside the cast story scenes, tagged with one of the 8 emotion-sheet moods. Behind the scenes only: the game does not load it. It is the list a later change uses to show an emotion pose frame per line.", "",
 "- Source of truth: `docs/npc-emotion-lines.tsv` (columns: chapters, file, line, character, where, mood, text). Correct a tag by changing the one mood word there. This page is rebuilt from it with `python3 tools/npc-emotion-index.py`.",
 "- Check: `python3 tools/npc-emotion-check.py` (mood valid, exact text still in its file, one mood per speaker and text). `--fix` refreshes line numbers after code moves.",
 "- Covered: map NPC talk (townsfolk and family: first visit, revisit, hug and chapter variants), townsfolk lines inside story scenes, recruit and follower chatter, Penny and Nickel shop lines (greetings, buy and sell lines, shelf lines; not the gear captions), the cab drivers Sal and Sol.",
 "- Not covered: cast lines in story scenes (already tagged in `docs/emotion-index-lines.tsv`, live in the game), monsters and bosses (no emotion sheets), narration from signs and objects, battle barks, puzzle replies (not located in the data), cast lines in the airport trips (Tom, Grace, Rose, TNB, Amy and the rest at the cab).",
 "- `chapters`: where the line can show. `1-10` Long Island anytime in Part 1; `2-10` Los Angeles (first reached in chapter 2); single numbers and `a-b` are chapter variants. A line keyed by speaker and exact text carries its mood wherever it shows.",
 "- Who has emotion sheets today: Tom, TNB, Grace, Rose, Amy, Justin, Deedee, Boppy, Olivia, Aunt Ellie (Nara has her own). Every townsperson here needs an emotion sheet before their tags can show a pose.", "",
 "## Totals", "", "| Mood | Lines |", "|---|---|"]
o += ["| %s | %d |" % (m.capitalize(), tot[m]) for m in MOODS] + ["| **All** | %d |" % len(rows), "", "## Lines by character", ""]
for c, rs in by.items():
    o += ["### %s (%d)" % (c, len(rs)), "", "| Ch | Where | Emotion | Line |", "|---|---|---|---|"]
    o += ["| %s | %s | %s | %s |" % (r['chapters'], r['where'].replace('|', '/'), r['mood'].capitalize(), r['text'].replace('|', '/')) for r in rs] + [""]
open(os.path.join(ROOT, 'docs/NPC_EMOTION_INDEX.md'), 'w', encoding='utf-8').write('\n'.join(o))
print('rows', len(rows), 'characters', len(by))
