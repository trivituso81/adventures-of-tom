# Chapter 7 build, stage 3 done (2026-11-14, build ch7s3, main bd2a7d2)

Read this together with claude/story-build.md (section 12), claude/story-ch07.md and claude/next-addendum-ch7s2.md. It overrides "Stage 2 is NEXT" in section 12 and the Live cell of the board: STAGES 2 AND 3 ARE DONE AND PUSHED; STAGE 4 IS NEXT. (story-build.md and next.md were not rewritten in this session, to avoid overwriting edits from the other story and build conversations. The next chapter 7 session folds this into section 12 when it rewrites that file.)

## What stage 3 built (scenes 3 to 9)
- Scene 3 SCENES.ch7Page: Monday night, cookbooks line, Grace questions Page with the chart box by box.
- Scene 4 SCENES.ch7Stacks: whispers about Tom and Rose, pie crust, the ear-covering row (approved ch7-ears-row picture, scene-props kind `img`), then the hall: grey circle, Page's bedsheet and WET FLOOR sign, Tom pulls the sheet (flag ch7-unsheet), the golf-cart-sized block, Grace at the round hole, Rose at the quiet grey shelf (14,7), one second of hush. Flag ch7-hall turns the block on.
- Scenes 5 to 9: story time (speaker `A picture book`), three wings with the new Tom lines and Rose's "S. H. H.", the door (`A dry old voice`), the Unread (no long coat, VOLUME ONE, gold edge), and ch7AfterBoss with the coin close-up `{ch7Reveal:'coin'}`, Tom's warning, the four conditions, Grace's bookmark, Tom lifts the book. Grace now holds the coin: flag `ch7-gracecoin`. coinFind 5 and the checkout card are gone.
- Engine: BB_SPOTS.stacks in engine/block-break.js (block hangs over the painted returns cart; `cover` draws sheet and sign until `ch7-unsheet`; done flag `bb-stacks`; `ordinary:{}` is empty, stage 4 fills it). Block solid tiles x16-18 rows 7-8 in the ch7 STORY_WORLD hook until `bb-stacks`. `var ch7HushUntil` (data/scenes.js) mutes the floating whisper labels; they are muted for good once flag ch7-door is set.
- Art baked by tools/art-library/bake_ch7_stage3.py: art/props/stacks/ch7_block, ch7_sheet, ch7_sign, ch7_ears; art/closeup/ch7-coin.webp. Test: `python3 tools/closeup_ch7_story_test.py` (passes portrait, landscape, Duo).
- Fixed a stage 2 bug: `{prop:'x',hide:true}` hid nothing because the `hide` key wins. Use `{call:()=>{SCENE_PROPS.x.show=false;}}` or `{propsClear:true}`.

## Tested
reaction_test frames of ch7Page, ch7Stacks (portrait and landscape), ch7Fic, ch7Door (no page errors); ch7AfterBoss ran to the coin close-up (the harness cannot press A on a reveal, so the rest of that scene was not played through; the close-up itself is covered by closeup_ch7_story_test.py). I looked at the hall frames in portrait and landscape and at the coin close-up. smoke FAILS: []. unused_voice.py: check 4 shows 52, the same as before this change.
NOT looked at: frames of the Fiction, Nonfiction and Picture Books scenes beyond the Fiction run, the boss scene (battle), the ears picture after the fix (the fixed run passed with no errors, the frame was checked only as "picture gone").

## Stand-ins and rough spots
- Character pose sheets (Tom pulling the sheet, Grace at the hole, Grace offering the bookmark, Tom lifting the book) are the ordinary sprites. The book is not carried: it stays on the lectern.
- Grey Stacks is the plate turned grey in a circle (ch7-stacks-grey is not approved). The Unread boss sheet was just rewritten upstream (unread1): look at the Unread in the fight and in scene 9 first thing in stage 4.
- Until stage 4: ch7-wrap is still set at the end of the Reading Room scene, and the block and the grey circle stay in the hall after the chapter (they are drawn until flag bb-stacks).

## Stage 4 (next)
1. Hall scene 10 (new SCENES.ch7Hall, trigger after ch7-clear on map stacks, before ch7End): Tom carries the book (hide the book on the lectern, show it in his arms), Page with the sheet, Grace pushes the coin in. Reuse bbPlay('stacks'): roll, click, `ch7Reveal`-style close-up (bbCloseupOn hard-codes art/closeup/ch6-coin.webp: make it use the spot's coin picture, `coin.close` field), cracks, fall, ring. Add `keep` for the stacks spot: the neat cart (art ch7-cart-neat, bake it) dropping onto four wheels, seven books landing, cart rolling into Tom's shins. Fill `ordinary` for the Stacks monsters (cliffhanger, knowitall, popup, shushers; pictures from ch7-books-ordinary) and the Unread shrinking in Tom's arms (ch7-unread-ordinary). bbPlay preload list is oakpark-specific: generalise it.
2. Move ch7-wrap out of AfterBoss (the Unread must stay up until the ring passes), whispers stop shelf by shelf as the ring passes, encounters off in the Stacks and Reading Room.
3. Scene 11 changes (ch7End): Deedee and Boppy walk in, cookie, seventh bulb and card, Tom reads TNB's text as a spoken line, new Heart lines, "Grace row eight". Also the "Also changes" object and NPC text list in story-ch07.md (bookcart text after break, Page lines).
4. Test the whole chapter from the chapter-select jump in portrait and landscape; push.
Prompt: "Read claude/story-build.md, claude/story-ch07.md, claude/next-addendum-ch7s2.md and claude/next-addendum-ch7s3.md. Continue the chapter 7 build at stage 4."
Test recipe: the stage 3 cases are in this addendum's description: map stacks start [1,10,"right"], flags ch7-page ch7-kitchen ch7-goal, unflag ch7-stacks ch7-hall ch7-unsheet; `LATE=1 FIN=1 ROOT=$PWD python3 tools/reaction_test.py cases.json /tmp/out` (about 4 min per case pair, never two Playwright runs at once).
