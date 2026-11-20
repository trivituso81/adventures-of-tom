# ch7s4 (2026-11-14): chapter 7 stage 4, pushed as main 9324a9f

Done: hall scene ch7Hall (cart drops on four wheels, seven books land, cart rolls into Tom's shins, Unread shrinks, whispers stop shelf by shelf), rewritten ch7End (Deedee and Boppy walk in as `{bench:...,quiet:true}` guests because PARTY_MAX is 4, cookie, seventh bulb and card, TNB's text as spoken lines), triggers ch7-hall and ch7-end (needs ch7-hallend), new ops cartSet, cartTo, freedDecor in engine/block-break.js, plate zone `off` hook in engine/plate.js, Page NPC in the stacks, bake script tools/art-library/bake_ch7_stage4.py (art/props/stacks/ch7_cart, ch7_cartrose, ord_*).

Tested: ch7Hall 28 pages and ch7End 32 pages, portrait; ch7Hall landscape (117 frames, no errors). Smoke FAILS: []. unused_voice check 4 stays 52 (unchanged by this build).

NOT done or not looked at: ch7End in landscape; a full chapter 7 run from the chapter-select jump; confirming no monsters remain in the Stacks and none in the Reading Room after the break; the floor patch feather change (shadowBlur 16) only seen in landscape frames.

Stand-ins (need Art Library art): ord_know (hue stand-in), ord_shusher, ord_dogear.

Not folded: claude/story-build.md section 12 and the board Live cell for chapter 7 still describe stage 2/3; update them in the next chapter 7 session.

Next chapter 7 prompt: "Read claude/story-build.md, claude/story-ch07.md and claude/next-addendum-ch7s4.md. Test chapter 7 start to finish from the chapter-select jump in portrait and landscape, fix what is off, then update story-build.md section 12."
