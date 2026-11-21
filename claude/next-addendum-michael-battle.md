# Michael in battle: stance prompts rewritten (Tom 11-07 09:00, CHANGES 430, pushed 25d6cf6)

Fact: Tom said Michael in battle never holds Lachlan or Isla in any pose or frame. Cause: the two battle stance drafts `michael-battle-stance-1` (8 frames, 4 x 2) and `-2` (6 frames, 3 x 2) said "one figure, hands empty". Both are rewritten in data/art-prompts.json (json only, other entries asserted unchanged, full validate OK, 860 entries): a group of three, both children in his arms in every frame, arms never swing, poses use legs, torso and face. Stance 1 refs: hero painting, approved walk v3, tom-battle-sheet-1-v1 (layout only). Stance 2 refs: hero painting, stance 1 v1 (approved stance 1 is needed first).

Not a prompt problem: `michael-ab-answers-the-call` v1 (approved) already shows both kids in all 6 frames.

Press order for Tom (2 presses): `michael-battle-stance-1`, then `michael-battle-stance-2`. Claude never presses. Stop-loss if either drops a child twice: recommend a different input (Tom paints one battle pose of Michael holding both kids as the reference).

Install (only after Tom approves; approved is not installed): Michael is still not drawn in battle (`O.michael`, engine/olivia-moves.js ~233). Propose staging timing in one line first (Michael with the kids appears for the MICHAEL! move, sheet `michael-ab-answers-the-call` for the six ability frames, stance frames for idle/flinch/cheer). Head row (Michael vs Justin, Lachlan vs Grace, Isla vs Rose) before pushing. No new voice.
