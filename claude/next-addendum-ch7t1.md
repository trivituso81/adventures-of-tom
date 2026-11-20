# ch7t1 (2026-11-14): chapter 7 tested start to finish, pushed as main 4a42093

Supersedes claude/next-addendum-ch7s2.md, ch7s3.md and ch7s4.md and the chapter 7 lines in claude/next.md (ORDER NOW -5 and "Waiting on Tom" ch7assets1). The full record is claude/story-build.md section 12. next.md was not rewritten in this session.

- Chapter 7 is built (ch7assets1, ch7s2, ch7s3, ch7s4) and was played from the chapter-select jump to the end card in portrait and landscape with the new `tools/ch7_test.py` (`LAYOUT=landscape` for landscape, output folder as argument, about 7 minutes each, never two at once). Both FAILS [], smoke FAILS [] on the merged main.
- Fixed: chapterJump plays ARRIVALS[n] (engine/chapter-select.js; affects the jumps for chapters 4 to 9); held camera may slide past the bottom of outdoor maps (engine/overworld.js updateCamera, `held`); staging in ch7Arrive, ch7Kitchen, ch7Page, ch7Stacks (`ch7StacksHold`), ch7AfterBoss, ch7Hall (Grace first, Page at 21,10, coin roll from Grace in engine/block-break.js stacks), ch7End.
- Not played by ch7t1: scene 0 (LA goodbye and flight; not part of the jump) and optional story time.
- Waiting on Tom: play chapter 7 (Menu > Chapter Select > Chapter 7), approve the Chapter 7 Library art (stand-ins listed in story-build.md section 12), record the 232 chapter 7 lines.
- Next chapter 7 prompt: "Read claude/story-build.md section 12 and claude/story-ch07.md. Chapter 7 play feedback: <what Tom saw>."
