# Amy kit, Round 3 (approved by Tom 2026-10-27)

Seven version swaps in Amy's kit (data/abilities.js B8_KITS.amy). Source of truth: the Family Move Lab (JmodAze1EvP34Cob5ECzXD), not the game artifact.
Rule: VP, elem, effect and targeting of each slot stay exactly as written. Only key, name, desc, animation and spoken line change.
All seven replaced versions were unbuilt (play:null) or shared an animation that stays, so nothing built is thrown away.
Kit after the swap: 9 teaching, 8 running, 1 singing (two versions), 2 SuperMom, 3 reading, plus PEP TALK. Removes both duplicates (A5 P repeated A2 R; B3 R repeated B3 P).

## Swaps

| Slot | Replaces | New name | Effect kept (verbatim from desc) | Spoken line (data/lines.js, keyed by new key) |
|---|---|---|---|---|
| B5 P | Negative Split | Car Karaoke | Raise party PEP and clear Amber-Stuck (cozy, 5 VP) | LA LA LA LAAAA! I KNOW THIS ONE! EVERYBODY! |
| B5 R | Negative Split | The Key Change | Hit random foes 4 times, +35% crit, Personal Best (+30% POW/WARMTH) 2 turns (kinetic, 5 VP) | And THIS... is the key change! |
| A6 R (ult) | Everybody Gets a Turn | SuperMom | Pull party forward, lift POW and WARMTH, clear mental debuffs (sparkle, 8 VP) | Mom's got it. Mom's got ALL of it. At the same TIME. |
| B4 P | False Start | Eyes in the Back of My Head | Hit one enemy, interrupt its wind-up, delay its turn (kinetic, 4 VP) | I saw that. I didn't even look, and I saw that. |
| A3 P | Gold-Star Recess | Drop Everything and Read | Heal the party (sparkle, 4 VP) | Drop everything and read. Yes, everything. Yes, now. |
| A5 P | Surprise Quiz | Book a Week | Hit one enemy, harder when debuffed, reassure the girls (sparkle, 5 VP) | I finished this one Tuesday. The ending is YOU. |
| B3 R | Almond Milk Gel Pack | Book Club Night | Heal party 25%, thaw Amber, party PEP 2 turns, kindFoe share (cozy, 3 VP) | Book club! I have THOUGHTS about chapter nine. Sit. |

## Animations (build with queue steps, battle.fx, battle.props; reuse the Round 2 "step in front" staging and the amy run frames)

- Car Karaoke: steering wheel and dashboard prop slide in. Amy cranks the radio knob, closes eyes, belts. Huge wobbly music notes fill the stage; drawn car windows rattle; Amber frost shakes off the party from the volume. Tom and Grace cover ears; Rose sings along; PEP bars rise anyway. End pose: Amy holding the note, one finger up, eyes still closed.
- The Key Change: same radio. Four notes fire as projectiles at random foes. The fourth is the high note: screen crack overlay like glass, every foe flinches. Amy fist pump (Personal Best). Grace mouths "Mom. MOM." (small speech bubble, no voice).
- SuperMom: phone prop buzzes MOM x4. One spin; cape and SUPER MOM shirt appear (recolor/overlay). One pass across the stage scooping every party member under her arms like grocery bags, carry them to the front of the turn ribbon, set each down. One finger snap; debuffs pop off as chalk puffs. Hero pose; cape flaps from a desk fan prop.
- Eyes in the Back of My Head: Amy faces away checking her watch. Enemy winds up behind her. Without turning she shoots one hand back, catches its attack prop mid-air, flings it back into it. "I SAW THAT" text pop. She never turns around.
- Drop Everything and Read: library books from her tote dealt one to each member like cards. Everyone sits cross-legged; page-flip sparkles and hearts rise (heal). Rose holds hers upside down; Amy flips it without looking up from her own.
- Book a Week: door-sized hardcover drops from above; Amy catches it one-handed, flips to the last page, slams it shut on the enemy's head. Dust cloud of loose pages. Two bookmarks flutter out and land on Grace and Rose (the reassurance).
- Book Club Night: couch prop unfolds; party piles on. Amy passes a hummus plate (no cheese; almond milk latte on the side table), opens her book, delivers one opinion with a pointed finger. Everyone laughs, hearts rise, frost melts. On a monster (kindFoe) it leans in to listen.

## Voice
All seven lines are new text: add to claude/voice-baker-scripts-familylab.json; browser voice reads them until Tom bakes. No em dashes in any game text.
