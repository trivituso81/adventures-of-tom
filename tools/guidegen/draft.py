#!/usr/bin/env python3
"""guideprompts1: write a real MOTION for every Battle Guide animation that still has a rule-made starter draft.

  python3 -I tools/guidegen/draft.py [--ids a,b] [--cap 1.0] [--out DIR] [--model ID] [--dry-run] [--limit N]

Reads data/guide-anims.json (promptSource rule-draft only; a job, entry or used prompt is never touched), asks the xAI text model (repo secret XAI_API_KEY,
the same client and model pick as reconcile.py) for ONE new MOTION part per animation, checks the answer in code, sends a broken answer back once, and
writes data/guide-prompts.json-shaped results to DIR/guide-prompts.json ({"anims": {id: {prompt, rev, source: "model-draft", model}}, "failed": {id: [why]}}).
Everything before MOTION (and a monster's closing tail) is copied word for word from the starter draft, in code, so the model cannot change it.
The workflow keeps DIR on the branch `guidegen`; a session copies the file into data/guide-prompts.json and rebuilds data/guide-anims.json.
Env: XAI_API_KEY (never printed), XAI_BASE (test stand-in).

Library: split_prompt, check_motion, draft_one(ask, anim, existing) -> dict
"""
import json, os, re, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, 'tools', 'clip-gate'))
import reconcile as R

BAD_WORDS = ['sound', 'noise', 'zoom', 'camera', 'music', 'voice', 'says', 'shouts', 'yells', 'whispers', 'speaks', 'sings', 'left', 'right', 'faster', 'slower']
LABEL_WORDS = ['racket', 'clobber', 'drench', 'razzle', 'sizzle', 'melee', 'ground sweep', 'guard stance', 'announced']   # the game's damage-type and aiming labels, never objects or actions
EXAMPLES_FAMILY = [
    ('Single index finger tap (approved)', 'From her starting relaxed stance, she smiles, rises onto her tiptoes, and smoothly extends one arm straight forward at nose height, tapping the air once with a single extended index finger. Without repeating the gesture, she immediately pulls her arm back, settles onto flat feet with both hands resting on her hips, and remains completely still in that proud, smiling pose for the rest of the clip.'),
    ('Lounge Pass Flex', 'From his starting relaxed stance, he gives a smug little smile, brings a small lounge pass card out from behind his back, and presents it forward at face height once with a little flourish, holding it there like a VIP badge for a moment. Without repeating the gesture, he tucks the card behind his back again. He returns to his starting relaxed stance and remains completely still in that pose for the rest of the clip.'),
    ('Squishy Squeeze', 'From her starting relaxed stance, she brings a small round dumpling-shaped squishy toy out from behind her back, holds it out forward in both hands at chest height, and squeezes it hard once with a delighted grin. Without repeating the squeeze, she tucks the toy behind her back again. She returns to her starting relaxed stance and remains completely still in that pose for the rest of the clip.'),
]
EXAMPLES_MONSTER = [
    ('Wobble', 'The creature leans its whole body forward and bumps forward once with its belly, wobbling like jelly, while its base stays put. Without repeating the bump, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.'),
    ('Throw', 'The creature swings one mud arm back and flings it forward once at head height, as if throwing a ball of mud, while its base stays put. Without repeating the throw, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.'),
]

