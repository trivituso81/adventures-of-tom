#!/usr/bin/env python3
"""guide_planned.py (build battleguide2): writes data/guide-planned.json, the list of everything the battle plan has that the game does not,
which the Battle Guide (battle-guide.html) shows with a PLANNED badge.

    python3 tools/guide_planned.py            write data/guide-planned.json
    python3 tools/guide_planned.py --check    exit 1 when a source document changed since the file was written (the file is stale)
    python3 tools/guide_planned.py --list     print a one-line summary of what the list holds

claude/ is not published on the game's site, so the plan documents cannot be read by the page. This script reads them and writes a small
file the page can load. The page never types a planned thing itself, and it decides by itself, from the game's own data (the same
data/b3-*.js files it already reads), which planned things are still planned: each item carries a `when` rule (see WHEN in
battle-guide.html, builtWhen) and the page drops the item as soon as that rule holds. So a session that builds a third Vibe, a monster,
a chapter or a feature does not have to touch the page or this file. Run this script again only to tidy the file (it drops what the game
has) or after a source document changed.

Sources (all in claude/, mirrored from the Project; the repo copy is the original):
  claude/battle-spec-v11.md          the 30 Vibes (the ones the game does not hold are the third Vibes), Casual Mode, KO and the last fight (section 2.1, 2.9)
  claude/bestiary-v11.md             every monster and boss of chapters 11 to 20 and the rules they need (it replaces bestiary-v10.1.md)
  claude/battle-architecture.md      the stage plan (section 5), Tombo skins (section 3), the gap table (section 1), saves and gear (section 4.2)
  docs/BATTLE3.md                    what the game says it holds and what waits (Tombo toasts, the bonus chapter)
  data/b3-*.js                       the game's own data, read through node, to know what is built today
"""
import hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'data', 'guide-planned.json')
SOURCES = ['claude/battle-spec-v11.md', 'claude/bestiary-v11.md', 'claude/battle-architecture.md']
ALSO_READ = ['docs/BATTLE3.md', 'claude/bestiary-v10.1.md', 'claude/battle-build.md']   # read to build the list; their text is not copied, so they are not hashed
DASH = chr(8212)   # no em dashes anywhere the page shows
BUILT_AS = {'lens': 'bluelens'}   # the bestiary's one entry for the two lenses of chapter 20 is built as two rows, `bluelens` and `orangelens` (data/b3-foes-ch20.js); the entry drops out when the first exists

