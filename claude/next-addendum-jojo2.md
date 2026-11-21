# jojo2 (2026-11-11 12:3x, main e53ee56; admin and data only, no tag). Read with claude/next.md (not edited there: it is large and other sessions write it)

- Tom 12:18: "implement Jojo's approved art everywhere including admin screens".
- Fact: all in-game Jojo art already rebakes byte for byte from the newest approved files (hero v2, walk v2, emotions v1, stance 1 and 2 v1): bake_jojo.py, bake_jojo_stance.py, emotion_frames.py jojo, bake_emotion_faces.py jojo, bake_talk_faces.py jojo, head_adjust.py manifest. Nothing to install there.
- Fixed: Jojo had no hero crop and was missing from portraits.html. Added FACE['jojo'] (430, 550, 235, 360) in bake_portraits.py, portraits/jojo.png, her square in data/portrait-crops-base.json, and her chip in portraits.html. Looked at the crop and the page.
- Not drawn by the game yet (she is not a party member). If she joins the party, wire `portraits/jojo.png` into the status screen and battle menus.
- Open: `python3 -I tools/sprite-bake/bake_portraits.py tnb` differs from the repo (not Jojo; left alone, check whether a newer TNB hero exists). tools/portraits_test.py times out on main (pre-existing). head_adjust.py apply path for Jojo still untested (see next.md 0i).
