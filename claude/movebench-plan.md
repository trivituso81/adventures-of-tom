# The Move Workbench: one page per battle animation where Tom sets everything and previews the whole move (movebench-design, 2026-11-26)

Card `c-movebench-design`. Design only: nothing in the game, the engine, a data file or the Battle Guide page was changed by this document. Mock: `claude/movebench-mock/` (open its README on GitHub, the pictures show under the file list). Tom's decision: card `t-movebench-plan`.

Tom, 2026-11-26: "I don't wanna do any more automatic videos because of the quality issues. I'm gonna curate them all myself, but I need a way to do it, and I think that the battle guide is the best place to do it in the animations tab, so we need to make sure for every single animation that I am able to configure every single variable required in order to do this move and then potentially even preview the move entirely. And remember this move needs to include not only its original animation but special effects, objects, etc, exactly as specified in our spec."

## What you get (Tom: this is the only part you need to read)

| | |
|---|---|
| Where | ADMIN > BATTLE GUIDE > Animations. Tap any animation. Its page is the Move Workbench. |
| Preview | A box at the top plays the WHOLE move: the video, the stage, the objects, the effects, the freeze on the hit, the shake, the sounds. It is the game's own battle code running in the page, so what you see is what the game plays. Play, pause, half and quarter speed, loop, and a bar you drag to any moment. It costs nothing. |
| What you can set | Under the preview, in this order: Body video (start picture, what is held, what is worn, the prompt, Make this video, takes, Use this one, all as today), Timing (when the hit lands, freeze, shake, running in), Stage and objects (words, things that fly, drop or drive across, flashes, the set piece of a Capstone), Effects (the 37 effects of the library, each with its own settings), Sound. |
| Controls | Plain words and buttons: None, Short, Medium, Long. "Set to where the preview is". No codes, no files. |
| Saving | Save draft keeps your work (on every device, with every earlier version one tap away). Finished puts it in the game as a new build and marks the animation Finished by you, with the date. |
| Progress | The list shows a dot and a word per animation (To do, In progress, Waiting, Finished) and a bar: Finished 14 of 679. |
| No automatic videos | Nothing in this feature makes a video or spends money without your tap. |
| First thing you can use | Phase 1: Preview the whole move, on your phone, for every family move and monster attack. Editing arrives from phase 5. |

Sixteen build phases, each one small session, in section g. Decisions I made are listed at the end of section h.

---

## Corrections to the facts I was handed (checked in the repo on 2026-11-26)

| Handed to me | What the repo says |
|---|---|
| About 346 animations | `data/guide-anims.json` lists **679**: 459 monster attacks, 120 family moves, 90 body states, 10 wind-ups. 119 have a video (17 moves, 40 attacks, 52 body states, 10 wind-ups). 346 is only the floor in `tools/battle_guide_test.py`. |
| The 37 library effects are all `todo`; effects are code-drawn in `engine/b3-vfx.js` | All 37 are `buildStatus: built` and drawn in code by `engine/vfx-library.js` (vfxlib1 to vfxlib3, today). `engine/b3-vfx.js` (vfxfight1) only places them in a real fight at each effect's layer. They take the params the library lists. No page can set them. |
| Timing is "applied by code in engine/pass1-vfx.js" | Also in a real fight since today: hit stop plays in Battle 3 (`hitstop1`, `b3vHold` in `engine/b3-vfx.js`, frames counted at 24 a second). Screen shake and the run-in slide of `data/pass1-meta.js` still play only in the Battle Lab review. |
| Each manifest move has "a motion text" | The manifests have no motion field. The motion is the end of `wanClip.positivePrompt`, after the `[Clip: ...]` tag. `tools/guidegen/manifest_crosswalk.py` cuts it out into `motion` in `data/guide-manifest.json`. |
| Family Ruckus moves are animations | `univ-double-team` and `univ-full-ruckus` match no game skill (`unmatched` in `data/guide-manifest.json`). In the game a Ruckus is two ordinary moves played one after the other (`part2` in `engine/b3-play.js`). The Guide has no animation id for them. |
| The Guide's 121 family moves | The crosswalk matches 121; the Animations tab lists 120. Pick-Me-Up (`pick_me_up`, the universal move) has no `move:` row. |

Everything else in the brief matched.

---

## a. INVENTORY: every variable that shapes a move today

Derived from the files named in each row. "Tom" in the last column means he can change it today on some page.

### a.1 Body video (the person or monster acting)

