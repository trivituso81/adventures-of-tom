#!/usr/bin/env python3
"""manifest_crosswalk.py (card c-guide-crosswalk, build guidecross1, 2026-11-25).

Writes data/guide-manifest.json, the one file the Battle Guide reads to show, on each move's page, what the Stage 2 manifests say about it
(the clip's motion text, length, contact, beats, hit-stop, the effects it uses and whether they are built) and what Tom has to supply or
approve before the move can be implemented. Also keeps the generated section of docs/BATTLE_GUIDE.md ("Manifest crosswalk and what Tom has to do").

  python3 -I tools/guidegen/manifest_crosswalk.py           writes data/guide-manifest.json and the docs section
  python3 -I tools/guidegen/manifest_crosswalk.py --check   exits 1 when either file is not what this would write
  python3 -I tools/guidegen/manifest_crosswalk.py --report  prints every unmatched item and the counts

Sources (read only, nothing in them is changed):
  art-factory/aot-stage2-pass1-manifest-24fps.json, pass2, pass3   the 123 moves (id, clip motion text, engineSpec)
  art-factory/aot-stage2c-vfx-library-v11.json                      the 37 effect assets (buildStatus, usedBy)
  art-factory/move-packets-pass1.json                               the pass 1 packets: used to CHECK the effect matches (vfx_cue_id)
  art-factory/start-frame-queue-pass1.json, queue.json              held props, start frame and clip draft status
  art-factory/refs/<id>.png, PIPELINE_LOCK.json                     the Hero PNGs, the raw clip length of the lock
  data/b3-*.js (through node), data/guide-anims.json                the game's skills and which of them have a video

NOT read, on purpose: the manifests' wanDefaults.stylePrefix and negativePrompt, and the style part of every clip's positivePrompt. They carry
the green screen and the painting word that the Battle Animation Pipeline Lock bans (CLAUDE.md). Only the motion text (what follows the
"[Clip: ... frames @ 24fps]" tag) and engineSpec are kept. The test fails if a banned word reaches data/guide-manifest.json.

How a move is matched to a game skill: by name (lowercase letters and digits only, one skill with that name). 117 of 123 match. The other 6
are in HAND_MOVES with the reason. How an effect is matched to a library asset: the manifests name effects per move (vfx_clobber_3hit_pops)
and the library names shared engine pieces (vfx_core_clobber_impact), so no name is equal. FAMILIES below holds the rule (a pattern on the
effect name) for each asset and HAND_EFFECTS the exceptions, each with its reason. Every match is then CHECKED against the library's own
usedBy list (is the move listed on that asset?) and, for pass 1, against move-packets-pass1.json (vfx_cue_id and secondary_vfx_cue_ids);
a match the checks do not back says so in its `why`. An effect no rule or hand entry covers is listed under `unmatched`."""
import hashlib, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
AF = os.path.join(ROOT, 'art-factory')
OUT = os.path.join(ROOT, 'data', 'guide-manifest.json')
DOC = os.path.join(ROOT, 'docs', 'BATTLE_GUIDE.md')
DOC_BEGIN = '<!-- manifest-crosswalk:begin (written by tools/guidegen/manifest_crosswalk.py, do not edit by hand) -->'
DOC_END = '<!-- manifest-crosswalk:end -->'
MANIFESTS = ['aot-stage2-pass1-manifest-24fps.json', 'aot-stage2-pass2-manifest-24fps.json', 'aot-stage2-pass3-manifest-24fps.json']
LIBRARY = 'aot-stage2c-vfx-library-v11.json'
BANNED = ['#00ff00', 'chroma', 'gouache', '4 heads tall', 'bobblehead', 'sprite']   # the pipeline lock's words; the test scans data/guide-manifest.json for them
TIER_SLOT = {'Basic Action': 'basic', 'Skill 1': 's1', 'Skill 2': 's2', 'Grand Capstone': 'cap'}
SLOT_WORDS = {'basic': 'Basic', 's1': 'Skill 1', 's2': 'Skill 2', 'cap': 'Capstone'}
CHAR_ID = {'Tom': 'tom', 'Grace': 'grace', 'Rose': 'rose', 'Amy': 'amy', 'Deedee': 'deedee', 'Boppy': 'boppy', 'TNB': 'tnb', 'Nara': 'nara', 'Justin': 'justin', 'Olivia': 'olivia'}

# ---------------------------------------------------------------- the 6 moves whose name does not match a game skill
# manifest id -> (kind, game id, why). kind skill: a row of B3_SKILLS. kind rule: not a skill, a rule of B3_RULES.ruckus (Family Ruckus, spec 2.10).
HAND_MOVES = {
    'rose-sr-cap': ('skill', 'double_lamby_return_cart_blitz', 'Rose, Sugar Rush, Capstone. The manifest says "Pinball Blitz", the game says "Return-Cart Blitz". Same slot, same Vibe.'),
    'nara-ap-s2': ('skill', 'vacuum_cleaner_bolt', 'Nara, Attached Pup, Skill 2. The manifest says "Skateboard Bolt!", the game says "Vacuum-Cleaner Bolt!". Same slot, same Vibe.'),
    'grace-sp-cap': ('skill', 'grand_jete_spotlight_finale', 'Grace, Stage Performer, Capstone. Same name; the game spells Jeté with an accent, the manifest without.'),
    'boppy-ba-s1': ('skill', 'lead_sinker_boat_slam', 'Boppy, Boat Angler, Skill 1. The manifest says "Pier Slam", the game says "Boat Slam" (the pier canon: the manifest set piece honours the no-boat lock).'),
    'univ-double-team': ('rule', 'ruckus.double', 'Not a skill. Double Team is the Family Ruckus at 50% (B3_RULES.ruckus.doubleTeam, engine/b3-ruckus.js, shown in the Rules tab under Family Ruckus).'),
    'univ-full-ruckus': ('rule', 'ruckus.full', 'Not a skill. The Full Family Ruckus is the Family Ruckus at 100% (B3_RULES.ruckus.full, engine/b3-ruckus.js, shown in the Rules tab under Family Ruckus).'),
}
# Held-prop calls Tom has already made, in his words (CLAUDE.md, One held prop, WO-01H): manifest id -> what he decided.
HELD_DECIDED = {'justin-bb-basic': 'the claw hammer is held and the stud finder is clipped flat on the belt (Tom, WO-01H, 2026-11-25)'}
# Of the six, these differ in WORDS and need Tom to say which name is canon (an accent alone does not).
NAME_DECISIONS = {
    'rose-sr-cap': 'Which name is canon: the game\'s "Double-Lamby Return-Cart Blitz" or the manifest\'s "Double-Lamby Pinball Blitz"? Recommended: keep the game\'s name (a spoken line may carry it).',
    'nara-ap-s2': 'Which name is canon: the game\'s "Vacuum-Cleaner Bolt!" or the manifest\'s "Skateboard Bolt!"? Recommended: keep the game\'s name (a spoken line may carry it).',
    'boppy-ba-s1': 'Which name is canon: the game\'s "Lead-Sinker Boat Slam" or the manifest\'s "Lead-Sinker Pier Slam"? Recommended: "Pier Slam", because the pier set piece forbids a boat; changing the game name would silence its baked line until a re-bake.',
}

