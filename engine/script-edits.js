'use strict';
// engine/script-edits.js: the Script Editor overlay (script.html, docs/SCRIPT_EDITOR.md).
// Tom's line edits live in two places and are applied to a scene's step list just before it plays; the scene source files are never touched here:
//   data/script-edits.json   edits Tom has sent that a Claude session has not folded into the source yet (tools/script-index/apply.py empties it)
//   localStorage aot-script-draft   this phone's unsent edits (a scene saved here replaces the sent copy of that scene)
// Scene edit shape (one per scene id):
//   lines: { '<Speaker>|<exact original text>' (a second identical line in a scene ends '#2'): { to, who, rm, pre, post, mood, talk, react:[[listener,mood,cue words]] } }
//   ins:   [ { uid, who, text, mood, talk, pre, post, react } ]    added lines; who null + beat:<seconds> is a silent beat
//   order: [ref or uid, ...]   the order Tom wants for the lines he can see (refs of original lines and uids of added ones)
// A line is found by speaker and exact text, never by position, so a scene that branches on game state (bag, flags) still takes the edits that
// fit the branch that plays. A line that is not in the scene any more is skipped and counted in SE.misses.
// Play (script.html > PLAY): localStorage aot-script-play {id,recipe} starts the real scene in the real game with the edits applied (sePlayBoot).
const SE={sent:{},draft:{},orig:{},misses:[],edited:new Set(),ready:null,play:false};
const SE_DRAFT='aot-script-draft',SE_PLAYKEY='aot-script-play';
function seLoadDraft() { try { SE.draft=(JSON.parse(localStorage.getItem(SE_DRAFT)||'{}')||{}).scenes||{}; } catch(e) { SE.draft={}; } }
function seStateOf(id) { return SE.draft[id]||SE.sent[id]||null; }
function seHas(st) { return !!st&&((st.lines&&Object.keys(st.lines).length)||(st.ins&&st.ins.length)||(st.order&&st.order.length)); }

