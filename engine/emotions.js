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
const TALKPOSE_V='tpface1';
const EMOTIONS_LIST=["happy","loving","sad","angry","scared","surprised","proud","unimpressed"],EMO_V='reports-2026-11-19c';
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
function emoPose(lid,mood,fx,isSpk) {
  const a=emoActorById(lid);
  if(!a) return;
  if(isSpk) { if(typeof STORY_POSES!=='undefined'&&STORY_POSES[lid]&&STORY_POSES[lid]['em_'+mood]) { a.scenePose={f:'em_'+mood,mid:lid,emo:true}; EMO.actor=a; } emoFx(a,fx); return; }   // cutpolish5: a row that names the speaker changes the speaker's own pose on a cue word
  if(!a.scenePose&&typeof STORY_POSES!=='undefined'&&STORY_POSES[lid]&&STORY_POSES[lid]['em_'+mood]) { a.scenePose={f:'em_'+mood,mid:lid,emo:true}; EMO.listeners.push(a); }
  emoFx(a,fx);
}
function emoCueTick() {
  if(!EMO.pending.length) return;
  if(!dialog.active||dialog.index!==EMO.cueLine) { EMO.pending=[]; return; }
  const at=emoCueReached(),keep=[];
  for(const p of EMO.pending) { if(at>=p[2]) emoPose(p[0],p[1],p[3],p[4]); else keep.push(p); }
  EMO.pending=keep;
}
setInterval(()=>{ try { emoCueTick(); } catch(e) {} },50);
function emoReact(speakerId,text) {
  const rs=emoReactionsOf(dialog.name,text); if(!rs) return;
  const nx=dialog.lines[dialog.index+1],ns=nx&&emoReactionsOf(dialog.name,nx);   // warm the next line's sheets
  for(const [lid] of (ns||[])) if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
  EMO.cueLine=dialog.index;
  for(const [lid,mood,at,fx] of rs) {
    const isSpk=lid===speakerId;
    if((isSpk&&!at)||typeof EMOTION_FACES==='undefined'||!EMOTION_FACES.includes(lid)) continue;   // the speaker may only be named with a cue (at)
    if(typeof storyPosesLoad==='function') storyPosesLoad(lid);
    if(at>0) EMO.pending.push([lid,mood,at,fx,isSpk]); else emoPose(lid,mood,fx,isSpk);
  }
}
// Talking poses (talk1, Tom 2026-11-13, docs/TALK_POSES.md): four full-body poses per person (Art Library <id>-talk, tools/sprite-bake/talk_frames.py, frames tk_<type>
// in STORY_POSES) for lines with no strong feeling: tell (explaining), point (pointing out or directing people), ask (questions), answer (short replies).
// Which lines: TALK_TYPES (data/talk-types.js, from docs/talk-lines.tsv by tools/talk-apply.py) lists every plain cast line and the borderline mood lines that
// read better as plain talk; it wins over the mood. A line with no entry and no mood gets talkRule (the same rule as tools/talk-index.py).
// A person with no baked talking sheet keeps exactly the old behaviour (mood pose, or the plain stance), so nothing changes until a sheet is installed.
// The dialogue face on a talk line is cropped from that talking pose (portraits/talk/pose, tools/sprite-bake/bake_talkpose_faces.py); a person without one keeps the plain talk face.
const TALK_LIST=['tell','point','ask','answer','think'];
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
  const had=EMO.mood; emoHoldClear(); emoClear();
  EMO.spk=id?emoActorFor(id,dialog.name,dialog.npc):null;
  if(EMO.spk&&dialog.emo&&lifeOn(EMO.spk)) { EMO.spk._sqT=lifeNow(); emoTurnListeners(EMO.spk); }   // cutpolish5: squash as the line starts, listeners turn
  // the person speaking this line: listeners in a mood pose turn toward them (facing1, poseFacingWant in engine/story.js)
  if(dialog.emo) emoReact(id,text);
  else if(EMO.spk&&dialog.name==='Boppy'&&/Gently\. The stomach\./.test(text)) emoFx(EMO.spk,'wince');   // cutpolish5: Boppy's wince, a code stand-in (squash and a sweat drop) until a painted stomach pose is approved; this line is a press-A chat, not a scene step
  const lp=id&&typeof LINE_POSES!=='undefined'&&LINE_POSES[String(dialog.name||'').trim()+'|'+text];   // c-reports: one line, one painted pose and its own face (data/line-poses.js)
  if(lp&&typeof STORY_POSES!=='undefined'&&STORY_POSES[lp.id]&&STORY_POSES[lp.id][lp.f]) {
    const box=$('dialog-portrait'),img=box&&box.querySelector('img');
    if(img) { img.src='portraits/talk/pose/'+lp.id+'-'+lp.face+'.webp?v='+TALKPOSE_V; img.alt=''; box.hidden=false; $('dialog').classList.add('has-portrait'); fitDialogPortrait(); EMO.mood=lp.f; }
    EMO.talk=lp.f; EMO.id=id;
    const a=emoActorFor(id,dialog.name,dialog.npc);
    if(a&&!a.scenePose) { if(typeof storyPosesLoad==='function') storyPosesLoad(lp.id); a.scenePose={f:lp.f,mid:lp.id,emo:true}; EMO.actor=a; }
    return;
  }
  const tk=id&&typeof EMOTION_FACES!=='undefined'&&EMOTION_FACES.includes(id)?talkFrameOf(id,talkTypeOf(String(dialog.name||'').trim(),text,mood)):null;
  if(tk) {   // a plain line (or a borderline mood line) of a person whose talking sheet is baked: talk pose, and the dialogue face cropped from that same pose
    // (Tom 2026-11-14, r-20261114-100449-r0ib: "Talking frames should also always update the portrait image in the dialog box", cropped like the mood faces)
    const tface=typeof TALKPOSE_FACES!=='undefined'&&TALKPOSE_FACES.includes(id);
    if(tface) {
      const box=$('dialog-portrait'),img=box&&box.querySelector('img');
      if(img) { img.src='portraits/talk/pose/'+id+'-'+tk.slice(3)+'.webp?v='+TALKPOSE_V; img.alt=''; box.hidden=false; $('dialog').classList.add('has-portrait'); fitDialogPortrait(); EMO.mood=tk; }
    } else if(had) setDialogPortrait(dialog.name);
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
// Pose hold (cutpolish1): inside a scene the speaker keeps the mood or talking pose for up to 0.6 s of scene time after the box closes, so a person does not drop
// to a plain stand between two lines. It ends when the next box opens, when a step moves or re-poses that person, at a fight, on SKIP and at scene end.
const EMO_HOLD_SEC=.6;
let emoHold=null;   // {a,P,t}
function emoHoldClear() { if(emoHold) { if(emoHold.a.scenePose===emoHold.P) emoHold.a.scenePose=null; emoHold=null; } }
const LE_advanceDialog_emo=advanceDialog;
advanceDialog=function() {
  LE_advanceDialog_emo();
  if(dialog.active||!(EMO.mood||EMO.actor||EMO.listeners.length)) return;
  const a=EMO.actor,P=a&&a.scenePose&&a.scenePose.emo?a.scenePose:null;
  emoClear();
  if(P&&intro.active&&intro.phase==='scene'&&!battle.active&&!(typeof cut!=='undefined'&&(cut.skip||cut.ff))) { a.scenePose=P; emoHold={a,P,t:0}; }
};
setInterval(()=>{ if(!dialog.active&&(EMO.mood||EMO.actor||EMO.listeners.length||EMO.pending.length)) emoClear(); },100);   // a skipped or interrupted scene must leave no pose behind
const LE_endIntro_emo=endIntro;
endIntro=function() { emoClear(); emoHoldClear(); return LE_endIntro_emo(); };
const LE_updateIntro_emo=updateIntro;
updateIntro=function(dt) {
  const r=LE_updateIntro_emo(dt);
  if(emoHold) {
    const h=emoHold;
    if(dialog.active||battle.active||!intro.active||h.a.scenePose!==h.P||h.a.move||h.a.scr) { if(h.a.scenePose===h.P&&!dialog.active) h.a.scenePose=null; emoHold=null; }   // a step moved or re-posed them
    else if((h.t+=dt)>=EMO_HOLD_SEC) emoHoldClear();
  }
  return r;
};
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{EMO,emoMoodOf,emoCueReached,emoCueWeights}); });

