'use strict';
// engine/emotions.js — mood faces and mood poses for story dialogue (emo7, Tom 2026-11-06).
// While a story talk line shows, its mood (data/emotion-moods.js, from docs/emotion-index-lines.tsv by tools/emotion-apply.py) swaps the
// dialogue portrait to that character's face in that mood (portraits/emo/<id>-<mood>.webp, tools/sprite-bake/bake_emotion_faces.py) and
// draws the speaker on the map in the full-body mood pose (STORY_POSES frame em_<mood>, tools/sprite-bake/bake_story_poses.py).
// Cast story scenes (S.talk) show it only in chapters in EMO_CHAPTERS. Every other dialogue box (map NPC talk, recruit and shop intro lines, cab lines, townsfolk lines in scenes)
// looks its line up in NPC_EMOTION_MOODS (data/npc-emotion-moods.js, from docs/npc-emotion-lines.tsv by tools/npc-emotion-apply.py; npcemo7). The NPC is drawn in its pose
// (data/npc-poses.js). Both clear when the line advances, on a line with no mood, and when the scene ends or is skipped.
const EMO={starting:false,actor:null,id:null,mood:null,listeners:[]};
const EMO_PORTRAIT_DEFAULT=()=>{ const box=$('dialog-portrait'); return box&&box.querySelector('img'); };
const emoPreloaded=new Set();
function emoOn() { return typeof EMO_CHAPTERS!=='undefined'&&typeof STORY!=='undefined'&&EMO_CHAPTERS.has(STORY.chapter); }
function emoMoodOf(name,text) {
  if(!emoOn()||typeof EMOTION_MOODS==='undefined') return null;
  return EMOTION_MOODS[name+'|'+text+'|'+STORY.chapter]||EMOTION_MOODS[name+'|'+text]||null;
}
function emoNpcMoodOf(name,text) {
  if(typeof NPC_EMOTION_MOODS==='undefined') return null;
  return NPC_EMOTION_MOODS[String(name||'').trim().toLowerCase()+'|'+text]||null;
}
function emoPreload(id) {
  if(emoPreloaded.has(id)) return; emoPreloaded.add(id);
  for(const m of EMOTIONS_LIST) new Image().src='portraits/emo/'+id+'-'+m+'.webp?v='+EMO_V;
}
const EMOTIONS_LIST=["happy","loving","sad","angry","scared","surprised","proud","unimpressed"],EMO_V='emowrong1';
function emoActorFor(id,name,npc) {
  const pm=typeof playerMember==='function'?playerMember():null;
  if(pm&&pm.id===id) return typeof roseRider==='function'&&roseRider()?null:player;   // Tom carrying Rose keeps the ride picture
  const f=followers.find(x=>x.member&&x.member.id===id); if(f) return f.seat||f.hidden?null:f;
  const low=String(name).toLowerCase();
  const n=npc&&npc.name&&npc.name.toLowerCase()===low&&!npc.monster?npc:(currentMap&&currentMap.npcs.find(x=>x.name&&x.name.toLowerCase()===low&&!x.monster));
  return n&&!n.hidden?n:null;
}
// Listener reactions (react2, docs/emotion-reactions.tsv -> data/emotion-reactions.js): while a scene line shows, every other visible cast member
// in the table for that line takes their full-body mood pose. Skipped: the speaker, anyone holding a story pose, Rose riding, hidden people.
// Hand-set beats that run in every chapter regardless of REACTION_CHAPTERS (Tom 2026-11-12: at the end of chapter 10 "Everybody laughs" must put everyone in the house in the laughing pose, `happy`).
const EMO_FORCED={
  'Sunday dinner|Everybody laughs. Boppy laughs so hard he has to hold his stomach. Deedee laughs last, and longest.|10':['tom','grace','rose','amy','justin','deedee','boppy','ellie'].map(i=>[i,'happy'])
};
function emoReactionsOf(name,text) {
  if(typeof STORY!=='undefined'&&EMO_FORCED[name+'|'+text+'|'+STORY.chapter]) return EMO_FORCED[name+'|'+text+'|'+STORY.chapter];
  if(typeof EMOTION_REACTIONS==='undefined'||typeof STORY==='undefined'||!REACTION_CHAPTERS.has(STORY.chapter)) return null;
  return EMOTION_REACTIONS[name+'|'+text+'|'+STORY.chapter]||null;
}
function emoActorById(id) {
  const pm=typeof playerMember==='function'?playerMember():null;
  if(pm&&pm.id===id) return typeof roseRider==='function'&&roseRider()?null:player;
  const f=followers.find(x=>x.member&&x.member.id===id); if(f) return f.seat||f.hidden?null:f;
  const n=currentMap&&currentMap.npcs.find(x=>!x.monster&&!x.hidden&&x.name&&String(DIALOG_PORTRAIT_IDS[x.name.toLowerCase()]||'').replace(/^npc_/,'')===id);
  return n||null;
}
// A mood pose is shown in full on the map whichever way the person faces (Tom 2026-11-12 23:38, emofull1: the close1 rule that showed it only
// when facing the camera is removed). Facing matters only when no mood is shown: then the normal front, back, left or right stance is drawn.
function emoClear() {
  if(EMO.actor&&EMO.actor.scenePose&&EMO.actor.scenePose.emo) EMO.actor.scenePose=null;
  for(const a of EMO.listeners) if(a.scenePose&&a.scenePose.emo) a.scenePose=null;
  EMO.listeners=[]; EMO.actor=null; EMO.mood=null; EMO.id=null;
}
function emoReact(speakerId,text) {
  const rs=emoReactionsOf(dialog.name,text); if(!rs) return;
  const nx=dialog.lines[dialog.index+1],ns=nx&&emoReactionsOf(dialog.name,nx);   // warm the next line's sheets
  for(const [lid] of (ns||[])) if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
  for(const [lid,mood] of rs) {
    if(lid===speakerId||typeof EMOTION_FACES==='undefined'||!EMOTION_FACES.includes(lid)) continue;
    if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
    const a=emoActorById(lid);
    if(a&&!a.scenePose&&typeof STORY_POSES!=='undefined'&&STORY_POSES[lid]&&STORY_POSES[lid]['em_'+mood]) { a.scenePose={f:'em_'+mood,mid:lid,emo:true}; EMO.listeners.push(a); }
  }
}
function emoApply() {
  if(!dialog.active) { if(EMO.mood||EMO.actor||EMO.listeners.length) emoClear(); return; }
  const text=dialog.lines[dialog.index];
  const mood=(dialog.emo&&emoMoodOf(dialog.name,text))||emoNpcMoodOf(dialog.name,text);
  const id=String(DIALOG_PORTRAIT_IDS[String(dialog.name||'').trim().toLowerCase()]||'').replace(/^npc_/,'');   // townspeople's keys are npc_<id>; their faces and poses are filed under <id>
  const had=EMO.mood; emoClear();
  if(dialog.emo) emoReact(id,text);
  if(!mood||!id||typeof EMOTION_FACES==='undefined'||!EMOTION_FACES.includes(id)) { if(had) setDialogPortrait(dialog.name); return; }
  emoPreload(id);
  const box=$('dialog-portrait'),img=box&&box.querySelector('img');
  if(img) { img.src='portraits/emo/'+id+'-'+mood+'.webp?v='+EMO_V; img.alt=''; box.hidden=false; $('dialog').classList.add('has-portrait'); fitDialogPortrait(); }
  EMO.mood=mood; EMO.id=id;
  const a=emoActorFor(id,dialog.name,dialog.npc);
  if(a&&!a.scenePose&&typeof STORY_POSES!=='undefined'&&STORY_POSES[id]&&STORY_POSES[id]['em_'+mood]) {
    if(typeof storyPosesLoad==='function') storyPosesLoad(id);
    a.scenePose={f:'em_'+mood,mid:id,emo:true}; EMO.actor=a;
  }
}
// A story talk step marks its dialogue as a scene dialogue.
const LE_talk_emo=S.talk;
S.talk=function(name,lines,voice) {
  const st=LE_talk_emo(name,lines,voice),start=st.start;
  st.start=function() { EMO.starting=true; try { return start.call(this); } finally { EMO.starting=false; } };
  return st;
};
const LE_openDialog_emo=openDialog;
openDialog=function(name,lines,npc) { dialog.emo=EMO.starting; return LE_openDialog_emo(name,lines,npc); };
const LE_loadDialogLine_emo=loadDialogLine;
loadDialogLine=function() { LE_loadDialogLine_emo(); emoApply(); };
const LE_advanceDialog_emo=advanceDialog;
advanceDialog=function() { LE_advanceDialog_emo(); if(!dialog.active&&(EMO.mood||EMO.actor||EMO.listeners.length)) emoClear(); };
setInterval(()=>{ if(!dialog.active&&(EMO.mood||EMO.actor||EMO.listeners.length)) emoClear(); },100);   // a skipped or interrupted scene must leave no pose behind
const LE_endIntro_emo=endIntro;
endIntro=function() { emoClear(); return LE_endIntro_emo(); };
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{EMO,emoMoodOf}); });
