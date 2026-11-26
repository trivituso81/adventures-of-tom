'use strict';
// data/b3-clips.js — Battle 3 body states and video clips (stage 8, architecture 2.7).
// B3_BODY_CLIPS[owner][state] is a clip id (data/clips/*.js, made in the Art Library or by the wan-gen Action). Tom, Grace, Rose and Deedee
// (B3_VIDEO_ONLY below) show a video in every state: a state with no clip of its own, or a clip not loaded yet, shows one of their other
// videos (b3cStandIn, engine/b3-clips.js). A monster's state with no clip shows the painted frame that B3_BODY (engine/b3-play.js) names.
// A MOVE or an ACT switches from the default animation to a clip by its own row: anim:{kind:'clip',clip:'<id>'} in data/b3-kit-<id>.js
// or data/b3-foes-ch*.js (a clip with no impact frame says where it lands: at:<share of its length>). An act may also name the clip
// that holds while it is wound up: wind:'<id>'.
// wanch2a (2026-11-21): the painted body states (B3_BODY_PAINT, the painted guard, fidget, hit, dodge, knock-out, get up, run and victory
// poses) were purged; Tom's rule "NO PAINTED POSES IN BATTLE" (CLAUDE.md). A new video for a state is listed here and replaces its stand-in.
const B3_BODY_CLIPS={
  tom:   {cast:'tom_cast',dodge:'tom_dodge',idle:'tom_idle',guard:'tom_guard',ko:'tom_ko',victory:'tom_victory',run:'tom_run',hit:'tom_hit'},   // wanch1: Wan 3.0 videos
  grace: {dodge:'grace_dodge',cast:'grace_cast',give:'grace_give',idle:'grace_idle',guard:'grace_guard',hit:'grace_hit',ko:'grace_ko',victory:'grace_victory',run:'grace_run'},   // wanch1: Wan 3.0 videos (wanch2: cast on Kling 4.0, dodge a Wan duck)
  rose:  {cast:'rose_cast',dodge:'rose_dodge',victory:'rose_victory',give:'rose_give',idle:'rose_idle',guard:'rose_guard',hit:'rose_hit',ko:'rose_ko',run:'rose_run'},   // wanch1: Wan 3.0 videos (victory, give, dodge: anim-rose-*, 2026-11-21)
  deedee:{cast:'deedee_cast',dodge:'deedee_dodge',give:'deedee_give',idle:'deedee_idle',guard:'deedee_guard',hit:'deedee_hit',ko:'deedee_ko',victory:'deedee_victory',run:'deedee_run'},   // wanch1: Wan 3.0 videos (ko: anim-deedee-ko-yes1)
  mudling:{idle:'mudling_idle',hit:'mudling_hit',slip:'mudling_slip',die:'mudling_defeated'},
  grump:{idle:'grump_idle'},
  toad:{idle:'toad_idle'},
  log:{idle:'log_idle'},
  skeeter:{idle:'skeeter_idle'},   // wanch1
  bigone:{idle:'bigone_idle',hit:'bigone_hit',slip:'bigone_slip',flustered:'bigone_flustered',die:'bigone_defeated'},
  tnb:{idle:'tnb_idle',guard:'tnb_guard'}
};
// B3_VIDEO_ONLY (idea-tomgrace, Tom 2026-11-21: "For Tom Grace and Rose and Deedee ensure that no old painted frames are ever used in battle.
// Only new video animations"): these family members never show a painted battle frame. Any
// moment that has no video of its own shows one of their videos instead (b3cStandIn, engine/b3-clips.js): a reaching move (strike, cast,
// throw, give) plays their give video, a dodge slides their idle video, a knock-out whose video is not loaded yet holds the deepest wince
// of their hit video, dimmed, with stars; everything else is the idle, guard or victory video. Until a video is loaded they are not drawn at all.
const B3_VIDEO_ONLY=['tom','grace','rose','deedee'];
