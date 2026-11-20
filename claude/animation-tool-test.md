# Animation tool test (option 3): state and plan (updated 2026-11-17 11:50, side thread of claude/battle-revamp-next.md)

Prompt Tom pastes in the new conversation: **"Read claude/animation-tool-test.md and continue the animation tool test."**
Nothing here is built into the game. Do not edit the game repo until Tom says a method is chosen. (add_repo was refused twice this session; read-only fetches of raw.githubusercontent.com worked once, then a later one was blocked. Do not rely on repo access for this thread.)

## Result so far (facts, measured)

Method tested: Sorceress, AI Video Gen tool (sorceress.games, Tom signed in, browser), model **Kling 3.0 Omni**, 3 seconds, 764 x 1200, 24 fps, one start frame and one end frame. Claude cut each MP4 into frames with ffmpeg and measured them (scripts in this Project: `claude/anim-test/measure_clip.py`).

| Clip | Verdict | Evidence |
|---|---|---|
| Idle v2 (pencil start picture, same picture as end frame) | **Pass** | Head width varies 0.3 percent over the clip, figure height 0.1 percent. Background and pencil style constant. First vs last frame differ by 1.9 of 255, so it loops. Motion is small but natural (weight shift, blink, head tilt). |
| Strike v2 | **Mostly pass** | Head width varies 2.8 percent. Wind-up, lunge with shout, hold and return all read. Loops (2.0 of 255). Flaws: a pale glow around the figure on the cream background during the lunge, and the shading turns a little smoother and glossier in the lunge frames. |
| Idle v1 (first try) | Fail, cause found | Clip jumped from cream paper to dark pink after half a second and the look was pencil, not painted. Cause: v1 prompt demanded a magenta background and a painted look, and a leftover **END FRAME** picture sat in the tool. Fix: same picture in START and END frame (gives a loop), prompt describes the picture's own look and background. |

