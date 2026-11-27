'use strict';
// engine/b3-spec.js (movebench3, 2026-11-26): the one table of what the game plays for each animation (claude/movebench-plan.md section b).
// data/move-specs.js (written by tools/movebench/bundle.py from data/moves/*.json) fills MOVE_SPECS: for each Guide animation id, the `live` part of its file.
//   msLive(id)   what the game plays for that animation, or null (null means the defaults: nothing here, nothing waits)
//   msSet(id, live)   puts a spec in the table for this page only (the preview plays a draft this way; null puts the file's own back); nothing is saved
//   msReset()   puts every file's own back
// movebench4: the engine reads the timing and the effects from this table (engine/b3-vfx.js, engine/b3-play.js, engine/b3-stage.js, engine/b3-clips.js through msTiming and msEffects below). Phases 8 and 12 move the stage and the clips onto it,
// each under tools/movebench/golden_test.py.
const MS={by:Object.assign({},typeof MOVE_SPECS!=='undefined'?MOVE_SPECS:{}),n:typeof MOVE_SPECS!=='undefined'?Object.keys(MOVE_SPECS).length:0};
function msLive(id) { const s=MS.by[String(id)]; return s?s:null; }
function msSet(id,live) {
  id=String(id);
  if(live==null) { if(typeof MOVE_SPECS!=='undefined'&&MOVE_SPECS[id]) MS.by[id]=MOVE_SPECS[id]; else delete MS.by[id]; return msLive(id); }
  MS.by[id]=live; return live;
}
function msReset() { MS.by=Object.assign({},typeof MOVE_SPECS!=='undefined'?MOVE_SPECS:{}); return MS.n; }

// ---------- what a fight asks of a spec (movebench4) ----------
// The spec's id of the move a beat plays: 'move:<skill id>' for a family move, 'act:<monster id>:<act id>' for a monster's attack. null for a beat that is not a move.
function msIdOf(head) {
  try {
    if(!head||head.t!=='act'||!head.id) return null;
    if(head.src&&head.src[0]==='f') { const u=typeof b3Unit==='function'&&typeof B3!=='undefined'&&B3.F?b3Unit(B3.F,head.src):null; return u&&u.id?'act:'+u.id+':'+head.id:null; }
    return 'move:'+head.id;
  } catch(e) { return null; }
}
const MS_DEFAULTS={hitStop:0,shake:0,approach:'auto',approachSec:.55,returnSec:.5,gap:.35};
// The timing the game plays for a move (section b.2 `timing`): every field, the spec's own or the default. A move with no spec (or no timing) plays all defaults, so nothing here can wait on anything.
function msTiming(head) {
  const s=msLive(msIdOf(head)),t=(s&&s.timing)||{},num=(v,d,lo,hi)=>typeof v==='number'&&isFinite(v)?Math.max(lo,Math.min(hi,v)):d;
  return {contact:t.contact==null?'auto':t.contact,noHit:!!t.noHit,impactMs:typeof t.impactMs==='number'&&isFinite(t.impactMs)?t.impactMs:null,
    hitStop:Math.round(num(t.hitStop,MS_DEFAULTS.hitStop,0,12)),shake:num(t.shake,MS_DEFAULTS.shake,0,12),approach:t.approach==='stay'||t.approach==='run'?t.approach:'auto',
    approachSec:num(t.approachSec,MS_DEFAULTS.approachSec,.2,1.2),returnSec:num(t.returnSec,MS_DEFAULTS.returnSec,.2,1.2),gap:num(t.gap,MS_DEFAULTS.gap,.15,.8)};
}
// The effects a move plays, in the spec's order, with the ones switched off left out: [{fx, at, on, params, sfx}] (an `at` of 'contact', `on` of 'auto' when the spec says nothing). [] for no spec.
function msEffects(head) {
  const s=msLive(msIdOf(head)); if(!s||!Array.isArray(s.effects)) return [];
  return s.effects.filter(e=>e&&typeof e.fx==='string'&&!e.off).map(e=>({fx:e.fx,at:e.at==null?'contact':e.at,on:e.on||'auto',params:e.params&&typeof e.params==='object'?e.params:null,sfx:e.sfx||null}));
}

// ---------- the stage of a move (movebench8) ----------
// A move is staged when its spec has a `stage` section. msStageRow answers the row engine/b3-stage.js plays, built from the spec: {body:{clip,marks,hand}, budget, hit, late, steps, lasting, setpiece, assets}.
// `hit` is the mark or step id of timing.contact; a move with no hit of its own (timing.noHit) shows its results at that moment, which is hit 'late' with `late` naming it.
// The row is kept for as long as the spec object is the same one, so msSet (a draft in the preview) makes a new one. null for a move with no stage.
const MS_ROWS=new WeakMap();
function msStageRow(id) {
  const s=msLive(id); if(!s||!s.stage) return null;
  let R=MS_ROWS.get(s); if(R) return R;
  const b=s.body||{},t=s.timing||{},st=s.stage,c=t.contact,name=c&&typeof c==='object'?(c.mark||c.step||null):null;
  R={body:{clip:b.clip||null,marks:b.marks||{},hand:b.hand||null},budget:typeof t.budget==='number'?t.budget:3,steps:st.steps||null,lasting:st.lasting||null,setpiece:st.setpiece||null,assets:st.objects||{}};
  if(name) { if(t.noHit) { R.hit='late'; R.late=name; } else R.hit=name; }
  MS_ROWS.set(s,R); return R;
}
// The spec ids that have a stage, in the table's order.
function msStagedIds() { const out=[]; for(const id in MS.by) if(MS.by[id]&&MS.by[id].stage&&id.slice(0,5)==='move:') out.push(id); return out; }

// ---------- the answer of a move (movebench11) ----------
// A move that answers a hit (a ward, a counter) has `answer: {clip, effects}`: the counter video (null until it is made) and the library effects that play with it, timed from the answer's start (an `at` of 'contact'
// is the start). null when the spec has none or both are empty. engine/b3-stage.js plays it on the react or intercept beat of the move's status.
function msAnswer(id) {
  const s=msLive(id),a=s&&s.answer; if(!a||typeof a!=='object') return null;
  const clip=typeof a.clip==='string'&&a.clip?a.clip:null,E=(Array.isArray(a.effects)?a.effects:[]).filter(e=>e&&typeof e.fx==='string'&&!e.off).map(e=>({fx:e.fx,at:e.at==null?'contact':e.at,on:e.on||'auto',params:e.params&&typeof e.params==='object'?e.params:null,sfx:e.sfx||null}));
  return clip||E.length?{clip,effects:E}:null;
}
