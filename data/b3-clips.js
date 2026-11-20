'use strict';
// data/b3-clips.js — Battle 3 body states and video clips (stage 8, architecture 2.7).
// B3_BODY_CLIPS[owner][state] is a clip id (data/clips/*.js, made in the Art Library). A state with no entry, or a clip that is not
// loaded yet, shows the painted frame that B3_BODY (engine/b3-play.js) names, so a missing clip never breaks a fight.
// States: idle and guard are loops; hit, dodge, give, cast and victory play once; ko plays once and its last picture is held;
// run is the loop shown while a fighter crosses the field. Monsters add slip (Deedee's wet floor), flustered (held) and die.
// A MOVE or an ACT switches from the default animation to a clip by its own row: anim:{kind:'clip',clip:'<id>'} in data/b3-kit-<id>.js
// or data/b3-foes-ch*.js (a clip with no impact frame says where it lands: at:<share of its length>). An act may also name the clip
// that holds while it is wound up: wind:'<id>'.
// B3_BODY_PAINT[owner][state] (clipreset, 2026-11-19): a state shown by a painted battle frame and the engine's own motion, with no video.
// f is the frame's name on the owner's battle sprite; h is that pose's painted height as a share of the standing idle's (measured from the
// battle sheet); s is the size the pose is drawn at, so that its head matches the standing head (Grace's guard is painted with a face about
// 1.25x her standing face, so it is drawn at .8). A state listed here has no row in B3_BODY_CLIPS.
// Proof build: Grace's guard only. Her old guard video (data/clips/grace-guard.js) stays in the repo until Tom decides (board card t-clipreset).
const B3_BODY_PAINT={
  grace:{guard:{f:'defend',h:.88,s:.8}}
};
const B3_BODY_CLIPS={
  tom:   {idle:'tom_idle',   guard:'tom_guard',   hit:'tom_hit',   dodge:'tom_dodge',   ko:'tom_ko',   victory:'tom_victory',   run:'tom_run',   give:'tom_give',   cast:'tom_cast'},
  grace: {idle:'grace_idle', hit:'grace_hit', dodge:'grace_dodge', ko:'grace_ko', victory:'grace_victory', run:'grace_run', give:'grace_give', cast:'grace_cast'},
  rose:  {idle:'rose_idle',  guard:'rose_guard',  hit:'rose_hit',  dodge:'rose_dodge',  ko:'rose_ko',  victory:'rose_victory',  run:'rose_run',  give:'rose_give',  cast:'rose_cast'},
  deedee:{idle:'deedee_idle',guard:'deedee_guard',hit:'deedee_hit',dodge:'deedee_dodge',ko:'deedee_ko',victory:'deedee_victory',run:'deedee_run',give:'deedee_give',cast:'deedee_cast'},
  mudling:{idle:'mudling_idle',hit:'mudling_hit',slip:'mudling_slip',die:'mudling_defeated'},
  grump:{idle:'grump_idle'},
  toad:{idle:'toad_idle'},
  log:{idle:'log_idle'},
  bigone:{idle:'bigone_idle',hit:'bigone_hit',slip:'bigone_slip',flustered:'bigone_flustered',die:'bigone_defeated'}
};
