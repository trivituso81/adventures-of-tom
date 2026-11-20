# Muffin theft, fix round 5: the Mudling's whole path (plan, 2026-11-20)

Source: Tom's screen recording of 2026-11-20 09:46 (27 s, desktop, build after fix-heist1play-4), reviewed frame by frame by a Fable session. Tom: "there are still several issues with the mudblob animation". Board card: t-heist1play (Watch the new muffin theft in Deedee's kitchen). Suggested tag: fix-heist1play-5.

This plan was NOT pushed to the board: that session was refused push access to the repo. The session that takes this plan adds the card (c-fix-heist1play-5, lane Claude, theme Story and Dialogue) in its first push and a history line on t-heist1play.

## Why four fix rounds missed (read first)

Each round changed one coordinate from one sentence of Tom's and shipped on tests. Nobody watched the scene play. The scene is staged in tile coordinates on a flat painting, so a number that looks fine in data/scenes.js can sit inside a stool, behind the island cutout or behind the railing plant. Rule for this round: record the scene in the headless browser, cut frames at 10 per second for the whole theft (bang to despawn), and look at every one in portrait and landscape before pushing. A frame where the Mudling is cut by furniture, covers a person, stands still for more than 1 s with nothing changing, or is missing, is a fail.

## What the recording shows, and the change (scene: SCENES.ch1Theft, data/scenes.js about 205 to 250)

Times are in Tom's recording.

| # | Time | What is on screen | Cause seen in the scene steps | Change |
|---|---|---|---|---|
| 1 | 0:06.1 to 0:06.8 | It slides up the hall as one frozen picture. | `walk` with the single pose `mh_look`. | It travels in short hops with a squash on each landing, one hop per `splat`. Same for every later move. No new art. |
| 2 | 0:06.8 to 0:11.7 | It stands frozen for 5 s right under Rose (her shoes touch its sprout) while "AHHH! DEEDEE!" plays. | It stops at [8,11.4], Rose is at [8,10]; the `all` waits for Rose's whole voice clip. | Stop at about [8,12.2] so they do not touch. The scream must not hold the scene: the charge starts about 0.5 s into it. While it does stand, it looks one way, then the other (existing `mh_look` flips). |
| 3 | 0:11.7 to 0:12.3 | The charge is over in half a second, as the standing picture facing the camera. Grace is thrown although it never goes near her, flies across Tom and lands half hidden behind the plant on the railing. Tom is thrown up over the sofa before he lands. Deedee is shoved about half a second after it has passed her. | Path [8.4,9.9] > [7.4,10.4] > [5.7,8.9] misses Grace [10,10] and Tom [9,9]; knocks are on fixed delays, not on contact; Grace's landing [11,10.7] is behind the plant cutout; Deedee's hop waits .95 s. | Path goes through the people in order: Rose, Grace, Tom, Deedee, then the island. Each one falls when it reaches them (trigger on its position, not a timer). Short throws that land on open floor (check each landing in frames, none behind the plant, none over the sofa). Deedee is shoved on contact. About twice as long overall so it reads. Use the two run pictures (`mh_sneak_a/b`) facing the way it travels. |
| 4 | 0:12.4 to 0:15.5 | It waits 3 s standing inside the stool at the corner of the island. | Wait spot [5.7,8.9] is on the painted stool. | Wait on open floor just clear of the stool (find the spot in frames). |
| 5 | 0:15.6 to 0:16.6 | It hops "onto" the counter, is on it for one frame, then is drawn BEHIND the island with only its head and arms showing. The pan vanishes from the counter half a second before it appears over its head. | Hop target [4.7,7.5] sorts behind the island cutout layer; pan hide and hold pose are not on the same frame as drawn. | It lands on the countertop beside the pan and is drawn in front of the island layer for as long as it is up there (a draw-on-top flag for the actor, or a lift that keeps its sort row in front). The pan leaves the counter on the exact frame it appears overhead. |
| 6 | 0:17.2 to 0:17.6 | Hopping down, its body is cut off by the counter edge, then it floats across Deedee's legs. | Starts behind the cutout; landing [6.6,8.6] overlaps Deedee at [7.6,8.1]. | Hop down from the visible spot to open floor that covers nobody. Move Deedee's shove landing if needed so the two never overlap. |
| 7 | 0:17.6 to 0:18.9 | It runs on the spot for 1.3 s, then blinks out. It never crosses the room or reaches the door. | The `walk` to [7.2,10.8], [8,11.8], [8,13.2], [8,14.6] does not move it (find out why: blocked by the people getting up at [8,9] and [9,9], or the frame-list pose stops the walk), then `despawn` fires. | It really runs out: across the floor, down the hall and off through the door, in view the whole way, `doorOut` when it is gone. |
| 8 | 0:18.0 to 0:18.9 | Tom, Rose and Grace stand back up into calm poses (Tom smiling) right beside the thief while it still holds the pan. Nobody watches it go. Deedee ends tucked behind Tom's shoulder. | `getup` delays .25 to .55 s run alongside the escape. | They stay on the floor and turn to follow it out; they get up after it is through the door. Deedee ends on a clear spot beside Tom, not behind him. Boppy stays turned away (correct today). |

Not the Mudling, seen in the same frames: Rose's scream pose has a pink dress, her other poses a yellow one. Leave it unless Tom asks; note it on the card.

## Keep as is

The pan size in its hands (fixed in round 4), the knocked-down poses, Deedee's lines, Boppy's story running over the exit, the mud prints and crumbs, the Mudling's size (CH1_MUD 1.1).

## Check before pushing

Chapter select > Chapter 1 > theft scene, portrait and landscape, frames at 10 per second from the bang to the despawn, every frame looked at against the fail list at the top. Then the usual tests and push steps in claude/next.md.