| Variable | Where it lives | Who sets it | Tom can reach it |
|---|---|---|---|
| Which clip a family move plays | `anim:{kind:'clip',clip}` on the move's row, `data/b3-kit-<id>.js` (17 of the 120 family moves have a clip, 103 use `kind:'default'`) | `tools/guidegen/use_take.py` (Use this one), or a session | Yes: Use this one |
| Which clip a monster attack plays (20 of the 459 have one), and where a clip lands when it has no impact picture (`at`, a share of its length; 8 rows, 2 of them family moves) | `anim` on the act row, `data/b3-foes-ch*.js` | `use_take.py`, or a session | Clip yes, `at` no |
| The wind-up clip of an attack | `wind:'<clip>'` on the act row (5 rows in the game; 10 wind-up animations in the Guide) | `use_take.py`, or a session | Yes: Use this one |
| The clip of each body state (idle, guard, hit, dodge, ko, victory, run, cast, give; monsters: idle, hit, slip, flustered, die) | `B3_BODY_CLIPS` in `data/b3-clips.js` (12 owners) | `use_take.py`, or a session | Yes: Use this one |
| Who never shows a painted frame, and what stands in for a missing video | `B3_VIDEO_ONLY` (tom, grace, rose, deedee), `b3cStandIn`, `b3cKoStandIn` in `engine/b3-clips.js` | Code | No |
| The default motion when there is no clip (strike, cast, throw, give) | `shape` in `anim`, played by `b3PlayMove` in `engine/b3-play.js` | The kit row | No |
| The pace of every default motion | `B3_TEMPO=2` in `engine/b3-play.js` (one number for all moves) | Code | No |
| A two-person video (Rose on Tom's shoulders) | `anim.pair:{with,clip}` (1 row) | A session | No |
| The prompt of the video | Wan job prompt files `tools/art-library/prompts/wan-*.txt` named in `tools/art-library/wangen-jobs.json`; monster entries in `tools/art-library/clip-prompts.js`; drafts in `data/guide-prompts.json`; his own edit in this browser (`aot-guide-work`) | Sessions; Tom | Yes: Edit this prompt, Update the prompt from a note |
| The model, length, size and seed of a try | `routes` in `data/guide-anims.json`: Wan 3.0, 5 s, 720p, seed 81, $0.50 (family); xAI Grok lite, 3 s, 480p, $0.07 (monsters) | `tools/guidegen/build_map.js` | No (fixed, and stays fixed) |
| The start picture of a person | `art/clips/start/<who>-hero.png`, rows in `queue.json` on branch `guideq` | Tom (Make the start picture, Upload my own) | Yes, one per person |
| A start picture made for one move, what is held, what is worn | `art-factory/start-frame-queue-pass1.json` (27 moves flagged, 22 prop kits), `held_props`, `expected_prop`, `prop_kit_id` in `art-factory/move-packets-pass1.json` | Factory sessions | **No** (7 two-held-prop decisions wait on card `t-guidecross-decide`) |
| Room around the figure in the video (`pad`, `shift`), feet in the air (`airborne`), ends in a held pose (`returns:false`) | The job's row in `wangen-jobs.json` | Sessions | No |
| How the video is cut into the clip: first and last picture, every n-th picture, playback speed, the hit picture, pace changes | `tools/guidegen/recipe.json` (8 recipes by kind), per job `bake` in `wangen-jobs.json`, written into `data/clips/<id>.js` (`ms`, `impact`, `first`, `last`, `rise`, `lower`, `wrap`) by `tools/clip-bake/bake_clip.py` | The bake | No |
| Size of the figure on the field | `figRows` (`tools/guidegen/figrows.json`), `BATTLE_SPRITES[id].scale`; monsters: `B3_FOE_LOOK`, `B3_BOSS_SIZE=2.5` | Code and bake | No |
| How long a move waits for its clip to load | `B3C.waitMax=2.5` s | Code | No |
| Something drawn on the ground under a clip (the lava) | `ground` in the clip file, `engine/clip-ground.js` | The bake | No |

### a.2 Timing

| Variable | Where it lives | Who sets it | Tom can reach it |
|---|---|---|---|
| The moment the hit shows | A staged move: `hit` (a mark, a step id or `late`) in its `B3_STAGE` row. A clip: its `impact` picture, else `anim.at`. A default motion: fixed in `b3PlayMove` (strike 0.36 s, throw and cast 0.46 s, times `B3_TEMPO`) | Session, bake, code | No |
| The moment the library effects start | `contactSec` of the manifest, through `data/guide-manifest.json` and `engine/guide-timing.js` (`gtMetaMove`); a row in `data/pass1-meta.js` (7 clips, measured) wins for its clip | Manifest; `tools/clip-bake/pass1_meta.py` | No |
| Hit stop (everyone the hit touches freezes) | `hitStopFrames` of the manifest (0 to 8, at 24 a second), `b3vHold`; capped at 0.5 s (`B3V_HOLD_MAX`) | Manifest | No |
| Screen shake on the hit | `screen_shake_px` in `data/pass1-meta.js` (5 to 11), Battle Lab review only; in a fight only a stage `shake` step shakes | Factory packet | No |
| Running to the monster and back | A move's own clip aimed at a monster: 0.55 s out, 0.5 s back (`b3PlayMove`). A staged move stays home. Review: `approach` in pass1-meta, `P1_SLIDE_MS=350` | Code | No |
| Time between the hits of a many-hit move | 0.35 s (`b3PlayMove`, `b3gPlay`) | Code | No |
| When an answer (a ward, a counter) plays after the hit | 0.3, 0.34 and 0.5 s times `B3_TEMPO` (`react` in `b3PlayMove`) | Code | No |
| How long a move should take | `budget` in the `B3_STAGE` row (the ladder: Basic 2 to 3 s, Skill 1 3 to 4, Skill 2 4 to 5, Capstone 6 to 8); the Move Lab shows the real length beside it | Session | No |
| Named moments of the body clip | `body.marks` in the row (`{pic:n}` or `{f:share}`) | Session | No |
| The manifest's three beats and its path (`beatsSec`, `translationPath`: 13 kinds, 77 moves stay in place, 31 approach) | The three manifests | Manifest | Read only (Manifest panel) |

### a.3 Stage, objects and set pieces

| Variable | Where it lives | Who sets it | Tom can reach it |
|---|---|---|---|
| The stage steps of a move: what, when, where | `steps` in `B3_STAGE` (`data/b3-stage.js`, 20 rows: Tom 8, Rose 12), played by `b3gPlay` in `engine/b3-stage.js` | Sessions | **No**. A family move with no row shows "Waits for staging" (100 moves) |
| The 15 actions and their fields | `b3gDo`: fly, hover, drop, cross, rain, surround, place, pop, words, foe, shake, flash, dim, glow, sfx; fields `from, to, onto, stop, lane, arc, spin, dur, hold, back, skid, blend, text, glyphs, where, size, color, react, px, amp, amount, in, out, n, on` | Sessions | No |
| Where a step points (18 anchors) | `b3gPts`: self, self_front, above_self, hand, target, each_target, above_target, attacker, carrier, above_carrier, ally, each_ally, foes_front, screen_center, screen_left, screen_right, top, floor | Sessions | No |
| Things that stay while a status lasts, and how they answer | `lasting` (9 rows): `while, on, do, asset, enter, then{beat:'react'|'intercept'}, exit` | Sessions | No |
| The set piece of a Capstone | `setpiece{dur, dim, steps}` (5 rows) | Sessions | No |
| The objects: a picture or an object-only video, its background, size and loop | `assets` in the row; baked files `data/stage/<owner>-<name>.js` (15 exist), made by wan-gen jobs `stage-*` and `tools/clip-bake/bake_stage.py` | Sessions and the bulk Action | No |
| The hand point of a clip | `body.hand` in the row, else a default | Sessions | No |

### a.4 Effects

| Variable | Where it lives | Who sets it | Tom can reach it |
|---|---|---|---|
| Which library effects a move draws | `libraryAssets` per move in `data/guide-manifest.json` (276 effect names in the manifests matched to the 37 assets by `manifest_crosswalk.py`); `vfx` in `data/pass1-meta.js` for 7 clips | Manifest and the crosswalk's rules | Read only |
| The settings of an effect | Defaults inside each drawer in `engine/vfx-library.js`; per move only for 9 moves (`EFFECT_PARAMS` in `manifest_crosswalk.py`, `fxp`) | Code | No |
| How long an effect draws, how early a projectile starts, which side it draws on, its layer | `P1_VFX_MS`, `P1_VFX_LEAD`, `P1_VFX_SELF`, `P1_VFX_LAYER` (end of `engine/vfx-library.js`) | Code | No |
| Which effects draw once per target, which on each ally | `B3V_EACH`, `B3V_ALLY` in `engine/b3-vfx.js` | Code | No |
| The size effects are drawn at | The fixed `1.8` in `p1DrawVfx` (`engine/pass1-vfx.js`) | Code | No |
| One effect outside the library | `vfx_red_stud_led_ping` (Justin's worn stud finder), inline in `engine/pass1-vfx.js` | Code | No |
| The plain ball a throw or a cast sends when there is no library projectile | `B3P.fx` `proj` in `b3PlayMove`, colour from the move's flavor | Code | No |
| Effects on a monster's attack | None: `b3vMeta` answers null for a foe's move | Code | No |

### a.5 Sound

| Variable | Where it lives | Who sets it | Tom can reach it |
|---|---|---|---|
| A sound on a stage step | `do:'sfx'` (36 steps, four sounds: charge, ding, thud, whoosh) | Sessions | No |
| A sound on a clip picture | `anim.sound:{at,sfx}` (1 row), notes in `data/b3-sfx.js` | Sessions | No |
| The sounds that exist | 61 synthesized sounds in `sfx` (`engine/audio.js`) | Code | No |
| The sound of each library effect | `sfxHook` names in the library file. Not wired: no file or sound is behind any of them | Nobody | No |
| The spoken line of a move | `data/lines.js`, the Voice Library. Out of scope here (voice has its own tools and rules) | Tom | Yes, elsewhere |

### a.6 What each kind of animation needs

| Kind (Guide id) | How many | Body video | Start, held, worn | Timing | Stage and objects | Effects | Sound | Answer | Set piece |
|---|---|---|---|---|---|---|---|---|---|
| Family Basic, Skill 1, Skill 2 (`move:`) | 90 | yes | yes | yes | yes | yes | yes | when the move has a ward or a counter (7 counter clips in the manifests) | no |
| Family Capstone (`move:`) | 30 | yes | yes | yes | yes | yes | yes | no | yes |
| Monster attack (`act:`) | 459 | yes | no (the monster's standard picture) | yes | yes, from phase 14 | yes, from phase 14 | yes | no | no |
| Monster wind-up (`wind:`) | 10 | yes (held on its last picture) | no | no | no | no | yes | no | no |
| Body state (`body:`) idle, guard, hit, dodge, knocked out, victory, running, cast, give; monsters idle, hit, slip, flustered, defeated | 90 | yes | no | no (guard: the rise and the lowering) | no | no | no | no | no |
| Family Ruckus (`ruckus:double`, `ruckus:full`; new in phase 15) | 2 | no: each member plays their own move | no | the moment the link shows | yes | yes | yes | no | no |
| Pick-Me-Up (`move:pick_me_up`; listed from phase 6) | 1 | yes | yes | yes | yes | yes | yes | no | no |

---

## b. THE SPEC: one file per animation, read by the engine, the Guide and the preview

### b.1 Where and what

One JSON file per animation, `data/moves/<slug>.json`, where `<slug>` is the `slug` the Guide already gives every animation (`move-lounge-pass-flex`, `body-tom-idle`, `act-mudling-mud-pie`, `wind-mudling-mud-pie`), plus `ruckus-double` and `ruckus-full`. A generated script, `data/move-specs.js`, holds the `live` part of every file and is the only thing the game loads. The page and the preview read the same sections. There is no other place a move's look is kept once the phases are done.

```
{
 "v": 1,                         schema version (tools)
 "id": "move:lounge_pass_flex",  the Guide's animation id (tools)
 "rev": 7,                       whole number from 1, one more on every save
 "live":  { sections } or null,  what the game plays; null means the defaults
 "draft": { sections } or null,  Tom's work in progress; the game never reads it
 "finished": {"rev":5, "at":"2026-11-26T16:02:00-08:00", "by":"tom", "build":"movespec-4471"} or null,
 "log": [ {"rev":7, "at":"...", "by":"tom"|"claude"|"migration", "what":"freeze on the hit: Short"} ]   newest 20
}
```

### b.2 The sections (the same shape in `live` and in `draft`; a missing section or field means its default)

**`start`** (family moves). Who sets: Tom.

| Field | Type | Range | Default | Notes |
|---|---|---|---|---|
| `picture` | word | `standard`, `own` | `standard` | standard is `art/clips/start/<who>-hero.png`; own is a start picture made for this move |
| `held` | text or null | up to 60 letters | null | ONE thing. It is a single text, never a list, so the file cannot hold a second held prop (Pipeline Lock, One held prop) |
| `worn` | list of `{what, where}` | 0 to 3 | empty | each worn thing is drawn into the start picture; what it does is an effect in `effects` |
| `entry` | text | an Art Library entry id | derived | written when the own picture's entry is created (`start-<who>-<move>`) |

**`body`** (every kind).

| Field | Type | Range | Default | Who sets |
|---|---|---|---|---|
| `clip` | clip id or null | a clip in `data/clips/` | null | Tom, through Use this one (the apply job writes it) |
| `motion` | word | `strike`, `cast`, `throw`, `give` | from the move's kit row at migration | derived; used only while `clip` is null |
| `trim` | `{from, to}` pictures or null | 0 to n-1, from below to | null (the whole clip) | Tom |
| `marks` | `{name: {pic:n} or {f:0..1}}` | up to 12 | empty | Tom ("Name this moment") and migration |
| `pair` | `{with, clip}` or null | a member id, a clip id | null | Claude |
| `hand` | `[x, y]` or null | clip pixels | null | Claude |

There is no playback speed field. The lock allows native speed only; slow motion is a preview control and is never saved.

**`timing`** (family moves, monster attacks, Ruckus). Who sets: Tom.

| Field | Type | Range | Default | Page control |
|---|---|---|---|---|
| `contact` | `"auto"`, `{mark}`, `{step}`, `{sec}`, `{share}` | sec 0 to 12, share 0 to 1 | `auto`: the clip's hit picture; a clip with none lands at half its length; no clip, the default motion's own moment | "The hit lands", with Set to where the preview is |
| `noHit` | true or absent | | absent | derived: a move with no hit (a ward, a pass) shows its results at `contact` |
| `hitStop` | whole number | 0 to 12 frames at 24 a second | 0 | Freeze on the hit: None 0, Short 3, Medium 5, Long 7, and a fine stepper |
| `shake` | whole number | 0 to 12 px | 0 | Screen shake: None 0, Light 3, Medium 6, Heavy 11 |
| `approach` | word | `auto`, `stay`, `run` | `auto` (today's rule) | How he gets there: Stays in place, Runs to the monster |
| `approachSec`, `returnSec` | number | 0.2 to 1.2 | 0.55, 0.5 | under "Runs to the monster": Quick, Normal, Slow |
| `gap` | number | 0.15 to 0.8 s | 0.35 | Time between hits (many-hit moves only) |
| `budget` | number | seconds | from the ladder by tier | derived, shown as "target" |

**`stage`** (family moves; monster attacks and Ruckus from phases 14 and 15). Who sets: Tom. The shape is today's `B3_STAGE` row, unchanged, so migration is a copy:

| Field | Type | Notes |
|---|---|---|
| `steps` | list of `{id?, at, do, ...}` | `at`: seconds, a mark name, `{mark, plus}` or `{step, plus}`. `do`: one of the 15 actions of a.3 with that action's own fields and ranges (`dur` 0.05 to 4, `hold` 0.1 to 8, `arc` 0 to 120, `amp` 0 to 12, `amount` 0 to 0.95, `size` 1 to 4, `px` 0 to 40, `n` 1 to 40) |
| `lasting` | list of `{while, on, do, asset, enter, then, exit}` | as today |
| `setpiece` | `{dur, dim, steps}` | Capstones only; `dur` 3 to 10 s, `dim` 0 to 0.95 |
| `objects` | `{id: {name, kind:'prop'|'obj', bg:'magenta'|'black', size:{h}|{sw}, loop?, entry}}` | today's `assets`, plus the plain name and the Art Library entry id |

**`effects`** (family moves; monster attacks and Ruckus from phases 14 and 15). Who sets: Tom. A list of:

| Field | Type | Range | Default |
|---|---|---|---|
| `fx` | effect id | the 37 ids of `art-factory/aot-stage2c-vfx-library-v11.json`, or `vfx_red_stud_led_ping` | required |
| `at` | `"contact"`, `{plus: seconds}`, `{mark}`, `{sec}` | plus -2 to 6 | `contact` |
| `on` | word | `auto`, `target`, `each_target`, `self`, `each_ally`, `field` | `auto` (today's tables `B3V_EACH`, `B3V_ALLY`, `P1_VFX_SELF`, kept as each effect's default) |
| `params` | object | the names and ranges the library entry's `params` lists | the drawer's defaults |
| `sfx` | sound key or null | one of the 61 in `engine/audio.js` | null |
| `off` | true or absent | | absent (lets Tom switch one off without losing its settings) |

**`answer`** (moves with a ward or a counter): `{clip, effects}`. `clip` is the counter video (null until made); `effects` is a list like `effects`, timed from the answer's start.

**`note`**: Tom's own words about the move, up to 500 letters. Never read by the game.

Sound has no section of its own: a sound is a stage step (`do:'sfx'`) or an effect's `sfx`. The page shows both under Sound.

Derived, never stored: the name, owner, tier, flavor and target (from `data/b3-*.js`), the effect's layer and length (from the library), the price and route of a video, whether an object has a picture.

### b.3 Four worked examples (`live` only)

A Basic, Tom's Lounge Pass Flex (`data/moves/move-lounge-pass-flex.json`): today's row and manifest numbers, copied.

```
{"start":{"picture":"standard","held":"laminated Sky Club pass","worn":[{"what":"metal brag tag","where":"clipped to his jacket"}]},
 "body":{"clip":"tom_loungepass","motion":"cast","marks":{"flash":{"pic":9},"swat":{"pic":24}}},
 "timing":{"contact":{"mark":"swat"},"hitStop":3,"budget":2.8},
 "stage":{"steps":[{"at":{"pic":9},"do":"sfx","sfx":"ding"},
                   {"at":"swat","do":"words","text":"NOT ON THE LIST","where":"over:target","size":2,"color":"#f1d58c","hold":1.1}]},
 "effects":[{"fx":"vfx_core_racket_rings"},{"fx":"vfx_core_status_debuff_badges"}]}
```

A Skill with a held prop, Deedee's Wet-Floor Hazard (`move-wet-floor-hazard.json`): two props in the manifest, so one is held and one is worn.

```
{"start":{"picture":"own","held":"mop","worn":[{"what":"folded WET FLOOR sign","where":"clipped on her apron"}],"entry":"start-deedee-wet-floor-hazard"},
 "body":{"clip":"deedee_wetfloor","motion":"cast"},
 "timing":{"contact":"auto","noHit":true,"hitStop":0},
 "effects":[{"fx":"vfx_core_drench_splash","at":{"plus":-0.4},"params":{"mode":"spray"}},
            {"fx":"proj_ground_hazard_mat","params":{"hazardType":"wet_floor","durationRounds":2}}],
 "answer":{"clip":null,"effects":[{"fx":"vfx_core_clobber_impact","at":{"plus":0.3},"params":{"hits":1}}]}}
```

A Capstone with a set piece, Tom's Tarmac Porsche Transfer (`move-tarmac-porsche-transfer.json`), shortened: the set piece is the row of `data/b3-stage.js`, step for step.

```
{"start":{"picture":"own","held":"360 medallion","worn":[],"entry":"start-tom-tarmac-porsche-transfer"},
 "body":{"clip":"tom_porsche","motion":"cast","marks":{"watch":{"pic":9},"wave":{"pic":22}}},
 "timing":{"contact":{"step":"beams"},"hitStop":6,"budget":7.5},
 "stage":{"setpiece":{"dur":7.5,"dim":0.8,"steps":[
     {"at":0,"do":"dim","amount":0.8,"in":0.4},{"at":0,"do":"sfx","sfx":"charge"},
     {"at":0.4,"do":"pop","asset":"tom/runwaylights","on":"floor","hold":6.2,"blend":"add"},
     {"id":"arrive","at":{"mark":"wave","plus":0.3},"do":"cross","asset":"tom/porsche","from":"screen_right","stop":"foes_front","lane":"mid","dur":0.9,"skid":0.3},
     {"id":"beams","at":{"step":"arrive","plus":1.5},"do":"flash","color":"#ffffff","dur":0.35},
     ... the other 10 steps of the row ...]},
   "lasting":[{"while":"high_beams","on":"self","do":"glow","color":"#ffd27a"}],
   "objects":{"tom/porsche":{"name":"Black Porsche","kind":"prop","bg":"magenta","size":{"sw":0.5},"entry":"stage-tom-porsche"},
              "tom/runwaylights":{"name":"Runway lights","kind":"obj","bg":"black","loop":true,"size":{"sw":1},"entry":"stage-tom-runwaylights"},
              "tom/glare":{"name":"High-beam glare","kind":"obj","bg":"black","size":{"h":1.2},"entry":"stage-tom-glare"},
              "tom/jetwash":{"name":"Jet wash","kind":"obj","bg":"black","size":{"sw":1},"entry":"stage-tom-jetwash"}}},
 "effects":[{"fx":"setpiece_black_porsche_suv","params":{"speedPxSec":1150,"highBeamAlpha":0.85,"dustTrail":true}},
            {"fx":"vfx_core_status_debuff_badges","at":{"plus":0.3}}]}
```

A monster attack, the Mudling's Mud Pie (`act-mudling-mud-pie.json`); its wind-up is its own file (`wind-mudling-mud-pie.json`, `{"body":{"clip":"mudling_windup"}}`).

```
{"body":{"clip":"mudling_throw","motion":"throw"},
 "timing":{"contact":"auto","hitStop":0,"shake":3},
 "effects":[{"fx":"vfx_core_drench_splash","params":{"mode":"spray","tintHex":"#8a5a2b"},"sfx":"splat"}]}
```

### b.4 A move with no spec

`msLive(id)` answers null and the engine plays exactly the defaults: the default motion of its shape at `B3_TEMPO` (a video-only member's stand-in video), the hit at the default moment, no freeze, no shake, no stage, no effect, no sound. A body state with no spec shows today's stand-in. The seam is untouched: the rules resolve first, a clip or a row only calls `reveal(share)`, nothing waits. A spec whose clip or object is not baked plays what it can and skips the rest (b.6).

### b.5 How it replaces the old places, in order

| Step | Phase | The spec takes over | Deleted in the same phase |
|---|---|---|---|
| 1 | 3 | Nothing yet: files and `data/move-specs.js` are written from the old places by `tools/movebench/migrate.py`; the engine still reads the old places | Nothing |
| 2 | 4 | Contact moment, hit stop, shake, which effects and their params | `engine/guide-timing.js`, `data/pass1-meta.js`, `tools/clip-bake/pass1_meta.py`, `p1Meta`, `p1Clock`, `p1Lead`, `p1Slide`, `p1Shake`, the inline `P1_VFX` copy of the clobber effect, `EFFECT_PARAMS` and the `effectParams`, `contactApplied` fields of the crosswalk, `B3V_EACH`, `B3V_ALLY` (they become each effect's default `on`), the Battle Lab row PASS-1 DRAFT REVIEW with `engine/clip-review.js`'s `reviewClips` branch, `tools/guide_timing_test.py` (rewritten as `tools/movebench/timing_test.py`). `p1DrawVfx`, `p1Guard` and the layer table move into `engine/b3-vfx.js` and `engine/pass1-vfx.js` is deleted |
| 3 | 8 | Stage steps, lasting things, set pieces, objects, budget, marks | The rows of `data/b3-stage.js` (the file is deleted; `b3gDefine` and `B3G_DATA` move into `engine/b3-stage.js`), `staging_waits` in `tools/art-library/wangen.py` and failure X15, "Waits for staging" in the Guide and `build_map.js`, the `stage` field and `waitsStaging` count of `data/guide-anims.json`, `tools/movestage_test.py` (rewritten against the spec) |
| 4 | 12 | Which clip plays, wind-ups, the pair video, the sound on a clip picture, where a clip lands, body states | `anim` and `wind` on every row of `data/b3-kit-*.js` and `data/b3-foes-ch*.js`, `B3_BODY_CLIPS` and its comment block in `data/b3-clips.js` (`B3_VIDEO_ONLY` stays), the code in `use_take.py` that edits kit and foe rows (it writes the spec file instead) |
| 5 | 16 | The review of a move | `engine/b3-movelab.js`, `b3-movelab.css`, the `movelab` row of `data/b3-lab.js`, `tools/movestage_lab_test.py`, the Guide's old sheet code (`openPlayer`'s body, `manifestBlock`'s What is done lines that the page now shows itself), NOTE OPEN as a separate badge |

Each phase greps for the old names and confirms zero references outside `docs/CHANGES.md` and `claude/`. Nothing is kept as a fallback. `data/guide-manifest.json` stays as the read-only record of what the manifests planned (the Manifest panel); after phase 4 no engine file reads it.

### b.6 Every existing move migrates with no regression: the tests that prove it

| Test | Made in | Proves |
|---|---|---|
| `python3 -I tools/movebench/spec_test.py` | 3 | Every file matches the schema (types, ranges, one held prop, effect ids exist, param names and ranges are the library's), `finished.by` is only ever `tom`, `python3 tools/movebench/bundle.py --check` says the script is fresh, no em dash |
| `python3 tools/movebench/golden_test.py` | 3 | THE regression test. Phase 3 records `tools/movebench/golden.json` on the untouched engine: every family move and every monster attack with a clip is played in a stub fight with a fixed seed and the clock stepped by hand, and the timeline is written down (the moment of each hit, the hold in seconds, the shake, each effect armed with its id, moment, params, target count and layer, each stage step fired with its moment and action, the move's end). Phases 4, 8 and 12 must reproduce it within 1 ms, value for value. A difference is a bug in the phase, not a new golden |
| `python3 tools/b3_vfx_test.py`, `python3 tools/b3_hitstop_test.py` | exist | Effects and holds in a real `b3Draw`, portrait and landscape |
| `python3 tools/b3_test.py new1 new2 new3 new4 new5`, `node tools/b3-sim.js check` | exist | The rules never changed and never wait |
| `python3 -I tools/video_only_test.py` | exists | No painted frame of Tom, Grace, Rose or Deedee in a fight |
| `python3 tools/battle_guide_test.py`, `python3 -I tools/guidegen/apply_test.py`, `take_test.py`, `store_test.py` | exist | Make this video, takes and Use this one work unchanged |
| `python3 tools/smoke.py` | exists | The game runs |

A spec names things that may not exist yet (a clip not baked, an object with no picture, an effect id the library drops). The engine skips that one thing and plays the rest; `spec_test.py` lists them as "waiting", never as a failure.

---

## c. PREVIEW: the whole move, played by the game's own engine

**What runs.** The real engine files, unchanged: `b3PlayMove`, `b3gPlay`, `b3vArm`, `b3vDraw`, `b3Draw`, the clips, the sounds. There is no second implementation of anything. A new small file, `engine/b3-bench.js`, only starts a fight, plays one thing in it and owns the clock.

**Where.** Inside the Guide page, in a frame at the top of the workbench that shows a new page, `bench.html` (the preview stage). Not the real fight: a real fight has a turn order, menus and a result, and cannot be stopped at a moment, played backwards or looped. Not a drawing in the Guide page itself: that would be a second implementation. A stub fight is the precedent the repo already has twice: PROOF: GRACE'S GUARD (`b3LabGuardProof`: one member, one Mudling, nobody takes a turn) and the Move Lab (`b3mlPlay`: the move is played NOW through `b3Act` and `b3Play`).

| Part | How |
|---|---|
| The fight | The mover, the allies the move needs (the pair partner, an ally to aim at), and monsters: Mudlings, or The Big One for a Capstone, or for a monster attack the first formation that holds that monster. Fixed seed. Everyone at full HP and Pep before each play (`b3mlRefill`). |
| A family move | `b3Act(F, mover, id, target)` then `b3Play(beats, done)`: the Move Lab's own way. |
| A monster attack | `b3FoeTurn` with the attack forced (`e.force`, the "In a fight" address already uses it). Its wind-up plays first. |
| A body state | The state is set on the unit and held: guard on and off (the guard proof's way), a braced hit, a dodge, a knock-out, the victory loop, the run. |
| An answer | After the move, one monster attack is played so the ward or the counter answers (the Move Lab's MONSTER ACTS). |
| The draft | The page sends the draft to the frame (`postMessage`, same origin); the frame puts it in the same table the game's `data/move-specs.js` fills (`msSet`) and plays again. Nothing is saved. |

**Loading without filling the phone.** `bench.html` reads `index.html` and adds its script tags in order (the Guide already boots this way for the data files), leaving out the baked voice audio: `data/voice-clips.js` and `data/voice/*.js`. Measured on 2026-11-26: the game boots with 59.3 MB of scripts (592 tags), 38.4 MB of it voice; with the voice files left out, 20.9 MB loaded, a Battle Lab fight started, a staged move played (`B3G.run` for `lounge_pass_flex`) and the page logged no error. Dropping more (scenes, townsfolk, NPC data) broke the boot (`OW is not defined`), so only voice is dropped. The service worker serves the tagged files from the phone's own copy. Voice is switched off in the frame; sound effects play, with a Mute button.

**Clips in memory (about 10 MB each).** Only the stub fight's units are on the field, so only their idle loops stay loaded; the move's clip and objects are asked for when it plays and let go a few seconds after (`B3C_KEEP` 4.5 s, `B3G_KEEP` 9 s: the engine's own rule). The test holds the count at 16 or fewer (`b3cLoaded`, the limit `b3_test.py s8` already uses). The frame is made on the first tap of Play, reused from one animation to the next (the fight is reset, the page is not reloaded), and removed when Tom leaves the Animations tab.

**A move whose video does not exist yet.** The preview fight sets `cfg.bench`. With it, a spec whose body clip is missing plays its stage, effects, freeze, shake and sounds over the mover's idle video (a monster's idle video for an attack), and marks given as pictures fall at the same share of the budget. The box says NO VIDEO YET: SHOWN ON THE STANDING VIDEO. The game does not do this (no `cfg.bench`), so no fight changes. An object with no picture and an effect nobody built show as a pink dashed box with the name and NOT FINAL (section e); the game draws nothing for them.

**Scrub, slow, loop.** Every drawing and every timed step of a Battle 3 fight hangs off one clock, `B3P.t`, moved only by `b3Update(dt)`. The bench calls it itself:

| Control | How |
|---|---|
| Play, Pause | dt as real time, or 0 |
| 1x, half, quarter | dt times 1, 0.5, 0.25 (sounds follow) |
| Step one picture | one dt of 1/24 s |
| Loop | when the move ends, reset and play again |
| Drag to a moment | reset the fight (same seed), play the move, call `b3Update(1/60)` without drawing until the moment, draw once. Random numbers are pinned while it replays |
| The bar | lanes for Video, Stage, Effects, Sound and a HIT line, read from the run itself (`B3G.run.marks`, `ids`, `hitAt`, `len`, the armed cues), so the bar cannot disagree with what plays |

Checked on 2026-11-26 with the real engine: taking `b3Update` and stepping it by hand played a staged move, and replaying Zone One Blockade to 1.8 s twice gave the identical picture. At 0.9 s the two pictures differed (risk 3 in section h).

**Free.** The frame makes no request to GitHub's dispatch address, fal or xAI. The test fails if it does.

---

## d. THE PAGE: the workbench for one animation

Drawn in `claude/movebench-mock/`. Opening an animation in the Animations tab shows the workbench in place of today's sheet. The address is the one that exists (`#anims/move:lounge_pass_flex`).

### d.1 Sections, top to bottom

| # | Section | For | What Tom does there |
|---|---|---|---|
| 0 | Top bar | all | Back, the name, one line (tier, real length beside the target, who it is used on), the status |
| 1 | Preview | all | Play, 1x / half / quarter, Loop, the bar with its lanes, the clock. Upright phone: it shrinks to a small player that stays on screen while a setting is changed |
| 2 | Body video | all | The start picture; Holds (one thing) and Wears; the prompt with Edit this prompt and Update the prompt from a note; Make this video with its price; the takes side by side; Use this one; Keep the old one; Trim (first and last picture, by dragging the bar). Today's flow, same buttons, same words, same queue |
| 3 | Timing | moves, attacks | The hit lands (a time, and Set to where the preview is); Freeze on the hit; Screen shake; How he gets there; Time between hits |
| 4 | Stage and objects | moves (attacks from phase 14) | A list of steps in time order, each a sentence ("1.9 s, at the hit: Words on screen NOT ON THE LIST, over the monster, gold, stays 1.1 s") with Change; Add a step; the objects with their pictures |
| 5 | Set piece | Capstones | How long it lasts, how dark the field goes, its steps |
| 6 | Effects | moves (attacks from phase 14) | A list of effects, each with its colour, when, on whom and its settings; Add an effect opens the 37 as a grid with a small moving sample of each |
| 7 | When it answers | moves with a ward or a counter | The counter video (Make this video) and what plays with it |
| 8 | Sound | all but body states | Each cue with its moment and a Play button; Add a sound (the 61, by name, with Play) |
| 9 | Bottom bar | all | What is unsaved, Undo, Save draft, Finished. After Finished: who and when, the build, Earlier versions, Send a note |

A monster attack shows Wind-up video and Attack video as two Body sections. A body state shows Preview and Body video only.

### d.2 The controls are words

| Setting | Control |
|---|---|
| A moment | The time in seconds, plus "at the hit", "0.3 s after the hit", or a moment he named. Picked with Set to where the preview is, or from a short list (Start, a named moment, The hit, After another step) |
| An amount | Named steps (None, Light, Medium, Heavy; Quick, Normal, Slow; Off, Dusk, Night) with plus and minus for in between |
| A place | Words from a list: Over the monster, On every monster, In his hand, In front of him, Over him, On each family member beside him, In front of the monsters, The middle of the screen, The floor, From the right edge, To the left edge |
| An action | One of 15 tiles with a picture: Words on screen, Throw something, Drop something, Drive something across, Rain things down, Put something in front, Float something over, Surround, Pop up, Knock the monster back, Shake, Flash, Dim the field, Glow, Play a sound |
| A colour | Eight swatches from the game's palette |
| An effect's setting | Built from the library's own `params` (section e) |

The words live in one file, `data/movebench-words.json`, so a session never types a label into the page. A value with no words shows as the raw word without underscores, as the Guide does today.

### d.3 Saving, undo and versions

| Action | What happens |
|---|---|
| Any change | The preview plays it at once. The draft is kept in this browser (`aot-movebench`), so closing the page loses nothing |
| Undo | Steps back one change, as far as the last save |
| Save draft | One commit: the file's `draft` and `rev`. The same draft is then on every device. The game is not changed |
| Finished | Asks once ("This changes the game"), then one commit: `live` becomes the draft, `draft` null, `finished` set to him and now. The apply job makes ONE build with every animation finished since the last one (`movespec-<run>`). The bar shows "Putting it in the game. About 4 minutes." then "In the game (build movespec-4471)." |
| Earlier versions | Every save of the file, newest first, with who and what changed in plain words (the file's `log` and its history on GitHub). Bring back copies that version into the draft |
| A change by Claude after he finished | The status reads Changed since you finished it, with See what changed in plain words. Finished again, or Bring back his version |

### d.4 "This move is finished", and who said so

One status per animation, one word on the list and on the page:

| Status | Means | Replaces |
|---|---|---|
| No video yet | No body video and no draft | NO VIDEO YET |
| To do | Has a video, he has not opened and saved it | |
| In progress | A draft is saved | Tweak |
| Waiting on a video | A row of his in the queue is making or ready to review | the queue line, kept |
| Waiting on a picture | An object or a start picture is in the Art Library | |
| Waiting on Claude | A note he sent is an open card | NOTE OPEN |
| Finished, by you, the date | `finished.rev` equals `rev`. Only the page writes it, only on his tap. A session never sets it; `spec_test.py` fails a file where anyone else did | Keep |
| Changed since you finished it | `rev` is above `finished.rev` | |

Replace is the Body video section (Make this video). Send a note stays for what no control covers and makes the same `c-anim-` card as today.

### d.5 The list across 679 animations

On top: "Finished 14 of 679", a bar, and chips All, To do, In progress, Waiting, Finished, No video yet. Each person and monster shows its own count ("Tom: 5 of 23"). Each row keeps its picture and name and gains the status dot and word. It replaces the Plan block (Making, Next, Done) at the top of the tab; the Activity bar of the queue stays. The statuses come from `data/moves/index.json` (written by the apply job) with this browser's own unsent changes on top.

### d.6 The five sizes

| Size | Layout |
|---|---|
| 466 x 657, phone upright | One column. Preview on top, its bar under it, sections below, the bottom bar fixed. While a setting is changed the preview is a small player in the top corner. The Guide's tab bar is hidden inside the workbench (Back returns) |
| 678 x 445, folded sideways | Preview and bar on the left, sections on the right, the bottom bar across the whole width, thin header |
| 951 x 648, open sideways | Preview and lanes on the left (54%), sections on the right |
| 669 x 869, open upright | As the phone upright, larger |
| 3440 x 1440, Admin Dashboard | A new layout, Animations (pane widths 420, 951, 1589, 440; phase 16). In the 1589 pane: the list on the left (300), preview, lanes and Earlier versions in the middle, sections in two columns on the right. In today's All four layout (829 wide) it is the open-sideways layout |

The rule is the page's shape, not its name: wider than tall puts the preview beside the sections; 1300 or wider adds the list.

---

## e. EFFECTS AND OBJECTS

### e.1 The 37 effects, set per move from what the library already defines

Each library entry has a `params` line. The page turns each kind of value into one kind of control; nothing about an effect is typed into the page.

| In `params` | Example | Control |
|---|---|---|
| `a..b` (a range) | `hits: 1..7`, `scale: 0.8..1.8`, `arcHeightPx: 45..110` | A slider with its ends named, the value shown |
| `"x"|"y"|...` (a choice) | `mode: "spray"|"row_wave"|"aoe_cloud"|"shake_360"`, `skin` (8), `recipe` (6), `hazardType` (4) | Buttons with plain words (Spray, A wave along the row, A cloud, A shake all round) |
| `bool` or true/false | `pierceShield`, `dustTrail`, `candleFlicker` | A switch |
| A single number | `intervalMs: 110`, `speedPxSec: 1150`, `sparklerCount: 9` | Named steps with plus and minus (Slow, Normal, Fast) |
| A colour | `color`, `tintHex`, `partyInfusionTint` | The swatches |
| A list of letters | `buttonSeq` (the Konami code) | A row of arrow and letter buttons |
| Text | `tickerText` | A text box |
| Who or where (`targetIds`, `targetId`, `allyIds`, `startPos`, `endPos`, `targetEnemyId`) | | Not a setting: it follows the move's target. The effect's "On whom" (the `on` field) is the one control |
| A picture (`spriteId`) or another effect (`impactVfxId`, `onCatchVfxId`) | the thing a projectile throws | Pick an object of this move, or an effect of this move |

`tools/movebench/fxparams.py` reads the library file and writes `data/movebench-fx.json` (per effect: its name, layer, colour, summary, and each param's kind, range and default). `data/movebench-words.json` gives every param and every choice its plain words. `spec_test.py` fails when a param of any of the 37 has no control kind or no words, so a new library entry cannot reach the page half-described. All 37 are built today, so every one previews for real.

### e.2 A missing picture is asked for in the Art Library, then it appears

| Step | Where |
|---|---|
| 1. Tom adds an object in a step ("New object") and types what it is in his own words: "a yellow folding WET FLOOR sign" | The workbench |
| 2. Save draft. The apply job sees an object with no Art Library entry and adds one under Props > Battle stage (`stage-<owner>-<name>`), its prompt built from his words and the fixed asset pattern of `claude/move-staging-plan.md` section 5 (what it is, the game's painted look, side view, centred, flat background, no people, no text). No model writes it and nothing is generated | `tools/art-library/stage-prompts.js` (new, the shape of `gate-prompts.js`) |
| 3. The object's tile says NO PICTURE YET with Open in the Art Library (`art.html?open=<entry id>`) | The workbench |
| 4. Tom presses Generate, then Approve, in the Library. He can edit the prompt there as with any entry | ADMIN > ART LIBRARY |
| 5. The art-bake Action cuts it (`tools/clip-bake/bake_stage.py`) to `data/stage/<owner>-<name>.js` | Existing |
| 6. The tile shows the picture and the preview draws the real thing | The workbench |

A start picture made for one move (the held prop in the hand, the worn things on the belt) is the same path: an entry `start-<who>-<move>` under Characters > Battle start pictures, made from the Hero picture with only the hand band edited (Direct-Hero start frames), Generate and Approve in the Library, then Make this video uses it. An object that moves by itself (wings, a fireball) is a Clips entry made from the object's approved picture.

### e.3 Something not built yet is previewed as a labelled placeholder

| Missing | In the preview | In the game |
|---|---|---|
| An object with no picture | A pink dashed box of the object's size, its name inside, moving along the object's real path at the real moments | Not drawn; the rest of the move plays |
| An effect id with no drawer (a future library entry, or the one manifest effect with no asset, `vfx_sunset_gold_stunt_lines`) | A pink dashed box at the effect's layer and moment with its name | Not drawn (as today: `if(!fn) continue`) |
| The body video | The standing video, labelled (section c) | The default motion or stand-in |

Whenever a placeholder is on screen the box carries the tag "PINK BOXES ARE NOT FINAL", and the bar's lane shows the item striped pink. Pink (`#ff5bd2`) is used for nothing else on the page.

---

## f. SAVING

### f.1 The choice

Specs live on `main`, one file per animation, `data/moves/<slug>.json`. The page writes a file through the GitHub contents API with the token the pages already use (`aot-gh-token`) and the file's `sha` (compare and swap: GitHub refuses the write if the file changed since it was read). The game reads one generated script, `data/move-specs.js?v=<build>`, written by a new Action, `move-apply`.

### f.2 The precedents, weighed

| Precedent | Good for | Why it is not the whole answer here |
|---|---|---|
| `queue.json` on branch `guideq` (compare and swap, `tools/guidegen/store.py`) | Status that changes every few seconds and never ships | It is one file: 241 KB after four days. 679 specs with stage steps in one file would pass 1 MiB, where GitHub sends no content. A branch is not served to the game, so a second copy would have to reach `main` anyway |
| `data/script-edits.json` on `main` | Tom's edits waiting for a session | A session applies them by hand. The workbench must put a finished move in the game with no session |
| The board (`ghBoard`, `saveBoard`, `storeUpdate`) | The read, change, write and retry loop, and the blob fallback for a big file | One 751 KB file that every writer shares: every save can clash with the board job, the phone and every session |
| `guide-apply` (one build for everything wanted, pushed with the every-try-from-the-newest-main loop, `live` only after the files are confirmed on `main`) | Getting a change into the game as a real build | Copied as `move-apply` |

One file per animation takes the good part of each: compare and swap per file (two edits clash only when they are the same move), files of 1 to 8 KB (the size limit never applies), on `main` (sessions edit and review them like any data file, history is the version list), and a build per batch (the build label rule holds).

### f.3 Concurrent edits

| Case | Result |
|---|---|
| Tom on two devices, different moves | Different files, no clash |
| Tom on two devices, the same move | The second save gets 409, reads the file again and replays his changes on top (the page keeps his changes as a list of field changes, not as a whole file); a field both changed takes the later one and the log says so |
| A session changes a move he is editing | Same replay. A session writes `live` only, raises `rev`, adds a `log` line with `by: claude` and what changed, and never touches `draft` or `finished`. The status becomes Changed since you finished it |
| The apply job | Reads every file, writes only `finished.build`, `data/moves/index.json` and the generated script |

### f.4 From a save to the game and the cache tags

| Step | What |
|---|---|
| 1 | The page commits the file: `move: draft <id> [skip ci]` or `move: finished <id> [skip ci]`, then pokes `move-apply` (repository dispatch). `data/moves/**` is added to `paths-ignore` of `publish.yml`, so a save does not republish the site |
| 2 | `move-apply` (also on a 10 minute timer, so a lost poke loses nothing; `concurrency` on the job, wanstuck1; no paid secret, so nothing can be spent): rebuilds `data/moves/index.json`; adds Art Library entries for new objects (e.2) |
| 3 | When any `live` differs from the generated script: `python3 tools/movebench/bundle.py`, a `## movespec-<run>` heading in `docs/CHANGES.md` naming the animations, `python3 tools/art-library/bump_tags.py movespec-<run>`, which moves the `?v=` of `data/move-specs.js` in `index.html` and adds the build to the history, then one push with the newest-main loop |
| 4 | After the contents API confirms the script on `main`, `finished.build` is written and the page shows "In the game (build ...)" |
| 5 | The phone gets it like any build: a new `?v=` is a new address, so the service worker fetches it |

A draft never reaches the script, so an unfinished idea never plays in the game. The board needs no card for these builds: `bump_tags.py` skips the board check when it runs inside an Action, as it does for the `guideuse-` builds.

---

## g. BUILD PHASES

Every phase is one session on **Claude Sonnet 5.5, effort medium** (row B of `claude/handoff-rules.md`: the next phase of a written plan, tests catch mistakes). No phase needs Fable: the one foundation choice, the spec, is made in this document. If a phase fails, raise the effort one step first (rule 4). Each phase ends with `python3 tools/smoke.py`, a `docs/CHANGES.md` heading, and Built notes added under this section.

| # | Card, build | Builds | Deletes | Tests | How Tom judges it |
|---|---|---|---|---|---|
| 1 | `c-movebench-1`, `movebench1` | The preview stage: `bench.html`, `engine/b3-bench.js`, and a Preview the whole move box on the sheet of every family move and monster attack. Play, Pause, 1x, half, quarter, Loop, Mute. Reads today's tables; no spec yet | Nothing | New `tools/movebench/preview_test.py`: the four Duo sizes; boots without the voice files (under 25 MB of scripts); a staged move, a move with only a clip, a default-motion move and a monster attack with a wind-up each play to the end; clips in memory 16 or fewer; no request to dispatch, fal or xAI; the frame is removed on leaving the tab | Phone: ADMIN > BATTLE GUIDE > Animations > Tom > Lounge Pass Flex > Preview the whole move |
| 2 | `c-movebench-2`, `movebench2` | Drag to any moment, step one picture, the bar with lanes read from the run, body states, wind-ups alone, answers (a monster attack after the move), NO VIDEO YET over the standing video (`cfg.bench`) | Nothing | `preview_test.py`: a replay to the same moment gives the same picture at three moments of three moves (clock start and random numbers pinned); each body state plays; a move with no video shows its stage and effects | Drag the bar on Zone One Blockade; open Tom's Guard |
| 3 | `c-movebench-3`, `movebench3` | The spec: `tools/movebench/` (`schema.py`, `migrate.py`, `bundle.py`, `golden.py`), a file in `data/moves/` for every animation that has anything today, `data/move-specs.js` in `index.html`, `engine/b3-spec.js` (`msLive`, `msSet`). The engine does not read it yet. `tools/movebench/golden.json` recorded on the untouched engine | Nothing | `spec_test.py`, `golden_test.py` (b.6); `bundle.py --check` in smoke | Nothing to judge (no screen changes); the CHANGES entry lists how many files |
| 4 | `c-movebench-4`, `movebench4` | The engine reads contact, hit stop, shake, effects and their params from the spec; shake and the run-in play in a real fight | Step 2 of b.5 | `golden_test.py` identical; `timing_test.py`; `b3_vfx_test.py`; `b3_hitstop_test.py`; grep zero | Preview of Lounge Pass Flex looks as before |
| 5 | `c-movebench-5`, `movebench5` | The workbench page shell in place of the sheet (d.1, d.6), the Timing section with its controls, the draft in the browser, the preview playing the draft. Not saved to the repo yet | Nothing | New `tools/movebench/page_test.py`: the five layouts with pictures; each Timing control changes the run the preview reports; today's Make this video, takes and Use this one checks of `battle_guide_test.py` still pass | Change Freeze on the hit and watch the preview |
| 6 | `c-movebench-6`, `movebench6` | Save draft, Undo, Earlier versions, Finished; the `move-apply` Action; statuses, the list's progress bar and chips; Pick-Me-Up gets a row | The Plan block at the top of the Animations tab | `page_test.py` against the stand-in GitHub: compare and swap with a 409 replay, a second device, Finished makes one build for three animations, a session's change shows Changed since you finished it; `tools/movebench/apply_test.py`; `workflow_check.py` | Finish one move and see the build name on the bar and on the title screen |
| 7 | `c-movebench-7`, `movebench7` | The Effects section: `fxparams.py`, `data/movebench-fx.json`, `data/movebench-words.json`, the picker of 37 with moving samples, a control per param, On whom, When, the placeholder for an id with no drawer | Nothing | `spec_test.py` (every param has a control kind and words); `page_test.py` sets one param of each control kind and reads it back from the armed cue | Add Brass rings to a move and change how many |
| 8 | `c-movebench-8`, `movebench8` | The engine reads stage steps, lasting things, set pieces and objects from the spec; a family move with no stage can be made | Step 3 of b.5 | `golden_test.py` identical; the rewritten `movestage_test.py`; `tools/guidegen/purge_test.py` gains the old names | A move that said Waits for staging now has Make this video |
| 9 | `c-movebench-9`, `movebench9` | Stage editor, part 1: the step list, moments (named moments, Set to where the preview is), and the steps with no object: Words, Shake, Flash, Dim, Glow, Knock the monster back, Play a sound; the Sound section | Nothing | `page_test.py` adds, changes, reorders and removes each of the seven and checks the step fires at its moment | Add words to a Basic |
| 10 | `c-movebench-10`, `movebench10` | Stage editor, part 2: objects (Throw, Drop, Drive across, Rain, Put in front, Float over, Surround, Pop up), New object, the Art Library entry (`stage-prompts.js`), the pink box | Nothing | `page_test.py` for the eight; `apply_test.py`: a new object makes one Library entry and no generation; `python3 tools/art-library/artgen_lib_test.py` | Add an object, open it in the Art Library, Generate, Approve, see it fly |
| 11 | `c-movebench-11`, `movebench11` | Lasting things, When it answers (the counter video through the same Make this video), the Set piece section | Nothing | `page_test.py`: a ward's object enters, answers a monster attack in the preview and leaves; a set piece's length and dim | Tom's Zone One Blockade and Tarmac Porsche Transfer |
| 12 | `c-movebench-12`, `movebench12` | The spec holds which clip plays (moves, attacks, wind-ups, pair, body states); `use_take.py` writes the spec; Trim | Step 4 of b.5 | `golden_test.py` identical; `apply_test.py`, `take_test.py`; `video_only_test.py`; `b3_test.py new1` to `new5` | Use this one on a new take still puts it in the game |
| 13 | `c-movebench-13`, `movebench13` | Start picture per move: Holds and Wears on the page, the Library entry `start-<who>-<move>` made from the Hero with only the hand band edited, a video row that carries its own start picture (`store.py` gains that one field) | The seven two-held-prop lines of the To do screen (each is now a setting of its move); card `t-guidecross-decide` is rewritten to the four decisions left | `store_test.py`, `worker_test.py`, `scripts/verify_lock.py` untouched and passing; `spec_test.py` (one held prop) | Deedee's Wet-Floor Hazard: set the mop as held, make the picture, make the video |
| 14 | `c-movebench-14`, `movebench14` | Monster attacks get stage steps, effects, hit stop and shake in the engine and on the page | `b3vMeta`'s "a foe's move draws nothing" rule | A new golden for attacks with a spec; `b3_vfx_test.py`; `b3_test.py` | Mud Pie with a splash |
| 15 | `c-movebench-15`, `movebench15` | Family Ruckus: the two rows `ruckus:double` and `ruckus:full`, their stage and effects played on the `ruckusSpend` beat | Nothing | `preview_test.py` plays both; `b3_test.py` | Double Team in the preview |
| 16 | `c-movebench-16`, `movebench16` | The Admin Dashboard layout Animations (420, 951, 1589, 440); the wide layout checked at 1589; docs: `docs/BATTLE_GUIDE.md`, `docs/BATTLE3.md`, CLAUDE.md "Where things live" | Step 5 of b.5; card `c-movelab-rose` retired | `python3 tools/dashboard_test.py`; `page_test.py` at 1589 and 829 wide; grep zero for `b3ml` | The wide monitor: Layout > Animations |

Phase 1 is usable on the phone by itself. Phases 3, 4, 8 and 12 change no screen: they are the engine moving to the spec under the golden test, and are placed so that each editing phase has its part of the engine ready.

### g.1 The board's bulk video path (a recommendation; this session did not touch it)

Recommended: **pause now, retire in phase 16.**

| Piece | Recommendation |
|---|---|
| Automatic re-rolls and the auto-started `c-wanstop-*` sessions (wanauto1) | Pause: set `_bulk.auto.tries` to 0 so a miss stops with no second paid try and no session. This is the part that spends without his tap |
| The ten open `t-wangaveup-*` cards and `c-fix-movefun-gen` | Answer Not needed in one go: each of those moves shows in the workbench as No video yet or To do, with its last prompt |
| `t-rosestage-lab`, `t-wanwatch-*`, `t-movefun-gen` | Close when the videos already made are judged; no new ones are added |
| `wan-gen --bulk`, `wanbulk.py`, `wanqa.py`, `wanbake.py`, the Generate all N videos button | Keep until phase 16, unused, then retire and purge in a card of its own, once Tom has made videos from the workbench for a week. `falq.py` and `wangen.py`'s single-job path stay: the Guide's worker uses them |

---

## h. RISKS AND WHAT I CHECKED

### h.1 Risks

| # | Risk | What limits it |
|---|---|---|
| 1 | The golden test is only as good as what it records. A look that is not on the timeline (an effect's drawing, an object's size) could change unseen | Phases 4, 8 and 12 also run `b3_vfx_test.py`, and the session looks at the contact sheets it writes |
| 2 | 20.9 MB of scripts in a frame on the phone, beside the Guide page. Measured in desktop Chromium only, not Safari on the phone | Phase 1's first job is to load it on the 466 x 657 test profile and report the time; the frame is made only on a tap. If the phone cannot hold it, the stop-loss applies and the fallback is the same stage opened as its own page from the Guide (same engine, same controls), never a second implementation |
| 3 | Replay to a moment was not identical at 0.9 s in my test (identical at 1.8 s). Not investigated; likely the idle loops' place in their cycle (the fight clock did not start from the same value) or an unpinned random shake | Phase 2 pins the clock's start and `Math.random`, and its test compares three moments |
| 4 | Phase 12 moves `anim` and `wind` off about 140 rows and out of `use_take.py`, the path that puts every video in the game | It is late in the order, after the page is in use; golden plus `apply_test.py` and `take_test.py`; it can be dropped without losing any editing feature (the spec would then name the clip only for preview) |
| 5 | The start picture with a held prop (phase 13) reuses the factory's hand-band edit (`lock_hero_pixels` in `scripts/benchmark_run.py`) from an Art Library entry. That has not been done from the Library before | The phase reads `scripts/` first and changes none of the lock files; `scripts/verify_lock.py` must pass untouched. If the Library cannot run it, the phase stops and says so |
| 6 | Two things can draw the same idea: Tom's Capstone has a stage Porsche (an object picture) and the library's code-drawn Porsche effect | The page shows both in their sections and each can be switched off; Tom judges in the preview which stays |
| 7 | A build per batch of finished moves adds `movespec-` builds to the history | They are grouped like `guideuse-` builds; one build carries every move finished in the last ten minutes |
| 8 | Battle 2 is still in the repo and PASS-1 DRAFT REVIEW plays on it. Phase 4 deletes that review | The workbench preview replaces it; card `t-pass1draftplay` is closed by phase 4 with a line saying where to look instead |
| 10 | Card `c-pass1final` (wire the Pass-1 finals and the counter clips) is open and writes rows of `data/pass1-meta.js`, a file phase 4 deletes | Phase 3 looks at that card before it records the golden: if it has shipped, its rows migrate like the rest; if not, phase 3 rewrites its prompt to write the spec files instead |
| 9 | The words for 37 effects' settings (about 110 params) are written once by a session, and Tom reads them | They are one file, changed without touching code; a wrong word is a one-line fix |

### h.2 Checked in the repo on 2026-11-26

| Checked | How |
|---|---|
| The three manifests: 123 moves (43, 40, 40), 24 fps, `engineSpec` fields and ranges, 7 counter clips, 13 path kinds | Read with a script |
| The library: 37 assets (11 core, 4 projectile, 22 set pieces), every `params` line, all `built` | Read with a script |
| `data/b3-stage.js` (20 rows, 15 actions, 9 lasting, 5 set pieces), `engine/b3-stage.js` (`b3gDo`, `b3gPts`, `b3gPlay`), `engine/b3-vfx.js`, `engine/guide-timing.js`, `engine/pass1-vfx.js`, `data/pass1-meta.js` (7 rows), `engine/b3-movelab.js`, `b3PlayMove` and `b3Draw` in `engine/b3-play.js`, `engine/b3-clips.js`, `data/b3-clips.js`, `engine/b3-lab.js` | Read the sections named |
| The Guide: `data/guide-anims.json` (679), `data/guide-manifest.json`, `openPlayer` and the queue code in `battle-guide.html`, `docs/BATTLE_GUIDE.md`, `tools/guidegen/recipe.json`, `queue.json` on `guideq` (241 KB) | Read; fetched the branch |
| The game boots a fight without the voice scripts; a staged move plays; the clock can be stepped by hand | Ran it in Chromium (the numbers in section c) |
| The preview pictures in the mock | Real frames from the Battle Lab "In a fight" address, taken the same day |
| The mock at 466 x 657, 678 x 445, 951 x 648, 669 x 869 and 3440 x 1440 | Looked at every size; fixed the folded-sideways bottom bar and lanes |

### h.3 Assumed or not checked

| Item | Status |
|---|---|
| Safari on the real phone | Not available here; every size was Chromium |
| File sizes of specs (1 to 8 KB) | Estimated from the worked examples; the Capstone row is the largest today |
| That the art-bake Action can cut a stage object approved in the Library with no change | `bake_stage.py` exists and cuts the 15 baked objects; the Library to bake link for this entry kind was not traced |
| The rows phase 12 touches | Counted with a pattern, not by loading the game: 120 family moves and 20 monster attacks carry an `anim`, 5 attacks a `wind`, 12 owners are in `B3_BODY_CLIPS` |
| How long `move-apply` takes | Assumed about 4 minutes, the figure `guide-apply` shows |

### h.4 The calls this plan made

| Call | Why |
|---|---|
| One file per animation on `main`, one generated script for the game | f.2 |
| A draft never plays in the game; only Finished does | He curates: what plays is what he signed off |
| The preview is a stub fight in a frame inside the Guide, running the engine files | c |
| No playback speed setting | The lock allows native speed only |
| `held` is one text, not a list | The file cannot break the one-held-prop rule |
| Sounds are steps and effect settings, not a fourth list | One place per fact |
| A family move with no stage can be made | He decides what a move needs; "Waits for staging" was a gate for sessions |
| The Move Lab and the Pass-1 draft review are deleted, not kept beside the workbench | Purge replaced files completely |
| Bulk videos: pause now, retire in phase 16 | g.1 |
| `c-movelab-rose` waits on Tom's answer | It would build onto a screen this plan deletes |
