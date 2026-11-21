Addendum to claude/next.md (written 2026-11-12 ~11:10). Fold into next.md next time it is rewritten, then delete this file. Read it with next.md; it is newer than the header there.

# heads6 (main 9a2989d): Tom's 10:37 to 10:39 head sizes baked and pushed
- Fact: Tom saved Justin 1.20 (was 1.18), TNB 1.21 (1.20), Amy 1.27 (1.25), Deedee 1.13 (1.10), Ms. Cathy 1.18 (new), Young Boppy 1.03 (new).
- Done: `head_adjust.py apply-requests` (heights_test FAILS []), then `emotion_frames.py`, `bake_emotion_faces.py`, `bake_story_poses.py`, `bake_talk_faces.py` for justin tnb amy deedee. EMO_V and TALK_V = heads6. smoke FAILS [], tag_check ok, pushed. CHANGES entry heads6.
- Ms. Cathy's factor is in her Snack Attack frames; Young Boppy's waits in head_tweak.json until the Van Cortlandt install (cathy3 section in next.md).
- Not looked at: a real phone, head rows after the change (no before/after image shown to Tom), welcome screen after rebake. Tom may want to see a head row: `head_adjust.py show` currently crashes for Michael (KeyError 'up_stand' in michael_head.py), so use specific ids.
- Welcome layout: Tom's 10:46 saves (commits 0c02d01, 2f920b1 on data/welcome-layout.json) are live on main, untouched by Claude. Not inspected for content.
- Other session shipped gatedoor3 (200d5ad) in between; rebased cleanly.
