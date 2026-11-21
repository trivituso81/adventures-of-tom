# duobox1 (2026-11-12 14:36 to ~15:10, main 47b81ce): Duo sideways dialogue box one third shorter

- Tom 14:36: "The height of the dialogue box on duo landscape should be one third less tall ... portrait should be shrunken proportionately."
- Fact (DONE, pushed): one rule in index.html after the Duo block, `html.duo.landscape #dialog{min-height:calc(calc(75px*var(--ts)) + env(safe-area-inset-bottom))}` (was 112 x --ts from the `html.tablet.landscape` rule). At 951 x 648 the box measures 93 px (was 140). The portrait is as tall as the box (`fitDialogPortrait` in engine/overworld.js, `--dp-w`), so it went 138 px to 91 px with no extra code and the text column follows. Phone landscape, other tablets and portrait are untouched.
- Looked at in a real browser (Duo 951 x 648, Grace line, chapter 1). smoke FAILS []. Not seen on the Duo.
- Tom's check: title stamp `build duobox1`; any dialogue in Duo sideways. If long lines clip, the text area has room for three lines (min text height 56 px at 14 px type); if he wants it shorter still, lower the 75.
- Note: next.md was not rewritten this session (small change); its header still says main e0d7fa8. Add duobox1 to the tag list at the next rewrite.