# ---------------------------------------------------------------- effects
# Library assets by family. A rule is (pattern on the effect name without "vfx_", asset id). First match wins. Set pieces are narrowed by the
# move's usedBy (one set piece asset per move), the other rules are checked against it.
CORE = lambda n: 'vfx_core_' + n
FAMILIES = [
    (r'^setpiece_', 'SETPIECE'),
    (r'^proj_(controller_boomerang|dumpling_boomerang)$', 'proj_boomerang_return'),
    (r'^proj_(needoh_ally_arc|cinnamon_roll_slide|snack_pouches_party|dairy_free_snacks_party|warm_apple_muffins_party)$', 'proj_ally_handoff_party'),
    (r'^proj_', 'proj_arc_single'),
    (r'^(ground_|floor_molten|mud_splat|tiny_falling_screw|floating_sofa)', 'proj_ground_hazard_mat'),
    (r'^clobber', CORE('clobber_impact')),
    (r'^(piercing_clobber|screw_sparks|shield_rip_shrapnel)', CORE('clobber_impact')),
    (r'^(sizzle|stuffed_melee_burn|double_burn|shared_warm_plate_steam)', CORE('sizzle_wave')),
    (r'^(drench|enemy_aoe_drenched)', CORE('drench_splash')),
    (r'^dual_drench', CORE('drench_splash')),
    (r'^razzle', CORE('razzle_beam_arc')),
    (r'^(dazzled|highbeam|blackout_flashlight|red_stud|wired_circuit|rental_ebike|front_door_latch|alcohol_swab|stage_spotlight)', CORE('razzle_beam_arc')),
    (r'^(racket|jetwash_racket)', CORE('racket_rings')),
    (r'^(detonat|double_burn_tick)', CORE('detonation_pops')),
    (r'^(composure|4pip_composure|shared_composure|resist_down|forced_razzle_peeve|passive_power)', CORE('composure_break')),
    (r'^(emerald|heal|full_cleanse|cleanse|self_cleanse|board_cleanse|slow_fatigue|party_heal|party_mental|revive|moonlight|regen|hot_dinner|chicken_snack|dual_heal|vfx_heal|ally_recovery)', CORE('heal_cleanse')),
    (r'^(shield|plush_self|clay_carapace|cozy_jacket|gypsum|seatbelt|fresh_ride|ally_fired|ally_golden|brass_def|iron_thorns|party_def|party_cool|party_feast|guts_1hp|pottery_wheel|velvet_stanchion|aoe_cover|hovering_blue|rainbow_invincible|on_air_stealth|pushback_immune|guard_stance|next_dmg_down|aoe_pushback)', CORE('shield_ward')),
    (r'^(timeline|turn_advance|tempo|pushback|slow_clocks|bonus_turn|ally_turn_pull|speed|sugar_kick|rolling_skateboard|whopper_tally|pep_|cadence|workout_countdown|ruckus_|rep_counter|ally_pep|aoe_buff_lock)', CORE('timeline_chevrons')),
    (r'^(atk_|ally_atk|eva_atk|acc_|crit|aggro|redirect|buff_|stolen_buff|eyes_on_me|target_intel|stat_scan|guaranteed_accuracy|dual_atk|triple_stat|minor_buff|poise_crit|breaking_news|chyron|4color|ebike_buff|ally_stuffed|ally_buff|ally_50pct|no_target|twin_lamby|speed_steal|speed_sync|delta_one|fishing_line|interrupt|perm_def|forced|pep_mark|cattail_pier|creative_mess|clearing_lights|purple_theater|airborne|guard_stance_rip)', CORE('status_debuff_badges')),
]
# Hand matches: effect name (without any annotation) -> (asset id, why). Used where the pattern would be a guess or has no pattern.
HAND_EFFECTS = {
    # Each reason quotes the library's own summary of the asset, which names the thing.
    'vfx_proj_tattered_lamby_mark': ('proj_boomerang_return', 'library summary of proj_boomerang_return names the tattered Lamby'),
    'vfx_rental_ebike_unlock_chirp': ('proj_ally_handoff_party', 'library summary of proj_ally_handoff_party names the rental e-bike chirp'),
    'vfx_rolling_skateboard_pass': ('proj_ground_hazard_mat', 'library summary of proj_ground_hazard_mat names the skateboard rolling debris'),
    'vfx_setpiece_80lb_red_toolbox_missile': ('proj_arc_single', 'named a set piece in the manifest, but the library builds the 80-lb toolbox as a projectile on proj_arc_single (its summary says so)'),
    'vfx_tiny_falling_screw': ('proj_arc_single', 'a falling screw is a thrown object; Justin\'s Capstone packet cues proj_arc_single'),
    'vfx_ruckus_50pct_link_flash': ('setpiece_gym_bleachers_and_ruckus_crest', 'library summary of that set piece: the 50% Double Team link flash'),
    'vfx_ruckus_100pct_storybook_crest': ('setpiece_gym_bleachers_and_ruckus_crest', 'the set piece is named for the Ruckus crest'),
    'vfx_party_cool_mist_blanket_25pct': ('vfx_core_drench_splash', 'library summary of vfx_core_drench_splash names the nursery cool-mist clouds'),
    'vfx_forced_razzle_peeve_badge': ('vfx_core_status_debuff_badges', 'library summary of vfx_core_status_debuff_badges names the forced Razzle Pet Peeve badge'),
    'vfx_passive_power_cut_icons': ('vfx_core_status_debuff_badges', 'a row of debuff icons'),
    'vfx_aoe_pushback_20pct': ('vfx_core_timeline_chevrons', 'library summary of vfx_core_timeline_chevrons names 10%-35% pushback'),
    'vfx_aoe_buff_lock_1t': ('vfx_core_status_debuff_badges', 'a buff lock is a status badge'),
    'vfx_delta_one_pod_doors': ('setpiece_delta_one_pod_doors', 'the effect is the set piece of the same name (Suite Door Slide)'),
    'vfx_cattail_pier_pilings_edge': ('setpiece_cattail_pier_leviathan', 'library summary of that set piece: anchors the weathered Cattail Pier pilings'),
    'vfx_fishing_line_backrow_hook_pull': ('proj_boomerang_return', 'library summary of proj_boomerang_return names Boppy\'s pier fishing line and lure'),
    'vfx_ally_spd_15pct_small_heal': ('vfx_core_heal_cleanse', 'a small heal; this is the other branch of an OR with a Drench splash'),
    'vfx_yellow_caution_cone': ('vfx_core_drench_splash', 'usedBy elimination: Deedee Nurse-Fixes-Everything Skill 1 lists vfx_core_drench_splash and no effect of the move maps to it (a yellow wet-floor cone)'),
    'vfx_backup_lamby_decoy_glint': ('vfx_core_timeline_chevrons', 'usedBy elimination: Rose Prankster Skill 2 lists vfx_core_timeline_chevrons and no effect of the move maps to it. Weakest match of the file: confirm'),
    'vfx_ally_yeast_buff_extend': ('vfx_core_status_debuff_badges', 'an ally buff extended; same family as vfx_ally_buff_refresh_halos'),
}


