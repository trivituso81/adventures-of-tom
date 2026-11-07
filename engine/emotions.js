'use strict';
// engine/emotions.js — mood faces and mood poses for story dialogue (emo7, Tom 2026-11-06).
// While a story talk line shows, its mood (data/emotion-moods.js, from docs/emotion-index-lines.tsv by tools/emotion-apply.py) swaps the
// dialogue portrait to that character's face in that mood (portraits/emo/<id>-<mood>.webp, tools/sprite-bake/bake_emotion_faces.py) and
// draws the speaker on the map in the full-body mood pose (STORY_POSES frame em_<mood>, tools/sprite-bake/bake_story_poses.py).
// Only story scenes (S.talk) and only chapters in EMO_CHAPTERS. Both clear when the line advances, on a line with no mood, and when the scene ends or is skipped.
const EMO={starting:false,actor:null,id:null,mood:null};
const EMO_PORTRAIT_DEFAULT=()=>{ const box=$('dialog-portrait'); return box&&box.querySelector('img'); };
const emoPreloaded=new Set();
function emoOn() { return typeof EMO_CHAPTERS!=='undefined'&&typeof STORY!=='undefined'&&EMO_CHAPTERS.has(STORY.chapter); }
function emoMoodOf(name,text) {
  if(!emoOn()||typeof EMOTION_MOODS==='undefined') return null;
  return EMOTION_MOODS[name+'|'+text+'|'+STORY.chapter]||EMOTION_MOODS[name+'|'+text]||null;
}
function emoPreload(id) {
  if(emoPreloaded.has(id)) return; emoPreloaded.add(id);
  for(const m of EMOTIONS_LIST) new Image().src='portraits/emo/'+id+'-'+m+'.webp?v='+EMO_V;
}
const EMOTIONS_LIST=["happy","loving","sad","angry","scared","surprised","proud","unimpressed"],EMO_V='tomemo2';
function emoActorFor(id,name) {
  const pm=typeof playerMember==='function'?playerMember():null;
  if(pm&&pm.id===id) return typeof roseRider==='function'&&roseRider()?null:player;   // Tom carrying Rose keeps the ride picture
  const f=followers.find(x=>x.member&&x.member.id===id); if(f) return f.seat||f.hidden?null:f;
  const low=String(name).toLowerCase();
  const n=currentMap&&currentMap.npcs.find(x=>x.name&&x.name.toLowerCase()===low&&!x.monster);
  return n&&!n.hidden?n:null;
}
function emoClear() {
  if(EMO.actor&&EMO.actor.scenePose&&EMO.actor.scenePose.emo) EMO.actor.scenePose=null;
  EMO.actor=null; EMO.mood=null; EMO.id=null;
}
function emoApply() {
  if(!dialog.active||!dialog.emo) { if(EMO.mood||EMO.actor) { emoClear(); if(dialog.active) setDialogPortrait(dialog.name); } return; }
  const mood=emoMoodOf(dialog.name,dialog.lines[dialog.index]);
  const id=DIALOG_PORTRAIT_IDS[String(dialog.name||'').trim().toLowerCase()];
  const had=EMO.mood; emoClear();
  if(!mood||!id||typeof EMOTION_FACES==='undefined'||!EMOTION_FACES.includes(id)) { if(had) setDialogPortrait(dialog.name); return; }
  emoPreload(id);
  const box=$('dialog-portrait'),img=box&&box.querySelector('img');
  if(img) { img.src='portraits/emo/'+id+'-'+mood+'.webp?v='+EMO_V; img.alt=''; box.hidden=false; $('dialog').classList.add('has-portrait'); fitDialogPortrait(); }
  EMO.mood=mood; EMO.id=id;
  const a=emoActorFor(id,dialog.name);
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
advanceDialog=function() { LE_advanceDialog_emo(); if(!dialog.active&&(EMO.mood||EMO.actor)) emoClear(); };
setInterval(()=>{ if(!dialog.active&&(EMO.mood||EMO.actor)) emoClear(); },100);   // a skipped or interrupted scene must leave no pose behind
const LE_endIntro_emo=endIntro;
endIntro=function() { emoClear(); return LE_endIntro_emo(); };
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{EMO,emoMoodOf}); });