// Life in a scene (cutpolish5, plan claude/cutscene-polish-plan.md phase 5). Only while a scene runs, only for people (never monsters, riders, knocked-down or
// amber figures), and off during SKIP. actorLife(a,posKey) gives drawSheetActor a scale (breathing: 1.75 percent taller and back over 3.2 s, each person offset;
// a 120 ms squash and settle 0.94, 1.04, 1.0 when the pose changes or a line starts; a 'wince' fx holds 0.95), a lift in pixels (an 8 px hop; a 1 px bob on the
// typing tick while that person's line types) and the pip to float over the head. The scale is uniform about the feet (the sprite drawer has no stretch).
const LIFE_BREATH=.0175, LIFE_PERIOD=3.2, LIFE_SQ=.12, LIFE_HOP_PX=8, LIFE_HOP_SEC=.3, LIFE_PIP_SEC=1.3, LIFE_WINCE_SEC=2.6;
function lifeOff(a) { const s=String((a.member&&a.member.id)||a.name||(a.isPlayer?'tom':'x')); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))%997; return h/997*LIFE_PERIOD; }
function lifeNow() { return (typeof performance!=='undefined'?performance.now():Date.now())/1000; }
function lifeOn(a) { return !!(a&&!a.monster&&!a.seat&&!a.amber&&typeof intro!=='undefined'&&(intro.active||(a._fx&&a._fx.kind==='wince'))&&!(typeof battle!=='undefined'&&battle.active)&&!(typeof cut!=='undefined'&&(cut.skip||cut.ff))); }
function emoFx(a,kind) { if(a&&kind) a._fx={kind,t0:lifeNow()}; }
function actorLife(a,posKey) {
  if(!lifeOn(a)) { if(a) a._fx=null; return null; }
  const now=lifeNow();
  if(a._lifeKey!==posKey) { if(a._lifeKey!==undefined) a._sqT=now; a._lifeKey=posKey; }
  let s=1+LIFE_BREATH*(.5-.5*Math.cos(2*Math.PI*(now+lifeOff(a))/LIFE_PERIOD)),lift=0,pip=null,pt=0;
  if(a._sqT!==undefined) { const e=(now-a._sqT)/LIFE_SQ;
    if(e<1) s*=e<.33?1-.06*(e/.33):(e<.66?.94+.10*((e-.33)/.33):1.04-.04*((e-.66)/.34)); else a._sqT=undefined; }
  if(EMO.spk===a&&dialog.active&&dialog.chars&&dialog.shown<dialog.chars.length) lift+=Math.floor(dialog.shown)%2;
  const f=a._fx;
  if(f) { const e=now-f.t0;
    if(f.kind==='hop') { if(e<LIFE_HOP_SEC) lift+=LIFE_HOP_PX*Math.sin(Math.PI*e/LIFE_HOP_SEC); else a._fx=null; }
    else if(f.kind==='wince') { if(e<LIFE_WINCE_SEC) { s*=.95; pip='sweat'; pt=e; } else a._fx=null; }
    else if(e<LIFE_PIP_SEC) { pip=f.kind; pt=e; if(f.kind==='!'&&e<LIFE_HOP_SEC) lift+=LIFE_HOP_PX*Math.sin(Math.PI*e/LIFE_HOP_SEC); }
    else a._fx=null; }
  return {s,lift,pip,pt};
}
// The pip floats over the head: '!', '?', '...' are small painted-style bubble text, 'sweat' is a drop (code stand-ins until the Art Library pips are approved).
function drawLifePip(pip,pt,cx,top,k) {
  const y=Math.round(top-6*k-Math.min(10,pt*14)),x=Math.round(cx+8*k);
  if(pip==='sweat') { ellipse(x,y+3,2,3,'#7fc4e8'); rect(x-1,y-3,2,3,'#7fc4e8'); ellipse(x-1,y+2,1,1,'#e8f6ff'); return; }
  if(typeof BUBBLE!=='undefined'&&BUBBLE.text) BUBBLE.text(pip,x,y,pip==='!'?'#c43c2a':'#4a5a7a',1.6);
}
// Listeners turn toward the speaker 80 to 180 ms after a line opens (plan phase 5), unless a step set their facing, they hold a pose or they are walking.
function emoTurnListeners(spk) {
  if(!lifeOn(spk)||!spk) return;
  const sp=position(spk),line=dialog.index,all=[player].concat(followers,(currentMap&&currentMap.npcs)||[]);
  for(const a of all) {
    if(!a||a===spk||a.monster||a.seat||a.hidden||a.scenePose||a.stageFaced||a.move||a.amber) continue;
    const t=80+Math.random()*100;
    setTimeout(()=>{ try {
      if(!dialog.active||dialog.index!==line||EMO.spk!==spk||a.scenePose||a.stageFaced||a.move||!lifeOn(a)) return;
      const p=position(a),dx=sp.x-p.x,dy=sp.y-p.y;
      a.facing=Math.abs(dx)>=Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
    } catch(e) {} },t);
  }
}