SYSTEM = """You write the MOTION part of ONE video prompt for a family role-playing game. The video model makes a silent, locked-camera clip of a hand-painted character or creature from a start picture, and it does exactly what the MOTION says.
You get: the animation's name and what it does in the game, the creature's LOOK when it is a monster, the starter MOTION (a generic placeholder you replace), and approved examples of the house style.
Write the motion so a viewer who knows the move's name would recognise it: use the move's own idea (what the character or creature actually does, and the prop it uses), not a generic gesture of its shape.

Rules (all of them):
1. Two or three sentences, 35 to 80 words. Name the gesture once, say how many times ("once", "twice" only if the move is a double hit), then "Without repeating the gesture" (or the matching noun: the bump, the throw) and how the body comes back.
2. Family member: start with the starter's own words, "From his starting relaxed stance," or "From her starting relaxed stance," or "From its starting relaxed stance," (the starter shows which; Nara the dog is "it": use paws, mouth, head and tail, never arms or hands), keep to that one pronoun, and end with the body back in its starting relaxed stance, "remains completely still in that pose for the rest of the clip". Props come out from behind the back, are used once, and go back behind the back.
3. Monster: start "The creature" and end with "it settles back into the pose of the attached picture and stays completely still for the rest of the clip". Use only parts the LOOK mentions or a general body part ("one arm", "its head"); the creature stays on its spot.
4. Describe what the camera would see in one clean action. No sound, no voice, no words spoken, no camera moves, no other characters, no text on screen, no effects added after the fact (the game draws the dust, sparks and markers).
5. Never say left or right ("forward" is toward the foe). Never describe speed. Say each thing once: describing one action two ways comes back as two actions.
6. Plain words, no em dashes, none of: 16-bit, 32-bit, SNES, pixel art, retro, sprite, Final Fantasy.
7. Words such as racket, clobber, drench, razzle, sizzle, melee, ground sweep, guard stance and announced are the game's labels for the kind of hit. They are never objects, props or actions: do not use them. Picture the move from its NAME and what it does.
8. A move that is a buff, shield or support (no hit) is shown as a clear gesture of that idea (hands raised, a prop held up), not as an attack.

Reply with JSON only: {"motion": "the new MOTION body only, the sentences, without the MOTION: line"}"""


def split_prompt(prompt):
    """-> (head, header_line, body, tail): head is every block before MOTION joined with blank lines, tail is the block after MOTION ('' if none)."""
    blocks = [b for b in re.split(r'\n\s*\n', prompt.strip())]
    for i, b in enumerate(blocks):
        if b.startswith('MOTION:'):
            hdr, _, body = b.partition('\n')
            return '\n\n'.join(blocks[:i]), hdr, body.strip(), '\n\n'.join(blocks[i + 1:])
    raise ValueError('no MOTION part')


def pronoun_ok(starter, motion):
    """The starter says "From his/her/its starting"; the new motion must use that pronoun and none of the others. -> '' when fine, else what is wrong."""
    m = re.search(r'From (his|her|its) starting', starter)
    if not m: return ''
    want = m.group(1); low = ' ' + re.sub(r"[^a-z' ]+", ' ', motion.lower()) + ' '
    if ('from %s starting' % want) not in low: return 'the motion must start "From %s starting relaxed stance," like the starter' % want
    subj = {'his': ('he', 'his'), 'her': ('she', 'her'), 'its': ('it', 'its')}[want]
    allowed = set(subj)   # "it" and "its" are fine for a prop in any motion ("blows into it"); he, she, his, her are the character's
    for o in ('he', 'she', 'his', 'her'):
        if o not in allowed and (' %s ' % o) in low:
            return 'the motion uses "%s" but this character is "%s" (use %s and %s only)' % (o, want, subj[0], subj[1])
    return ''


