# Family Move Lab feedback, ROUND 2 (Tom, 27 Oct 2026, 3pm): BUILD THESE NEXT

Source: Tom's second review of the Family Move Lab (https://claude.ai/artifact/JmodAze1EvP34Cob5ECzXD, version 4) after round 1 was built. This file replaces the round-1 list; round 1 is done except where a row below says otherwise. Rows marked KEEP need no change.

Tom's quality note: the round-1 build (done by the Fable model) came back below his bar. "Custom animation" means a purpose-built, detailed scene, drawn with the same care as Tom, Grace and Rose's moves. Do not ship a re-skin of a generic pose.

## Cross-cutting rules (canon; apply to every row)
- A Tombo participant is NEVER overlapped by a non-participating party member. When a Tombo starts, both participants step forward and stand in FRONT of the rest of the party, keeping their lineup order (Tom above Deedee or Boppy, as in formation). Audit every Tombo for this, not only the rows below. Same rule for a solo move: the mover steps forward in front, never over, a party member (see Almond Milk).
- "Body is distorted" = the shared recruit rig stretches Amy, Deedee or Boppy. Fix with custom pose sets (style of data/grace-wheel.js), not rig poses.
- Child Tom and child Amy (Ymamot Creation, Knock It Off!) must be as detailed as adult Tom and Amy: half height, different outfits, Tom has a full head of hair and no beard. The current kid() blocks are rejected.
- Keep numbers, costs and battle effects. Changed lines go on the bake list (claude/voice-baker-scripts-familylab.json). No em dashes.

## Amy's own moves
| Move | Verdict | What to change |
|---|---|---|
| Kettlebell Swing | KEEP | |
| PEP TALK | KEEP | |
| Red Pen | KEEP | |
| Hot Lunch Tray | tweak | The tray covers her face: move it off her head. Food must look like a school lunch (pizza slice, milk carton, apple, tater tots), drawn in detail. |
| Gold-Star Recess | KEEP | |
| Inside Voices! | tweak | Bigger, more detailed light switch (plate, toggle, screws) and a real flip animation (toggle moves, room lights go out). |
| Surprise Quiz | KEEP | |
| Burpee Blitz | tweak | Still not a burpee. Multi-step motion, one frame per beat: stand, squat with hands down, jump feet back to plank, push-up down, push-up up, jump feet in, jump with arms up. Repeat for the blitz. |
| Hill Repeats | tweak | Line still mentions the monster. Rewrite: she brags about her heart rate (e.g. "Heart rate 185 and I'm still TALKING."). Rebake. |
| Almond Milk, Please | tweak | Much more detailed food art (carton, glass, cereal or latte). She currently steps over a party member: step forward in front of the party instead. |
| False Start | KEEP (spot-check) | Verdict keep; carried note says body distorted. Open the frames; if any rig warp remains, fix with custom poses. |
| Negative Split | KEEP (spot-check) | Same as False Start. |
| Nobody Leaves | KEEP (spot-check) | Same as False Start. |
| Boston Qualifier | KEEP (spot-check) | Same as False Start. It is the Ultimate; if touched, make it bigger. |

## Tom + Amy
| Tombo | Verdict | What to change |
|---|---|---|
| I Called It! | tweak | Amy still distorts: custom poses. Funnier, more competitive bickering in jest. Both step in front of the party, no overlap. |
| Opening Night | tweak | Tom covers the party. He must step forward in front of them. |
| Ymamot Creation | tweak | Child graphics rejected (too simple, blocky). Redraw child Tom and child Amy per the cross-cutting rule. |
| Party Decorators | tweak | Add Tom's whining line: "But I've been on this ladder for an hour!" (bake it). |
| Knock It Off! | tweak | Same child-graphics rejection as Ymamot. Redraw. |
| Elevator Cheat | KEEP | |

## Tom + Deedee
| Tombo | Verdict | What to change |
|---|---|---|
| Wine and Gossip | tweak | Deedee still distorts. Custom animation for her and Tom. |
| Clean As You Go | tweak | Deedee still distorts. Custom animation for her and Tom. |
| Pick the Rhubarb | KEEP | |
| Trip to Italy | tweak | Tom is behind the party. Step him forward beside Deedee, just above her, in lineup order. |
| Tom Cooks for Mom | KEEP (spot-check) | Carried note says Deedee's run is distorted; check frames, fix only if it still warps. |
| Feast on Jefferson Park | KEEP | |

## Tom + Boppy
| Tombo | Verdict | What to change |
|---|---|---|
| You Hold the Net | tweak | Boppy's crouch at the end still distorts. Custom crouch frames. |
| Quiet on Cattail Pier | tweak | Tom is overlapped by the party. Step him forward, not behind Boppy. |
| Nobody Gets Past Us | tweak | Same: Tom overlapped by the party. Step him forward. |
| Bird's Nest / Measure Twice | tweak | Tom overlapped by the party; step him forward. The name Tom sees is still Bird's Nest: the rename to Measure Twice did not reach the lab viewer or export. Rename everywhere so the name matches the home-repair scene. |
| Garden Lesson | KEEP | |
| Pepper Contest | KEEP | |

## Order of work (make the call, do not ask Tom)
1. Staging first: a shared "step in front" helper for Tombos and solo forward steps, applied to every Tombo. Fixes Opening Night, Trip to Italy, Quiet on Cattail Pier, Nobody Gets Past Us, Measure Twice, Almond Milk, I Called It! in one pass.
2. Child Tom and child Amy sprites (shared by Ymamot Creation and Knock It Off!).
3. Remaining distortion rows: I Called It!, Wine and Gossip, Clean As You Go, You Hold the Net, plus the spot-checks.
4. Content rows: Hot Lunch Tray, Inside Voices!, Burpee Blitz, Hill Repeats line, Party Decorators line, Bird's Nest rename.
5. Test every changed move with claude/labtest.py, look at frames.py contact sheets for each, republish the lab at the SAME link for Tom's review. Merge into the game only after he approves.
