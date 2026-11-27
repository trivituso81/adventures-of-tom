'use strict';
// engine/b3-spec.js (movebench3, 2026-11-26): the one table of what the game plays for each animation (claude/movebench-plan.md section b).
// data/move-specs.js (written by tools/movebench/bundle.py from data/moves/*.json) fills MOVE_SPECS: for each Guide animation id, the `live` part of its file.
//   msLive(id)   what the game plays for that animation, or null (null means the defaults: nothing here, nothing waits)
//   msSet(id, live)   puts a spec in the table for this page only (the preview plays a draft this way; null puts the file's own back); nothing is saved
//   msReset()   puts every file's own back
// The engine does not read this table yet: phases 4, 8 and 12 move the contact moment, the effects, the stage and the clips onto it, each under tools/movebench/golden_test.py.
const MS={by:Object.assign({},typeof MOVE_SPECS!=='undefined'?MOVE_SPECS:{}),n:typeof MOVE_SPECS!=='undefined'?Object.keys(MOVE_SPECS).length:0};
function msLive(id) { const s=MS.by[String(id)]; return s?s:null; }
function msSet(id,live) {
  id=String(id);
  if(live==null) { if(typeof MOVE_SPECS!=='undefined'&&MOVE_SPECS[id]) MS.by[id]=MOVE_SPECS[id]; else delete MS.by[id]; return msLive(id); }
  MS.by[id]=live; return live;
}
function msReset() { MS.by=Object.assign({},typeof MOVE_SPECS!=='undefined'?MOVE_SPECS:{}); return MS.n; }