def check_motion(starter, motion, kind='family', name=''):
    """Rules run in code on the new MOTION body. -> list of what is wrong (empty: fine)."""
    why = []
    m = (motion or '').strip()
    if not m: return ['no motion was given']
    if '\n' in m: why.append('the motion is more than one paragraph')
    n = len(R.words(m))
    if not 30 <= n <= 90: why.append('the motion has %d words (30 to 90)' % n)
    sents = [s for s in re.split(r'(?<=[.!?])\s+', m) if s.strip()]
    if not 2 <= len(sents) <= 4: why.append('the motion has %d sentences (2 to 4)' % len(sents))
    keys = [re.sub(r'\W+', ' ', s).strip().lower() for s in sents]
    if len(keys) != len(set(keys)) or R.ngram_repeat(m): why.append('the motion says something twice, which comes back as two actions')
    low = m.lower()
    if 'once' not in low and 'twice' not in low: why.append('the motion does not say how many times')
    if 'without repeating' not in low: why.append('the motion lacks "Without repeating ..."')
    if 'completely still' not in low: why.append('the motion does not end in a held pose ("completely still")')
    if kind == 'family':
        if not m.startswith('From '): why.append('a family motion starts "From his/her starting relaxed stance,"')
        else:
            pw = pronoun_ok(starter, m)
            if pw: why.append(pw)
        if 'starting relaxed stance' not in low: why.append('the family motion lacks "starting relaxed stance"')
    else:
        if not m.startswith('The creature'): why.append('a monster motion starts "The creature"')
        if 'pose of the attached picture' not in low: why.append('the monster motion lacks "the pose of the attached picture"')
    for w in BAD_WORDS:
        if re.search(r'\b' + re.escape(w.strip()) + r'\b', low) and not re.search(r'\b' + re.escape(w.strip()) + r'\b', starter.lower()): why.append('the word "%s" is not allowed in a motion' % w.strip())
    for w in LABEL_WORDS:
        if re.search(r'\b' + re.escape(w) + r'\b', low) and not re.search(r'\b' + re.escape(w) + r'\b', (starter + ' ' + name).lower()):
            why.append('"%s" is a game label for the kind of hit, not an object or an action: show what the move is by what the character or creature does' % w)
    bad = [b for b in R.BANNED if b in low]
    if bad: why.append('words that are not allowed: ' + ', '.join(bad))
    if '—' in m or '–' in m: why.append('a dash character was used')
    return why


def user_text(a, hdr, body, look):
    kind = a.get('route') == 'wan'
    ex = EXAMPLES_FAMILY if kind else EXAMPLES_MONSTER
    br = a.get('brief') or {}
    facts = {k: br[k] for k in ('name', 'owner', 'desc', 'shape', 'target', 'effects', 'does', 'listRow') if br.get(k)}   # flavor and tags are game labels (racket, clobber, thrown ...), not facts about what it looks like
    out = 'KIND: %s\nANIMATION FACTS (from the game data):\n%s\n' % ('a family member (Wan video model)' if kind else 'a monster (xAI video model)', json.dumps(facts, indent=1, ensure_ascii=False))
    if look: out += '\nTHE CREATURE\'S LOOK:\n%s\n' % look
    out += '\nSTARTER MOTION (a generic placeholder: replace it)\n%s\n%s\n' % (hdr, body)
    out += '\nAPPROVED EXAMPLES OF THE HOUSE STYLE (other moves; copy the shape, not the content)\n' + '\n'.join('- %s: %s' % e for e in ex)
    return out


def parse(txt):
    t = (txt or '').strip()
    if t.startswith('```'): t = t.strip('`'); t = t[t.find('{'):]
    d = json.loads(t[t.find('{'):t.rfind('}') + 1])
    m = d.get('motion')
    return m.strip() if isinstance(m, str) and m.strip() else None


def draft_one(ask, a):
    """One animation. -> {ok, prompt, why, spent, tries}. The head and tail are copied from the starter in code."""
    head, hdr, body, tail = split_prompt(a['prompt'])
    look = ''
    for b in re.split(r'\n\s*\n', head):
        if b.startswith('LOOK'): look = b.split('\n', 1)[-1].strip()
    kind = 'family' if a.get('route') == 'wan' else 'monster'
    user = user_text(a, hdr, body, look); spent = 0.0; why = []
    for tries in (1, 2):
        txt, cost = ask(SYSTEM, user if tries == 1 else user + '\n\nYOUR LAST ANSWER BROKE THESE RULES. Fix only those and send the whole JSON again:\n- ' + '\n- '.join(why))
        spent += cost
        try: m = parse(txt)
        except Exception as ex: why = ['the reply was not the JSON asked for (%s)' % type(ex).__name__]; continue
        if not m: why = ['no motion was given']; continue
        why = check_motion(body, m, kind, (a.get('brief') or {}).get('name', ''))
        if not why:
            parts = [head, hdr + '\n' + m] + ([tail] if tail else [])
            return {'ok': True, 'prompt': '\n\n'.join(parts) + ('\n' if a['prompt'].endswith('\n') else ''), 'why': [], 'spent': round(spent, 5), 'tries': tries, 'motion': m}
    return {'ok': False, 'prompt': None, 'why': why, 'spent': round(spent, 5), 'tries': 2}