// ---------- apply to one scene's steps ----------
function seCueEnd(text,cue) { if(!cue) return 0; const i=text.indexOf(cue); return i<0?0:i+cue.length; }
// seApply(id,steps,state,opts): state defaults to this scene's stored edits. opts.show (script.html only): keep removed lines (flagged rm), one step per line,
// refs on every step, no pause steps: the editor draws what this returns, so the page and the game cannot disagree about what an edit does.
function seApply(id,steps,state,opts) {
  const st=state||seStateOf(id); const SHOW=!!(opts&&opts.show); if(!Array.isArray(steps)||(!SHOW&&!seHas(st))) return steps;
  const lines=(st&&st.lines)||{},ins=((st&&st.ins)||[]).map(x=>Object.assign({},x)),order=(st&&st.order)||[];
  const ch=typeof STORY!=='undefined'?STORY.chapter:0;
  const seen={},units={},arrays=[];
  const mk=(who,text,voice,ref)=>({who,text,voice,ref,pre:0,post:0});
  // 1. split every talk step into one unit per page, give each its ref, keep the other steps as they are
  const explode=arr=>{
    const els=[],info={arr,els};
    for(const o of arr) {
      if(o&&typeof o==='object'&&'talk' in o) {
        const ls=Array.isArray(o.lines)?o.lines:[o.lines];
        ls.forEach((t,j)=>{ const base=o.talk+'|'+t; seen[base]=(seen[base]||0)+1; const ref=seen[base]===1?base:base+'#'+seen[base];
          const u=mk(o.talk,t,o.voice&&o.voice[j]||null,ref); u.g=o; els.push({u}); units[ref]={u,info}; });
      } else {
        const sub={};
        for(const k of ['all','seq','then','else']) if(o&&Array.isArray(o[k])) sub[k]=explode(o[k]);
        els.push({s:o,sub:Object.keys(sub).length?sub:null});
      }
    }
    arrays.push(info); return info;
  };
  const top=explode(steps);
  // 2. per-line changes
  const orig={};
  for(const ref of Object.keys(units)) {
    const e=lines[ref]; if(!e) continue; const U=units[ref].u; orig[ref]={who:U.who,text:U.text};
    if(e.rm) { U.rm=true; continue; }
    if(e.who&&e.who!==U.who) { U.who=e.who; U.voice=null; }
    if(typeof e.to==='string'&&e.to!==U.text) { U.text=e.to; U.voice=null; }
    U.pre=+e.pre||0; U.post=+e.post||0; U.meta=e;
  }
  // 3. order and inserts, array by array
  const insByUid={}; for(const x of ins) insByUid[x.uid]=x;
  const owner={};   // uid -> info of the array that holds the line before it in `order`
  let prevInfo=top;
  for(const r of order) { if(units[r]) prevInfo=units[r].info; else if(insByUid[r]) owner[r]=prevInfo; }
  for(const x of ins) if(!owner[x.uid]) owner[x.uid]=top;
  for(const info of arrays) {
    const here=info.els.filter(e=>e.u&&!e.u.rm&&order.includes(e.u.ref));
    const slotIdx=info.els.map((e,i)=>e.u&&!e.u.rm&&order.includes(e.u.ref)?i:-1).filter(i=>i>=0);
    const want=order.filter(r=>units[r]&&units[r].info===info&&!units[r].u.rm).map(r=>units[r]);
    if(want.length===slotIdx.length) want.forEach((w,k)=>{ info.els[slotIdx[k]]={u:w.u}; });
    // inserts: right after the line before them in `order`
    for(const uid of order) {
      const x=insByUid[uid]; if(!x||owner[uid]!==info) continue;
      const k=order.indexOf(uid); let at=-1;
      for(let j=k-1;j>=0;j--) { const r=order[j]; const i=info.els.findIndex(e=>e.u&&(e.u.ref===r||e.u.uid===r)); if(i>=0) { at=i; break; } }
      const u=x.beat!=null&&!x.who?{beat:+x.beat||.6,uid:uid,pre:0,post:0}:{who:x.who,text:x.text,voice:null,ref:uid,uid,pre:+x.pre||0,post:+x.post||0,meta:x};
      const pv=at>=0&&info.els[at].u; if(pv&&pv.who&&u.who===pv.who&&!u.beat) u.g=pv.g||pv;   // an added line from the same person joins that step's box
      info.els.splice(at+1,0,{u});
    }
  }
  // inserts nobody could place (not in order): at the end of the top array
  for(const x of ins) if(!order.includes(x.uid)) top.els.push({u:x.beat!=null&&!x.who?{beat:+x.beat||.6,uid:x.uid,pre:0,post:0}:{who:x.who,text:x.text,voice:null,ref:x.uid,uid:x.uid,pre:+x.pre||0,post:+x.post||0,meta:x}});
  // 4. register mood, talking pose and listener reactions for changed lines, and rebuild the arrays
  const seenRef=new Set();
  for(const ref of Object.keys(lines)) if(!units[ref]&&!insByUid[ref]) SE.misses.push(id+': '+ref);
  const reg=(U)=>{
    if(SHOW||typeof EMO_FORCED==='undefined'||!U.who||!U.text) return;
    const e=U.meta||{},o=orig[U.ref]||null,key=U.who+'|'+U.text+'|'+ch;
    if(o&&(o.text!==U.text||o.who!==U.who)) {   // reworded or re-spoken: carry the old line's mood, pose and reactions over
      const m=typeof EMOTION_MOODS!=='undefined'&&(EMOTION_MOODS[o.who+'|'+o.text+'|'+ch]||EMOTION_MOODS[o.who+'|'+o.text]);
      if(m&&!e.mood) EMOTION_MOODS[key]=m;
      const t=typeof TALK_TYPES!=='undefined'&&(TALK_TYPES[o.who+'|'+o.text+'|'+ch]||TALK_TYPES[o.who+'|'+o.text]);
      if(t&&!e.talk) TALK_TYPES[key]=t;
      const r=typeof EMOTION_REACTIONS!=='undefined'&&EMOTION_REACTIONS[o.who+'|'+o.text+'|'+ch];
      if(r&&!e.react) EMO_FORCED[key]=r.map(x=>[x[0],x[1],0]);
    }
    if(e.mood&&typeof EMOTION_MOODS!=='undefined') EMOTION_MOODS[key]=e.mood;
    if(e.talk&&typeof TALK_TYPES!=='undefined') TALK_TYPES[key]=e.talk;
    if(e.react) EMO_FORCED[key]=e.react.map(x=>[String(x[0]).toLowerCase().replace(/[^a-z0-9]/g,''),x[1],seCueEnd(U.text,x[2])]);
    if((o&&(o.text!==U.text||o.who!==U.who))||U.uid) SE.edited.add(U.who+'|'+U.text);
  };
  const build=info=>{
    const out=[]; let run=null;
    const flush=()=>{ if(run) { const o={talk:run.who,lines:run.lines}; if(run.voice.some(Boolean)) o.voice=run.voice; out.push(o); run=null; } };
    for(const e of info.els) {
      if(e.u) {
        const U=e.u;
        if(SHOW) { if(U.beat!=null) out.push({wait:U.beat,beat:U.uid}); else out.push({talk:U.who,lines:[U.text],refs:[U.ref],rm:!!U.rm,voice:U.voice?[U.voice]:undefined,ins:!!U.uid}); continue; }
        if(U.rm) continue;
        if(U.beat!=null) { flush(); out.push({wait:U.beat}); continue; }
        reg(U);
        if(U.pre>0) { flush(); out.push({wait:U.pre}); }
        if(run&&run.who===U.who&&run.g===(U.g||U)&&!(U.pre>0)) { run.lines.push(U.text); run.voice.push(U.voice); }
        else { flush(); run={who:U.who,lines:[U.text],voice:[U.voice],g:U.g||U}; }
        if(U.post>0) { flush(); out.push({wait:U.post}); }
      } else {
        flush();
        if(e.sub) { const o=Object.assign({},e.s); for(const k of Object.keys(e.sub)) o[k]=build(e.sub[k]); out.push(o); } else out.push(e.s);
      }
    }
    flush(); return out;
  };
  return build(top);
}
// A scene is wrapped only while it has edits, so every other scene stays exactly as the game loads it.
function seInstall() {
  if(typeof SCENES==='undefined') return;
  for(const id of Object.keys(SE.orig)) if(!seHas(seStateOf(id))) { SCENES[id]=SE.orig[id]; delete SE.orig[id]; }
  const ids=new Set([...Object.keys(SE.sent),...Object.keys(SE.draft)]);
  for(const id of ids) {
    if(!SCENES[id]||!seHas(seStateOf(id))||SE.orig[id]) continue;
    const o=SCENES[id]; SE.orig[id]=o;
    SCENES[id]=function(ctx) { const steps=typeof o==='function'?o(ctx||{}):o; try { return seApply(id,steps,null); } catch(e) { console.error('script edits failed for '+id,e); return steps; } };
  }
}
SE.ready=(async()=>{
  seLoadDraft();
  try { const r=await fetch('data/script-edits.json?'+Date.now(),{cache:'no-store'}); if(r.ok) { const j=await r.json(); SE.sent=(j&&j.scenes)||{}; } } catch(e) {}
  seInstall();
})();
addEventListener('storage',e=>{ if(e.key===SE_DRAFT) { seLoadDraft(); seInstall(); } });