Cutout from cream (Claude's test): a plain colour threshold leaves cream pockets between the legs and, in lunge frames, light patches near the elbow where the glow is. A magenta background is cleaner to key. Claude made a magenta start frame from the idle clip's first frame (`claude/anim-test/make_magenta_start.py` reproduces it within a few percent of pixels; Tom already has the PNG `tom-magenta-start.png` from this conversation). Not yet tried as a video start frame. The guard clip was to be its first test.

## The master picture (important)

- The Art Library entry **tom-hero** current picture is a colored pencil and ink caricature on warm cream paper (heart under the controller print, belt, watch, white sneakers with a dark side accent). Faces the viewer, not left. Tom sent a screenshot; the clips used it and match it.
- The loose repo file `art/raw/characters/tom-hero-ref-v1.png` is an OLDER watercolor picture on cream (Nike swooshes). Do not use it.
- This pencil look is not the "painted, 32-bit realistic" style written in the project instructions. Claude asked Tom whether the pencil picture is the approved hero style. Tom has not answered; he continued testing with it. Treat the pencil look as current until he says otherwise.
- Because the picture faces the viewer, the v2 and v3 prompts keep the picture's own facing. The game's battle sheets face left. If the method is chosen, facing left must be solved (a mirrored or turned start frame, or a left-facing hero).

## Sorceress facts (from the tool, the wiki and Tom's screenshots)

- Video model list (cost shown by the tool): Grok Imagine Video 1.5 20 credits per about 5 s; Kling 3.0 Omni 10.6 credits per second (32 credits for 3 s, 53 for 5 s); Seedance 2.5 237; Wan 3.0 70; MiniMax H3 78; Vidu Q4 76; PixVerse V6 4 credits but about 1 s at 360p.
- The start frame goes in the right panel (START FRAME box). **An optional END FRAME box exists. A leftover end-frame picture caused the cut in the first clip.** Put the same picture in both for a loop.
- Gear icon next to a model sets duration.
- Credits: free trial gave 100. Tom has 4 left (68 before the last clip). One "Insufficient credits, you have 0" pop-up appeared while the top bar showed 68: reload and retry; it was a display glitch.
- Pricing (wiki https://sorceress.games/wiki/sorceress/plans-credits-billing, checked 2026-11-17): credits $1 = 100, never expire, one-time packs $10 / $20 / $50 / $100 (1,000 / 2,000 / 5,000 / 10,000 credits). The $49 lifetime pass ("Early Supporter") includes no credits; it unlocks non-AI tools (Auto-Sprite v2, True Pixel, Slicer, etc.). Claude recommended NOT buying the pass or any monthly plan before the Rose and Nara tests: buy the $10 one-time pack only.
- Tom's Plans page cart came pre-filled with five items ($147 once plus $37 a month). Tom did not intend to buy; he only wanted an assessment. Never tell him to subscribe from that page. A one-time pack should be bought from the tool's "Get Credits" button or the lightning icon in the top bar. Claude has not seen that checkout.
- Auto-Sprite v2 is marked Pro (needs the pass). It is not needed: Claude cuts frames and removes backgrounds itself.

## Remaining test plan (Tom agreed to continue; not started)

| # | Clip | Why |
|---|---|---|
| 1 | Rose idle | Child (3'4, head share, short limbs) |
| 2 | Rose strike | Fast move on a child |
| 3 | Nara idle | Dog. Most likely failure. The motion prompts describe a standing person: write a dog version FIRST |
| 4 | Nara strike (attack move) | Same |
| 5 (optional) | Tom with the controller (file 6) | Held prop |

Dropped for now: guard, flinch, cheer (low risk if idle and strike pass; test during the real build). Cost about 32 credits each on Kling 3 s, so about 130 credits for four clips; the $10 pack covers retries. Tom's effort about 10 minutes per clip.

Needs from Tom before generating: (a) a screenshot of the Art Library hero picture for `rose-hero` and `nara-hero`; (b) credits (one-time $10 pack, decision his).

## Next session: do this

1. Ask Tom for the Rose and Nara hero pictures (screenshots) and whether he bought credits. Do not ask which picture Tom used; it is the pencil one above.
2. For each, make a magenta start frame with `make_magenta_start.py` (look at legs, hands, hair, tail and ears; Nara's fur edges will be hard) or, if the cutout looks rough, use the cream picture as is. Try the magenta start frame once with Tom (guard clip, `anim-test-3-guard-v3.txt`) only if credits allow; otherwise use v2 prompts on cream.
3. Write a Nara version of the prompts (dog, four legs, tail, ears; idle breathing and an attack lunge). Self-contained .txt files, no fill-in fields, no banned words (16-bit, 32-bit, SNES, Final Fantasy, Chrono Trigger, pixel art, retro, sprite), no hurt or knocked-out wording, no em dashes. Use the v3 files as the template.
4. Tom runs the clip in AI Video Gen: Kling 3.0 Omni, 3 s, same picture in START and END frame, paste prompt, check the ESTIMATED number, generate, download MP4, send it here.
5. Run `python3 -I claude/anim-test/measure_clip.py <clip.mp4> <outdir>`, look at `<outdir>/sheet.png`, report in a table (head width spread under about 3 percent, loop difference under about 3 of 255, style, outfit, background, edges).
6. Checks that still need doing: head size vs the master picture's own head share; a proper cutout of each clip over magenta; a Move Lab style playback beside the current version of the same move (static strips are not acceptable); file size per move for phones; how many frames per motion feel smooth (the clips are 73 frames at 24 fps).
7. Decision at the end, one of: works for all (option 3 chosen), works for adults only, or fails (fallback: two-part neck split plus 4 to 6 painted key poses per character). Stop-loss: two failures in a row on the same cause, stop and say what is wrong.

## Prompt files (this Project, `claude/anim-test/`)

Every prompt: video clip of the attached picture, locked camera, same place and ground line, constant head size, no cuts. Versions:
- v1 (magenta background, painted look, faces left): superseded, caused the jump. Do not use.
- v2: keeps the picture's cream paper background and pencil look and facing. Tested for idle and strike.
- v3: same as v2 but the background is flat magenta (for the magenta start frame). Untested. Motions: 1 idle, 2 strike, 3 guard, 4 flinch (startled recoil), 5 cheer, 6 prop (controller; the word cream there is only the controller's colour).
The original v1 .txt files are not saved here (superseded).

## Not saved (Tom still has them in chat or on his computer)

Tom's two MP4 clips (idle v2, strike v2) and `tom-magenta-start.png`. Ask Tom to resend only if a re-measure is needed.