def jload(p):
    with open(p, encoding='utf-8') as f: return json.load(f)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]


def norm(s):
    return re.sub(r'[^a-z0-9]+', '', str(s).lower())


def game():
    """The game's skills and Vibes, loaded the way tools/guidegen/build_map.js does (the b3 data scripts of index.html, in order)."""
    js = r"""
const fs=require('fs'),path=require('path'),vm=require('vm');const R=process.argv[1];
const html=fs.readFileSync(path.join(R,'index.html'),'utf8');
const files=[...html.matchAll(/<script[^>]+src="(data\/b3-[^"?]+\.js)/g)].map(m=>m[1]);
const ctx=vm.createContext({Math,JSON,Object,Array,String,Number,Error,console:{log(){},error(){}}});
for(const f of files)vm.runInContext(fs.readFileSync(path.join(R,f),'utf8'),ctx,{filename:f});
const g=n=>vm.runInContext('typeof '+n+'!=="undefined"?'+n+':null',ctx);
const S=g('B3_SKILLS'),V=g('B3_VIBES'),RU=g('B3_RULES');
console.log(JSON.stringify({skills:Object.values(S).map(s=>({id:s.id,name:s.name,slot:s.slot,vibe:s.vibe||null,vibeName:s.vibe&&V[s.vibe]?V[s.vibe].name:null,owner:s.vibe&&V[s.vibe]?V[s.vibe].owner:null,anim:s.anim||null})),ruckus:RU&&RU.ruckus||null}));
"""
    r = subprocess.run(['node', '-e', js, ROOT], capture_output=True, text=True)
    if r.returncode: sys.exit('node could not load the game data: ' + r.stderr[:400])
    return json.loads(r.stdout)


def parse_effects(raw):
    """One manifest vfxPrimitives string -> a list of {name, role, note}. The manifests annotate: "(counter: x)", "(ambush: x)",
    "(2 allies)", "a OR b" (a branch of the move), "a (cast) / b (counter)"."""
    out = []
    for part in re.split(r'\s+/\s+|\s+OR\s+', raw):
        alt = ' OR ' in raw
        for m in re.finditer(r'(vfx_[a-z0-9_]+)(?:\s*\(([^)]*)\))?', part):
            name, note = m.group(1), (m.group(2) or '').strip()
            role = 'alternative' if alt else 'effect'
            inner = re.match(r'(counter|ambush):\s*(vfx_[a-z0-9_]+)$', note)
            if inner:
                out.append({'name': name, 'role': role, 'note': ''})
                out.append({'name': inner.group(2), 'role': inner.group(1), 'note': ''})
                continue
            if note in ('cast', 'counter'): role = note; note = ''
            out.append({'name': name, 'role': role, 'note': note})
    return out


def rule_asset(name):
    key = name[4:] if name.startswith('vfx_') else name
    for pat, asset in FAMILIES:
        if re.search(pat, key): return asset
    return None