def load_guide(root=ROOT):
    """The Battle Guide's animations as they are with NO written prompts laid over them, so every animation that has no job, entry or used prompt shows its
    starter draft (the thing this script replaces), whatever data/guide-prompts.json holds. Built by tools/guidegen/build_map.js with an empty override file."""
    import subprocess, tempfile
    with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False) as f:
        json.dump({'anims': {}}, f); empty = f.name
    try:
        r = subprocess.run(['node', os.path.join(root, 'tools', 'guidegen', 'build_map.js'), '--stdout'], cwd=root, env={**os.environ, 'GUIDEGEN_PROMPTS': empty}, capture_output=True, text=True)
        if r.returncode == 0 and r.stdout.strip().startswith('{'): return json.loads(r.stdout)
    finally:
        os.unlink(empty)
    return json.load(open(os.path.join(root, 'data', 'guide-anims.json'), encoding='utf-8'))


def todo(guide, ids=None):
    out = []
    for k, a in guide['anims'].items():
        if a.get('promptSource') != 'rule-draft': continue
        if ids and k not in ids: continue
        out.append((k, a))
    return out


def say(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)


def run(ask, model, guide, out, cap, ids=None, limit=None, dry=False, existing=None):
    work = todo(guide, ids)
    prior = (existing or {}).get('anims') or {}
    work = [(k, a) for k, a in work if k not in prior or ids]   # a finished one is not asked again unless named
    if limit: work = work[:limit]
    say('%d animation(s) with a starter draft to write' % len(work))
    res = {'anims': dict(prior), 'failed': {}}
    if dry:
        for k, a in work[:8]: say('dry run: would ask for', k)
        return res, 0.0
    total = 0.0
    for k, a in work:
        if total >= cap: say('cap of $%.2f reached, stopping' % cap); break
        try: r = draft_one(ask, a)
        except Exception as ex: r = {'ok': False, 'why': ['the model did not answer: %s' % str(ex)[:160]], 'spent': 0.0, 'tries': 0}
        total += r['spent']
        if r['ok']:
            res['anims'][k] = {'prompt': r['prompt'], 'rev': 0, 'source': 'model-draft', 'model': model}
            res['failed'].pop(k, None)
        else:
            res['failed'][k] = r['why']
        say('%-44s %s tries %s $%.4f' % (k, 'ok' if r['ok'] else 'CHECK THIS ONE', r['tries'], r['spent']))
        if r['ok'] and (ids or len(work) <= 3): say('   MOTION:', r['motion'])
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'guide-prompts.json'), 'w', encoding='utf-8').write(json.dumps(res, indent=1, ensure_ascii=False) + '\n')
    say('wrote %d prompt(s), %d failed, spent $%.4f' % (len(res['anims']) - len(prior), len(res['failed']), total))
    return res, total


def main(argv):
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument('--ids', default=''); ap.add_argument('--cap', type=float, default=1.0); ap.add_argument('--out', default='guidegen-out')
    ap.add_argument('--model', default=''); ap.add_argument('--dry-run', action='store_true'); ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--existing', default='', help='an earlier guide-prompts.json to add to (so a second run keeps the first run\'s prompts)')
    a = ap.parse_args(argv)
    guide = load_guide()
    ids = {x.strip() for x in a.ids.split(',') if x.strip()} or None
    existing = None
    if a.existing and os.path.exists(a.existing):
        try: existing = json.load(open(a.existing, encoding='utf-8'))
        except ValueError: existing = None   # an empty or broken earlier file is the same as none
    key = os.environ.get('XAI_API_KEY', '')
    if a.dry_run: run(None, '', guide, a.out, a.cap, ids, a.limit or None, True, existing); return 0
    if not key: raise SystemExit('Repo secret XAI_API_KEY is empty or missing.')
    base = os.environ.get('XAI_BASE', 'https://api.x.ai')
    import vision
    x = vision.Xai(key, base); model = R.pick_text_model(x.models(), a.model or None)['id']
    say('text model:', model)
    _, ask = R.xai_ask(key, base, model)
    res, total = run(ask, model, guide, a.out, a.cap, ids, a.limit or None, False, existing)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