// ---------- lines Tom changed play through speech synthesis until a clip is recorded ----------
if(typeof loadDialogLine==='function') {
  const LE_loadDialogLine_se=loadDialogLine;
  loadDialogLine=function() {
    LE_loadDialogLine_se();
    try {
      const text=dialog.lines[dialog.index];
      if(!SE.edited.has(dialog.name+'|'+text)||typeof dvClip!=='function'||dvClip(dialog.name,text)) return;
      if(!sound.enabled||!('speechSynthesis' in window)||(typeof cutMuted==='function'&&cutMuted())) return;
      const vid=typeof dvVoiceOf==='function'&&dvVoiceOf(dialog.name),v=(typeof VOICE!=='undefined'&&VOICE[vid])||{pitch:1,rate:1};
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text); u.pitch=v.pitch||1; u.rate=v.rate||1; u.volume=typeof volGain==='function'?volGain(sound.vol.voice):1;
      const pv=typeof pickVoice==='function'&&vid&&pickVoice(vid); if(pv) u.voice=pv;
      speechSynthesis.speak(u);
    } catch(e) {}
  };
}

// ---------- Play: start one scene in the real game ----------
// The recipe comes from data/script-index.json (script.html puts it in localStorage aot-script-play). The setup is the one tools/reaction_test.py uses:
// chapter state before the scene, the party, the map and start tile, then playScene(id).
function sePlaySetup(R) {
  splash.active=false; document.getElementById('splash').hidden=true; endIntro();
  resetStory('full',R.ch); const st=chselStateBefore(R.ch); Object.assign(STORY.flags,st.flags);
  for(const id of st.gives) if(items[id]&&!bag.includes(id)) bag.push(id);
  const keys=Object.keys(SCENES),first=keys.indexOf(R.id);
  const take=(k,v)=>{ if(!k||k==='goal'||v==='pending'||v===false||v===null) return; STORY.flags[k]=v===undefined?true:v; };
  const fromSource=fn=>{ for(const m of String(fn).matchAll(/setFlag\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?/g)) take(m[1],m[2]); };
  const walk=x=>{ if(!x) return; if(Array.isArray(x)) { x.forEach(walk); return; } if(typeof x==='function') { fromSource(x); return; }
    if(typeof x!=='object'||typeof x.start==='function') return; if(typeof x.flag==='string') take(x.flag,x.value);
    if(typeof x.battle==='string') take('battle:'+x.battle,'win'); if(typeof x.call==='function') fromSource(x.call);
    for(const k of ['then','else','all','seq']) if(x[k]) walk(x[k]); };
  const pre=new RegExp('^'+(R.prefix||('ch'+R.ch))+'[A-Z]');
  for(let i=0;i<first;i++) { const id=keys[i]; if(!pre.test(id)) continue; let s=(SE.orig[id]||SCENES[id]); if(typeof s==='function') { fromSource(s); try { s=s({}); } catch(e) { s=null; } } walk(s); }
  for(const f of R.unflag||[]) delete STORY.flags[f];
  for(const [k,v] of Object.entries(R.flags||{})) STORY.flags[k]=v;
  setChapter(R.ch,{apply:false}); STORY.override=null;
  if(typeof b6Prep==='function') b6Prep(10);
  for(const m of extras()) recruitLeave(m,true);
  const party_=R.party||['tom','grace','rose']; const wantGirls=party_.includes('grace'); if(girlsAway()===wantGirls) setGirlsAway(!wantGirls);
  for(const id of party_) { if(['tom','grace','rose'].includes(id)) continue; const m=MEMBERS()[id]; if(m) forceJoin(m,true); }
  for(const id of R.bench||[]) { const m=MEMBERS()[id]; if(m&&typeof benchAdd==='function') benchAdd(m); }
  const m=worlds[R.map]; currentMap=m;
  let s=R.start;
  if(!s&&R.atRect) { const [x0,y0,x1,y1]=R.atRect; s=[Math.round((x0+x1)/2),Math.round((y0+y1)/2),'down']; }
  if(!s) s=[m.spawn.x,m.spawn.y,'down'];
  player.x=s[0]; player.y=s[1]; player.facing=s[2]||'down'; player.move=null; player.hidden=false;
  placeFollowers(); refreshAreaUI(); resize(); camera.snap=true; storyWorld();
  window.storyTriggers=()=>false;   // nothing else starts while the scene is watched
  // a fight in the scene is won at once; a recipe with lose:true skips the fight and leaves it unwon, so the scene's try-again lines play
  SCENE_OPS.battle=o=>S.call(()=>{ if(R.lose) return; let mm=typeof o.battle==='function'?o.battle():typeof o.battle==='object'?o.battle:findMonster(o.battle);
    const id=(mm&&mm.monster)||o.battle; if(mm) monsterFall(mm); setFlag('battle:'+id,'win'); storyWorld(); });
}
function sePlayBack() { try { location.href=new URL('script.html'+(SE.play&&SE.play.id?'#'+SE.play.id:''),location.href).href; } catch(e) { location.href='script.html'; } }
async function sePlayBoot() {
  let P=null; try { P=JSON.parse(localStorage.getItem(SE_PLAYKEY)||'null'); localStorage.removeItem(SE_PLAYKEY); } catch(e) {}
  if(!P||!P.id) return;
  SE.play=P; await SE.ready;
  const wait=()=>new Promise(res=>{ const t=setInterval(()=>{ if(window.__LE&&window.__LE.playScene&&window.__LE.chapterJump) { clearInterval(t); res(); } },100); });
  await wait();
  saveGame=function() { return false; };   // watching a scene never replaces Tom's autosave or slots
  const bar=document.createElement('button'); bar.textContent='BACK TO SCRIPT EDITOR';
  bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top) + 56px);z-index:99999;background:#7b6cffee;color:#fff;border:0;border-radius:12px;padding:8px 12px;min-height:44px;font:600 13px -apple-system,system-ui,sans-serif;white-space:nowrap';
  bar.onclick=sePlayBack; document.body.appendChild(bar);
  try {
    sePlaySetup(Object.assign({id:P.id},P.recipe||{}));
    setTimeout(()=>playScene(P.id),400);
  } catch(e) { console.error(e); bar.textContent='COULD NOT START THIS SCENE (tap to go back)'; }
}
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{SE,seApply}); if(typeof SCENES!=='undefined') sePlayBoot(); });