def main():
    flags = sys.argv[1:]
    moves, packs = [], {}
    sources = {}
    for i, f in enumerate(MANIFESTS, 1):
        d = jload(os.path.join(AF, f)); sources[f] = sha(os.path.join(AF, f))
        for m in d['moves']:
            m['_pass'] = i; moves.append(m)
    lib = jload(os.path.join(AF, LIBRARY)); sources[LIBRARY] = sha(os.path.join(AF, LIBRARY))
    assets = {a['id']: a for a in lib['assets']}
    lock = jload(os.path.join(AF, 'PIPELINE_LOCK.json'))
    for p in ('move-packets-pass1.json', 'start-frame-queue-pass1.json', 'queue.json'):
        sources[p] = sha(os.path.join(AF, p))
    sources['PIPELINE_LOCK.json'] = sha(os.path.join(AF, 'PIPELINE_LOCK.json'))
    packets = {m['id']: m for m in jload(os.path.join(AF, 'move-packets-pass1.json'))['moves']}
    sfq = jload(os.path.join(AF, 'start-frame-queue-pass1.json'))
    queue = jload(os.path.join(AF, 'queue.json'))['items']
    G = game()
    anims = jload(os.path.join(ROOT, 'data', 'guide-anims.json'))['anims']
    skills = {s['id']: s for s in G['skills']}
    by_name = {}
    for s in G['skills']: by_name.setdefault(norm(s['name']), []).append(s)
    hero_have = {c: os.path.exists(os.path.join(AF, 'refs', c + '.png')) for c in CHAR_ID.values()}
    raw_cap = lock['raw_duration_sec']
    mids = {m['id'] for m in moves}

    # ---------- moves -> skills
    xmoves, unmatched_moves, checks = {}, [], []
    for m in moves:
        mid = m['id']
        rec = {'pass': m['_pass'], 'character': m['character'], 'vibe': m['vibe'], 'tier': m['tier'], 'name': m['name'], 'flavor': m['flavor']}
        if mid in HAND_MOVES:
            kind, gid, why = HAND_MOVES[mid]
            rec['match'] = {'how': 'hand', 'kind': kind, 'id': gid, 'why': why}
            if kind == 'skill' and gid not in skills: unmatched_moves.append({'id': mid, 'why': 'hand match points at %s, which is not a game skill' % gid})
            if kind == 'rule' and not (G['ruckus'] and gid.split('.')[1] in ('double', 'full')): unmatched_moves.append({'id': mid, 'why': 'hand match points at rule %s, which the game does not have' % gid})
        else:
            c = by_name.get(norm(m['name']), [])
            if len(c) == 1: rec['match'] = {'how': 'name', 'kind': 'skill', 'id': c[0]['id'], 'why': ''}
            else:
                rec['match'] = None; unmatched_moves.append({'id': mid, 'why': '%d game skills have this name' % len(c)})
        mt = rec['match']
        if mt and mt['kind'] == 'skill' and mt['id'] in skills:
            s = skills[mt['id']]
            if s['vibe'] is not None:
                if s['slot'] != TIER_SLOT[m['tier']]: checks.append('%s: manifest tier %s but game slot %s' % (mid, m['tier'], s['slot']))
                if s['owner'] != CHAR_ID.get(m['character']): checks.append('%s: manifest character %s but game owner %s' % (mid, m['character'], s['owner']))
                if norm(s['vibeName']) != norm(m['vibe']): checks.append('%s: manifest Vibe %s but game Vibe %s' % (mid, m['vibe'], s['vibeName']))
            if mt['how'] == 'name' and s['name'] != m['name']: checks.append('%s: names differ only in spelling' % mid)
        w, e = m['wanClip'], m['engineSpec']
        mm = re.match(r'^.*?\[Clip: [^\]]*\]\s*(.*)$', w['positivePrompt'], re.S)
        if not mm: sys.exit('%s: positivePrompt has no [Clip: ...] tag, cannot take the motion text' % mid)
        rec['clip'] = {'file': w['filename'], 'motion': mm.group(1).strip(), 'durationSec': w['durationSec'], 'fps': w['fps'], 'frames': w['numFrames']}
        rc = m['reactiveCounterClip']
        rec['counterClip'] = None
        if rc:
            cm = re.match(r'^.*?\[Clip: [^\]]*\]\s*(.*)$', rc['positivePrompt'], re.S)
            rec['counterClip'] = {'file': rc['filename'], 'motion': cm.group(1).strip(), 'durationSec': rc['durationSec'], 'fps': rc['fps'], 'frames': rc['numFrames']}
        rec['engine'] = {'beatsSec': e['beatsSec'], 'contactSec': e['contactTriggerSec'], 'hitStopFrames': e['hitStopFrames'], 'translationPath': e['translationPath'], 'v11Hook': e['v11Hook']}
        rec['_vfx_raw'] = e['vfxPrimitives']
        xmoves[mid] = rec

    # ---------- effects -> assets
    xeff, unmatched_eff, disputes = {}, [], []
    def asset_for(move_id, name):
        a = HAND_EFFECTS.get(name)
        if a: return a[0], 'hand', a[1]
        r = rule_asset(name)
        if r == 'SETPIECE':
            c = [aid for aid, A in assets.items() if aid.startswith('setpiece_') and move_id in A['usedBy']]
            if len(c) == 1: return c[0], 'usedBy', 'the one set piece asset whose usedBy lists this move'
            return None, 'none', 'set piece: %d candidate assets list this move in usedBy' % len(c)
        if r: return r, 'rule', 'family rule'
        return None, 'none', 'no rule and no hand entry'
    for mid, rec in xmoves.items():
        rec['effects'] = []
        for raw in rec.pop('_vfx_raw'):
            for ef in parse_effects(raw):
                aid, how, why = asset_for(mid, ef['name'])
                ok = None
                if aid:
                    ok = mid in assets[aid]['usedBy']
                rec['effects'].append({'name': ef['name'], 'role': ef['role'], 'note': ef['note'], 'asset': aid})
                x = xeff.setdefault(ef['name'], {'asset': aid, 'how': how, 'why': why, 'moves': []})
                if x['asset'] != aid: disputes.append('%s resolves to %s here and %s elsewhere' % (ef['name'], aid, x['asset']))
                x['moves'].append(mid)
    return xmoves, xeff, assets, unmatched_moves, checks, disputes, packets, skills, anims, sfq, queue, hero_have, raw_cap, sources, mids, G


