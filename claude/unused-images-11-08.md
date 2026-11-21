# Unused images sweep, 2026-11-08 (result: nothing removed)

Method: every image under art/ (not art/raw/) whose file name is not written in engine/, data/*.js, index.html or sw.js. 922 images (180 MB); 549 flagged (12 MB), of which 546 are painted props under art/props/ and 3 are other.

Why nothing was removed (checked, plain words): the game builds many image names while running, so a text search cannot prove a file is unused.
- art/shop-fg.webp and art/nickels-fg.webp: loaded as 'art/' + map id + '-fg.webp' (engine/plate.js line 298). In use.
- art/props: 424 of the 546 have their name written in code. The other 122 (2.7 MB) include families built from a prefix (for example tom/konami_*, tom/cart_*). Likely in use.
- art/chars/tomride-hero.webp: written by tools/sprite-bake/bake_tomride.py (title picture), not named in engine. Check the title code before judging it.
- Total possible saving is about 2.8 MB against a 1.14 GB site, so it does not help the SIZE problem. The real wins are in claude/size-remediation-plan.md.

To do this properly (only if Tom wants it): run the game with a logger on PROPART and the plate loader through every chapter, record the image names that actually load, and compare. Not worth it for 2.8 MB.

Checker written: tools/art-library/installed_check.py (pushed eb74458).
