# hugflag1 was UNDONE in hugflag2 (2026-11-13 12:55)

Tom did not want the greeting frames replaced. hugflag1 flagged `tom-greeting-crouch` and `tom-grace-rose-greeting-hug` as "old Tom" on my own assumption (outfit comparison against the kneel and ride poses, which have a heart under the shirt, belt, brown jeans). Tom said Tom does not wear a heart shirt or brown jeans and that the crouch reference picture is the only one needed. hugflag2 reverted the Library data: both entries Approved again, original file, title and `tom-hero-v2.png` reference. No game art, atlas or raw sheet was ever changed.

Still open: what Tom saw as "old frames" in the intro during the crouch and hug is NOT identified. Do not touch any art until he says which frame and what looks wrong. Open question for him: is the kneel (`hg_kneel`, heart shirt) or the ride poses (`tr_*`) the frames that look wrong to him?

Facts for whoever picks this up (code, not opinion): the crouch and hug play `hg_hear`, `hg_delight`, `hg_crouch`, `hg_kneel`, then `hg_run`, `hg_crash`, `hg_group` (engine/intro.js `hugHearStep`, `hugStep`; atlas art/chars/hug-story.webp; set `hug` in tools/sprite-bake/bake_story_poses.py). `hg_kneel` and the `tr_*` ride frames come from the 11-12 introride1 build.