def build():
    (xmoves, xeff, assets, um, checks, disputes, packets, skills, anims, sfq, queue, hero_have, raw_cap, sources, mids, G) = main()
    # ---------- confirm every pair against the library's own usedBy; enrich effects
    pairs = ok = 0
    for mid, r in xmoves.items():
        for e in r['effects']:
            a = e['asset']
            e['built'] = assets[a]['buildStatus'] if a else 'no asset'
            e['confirmed'] = (mid in assets[a]['usedBy']) if a else None
            if a: pairs += 1; ok += 1 if e['confirmed'] else 0
    for n, x in xeff.items():
        x['confirmed'] = any(xmoves[m]['effects'] and any(e['name'] == n and e['confirmed'] for e in xmoves[m]['effects']) for m in x['moves'])
        x['moves'] = sorted(set(x['moves']))
    amap = {}
    for a in assets:
        amap[a] = sorted({m for m, r in xmoves.items() for e in r['effects'] if e['asset'] == a})
    not_backed = sorted([a, m] for a, A in assets.items() for m in A['usedBy'] if m in xmoves and m not in amap[a])
    stale = sorted([a, m] for a, A in assets.items() for m in A['usedBy'] if m not in mids)
    packet_gaps = []
    for mid, p in packets.items():
        if mid not in xmoves: continue
        want = [p['vfx_cue_id']] + list(p.get('secondary_vfx_cue_ids') or [])
        have = {e['asset'] for e in xmoves[mid]['effects'] if e['asset']}
        for w in want:
            if w not in have: packet_gaps.append([mid, w])
    # ---------- the game side of each move
    by_skill = {}
    for mid, r in xmoves.items():
        mt = r['match']
        if mt and mt['kind'] == 'skill': by_skill[mt['id']] = mid
        r['game'] = None
        if mt and mt['kind'] == 'skill':
            an = anims.get('move:' + mt['id'])
            sk = skills[mt['id']]
            ac = (sk.get('anim') or {}).get('clip')
            baked = bool(ac) and os.path.exists(os.path.join(ROOT, 'data', 'clips', ac.replace('_', '-') + '.js'))
            r['game'] = {'skill': mt['id'], 'name': sk['name'], 'video': bool(an and an.get('video')), 'clip': (an or {}).get('clip') or ac, 'start': (an or {}).get('start'), 'waitsStaging': bool(an and an.get('waitsStaging')),
                         'factoryClip': ac if (ac and ac.startswith('pf_') and baked) else None}
    # ---------- factory status (queue.json) per move
    drafts = {i['move_id']: i for i in queue if i['stage'] == 'battle_move_draft'}
    starts = {i['move_id']: i for i in queue if i['stage'] == 'start_frames'}
    flagged = {m['move_id']: m for m in sfq['flagged_moves']}
    # ---------- needs: what Tom must supply or approve, one row per item. who: tom (can act now), claude (Claude first, then Tom approves), none
    for mid, r in xmoves.items():
        needs, ch = [], CHAR_ID.get(r['character'])
        # Hero
        if ch:
            if hero_have.get(ch): needs.append({'kind': 'hero', 'what': 'Hero PNG', 'status': 'approved: art-factory/refs/%s.png is the visual authority' % ch, 'who': 'none', 'tom': ''})
            else: needs.append({'kind': 'hero', 'what': 'Hero PNG', 'status': 'missing: no art-factory/refs/%s.png' % ch, 'who': 'tom', 'tom': 'Supply the Hero PNG for %s.' % r['character']})
        else:
            needs.append({'kind': 'hero', 'what': 'Hero PNG', 'status': 'two members act together; each uses their own Hero PNG', 'who': 'none', 'tom': ''})
        # start frame
        f = flagged.get(mid)
        fc = (r['game'] or {}).get('factoryClip')
        if fc:
            needs.append({'kind': 'start', 'what': 'Start frame', 'status': 'used: the clip %s was made from it and is baked in the game' % fc, 'who': 'none', 'tom': ''})
        elif f:
            st = starts.get(f['prop_kit_id'])
            props = f['held_props']
            if st:
                why = '; '.join(st.get('qa_issues') or []) or 'no reason recorded'
                stat = 'prop-locked start frame (kit %s: %s). Factory: %s after %s tries (%s)' % (f['prop_kit_id'], ', '.join(props), st['status'], st.get('qa_retries', '?'), why)
                if st['status'] == 'qa_passed': need = {'who': 'tom', 'tom': 'Approve start frame %s.' % f['prop_kit_id']}
                else: need = {'who': 'claude', 'tom': 'Nothing yet: Claude re-runs the start frame check, then you approve start frame %s.' % f['prop_kit_id']}
            else:
                stat = 'prop-locked start frame needed (kit %s: %s). Not in the factory queue' % (f['prop_kit_id'], ', '.join(props)); need = {'who': 'claude', 'tom': 'Nothing yet: Claude queues the start frame, then you approve it.'}
            needs.append(dict({'kind': 'start', 'what': 'Start frame', 'status': stat}, **need))
            if len(props) > 1 and mid in HELD_DECIDED:
                needs.append({'kind': 'start', 'what': 'Held prop', 'status': 'decided: ' + HELD_DECIDED[mid], 'who': 'none', 'tom': ''})
            elif len(props) > 1:
                needs.append({'kind': 'decision', 'what': 'Two held props', 'status': 'the packet lists %d props (%s) but a Wan clip holds at most one (CLAUDE.md, One held prop)' % (len(props), ', '.join(props)), 'who': 'tom', 'tom': 'Decide which prop is held; the other is worn flat on the belt. Recommended: %s (the first the packet lists).' % props[0]})
        elif mid in packets:
            needs.append({'kind': 'start', 'what': 'Start frame', 'status': 'plain Hero cutout, no held prop in the packet', 'who': 'none', 'tom': ''})
        elif r['character'] == 'Universal':
            needs.append({'kind': 'start', 'what': 'Start frame', 'status': 'group move: start frames of both members', 'who': 'none', 'tom': ''})
        else:
            needs.append({'kind': 'start', 'what': 'Start frame', 'status': 'no start frame plan yet: the held-prop queue (Phase 1A) covers pass 1 only, this move is in pass %d' % r['pass'], 'who': 'claude', 'tom': 'Nothing yet: Claude lists its held props first, then you approve the start frame.'})
        # clip
        def clip_need(label, cid, c):
            d = drafts.get(cid)
            if d and d['qa_passed']: return {'kind': 'clip', 'what': label, 'status': 'draft passed the factory QA (score %s)' % d.get('qa_overall', '?'), 'who': 'tom', 'tom': 'Approve the %s %s.' % (label.lower(), cid)}
            if d: return {'kind': 'clip', 'what': label, 'status': 'draft failed the factory QA (%s)' % (', '.join(d.get('qa_failure_tags') or []) or 'no tag'), 'who': 'claude', 'tom': 'Nothing yet: Claude makes it again, then you approve it.'}
            return {'kind': 'clip', 'what': label, 'status': 'no draft yet', 'who': 'claude', 'tom': 'Nothing yet: Claude makes it, then you approve it.'}
        g = r['game']
        if fc: needs.append({'kind': 'clip', 'what': 'Clip', 'status': 'baked in the game as %s (factory route)' % fc, 'who': 'none', 'tom': ''})
        else:
            needs.append(clip_need('Clip', mid, r['clip']))
            if g and g['video']: needs[-1]['status'] += '; the game already plays a clip for this move (%s) from the older route' % g['clip']
        if r['counterClip']: needs.append(clip_need('Counter clip', r['counterClip']['file'][:-4], r['counterClip']))
        for label, c in (('Clip', r['clip']), ('Counter clip', r['counterClip'])):
            if c and c['durationSec'] > raw_cap and not (fc and label == 'Clip'):
                needs.append({'kind': 'decision', 'what': 'Length', 'status': '%s %s is %.1f s; the pipeline lock makes raw clips of %.1f s at native speed' % (label, c['file'], c['durationSec'], raw_cap), 'who': 'tom', 'tom': 'Approve a body clip of at most %.1f s, the rest drawn by the engine as stage and set piece (the staging plan). Recommended.' % raw_cap})
        # effects not built
        seen = set()
        for e in r['effects']:
            if e['name'] in seen: continue
            seen.add(e['name'])
            if not e['asset']:
                needs.append({'kind': 'decision', 'what': 'Effect with no library asset', 'status': '%s has no asset in the effect library' % e['name'], 'who': 'tom', 'tom': 'Decide: add a new library asset for %s, or drop it from the move. Recommended: drop it.' % e['name']})
            elif e['built'] != 'built':
                needs.append({'kind': 'effect', 'what': e['name'], 'status': '%s: %s (%s)' % (e['asset'], e['built'], 'matched by ' + xeff[e['name']]['how']), 'who': 'claude', 'tom': 'Nothing yet: Claude builds %s, then you approve how it looks.' % e['asset']})
        if mid in NAME_DECISIONS: needs.append({'kind': 'decision', 'what': 'Name', 'status': 'the game and the manifest name this move differently', 'who': 'tom', 'tom': NAME_DECISIONS[mid]})
        if mid == 'rose-pr-s2' and 'vfx_backup_lamby_decoy_glint' in xeff:
            needs.append({'kind': 'decision', 'what': 'Weak effect match', 'status': 'vfx_backup_lamby_decoy_glint is matched by elimination only', 'who': 'tom', 'tom': 'Confirm the decoy glint uses the timeline chevron asset, or name another. Recommended: confirm.'})
        r['needs'] = needs
        r['tomNow'] = [n['tom'] for n in needs if n['who'] == 'tom']
    # ---------- the one-page summary, grouped by what Tom has to do
    def ids(pred): return sorted(m for m, r in xmoves.items() if any(pred(n) for n in r['needs']))
    dec = lambda what: (lambda n: n['kind'] == 'decision' and n['what'] == what)
    summary = {
        'decide': [
            {'what': 'Name differences', 'count': len(ids(dec('Name'))), 'moves': ids(dec('Name')), 'ask': 'Say which name is canon for each (recommended: keep the game\'s name, except Boppy\'s Pier Slam).'},
            {'what': 'Two held props', 'count': len(ids(dec('Two held props'))), 'moves': ids(dec('Two held props')), 'ask': 'Say which prop is held; the other is worn on the belt. Recommended: the first listed.'},
            {'what': 'Clip longer than the 5.0 s raw clip (every Capstone, 6.8 to 7.4 s)', 'count': len(ids(dec('Length'))), 'moves': ids(dec('Length')), 'ask': 'Approve one rule for all of them: body clip up to 5.0 s, the rest drawn by the engine (recommended).'},
            {'what': 'Effect with no library asset', 'count': len(ids(dec('Effect with no library asset'))), 'moves': ids(dec('Effect with no library asset')), 'ask': 'Add an asset or drop the effect (recommended: drop it).'},
            {'what': 'Weak effect match', 'count': len(ids(dec('Weak effect match'))), 'moves': ids(dec('Weak effect match')), 'ask': 'Confirm the one match made by elimination.'}],
        'approveNow': [
            {'what': 'Clip drafts that passed the factory QA', 'count': len(ids(lambda n: n['kind'] == 'clip' and n['who'] == 'tom')), 'moves': ids(lambda n: n['kind'] == 'clip' and n['who'] == 'tom'), 'ask': 'Approve or reject each.'},
            {'what': 'Start frames that passed the factory QA', 'count': len(ids(lambda n: n['kind'] == 'start' and n['who'] == 'tom')), 'moves': ids(lambda n: n['kind'] == 'start' and n['who'] == 'tom'), 'ask': 'Approve or reject each.'},
            {'what': 'Missing Hero PNGs', 'count': len(ids(lambda n: n['kind'] == 'hero' and n['who'] == 'tom')), 'moves': ids(lambda n: n['kind'] == 'hero' and n['who'] == 'tom'), 'ask': 'Supply the picture.'}],
        'approveLater': [
            {'what': 'Start frames Claude has to make or re-check first', 'count': len(ids(lambda n: n['kind'] == 'start' and n['who'] == 'claude')), 'moves': ids(lambda n: n['kind'] == 'start' and n['who'] == 'claude'), 'ask': 'Nothing until Claude has made them.'},
            {'what': 'Clips Claude has to make or remake first', 'count': len(ids(lambda n: n['kind'] == 'clip' and n['who'] == 'claude')), 'moves': ids(lambda n: n['kind'] == 'clip' and n['who'] == 'claude'), 'ask': 'Nothing until Claude has made them.'},
            {'what': 'Effects Claude has to build first (library assets, all buildStatus todo)', 'count': len({e['asset'] for r in xmoves.values() for e in r['effects'] if e['asset'] and e['built'] != 'built'}), 'moves': ids(lambda n: n['kind'] == 'effect'), 'ask': 'You approve how each looks once it is built.'}],
    }
    counts = {'moves': len(xmoves), 'matchedByName': sum(1 for r in xmoves.values() if r['match'] and r['match']['how'] == 'name'), 'matchedByHand': sum(1 for r in xmoves.values() if r['match'] and r['match']['how'] == 'hand'),
              'effectNames': len(xeff), 'effectsMatched': sum(1 for x in xeff.values() if x['asset']), 'effectsUnmatched': sum(1 for x in xeff.values() if not x['asset']),
              'effectsByHand': sum(1 for x in xeff.values() if x['how'] == 'hand'), 'effectsByUsedBy': sum(1 for x in xeff.values() if x['how'] == 'usedBy'), 'effectsByRule': sum(1 for x in xeff.values() if x['how'] == 'rule'),
              'effectNamesConfirmedByUsedBy': sum(1 for x in xeff.values() if x['confirmed']), 'effectUses': sum(len(r['effects']) for r in xmoves.values()), 'pairsConfirmedByUsedBy': ok, 'pairs': pairs,
              'assets': len(assets), 'assetsBuilt': sum(1 for a in assets.values() if a['buildStatus'] == 'built'), 'assetsWithNoEffect': sum(1 for a in amap.values() if not a), 'moveClipsOver5s': len(ids(dec('Length')))}
    out_assets = {}
    for a, A in assets.items():
        out_assets[a] = {'name': A['name'], 'category': A['category'], 'layer': A['layer'], 'buildStatus': A['buildStatus'], 'summary': A['summary'], 'reuseCount': A['reuseCount'],
                         'usedByLibrary': sorted(A['usedBy']), 'usedByManifest': amap[a]}
    data = {
        'about': 'Written by tools/guidegen/manifest_crosswalk.py (card c-guide-crosswalk). The three Stage 2A move manifests and the Stage 2C effect library, matched to the game. The manifests\' style prefix and negative prompt are NOT here (pipeline lock): only each clip\'s motion text and engineSpec.',
        'sources': sources, 'counts': counts, 'moves': xmoves, 'bySkill': by_skill, 'effects': xeff, 'assets': out_assets, 'summary': summary,
        'unmatched': {'moves': um, 'effects': sorted(n for n, x in xeff.items() if not x['asset']), 'effectMoves': {n: x['moves'] for n, x in xeff.items() if not x['asset']}},
        'handMoves': {m: {'id': v[1], 'kind': v[0], 'why': v[2]} for m, v in HAND_MOVES.items()},
        'libraryChecks': {'staleUsedBy': stale, 'usedByNotBackedByAnEffect': not_backed, 'pairsNotListedInUsedBy': pairs - ok, 'usedByLength': {a: len(A['usedBy']) for a, A in assets.items()},
                          'assetsWithNoManifestEffect': sorted(a for a, v in amap.items() if not v), 'packetCuesWithNoMatchingEffect': packet_gaps, 'nameChecks': checks, 'disputes': disputes},
    }
    return data


