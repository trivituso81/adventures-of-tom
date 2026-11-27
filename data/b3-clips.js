'use strict';
// data/b3-clips.js — which family members are video-only (movebench12: the table of which clip shows which body state, B3_BODY_CLIPS, and the clip a move or an act names in its row, anim and wind, are gone: each animation's
// spec names its own video, data/moves/*.json body.clip, read by engine/b3-spec.js; the Battle Guide's USE THIS ONE writes it, tools/guidegen/use_take.py).
// A monster's state with no clip shows the painted frame that B3_BODY (engine/b3-play.js) names.
// wanch2a (2026-11-21): the painted body states (the painted guard, fidget, hit, dodge, knock-out, get up, run and victory poses) were purged; Tom's rule "NO PAINTED POSES IN BATTLE" (CLAUDE.md).
// B3_VIDEO_ONLY (idea-tomgrace, Tom 2026-11-21: "For Tom Grace and Rose and Deedee ensure that no old painted frames are ever used in battle.
// Only new video animations"): these family members never show a painted battle frame. Any
// moment that has no video of its own shows one of their videos instead (b3cStandIn, engine/b3-clips.js): a reaching move (strike, cast,
// throw, give) plays their give video, a dodge slides their idle video, a knock-out whose video is not loaded yet holds the deepest wince
// of their hit video, dimmed, with stars; everything else is the idle, guard or victory video. Until a video is loaded they are not drawn at all.
const B3_VIDEO_ONLY=['tom','grace','rose','deedee'];
