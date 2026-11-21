# Addendum to claude/next.md (written 2026-11-05 ~16:10 local). Fold into next.md next time it is rewritten, then delete this file.

## DONE 11-05: Grace's walk head is .28 of her height (CHANGES 237, tag `gwalk5`, pushed to main as bfa9ea5)
- Tom (15:27): .28 (real children have a bigger head share than adults; order Tom .242, Grace .28, Rose about .295). Tom (15:36): "ok push" after seeing the figure line-up, head row and nine-frame sheet.
- One number: `HEAD_SHARE` default .28 in tools/sprite-bake/grace_walk_frames.py (`GRACE_HEAD_SHARE=0.25` reproduces the old art). Only art/chars/grace-ow.webp and data/grace-hires.js re-baked; battle and KO identical. Baseline rebake with no change reproduced the repo files byte for byte first.
- Measured: stands 39.0 rows before and after, front and back steps 38.9 to 39.0, side strides 37.4 and 37.5 before, 37.5 and 37.6 after. Bob unchanged.
- Tested: `IDS=tom,grace,rose python3 tools/smoke.py` FAILS: [] (twice, second time on the tree merged with Tom's walk21), tag_check ok. Looked at the overworld in portrait and landscape (chapter 10 start, `__LE.chapterJump(10)`): Grace and Rose draw, no errors; at that size they are small and partly behind the D-pad.
- Tom has NOT yet seen it on his phone. Ask one line only if he raises Grace: does Grace look right next to Tom and Rose now?
- Open (do not change until Tom says): whether Rose's old .295 head should come down a little. Grace battle art keeps the old head (.34 to .43 growth in bake_grace.py); not asked.
- Two other sessions pushed Tom's walk (walk20, walk21) while this was in progress; CHANGES numbers collided and Grace's is 237. Tags: ART_V is now `gwalk5`; tom-hires.js keeps `walk21`.