def doc_section(d):
    c, sm, L = d['counts'], d['summary'], []
    L.append(DOC_BEGIN)
    L.append('')
    L.append('## Manifest crosswalk and what Tom has to do (guidecross1, 2026-11-25)')
    L.append('')
    L.append('`data/guide-manifest.json`, written by `python3 -I tools/guidegen/manifest_crosswalk.py` (`--check` fails when it is stale, `--report` prints every unmatched item). It joins the three Stage 2A move manifests (`art-factory/aot-stage2-pass{1,2,3}-manifest-24fps.json`, 123 moves) and the Stage 2C effect library (`art-factory/aot-stage2c-vfx-library-v11.json`, 37 assets) to the game. The Guide shows it on each move\'s page under **Manifest** and on the **To do** screen (Animations tab, `#anims/todo`).')
    L.append('')
    L.append('**Not used, on purpose:** the manifests\' `stylePrefix` and `negativePrompt` and the style half of every clip prompt. They carry a green screen and a painting word the Battle Animation Pipeline Lock bans. Only the motion text (after the `[Clip: ...]` tag) and `engineSpec` are kept; the test fails if a banned word reaches the file.')
    L.append('')
    L.append('| Number | Value |')
    L.append('|---|---|')
    L.append('| Moves in the manifests | %d (pass 1: %d, pass 2: %d, pass 3: %d) |' % (c['moves'], *[sum(1 for r in d['moves'].values() if r['pass'] == i) for i in (1, 2, 3)]))
    L.append('| Matched to a game skill by name | %d |' % c['matchedByName'])
    L.append('| Matched by hand (listed below) | %d |' % c['matchedByHand'])
    L.append('| Effect names after splitting the manifests\' annotations ("(counter: x)", "a OR b") | %d (%d uses) |' % (c['effectNames'], c['effectUses']))
    L.append('| Matched to a library asset | %d (rule: %d, hand: %d, usedBy elimination: %d) |' % (c['effectsMatched'], c['effectsByRule'], c['effectsByHand'], c['effectsByUsedBy']))
    L.append('| Unmatched effects | %d: %s |' % (c['effectsUnmatched'], ', '.join('`%s`' % n for n in d['unmatched']['effects']) or 'none'))
    L.append('| Effect uses the library\'s own `usedBy` backs | %d of %d |' % (c['pairsConfirmedByUsedBy'], c['pairs']))
    L.append('| Library assets built | %d of %d (every `buildStatus` is `todo`) |' % (c['assetsBuilt'], c['assets']))
    L.append('| Stale ids in `usedBy` (not a move of the manifests) | %d |' % len(d['libraryChecks']['staleUsedBy']))
    L.append('| `usedBy` entries no effect of that move maps to | %d |' % len(d['libraryChecks']['usedByNotBackedByAnEffect']))
    L.append('')
    L.append('### The 6 moves whose name does not match a game skill')
    L.append('')
    L.append('| Manifest id | Matched to | Why |')
    L.append('|---|---|---|')
    for m, v in d['handMoves'].items(): L.append('| `%s` | %s `%s` | %s |' % (m, v['kind'], v['id'], v['why']))
    L.append('')
    L.append('### The one-page summary: what Tom has to do')
    L.append('')
    for title, key in (('Decide (you can do this now)', 'decide'), ('Approve now (a factory draft has passed QA)', 'approveNow'), ('Approve later (Claude has to make or build it first)', 'approveLater')):
        L.append('**%s**' % title)
        L.append('')
        L.append('| What | How many | What you do |')
        L.append('|---|---|---|')
        for g in sm[key]: L.append('| %s | %d | %s |' % (g['what'], g['count'], g['ask']))
        L.append('')
    L.append('### Per ability: what Tom must supply or approve')
    L.append('')
    L.append('One row per manifest move. Hero and Start frame are the status of the picture the clip starts from; Clip is the factory draft; Effects lists each effect asset that is not built yet; Decisions are the items only you can settle. "Claude first" means Claude has to make or build it before there is anything for you to approve.')
    L.append('')
    L.append('| Move (game skill) | Hero | Start frame | Clip | Effects not built | Decisions |')
    L.append('|---|---|---|---|---|---|')
    for mid, r in d['moves'].items():
        gid = r['match']['id'] if r['match'] else '(none)'
        by = {k: [n for n in r['needs'] if n['kind'] == k] for k in ('hero', 'start', 'clip', 'effect', 'decision')}
        def cell(k):
            return '; '.join('%s%s' % (n['status'].split(';')[0].split(' (')[0][:70], ' [%s]' % ('you' if n['who'] == 'tom' else 'Claude first') if n['who'] != 'none' else '') for n in by[k]) or 'n/a'
        eff = sorted({n['status'].split(':')[0] for n in by['effect']})
        dec = '; '.join(n['what'] for n in by['decision']) or 'none'
        L.append('| `%s` (%s) %s | %s | %s | %s | %s | %s |' % (mid, gid, r['name'], cell('hero').replace('|', '/'), cell('start').replace('|', '/'), cell('clip').replace('|', '/'), ('%d: ' % len(eff)) + ', '.join(e.replace('vfx_core_', '').replace('vfx_', '') for e in eff) if eff else 'none', dec))
    L.append('')
    L.append(DOC_END)
    return '\n'.join(L) + '\n'


