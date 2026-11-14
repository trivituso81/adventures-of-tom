'use strict';
// engine/emotions.js — mood faces and mood poses for story dialogue (emo7, Tom 2026-11-06).
// While a story talk line shows, its mood (data/emotion-moods.js, from docs/emotion-index-lines.tsv by tools/emotion-apply.py) swaps the
// dialogue portrait to that character's face in that mood (portraits/emo/<id>-<mood>.webp, tools/sprite-bake/bake_emotion_faces.py) and
// draws the speaker on the map in the full-body mood pose (STORY_POSES frame em_<mood>, tools/sprite-bake/bake_story_poses.py).
// Cast story scenes (S.talk) show it only in chapters in EMO_CHAPTERS. Every other dialogue box (map NPC talk, recruit and shop intro lines, cab lines, townsfolk lines in scenes)
// looks its line up in NPC_EMOTION_MOODS (data/npc-emotion-moods.js, from docs/npc-emotion-lines.tsv by tools/npc-emotion-apply.py; npcemo7). The NPC is drawn in its pose
// (data/npc-poses.js). Both clear when the line advances, on a line with no mood, and when the scene ends or is skipped.
const EMO={starting:false,spk:null,actor:null,id:null,mood:null,talk:null,listeners:[],pending:[],cueW:null,cueLine:-1};
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
const EMOTIONS_LIST=["happy","loving","sad","angry","scared","surprised","proud","unimpressed"],EMO_V='chinfix1';
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
  EMO.listeners=[]; EMO.spk=null; EMO.actor=null; EMO.mood=null; EMO.talk=null; EMO.id=null; EMO.pending=[]; EMO.cueW=null; EMO.cueLine=-1;
}
// Reaction timing (reacttime1, Tom 2026-11-13: a listener reacts when the line reaches the words that cause it, not when the line starts).
// A reaction may carry a third value: the character position in the line where its cue words end (the `at` column of docs/emotion-reactions.tsv,
// turned into a position by tools/reaction-apply.py). No third value = react as the line starts. How far the line has got:
// - a spoken clip is playing: the clip's own clock, spread over the text by emoCueWeights (letters take time, commas and sentence ends take longer);
// - no clip, or sound off, or fast-forward: the typewriter (dialog.shown); a tap that shows the whole page fires what is left.
// A cue near the end of a clip fires at least EMO_CUE_TAIL seconds before the clip ends so the pose is seen.
const EMO_CUE_TAIL=.35;
function emoCueWeights(chars) {
  const w=[0]; let t=0;
  for(let i=0;i<chars.length;i++) {
    const c=chars[i],n=chars[i+1];
    t+=1;
    if(c===','||c===';'||c===':') t+=3;
    else if(/[.!?\u2026]/.test(c)&&!(n&&/[.!?\u2026]/.test(n))) t+=7;   // one pause per run of dots
    w.push(t);
  }
  return w;
}
function emoCueReached() {
  const n=dialog.chars?dialog.chars.length:0;
  if(typeof DV!=='undefined'&&DV.page===dialog.index&&DV.playing) {
    if(DV.t0==null||!DV.dur) return 0;                                   // the clip is still being decoded
    const c=audio(); if(!c) return dialog.shown;
    const w=EMO.cueW||(EMO.cueW=emoCueWeights(dialog.chars)),total=w[n]||1;
    const el=c.currentTime-DV.t0,tail=Math.max(0,DV.dur-EMO_CUE_TAIL);
    if(el>=tail) return n;
    const heard=el/DV.dur*total; let i=0; while(i<n&&w[i+1]<=heard) i++;
    return i;
  }
  if(typeof DV!=='undefined'&&DV.page===dialog.index&&DV.t0!=null) return n;   // the clip has finished
  return dialog.shown;
}
function emoPose(lid,mood) {
  const a=emoActorById(lid);
  if(a&&!a.scenePose&&typeof STORY_POSES!=='undefined'&&STORY_POSES[lid]&&STORY_POSES[lid]['em_'+mood]) { a.scenePose={f:'em_'+mood,mid:lid,emo:true}; EMO.listeners.push(a); }
}
function emoCueTick() {
  if(!EMO.pending.length) return;
  if(!dialog.active||dialog.index!==EMO.cueLine) { EMO.pending=[]; return; }
  const at=emoCueReached(),keep=[];
  for(const p of EMO.pending) { if(at>=p[2]) emoPose(p[0],p[1]); else keep.push(p); }
  EMO.pending=keep;
}
setInterval(()=>{ try { emoCueTick(); } catch(e) {} },50);
function emoReact(speakerId,text) {
  const rs=emoReactionsOf(dialog.name,text); if(!rs) return;
  const nx=dialog.lines[dialog.index+1],ns=nx&&emoReactionsOf(dialog.name,nx);   // warm the next line's sheets
  for(const [lid] of (ns||[])) if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
  EMO.cueLine=dialog.index;
  for(const [lid,mood,at] of rs) {
    if(lid===speakerId||typeof EMOTION_FACES==='undefined'||!EMOTION_FACES.includes(lid)) continue;
    if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
    if(at>0) EMO.pending.push([lid,mood,at]); else emoPose(lid,mood);
  }
}
// Talking poses (talk1, Tom 2026-11-13, docs/TALK_POSES.md): four full-body poses per person (Art Library <id>-talk, tools/sprite-bake/talk_frames.py, frames tk_<type>
// in STORY_POSES) for lines with no strong feeling: tell (explaining), point (pointing out or directing people), ask (questions), answer (short replies).
// Which lines: TALK_TYPES (data/talk-types.js, from docs/talk-lines.tsv by tools/talk-apply.py) lists every plain cast line and the borderline mood lines that
// read better as plain talk; it wins over the mood. A line with no entry and no mood gets talkRule (the same rule as tools/talk-index.py).
// A person with no baked talking sheet keeps exactly the old behaviour (mood pose, or the plain stance), so nothing changes until a sheet is installed.
// The dialogue face stays the plain talk face (portraits/talk) on a talk line.
const TALK_LIST=['tell','point','ask','answer'];
const TALK_ORDER=/^(look|over there|up there|down there|this way|that way|come on|let's|follow|stay|go |go,|grab|hurry|up,|up!|up\.|everybody|everyone|nobody|over here|back to one|hold |get |in there|out there|put |give |take |be |don't |do not |no touching|hands |phone down|quiet|keep |watch |use |bring |move|walk |sit|stand|cut\.|copy|halt|eat|wait here|then nobody|then we|here's the plan|rose\. |grace\. |girls\. )|\b(look[,:.!]|look at|over there|up there|down there|in there|this way|that way|over here|right there|on the left|on the right|follow me|stay close|stay behind|let's go|come on|no touching|behind me|with me\.|everybody to|hands to yourselves|nobody touches|nobody goes)\b/;
function talkRule(text) {
  const s=String(text||'').trim().replace(/\u2019/g,"'"),low=s.toLowerCase(),words=(s.match(/[A-Za-z']+/g)||[]).length;
  if(s.includes('?')) return 'ask';
  if(TALK_ORDER.test(low)) return 'point';
  if(words<=5||(words<=9&&/^(okay|ok|yeah|yep|nope|no|yes|fine|sure|right|got it|mm|hm|uh|well)\b/.test(low))) return 'answer';
  return 'tell';
}
function talkTypeOf(name,text,mood) {
  if(typeof TALK_TYPES!=='undefined') { const k=name+'|'+text,ch=typeof STORY!=='undefined'?STORY.chapter:0,t=TALK_TYPES[k+'|'+ch]||TALK_TYPES[k]; if(t) return t; }
  return mood?null:talkRule(text);
}
function talkFrameOf(id,type) { return type&&typeof STORY_POSES!=='undefined'&&STORY_POSES[id]&&STORY_POSES[id]['tk_'+type]?'tk_'+type:null; }
function emoApply() {
  if(!dialog.active) { if(EMO.mood||EMO.actor||EMO.listeners.length) emoClear(); return; }
  const text=dialog.lines[dialog.index];
  const mood=(dialog.emo&&emoMoodOf(dialog.name,text))||emoNpcMoodOf(dialog.name,text);
  const id=String(DIALOG_PORTRAIT_IDS[String(dialog.name||'').trim().toLowerCase()]||'').replace(/^npc_/,'');   // townspeople's keys are npc_<id>; their faces and poses are filed under <id>
  const had=EMO.mood; emoClear();
  EMO.spk=id?emoActorFor(id,dialog.name,dialog.npc):null;   // the person speaking this line: listeners in a mood pose turn toward them (facing1, poseFacingWant in engine/story.js)
  if(dialog.emo) emoReact(id,text);
  const tk=id&&typeof EMOTION_FACES!=='undefined'&&EMOTION_FACES.includes(id)?talkFrameOf(id,talkTypeOf(String(dialog.name||'').trim(),text,mood)):null;
  if(tk) {   // a plain line (or a borderline mood line) of a person whose talking sheet is baked: talk pose, plain face
    if(had) setDialogPortrait(dialog.name);
    EMO.talk=tk; EMO.id=id;
    const a=emoActorFor(id,dialog.name,dialog.npc);
    if(a&&!a.scenePose) { if(typeof storyPosesLoad==='function') storyPosesLoad(id); a.scenePose={f:tk,mid:id,emo:true}; EMO.actor=a; }
    return;
  }
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
setInterval(()=>{ if(!dialog.active&&(EMO.mood||EMO.actor||EMO.listeners.length||EMO.pending.length)) emoClear(); },100);   // a skipped or interrupted scene must leave no pose behind
const LE_endIntro_emo=endIntro;
endIntro=function() { emoClear(); return LE_endIntro_emo(); };
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{EMO,emoMoodOf,emoCueReached,emoCueWeights}); });
