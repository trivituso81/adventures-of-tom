'use strict';
// data/b3-clips.js — Battle 3 body states and video clips (stage 8, architecture 2.7).
// B3_BODY_CLIPS[owner][state] is a clip id (data/clips/*.js, made in the Art Library). A state with no entry, or a clip that is not
// loaded yet, shows the painted frame that B3_BODY (engine/b3-play.js) names, so a missing clip never breaks a fight.
// States here are for monsters (idle, hit, slip, flustered, die) and the kept family clips (Rose's victory, the three gives). The family's other body
// states are painted poses, see B3_BODY_PAINT below.
// A MOVE or an ACT switches from the default animation to a clip by its own row: anim:{kind:'clip',clip:'<id>'} in data/b3-kit-<id>.js
// or data/b3-foes-ch*.js (a clip with no impact frame says where it lands: at:<share of its length>). An act may also name the clip
// that holds while it is wound up: wind:'<id>'.
// B3_BODY_PAINT[owner][state] (clipreset, 2026-11-19): a state shown by painted battle frames and the engine's own motion, with no video.
// f is the frame's name on the owner's battle sprite ('run' is the pair sp.run, with sp.runFlip for the way home); h is that pose's painted
// height as a share of the standing idle's (measured from the battle sheet); s is the size the pose is drawn at, so that its head matches the
// standing head (a pose is its own drawing: Grace's guard has a face about 1.25x her standing face, so it is drawn at .8). f2, h2, s2 name the
// second picture of a state that uses two: ko is hurt then kneel (then the knocked-out picture), victory swaps celeb and leap. idle is the
// fidget picture (idle2) shown for half a second every 5 to 7 seconds. A state listed here has no row in B3_BODY_CLIPS.
// Only s and h belong here: a pose is never warped (tools/paint_state_test.py measures them in the real game).
const B3_BODY_PAINT={
  tom:   {dodge:{f:'windup',h:.909,s:1}},
  grace: {dodge:{f:'windup',h:.967,s:.78}},
  rose:  {dodge:{f:'windup',h:1,s:.9}},
  deedee:{dodge:{f:'windup',h:.96,s:.95}}
};
const B3_BODY_CLIPS={
  tom:   {idle:'tom_idle',guard:'tom_guard',hit:'tom_hit',ko:'tom_ko',victory:'tom_victory',run:'tom_run'},   // wanch1: Wan 3.0 videos
  grace: {give:'grace_give',idle:'grace_idle',guard:'grace_guard',hit:'grace_hit',ko:'grace_ko',victory:'grace_victory',run:'grace_run'},   // wanch1: Wan 3.0 videos
  rose:  {victory:'rose_victory',give:'rose_give',idle:'rose_idle',guard:'rose_guard',hit:'rose_hit',ko:'rose_ko',run:'rose_run'},   // wanch1: Wan 3.0 videos (victory: the Grok clip Tom approved)
  deedee:{give:'deedee_give',idle:'deedee_idle',guard:'deedee_guard',hit:'deedee_hit',ko:'deedee_ko',victory:'deedee_victory',run:'deedee_run'},   // wanch1: Wan 3.0 videos (ko: anim-deedee-ko-yes1)
  mudling:{idle:'mudling_idle',hit:'mudling_hit',slip:'mudling_slip',die:'mudling_defeated'},
  grump:{idle:'grump_idle'},
  toad:{idle:'toad_idle'},
  log:{idle:'log_idle'},
  skeeter:{idle:'skeeter_idle'},   // wanch1
  bigone:{idle:'bigone_idle',hit:'bigone_hit',slip:'bigone_slip',flustered:'bigone_flustered',die:'bigone_defeated'}
};