def read(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def clean(s):
    s = s.replace('`', '').replace(DASH, ', ').replace('→', '->').strip()
    return re.sub(r'\s+', ' ', s)
def sha(p): return hashlib.sha256(read(p).encode('utf-8')).hexdigest()[:16]
def norm(s): return re.sub(r'[^a-z0-9]+', '', str(s).lower())

# ---------- what the game holds today ----------
NODE = r"""
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');
const srcs=[...html.matchAll(/src="(data\/b3-[^"?]*)/g)].map(m=>m[1]);const ctx={console};vm.createContext(ctx);
let code='';for(const s of srcs)code+=fs.readFileSync(s,'utf8').replace(/^'use strict';/,'')+'\n;';
code+='globalThis.OUT={cast:Object.fromEntries(Object.values(B3_CAST).map(c=>[c.id,c.vibes.map(v=>B3_VIBES[v].name)])),foes:Object.keys(B3_FOES),chapters:B3_STORY.chapters,rankUnlock:B3_RULES.rankUnlock};';
vm.runInContext(code,ctx);console.log(JSON.stringify(ctx.OUT));
"""
def game():
    return json.loads(subprocess.run(['node', '-e', NODE], cwd=ROOT, capture_output=True, text=True, check=True).stdout)

# ---------- the Vibes (spec section 3) ----------
LEAN = {'guard': 'Guard', 'striker': 'Striker', 'tempo': 'Tempo', 'support': 'Support'}
def parse_vibes(text, G):
    out = []; owner = None; cur = None; seen_owner = {}
    sec = text.split('## 3. All 10 Playable Character Kits')[1].split('## 4. Build Order')[0]
    for ln in sec.split('\n'):
        m = re.match(r'^### \d+\. ([A-Z]+):', ln)
        if m: owner = m.group(1).lower(); cur = None; continue
        m = re.match(r'^- \*\*Vibe (\d): (.+?)\*\* \((.+?); (.+?)\)\s*$', ln)
        if m:
            cur = {'owner': owner, 'num': int(m.group(1)), 'name': clean(m.group(2)), 'build': clean(m.group(3)), 'flavors': [x.strip() for x in m.group(4).split('/')], 'skills': [], 'quirks': []}
            out.append(cur); continue
        if cur is None: continue
        s = ln.strip()
        if s.startswith('- Subtitles:'): cur['subtitles'] = [clean(x) for x in re.findall(r'`([^`]+)`', s)]
        elif s.startswith('- Visual Arc:'): cur['arc'] = clean(s.split(':', 1)[1])
        elif s.startswith('- Lean:'): cur['lean'] = s.split(':', 1)[1].strip().lower()
        elif s.startswith('- Trait '):
            m = re.match(r'^- Trait `(.+?)`: (.*)$', s); cur['trait'] = {'name': clean(m.group(1)), 'desc': clean(m.group(2))}
        elif s.startswith('- Basic '):
            m = re.match(r'^- Basic `(.+?)` \((\w+), \+(\d) Pep\): (.*)$', s); cur['basic'] = {'name': clean(m.group(1)), 'flavor': m.group(2), 'gain': int(m.group(3)), 'desc': clean(m.group(4))}
        elif re.match(r'^- R\d Quirk [AB] ', s):
            m = re.match(r'^- R(\d) Quirk ([AB]) `(.+?)`: (.*)$', s); cur['quirks'].append({'slot': m.group(2).lower(), 'rank': int(m.group(1)), 'name': clean(m.group(3)), 'desc': clean(m.group(4))})
        elif re.match(r'^- R\d ', s):
            m = re.match(r'^- R(\d) `(.+?)` \((\d) Pep, (\w+)\): (.*)$', s)
            slot = {1: 's1', 2: 's2', 4: 'cap'}[int(m.group(1))]
            cur['skills'].append({'slot': slot, 'rank': int(m.group(1)), 'name': clean(m.group(2)), 'pep': int(m.group(3)), 'flavor': m.group(4), 'desc': clean(m.group(5))})
    # which of the 30 does the game hold? By name, for that person.
    planned = []
    for v in out:
        have = [norm(n) for n in G['cast'].get(v['owner'], [])]
        if norm(v['name']) in have: continue
        slug = norm(v['name'])
        v['id'] = 'vibe:%s:%s' % (v['owner'], slug); v['kind'] = 'vibe'; v['stage'] = '19 to 21'
        v['when'] = {'any': [{'vibeName': [v['owner'], v['name']]}, {'vibeCount': [v['owner'], 3]}]}
        v['source'] = 'claude/battle-spec-v11.md section 3'
        planned.append(v)
    return out, planned

# ---------- the monsters (bestiary section 2) ----------
def split_row(ln): return [c.strip() for c in ln.strip().strip('|').split('|')]
def num(s):
    m = re.search(r'[\d,]+', s); return int(m.group(0).replace(',', '')) if m else None
def hp_cell(s):
    m = re.match(r'^([\d,]+)\s*(?:\((.*)\))?$', clean(s))
    return (int(m.group(1).replace(',', '')), clean(m.group(2) or '')) if m else (num(s), '')
def flavors(s):
    s = clean(s); return [] if s.lower() in ('none', '') else [x.strip() for x in s.split(',')]
def name_id(cell):
    m = re.match(r'^(.*?)\s*\(`([a-z0-9_]+)`\)\s*$', cell.strip()); return (clean(m.group(1)), m.group(2)) if m else (None, None)
def act_row(cells, offset=0):
    c = cells[offset:]
    return {'name': clean(c[0]), 'flavor': clean(c[1]), 'power': clean(c[2]), 'rec': num(c[3]), 'hits': clean(c[4]), 'tags': [t.strip() for t in clean(c[5]).split(',') if t.strip()], 'effect': clean(c[6])}
def parse_bestiary(text):
    body = text.split('## 2. The bestiary')[1].split('## 3. The Part 1 monsters that come back')[0]
    chapters = []; foes = {}; ch = None; boss = None; mode = None; last_regular = {}
    lines = body.split('\n'); i = 0
    while i < len(lines):
        ln = lines[i]; i += 1
        m = re.match(r'^### Chapter (\d+): (.+?)(?: \((.*)\))?\s*$', ln) or re.match(r'^### (Bonus) chapter: (.+?)(?: \((.*)\))?\s*$', ln)
        if m:
            n = 21 if m.group(1) == 'Bonus' else int(m.group(1))
            ch = {'n': n, 'name': clean(re.sub(r'\s*\(`.*$', '', m.group(2))), 'provisional': False, 'note': '', 'foes': []}; chapters.append(ch); boss = None; mode = None; continue
        if ch is None: continue
        if ln.startswith('> '):
            t = clean(ln[2:])
            if 'PROVISIONAL' in t: ch['provisional'] = True
            ch['note'] = (ch['note'] + ' ' + t).strip() if len(ch['note']) < 400 else ch['note']; continue
        m = re.match(r'^#### (\d+)\. (.+?) \(`([a-z0-9_]+)`\)\s*$', ln)
        if m:
            name = clean(m.group(2)); working = 'working name' in name
            f = {'id': m.group(3), 'num': int(m.group(1)), 'name': re.sub(r'\s*\(working name\)', '', name), 'working': working, 'ch': ch['n'], 'notes': [], 'acts': []}
            foes[f['id']] = f; ch['foes'].append(f['id']); boss = f; mode = 'boss'; continue
        m = re.match(r'^\*\*(\d+)\. (.+?) \(`([a-z0-9_]+)`\)\.\*\* (.*)$', ln)
        if m:   # a special entry written as one paragraph (the lenses of chapter 20, Julian)
            name = clean(m.group(2)); text_ = clean(m.group(4))
            if text_.startswith('Not a fight'): continue
            f = {'id': m.group(3), 'num': int(m.group(1)), 'name': name, 'working': False, 'ch': ch['n'], 'kind': 'special', 'role': 'Special', 'notes': [text_], 'acts': []}
            foes[f['id']] = f; ch['foes'].append(f['id']); continue
        if ln.startswith('| # | Foe'):
            mode = 'regular'; i += 1
            while i < len(lines) and lines[i].startswith('|'):
                c = split_row(lines[i]); i += 1
                nm, fid = name_id(c[1]); hp, hpn = hp_cell(c[3]); role, row = [x.strip() for x in c[2].split(',')]
                f = {'id': fid, 'num': int(c[0]), 'name': re.sub(r'\s*\(working name\)', '', nm), 'working': 'working name' in nm, 'ch': ch['n'], 'kind': 'regular', 'role': role, 'row': row, 'hp': hp, 'hpNote': hpn,
                     'atk': num(c[4]), 'def': num(c[5]), 'spd': num(c[6]), 'pips': num(c[7]), 'peeves': flavors(c[8]), 'resists': flavors(c[9]), 'start': '' if clean(c[10]).lower() == 'none' else clean(c[10]), 'drop': clean(c[11]).lower() if clean(c[11]).lower() != 'none' else '', 'notes': [], 'acts': []}
                foes[fid] = f; ch['foes'].append(fid); last_regular[nm] = fid
            continue
        if ln.startswith('| Kind | Row | HP') and boss is not None:
            c = split_row(lines[i + 1]); i += 2
            hp, hpn = hp_cell(c[2]); kind = clean(c[0]); row = clean(c[1])
            boss.update({'kind': 'boss' if kind.lower().startswith('boss') else 'miniboss', 'role': 'Boss' if kind.lower().startswith('boss') else 'Mini-boss', 'noRun': 'no running' in kind.lower(), 'row': row, 'hp': hp, 'hpNote': hpn,
                         'atk': num(c[3]), 'def': num(c[4]), 'spd': num(c[5]), 'pips': num(c[6]), 'peeves': flavors(c[7]) if 'stance' not in c[7] else [], 'resists': flavors(c[8]) if 'stance' not in c[8] else [], 'stance': clean(c[7]) if 'stance' in c[7] else '', 'reward': clean(c[9])})
            continue
        if ln.startswith('| Foe | Act'):
            i += 1
            while i < len(lines) and lines[i].startswith('|'):
                c = split_row(lines[i]); i += 1
                fid = last_regular.get(c[0])
                if fid: foes[fid]['acts'].append(act_row(c, 1))
            continue
        if ln.startswith('| Act | Flavor') and boss is not None:
            i += 1
            while i < len(lines) and lines[i].startswith('|'):
                boss['acts'].append(act_row(split_row(lines[i]))); i += 1
            continue
        if ln.startswith('- ') and boss is not None and mode == 'boss':
            boss['notes'].append(clean(ln[2:]))
    return chapters, foes

# ---------- the rules and features the plan has and the game does not ----------
# Each row was found by comparing the plan documents with the game (docs/BATTLE_GUIDE.md says how). `anchors` are strings that must be in the named source file:
# the script stops if a source stops saying it, so a row cannot outlive its evidence. `when` is the page's rule for "the game has it now".
FEATURES = [
 dict(id='feature:bag', name='BAG command and Run', stage='no stage yet', when={'any': [{'rules': 'bag'}, {'global': 'B3_BAG'}]},
      plain='The fourth button on the command cross is greyed in the new battle. In battle 2 it opened the bag and let the party run. The plan keeps both: items re-described with the new statuses, and Run in fights that allow it. No stage in the plan owns it yet.',
      source='claude/battle-architecture.md gap table rows 26 and 30; the game: the BAG button says "Not yet"', anchors=[('claude/battle-architecture.md', 'Bag in battle')]),
 dict(id='feature:skins', name='Tombo skins on the Full Family Ruckus', stage='16', when={'any': [{'global': 'B3_SKINS'}, {'rules': 'skins'}]},
      plain='The 22 Primary Tombos (named pair moves with a spoken line and an animation, from battle 2) come back as optional skins: when Tom and a partner fire a Full Family Ruckus, the skin gives the name, the line and the animation. The result stays the rule\'s (both fire their best Skill) and a skin carries no numbers. A Move Lab review (Keep, Tweak, Replace) decides which skins make the cut. Until then no Tombo shows in the new battle, and the Tombo unlock flags are still saved.',
      source='claude/battle-architecture.md section 3 and stage 16; docs/BATTLE3.md (Tombo toasts)', anchors=[('claude/battle-architecture.md', 'Tombo skins')]),
 dict(id='feature:casual', name='Casual Mode (Freelancer)', stage='19 to 21', when={'any': [{'vibeMatch': 'casual|freelancer'}, {'rules': 'casual'}]},
      plain='The endgame reward, around chapter 18. A person unlocks it by mastering all three of their Vibes. It is a fourth Vibe with no Skills of its own and no Stat Lean. As Main Vibe it gives two Pocket Vibe slots instead of one, the Basic Action of the player\'s choice from that person\'s Vibes, and all three of that person\'s Traits. With every Vibe mastered there is no Vibe Point left to earn, which the game already handles.',
      source='claude/battle-spec-v11.md section 1; claude/battle-architecture.md stages 19 to 21', anchors=[('claude/battle-spec-v11.md', 'Casual Mode')]),
 dict(id='feature:standup', name='Knocked-out members stand up at 1 HP after a win', stage='no stage yet', when={'rules': 'winStandHp'},
      plain='The spec says a member who is knocked out when a fight is won stands back up at 1 HP. In a story fight the new battle hands HP back to the map as a share of Max HP, so a member who ended the fight knocked out stays at 0 HP.',
      source='claude/battle-spec-v11.md section 2.9; claude/battle-architecture.md gap row 25; engine/b3-story.js b3sEnd', anchors=[('claude/battle-spec-v11.md', 'stand back up at 1 HP')]),
 dict(id='feature:gear', name='Gear counts in fights', stage='no stage yet', when={'any': [{'global': 'B3_GEAR'}, {'rules': 'gear'}]},
      plain='Stat bonuses from gear and Charms should pass through a mapping table in data (POW to Attack, GRIT to Defense, PEP to Speed, HP to HP), with perks that have no meaning in the new rules switched off in that table. The new battle reads no gear today: its stats come from the level table, the Lean and the Vibes.',
      source='claude/battle-architecture.md section 4.2 (Gear) and gap row 31', anchors=[('claude/battle-architecture.md', 'mapping table in data')]),
 dict(id='feature:helpers', name='Helper links and helper feedback', stage='22', when={'chapter': 13},
      plain='A boss that calls helpers (chapter 15 speaker pods, chapter 16 Citation Slips, chapter 20) takes less damage while a helper stands, and loses pips and HP when a helper is knocked out. The pips count inside the 3-pip cap of the action that did it; the HP is a flat amount with no modifiers.',
      source='claude/bestiary-v11.md section 1.1 (Helper links, Helper feedback); engine/b3-foe.js header', anchors=[('claude/bestiary-v11.md', 'Helper feedback')]),
 dict(id='feature:lenses', name='The Twin Lenses stances', stage='22', when={'chapter': 17},
      plain='Chapter 17\'s boss has two stances that swap at every round divider and on Rack Focus. Blue hates Sizzle and Clobber and resists Drench and Razzle; Orange hates Drench and Razzle and resists Sizzle and Racket. A Prime put on in one stance can be set off in the next.',
      source='claude/bestiary-v11.md chapter 17, The Twin Lenses', anchors=[('claude/bestiary-v11.md', 'Rack Focus')]),
 dict(id='feature:phases', name='Boss phases and phase lines', stage='22', when={'chapter': 20},
      plain='The last boss has three phases (100% to 66%, 65% to 31%, 30% to 0). Damage past a phase line is lost: its HP stops at the line and the next phase starts at once. Boppy\'s Gold Armor in chapter 14 also shows cracks at 75%, 50% and 25% HP.',
      source='claude/bestiary-v11.md section 1.1 (Phase lines) and chapters 14 and 20; engine/b3-foe.js header', anchors=[('claude/bestiary-v11.md', 'Phase lines')]),
 dict(id='feature:pick4', name='Pick the four again at each phase of the last fight', stage='22', when={'chapter': 20},
      plain='The party is four, and swapping happens outside battle only, with one exception: in the last fight the player picks the four again at each phase change. A person coming in for the first time arrives at full HP with 4 Pep; one who was in it earlier returns with the HP and Pep they left with. Everyone joins the turn bar waiting 100 x 100 / Speed ticks.',
      source='claude/battle-spec-v11.md section 2.1; claude/battle-architecture.md gap row 38', anchors=[('claude/battle-spec-v11.md', 'picks the 4 again')]),
 dict(id='feature:returning', name='Part 1 monsters come back in chapters 13 and 14', stage='22', when={'chapter': 14},
      plain='The Long Island monsters the family met in Part 1 return in chapters 13 and 14 as returning packs and bosses, drawn larger with a brighter palette on the Part 1 art. Which places return is set by the chapter 13 and 14 scripts.',
      source='claude/bestiary-v11.md sections 3 and 6', anchors=[('claude/bestiary-v11.md', 'The Part 1 monsters that come back')]),
]
# The stages that are left, in plan order (claude/battle-architecture.md section 5). Stages 1 to 15, 17 and 18 are built (chapters 1 to 10 are on the list).
STAGES = [
 dict(id='stage:16', n='16', name='Tombo skins', when={'any': [{'global': 'B3_SKINS'}, {'rules': 'skins'}]},
      plain='A Move Lab review of the 22 Primary Tombos (Keep, Tweak or Replace), then the kept ones wired onto the Full Family Ruckus as named skins with their recorded line.', anchors=[('claude/battle-architecture.md', '| 16 | Tombo skins')]),
 dict(id='stage:19', n='19 to 21', name='Third Vibes and Casual Mode', when={'all': [{'allVibes': 3}, {'any': [{'vibeMatch': 'casual|freelancer'}, {'rules': 'casual'}]}]},
      plain='The ten third Vibes, three or four people per conversation, then Casual Mode. At the end all 30 Vibes are in the game and each person can be Main in any of three jobs. They show in the Family tab as PLANNED until then.', anchors=[('claude/battle-architecture.md', '| 19 to 21 |')]),
 dict(id='stage:22', n='22', name='The Part 2 chapters, 11 to 20', when={'all': [{'chapter': c} for c in range(11, 21)]},
      plain='Each chapter\'s monsters and boss are built inside that chapter\'s own story build, one chapter per conversation, with the helper links, the lenses, the phase lines and picking the four again where a chapter needs them. A chapter goes on the new battle only after its fights pass in the Battle Lab and its chapter test passes.', anchors=[('claude/battle-architecture.md', '| 22 | Part 2 bestiary')]),
 dict(id='stage:23', n='23', name='The purge', when={'noScript': 'engine/battle2'},
      plain='Battle 2 is deleted: the old battle files, Stampcards, Kindness in battle, the Director\'s Cuts, the Family Finishes, unused voice lines and clips, the old Lab fights and old docs. Nothing new to see; the game is smaller and loads faster.', anchors=[('claude/battle-architecture.md', '| 23 | The purge')]),
]
CHAPTER_STAGE = {21: 'bonus card c-b3s18bonus'}

def check_anchors():
    cache = {}
    for it in FEATURES + STAGES:
        for f, a in it['anchors']:
            cache.setdefault(f, read(f))
            if a not in cache[f]: raise SystemExit('The source %s no longer says %r (planned item %s). Read the plan again and fix tools/guide_planned.py.' % (f, a, it['id']))

def build():
    G = game(); check_anchors()
    spec = read('claude/battle-spec-v11.md'); best = read('claude/bestiary-v11.md')
    allv, vibes = parse_vibes(spec, G)
    chapters, foes = parse_bestiary(best)
    # every Vibe parsed whole, 40 moves a pass
    for v in allv:
        assert v.get('trait') and v.get('basic') and len(v['skills']) == 3 and len(v['quirks']) == 2 and len(v.get('subtitles', [])) == 3 and v.get('lean') in LEAN, ('bad Vibe', v['owner'], v['name'])
    assert len(allv) == 30, len(allv)
    items = list(vibes)
    for f in foes.values():
        if f['id'] in G['foes']: continue
        f['kind'] = f.get('kind', 'regular'); f['stage'] = '22'; f['plannedId'] = f['id']; f['id'] = 'foe:' + f['id']; f['monster'] = f['plannedId']
        f['when'] = {'foe': BUILT_AS.get(f['monster'], f['monster'])}; f['source'] = 'claude/bestiary-v11.md chapter %s' % ('bonus' if f['ch'] == 21 else f['ch'])
        items.append(dict(f, kind='foe', foeKind=f.pop('kind')))
    for fe in FEATURES:
        items.append(dict(id=fe['id'], kind='feature', name=fe['name'], plain=fe['plain'], stage=fe['stage'], when=fe['when'], source=fe['source']))
    for st in STAGES:
        items.append(dict(id=st['id'], kind='stage', n=st['n'], name=st['name'], plain=st['plain'], when=st['when'], source='claude/battle-architecture.md section 5'))
    chs = [dict(n=c['n'], name=c['name'], provisional=c['provisional'], foes=[x for x in c['foes']], card=CHAPTER_STAGE.get(c['n'], '')) for c in chapters]
    for c in chs:
        if c['n'] not in G['chapters']:
            items.append(dict(id='chapter:%s' % c['n'], kind='chapter', n=c['n'], name=c['name'], provisional=c['provisional'], when=({'chapter': c['n']} if c['n'] < 21 else {'any': [{'chapter': 21}, {'chapter': 'bonus'}]}), stage='22' if c['n'] < 21 else 'bonus', card=c['card'], source='claude/bestiary-v11.md chapter %s' % ('bonus' if c['n'] == 21 else c['n'])))
    doc = {'v': 1, 'note': 'Generated by tools/guide_planned.py from the plan documents; do not edit by hand. The page (battle-guide.html) drops an item when its `when` rule holds in the game\'s own data.',
           'sources': {p: sha(p) for p in SOURCES}, 'alsoRead': ALSO_READ,
           'chapters': [dict(n=c['n'], name=c['name']) for c in chs], 'items': items}
    return doc

def main():
    if '--check' in sys.argv:
        if not os.path.exists(OUT): print('data/guide-planned.json is missing: run python3 tools/guide_planned.py'); sys.exit(1)
        have = json.load(open(OUT, encoding='utf-8')).get('sources', {})
        bad = [p for p in SOURCES if have.get(p) != sha(p)]
        if bad: print('data/guide-planned.json is stale; a source changed: %s. Run python3 tools/guide_planned.py' % ', '.join(bad)); sys.exit(1)
        print('data/guide-planned.json is up to date'); return
    doc = build()
    s = json.dumps(doc, ensure_ascii=False, separators=(',', ':'))
    assert DASH not in s
    open(OUT, 'w', encoding='utf-8').write(s + '\n')
    n = {}
    for it in doc['items']: n[it['kind']] = n.get(it['kind'], 0) + 1
    print('wrote data/guide-planned.json (%d bytes): %s' % (len(s), ', '.join('%d %s' % (v, k) for k, v in sorted(n.items()))))

if __name__ == '__main__': main()