def dumps(d): return json.dumps(d, indent=1, ensure_ascii=False, sort_keys=False) + '\n'


def doc_text(section):
    cur = open(DOC, encoding='utf-8').read() if os.path.exists(DOC) else ''
    if DOC_BEGIN in cur and DOC_END in cur:
        a, b = cur.index(DOC_BEGIN), cur.index(DOC_END) + len(DOC_END)
        return cur[:a] + section.rstrip('\n') + cur[b:]
    return cur.rstrip('\n') + '\n\n' + section


def report(d):
    c = d['counts']
    print('moves %d: %d by name, %d by hand' % (c['moves'], c['matchedByName'], c['matchedByHand']))
    for m, v in d['handMoves'].items(): print('  hand: %s -> %s %s' % (m, v['kind'], v['id']))
    print('unmatched moves:', d['unmatched']['moves'] or 'none')
    print('effect names %d (%d uses): matched %d (rule %d, hand %d, usedBy %d), unmatched %d' % (c['effectNames'], c['effectUses'], c['effectsMatched'], c['effectsByRule'], c['effectsByHand'], c['effectsByUsedBy'], c['effectsUnmatched']))
    for n in d['unmatched']['effects']: print('  unmatched effect:', n, 'in', d['unmatched']['effectMoves'][n])
    print('pairs the library usedBy backs: %d of %d' % (c['pairsConfirmedByUsedBy'], c['pairs']))
    L = d['libraryChecks']
    print('stale usedBy ids:', len(L['staleUsedBy']), '| usedBy entries with no matching effect:', len(L['usedByNotBackedByAnEffect']), '| assets with no manifest effect:', L['assetsWithNoManifestEffect'])
    print('pass 1 packet cues with no matching manifest effect:', len(L['packetCuesWithNoMatchingEffect']))
    print('assets built: %d of %d' % (c['assetsBuilt'], c['assets']))


if __name__ == '__main__':
    flags = sys.argv[1:]
    d = build()
    text, sec = dumps(d), doc_section(d)
    if '--report' in flags: report(d); sys.exit(0)
    dtext = doc_text(sec)
    if '--check' in flags:
        bad = []
        if not os.path.exists(OUT) or open(OUT, encoding='utf-8').read() != text: bad.append('data/guide-manifest.json')
        if open(DOC, encoding='utf-8').read() != dtext: bad.append('docs/BATTLE_GUIDE.md')
        if bad: print('stale: %s. Run python3 -I tools/guidegen/manifest_crosswalk.py' % ', '.join(bad)); sys.exit(1)
        print('guide-manifest ok'); sys.exit(0)
    open(OUT, 'w', encoding='utf-8').write(text); open(DOC, 'w', encoding='utf-8').write(dtext)
    report(d)
