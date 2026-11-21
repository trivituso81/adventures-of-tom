# hero1 (2026-11-10, main at 6a2df06): hero painting entries in the Art Library

- Tom 07:59: "in the character sheets, an entry item for the hero image". Fact: heroes were only loose files (`art/raw/characters/<id>-hero-ref-v1.png`), no Library entry.
- Built: 14 entries `<id>-hero` (tom, tnb, grace, rose, amy, justin, deedee, boppy, olivia, ellie, jojo, michael, nara, boppy-young), first in each character's group, status APPROVED with the existing hero file as current picture (nothing changes in the game). Prompt: `tools/art-library/prompts/char-hero-pose.txt` (STYLE BLOCK v2 + PHOTO FIDELITY + one-picture rules, generic). Photos attach from Tom's device through three `own` slots. Module `tools/art-library/hero-prompts.js`, required in char-prompts.js. json spliced as text, 710 to 724 entries, validate.js OK.
- Not tested: a real GENERATE of a hero (needs Tom's photos on his phone). If it returns a grid or a cropped figure, adjust the "THE PICTURE (strict)" block in the prompt file and mirror it into the json entries.
- Pre-existing: `tools/art-library/review_test.py` fails one check (GENERATE 334 px below card top) with and without this change.
- Not done: claude/next.md was not rewritten this session (it is very large); add this item to it next session.
