'use strict';
// data/b3-clips.js — Battle 3 body states and video clips (stage 8, architecture 2.7).
// B3_BODY_CLIPS[owner][state] is a clip id (data/clips/*.js, made in the Art Library). A state with no entry, or a clip that is not
// loaded yet, shows the painted frame that B3_BODY (engine/b3-play.js) names, so a missing clip never breaks a fight.
// States: idle and guard are loops; hit, dodge, give, cast and victory play once; ko plays once and its last picture is held;
// run is the loop shown while a fighter crosses the field. Monsters add slip (Deedee's wet floor), flustered (held) and die.
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
  tom:   {idle:{f:'idle2',h:.99,s:1}, guard:{f:'defend',h:.879,s:.95}, hit:{f:'hurtPose',h:.838,s:.97}, dodge:{f:'windup',h:.909,s:1},
          ko:{f:'hurtPose',h:.838,s:.97,f2:'kneel',h2:.778,s2:1}, victory:{f:'celeb',h:.98,s:1,f2:'leap',h2:.97,s2:1}, run:{f:'run',h:1.01,s:1}},
  grace: {idle:{f:'idle2',h:1,s:1}, guard:{f:'defend',h:.878,s:.8}, hit:{f:'hurtPose',h:.967,s:.8}, dodge:{f:'windup',h:.967,s:.78},
          ko:{f:'hurtPose',h:.967,s:.8,f2:'kneel',h2:.833,s2:.78}, victory:{f:'celeb',h:1.056,s:.95,f2:'leap',h2:1.056,s2:.95}, run:{f:'run',h:1,s:1}},
  rose:  {idle:{f:'idle2',h:1.024,s:1}, guard:{f:'defend',h:.867,s:.85}, hit:{f:'hurtPose',h:.964,s:.85}, dodge:{f:'windup',h:1,s:.85},
          ko:{f:'hurtPose',h:.964,s:.85,f2:'kneel',h2:.795,s2:.85}, run:{f:'run',h:1,s:1}},
  deedee:{idle:{f:'idle2',h:1.01,s:1}, guard:{f:'defend',h:.899,s:.93}, hit:{f:'hurtPose',h:1,s:.93}, dodge:{f:'windup',h:.96,s:.95},
          ko:{f:'hurtPose',h:1,s:.93,f2:'kneel',h2:.838,s2:.95}, victory:{f:'celeb',h:1.081,s:.95,f2:'leap',h2:1.101,s2:.95}, run:{f:'run',h:1,s:1}}
};
const B3_BODY_CLIPS={
  tom:   {},
  grace: {give:'grace_give'},
  rose:  {victory:'rose_victory',give:'rose_give'},
  deedee:{give:'deedee_give'},
  mudling:{idle:'mudling_idle',hit:'mudling_hit',slip:'mudling_slip',die:'mudling_defeated'},
  grump:{idle:'grump_idle'},
  toad:{idle:'toad_idle'},
  log:{idle:'log_idle'},
  bigone:{idle:'bigone_idle',hit:'bigone_hit',slip:'bigone_slip',flustered:'bigone_flustered',die:'bigone_defeated'}
};
