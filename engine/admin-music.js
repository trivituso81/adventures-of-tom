'use strict';
// engine/admin-music.js: the calm track (music/admin.mp3, "Admin Calm" in the Music Library) on the separate admin pages
// (Voice Library, Art Library, Music Library, Area Builder, Portrait Crops, Head Sizes). The ADMIN menu inside the game plays the
// same track through engine/music-clips.js (mcAdminScreen). This file stands alone: it uses no game globals, so a page only needs
//   <script src="engine/admin-music.js?v=adminvol1"></script>
// Behaviour:
//  - Follows the game's music switch (localStorage 'le-music' = 'off' keeps it silent).
//  - Adds a "Music On/Off" button and a volume slider to the page's top bar (<header>). Off is kept in localStorage
//    'aot-admin-music-off' ('1'), volume 0 to 1 in 'aot-admin-music-vol' (default .5 = the old level). Both are shared by
//    all admin pages, and the game's ADMIN screens read the same volume and off switch (MC_ADMIN in engine/music-clips.js).
//  - Plays a take Tom picked for 'admin' in the Music Library on this phone (IndexedDB 'aot-music-library'), else music/admin.mp3.
//  - Loops by crossfading the track into itself (2.5 s), like the game does.
//  - Carries on from where the last admin page left off (position kept in localStorage 'aot-admin-music'), so moving between
//    admin pages does not restart it. Starts with a 2 s fade in.
//  - iPhones only start sound after a tap: if the page cannot start it, the first tap, key press or touch starts it.
//  - Goes quiet while anything else makes sound on the page (a clip or track played from a library, or the microphone being
//    open for a recording) and fades back 1.5 s after it ends. Quiet while the page is hidden.
(function() {
  if(window.adminMusic) return;
  const KEY='aot-admin-music', OFF_KEY='aot-admin-music-off', VOL_KEY='aot-admin-music-vol', ID='admin', XF=2.5, LEVEL=.25;
  let ctx=null, out=null, buf=null, loading=false, started=false, startedAt=0, offset=0, copies=[], nextAt=0, timer=0, saveTimer=0;
  const holds=new Set();
  const wantOn=()=>{ try { return localStorage.getItem('le-music')!=='off'&&localStorage.getItem(OFF_KEY)!=='1'; } catch(e) { return true; } };
  function volume() { try { const v=parseFloat(localStorage.getItem(VOL_KEY)); return v>=0&&v<=1?v:.5; } catch(e) { return .5; } }

  function mine() { return ctx&&buf; }
  function target() { return (!wantOn()||document.hidden||holds.size)?0:LEVEL*volume()/.5; }
  function fade(to,secs) {
    if(!out) return; const t=ctx.currentTime;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value,t); out.gain.linearRampToValueAtTime(to,t+secs);
  }
  function apply(secs) { if(started) fade(target(),secs===undefined?(target()?1.5:.4):secs); }

  // ---- bytes: Tom's picked phone take, else the built-in mp3 ----
  function phoneTake() {
    return new Promise(res=>{
      try {
        const q=indexedDB.open('aot-music-library',1);
        q.onupgradeneeded=()=>{ try { const d=q.result;
          if(!d.objectStoreNames.contains('takes')) d.createObjectStore('takes',{keyPath:'key'});
          if(!d.objectStoreNames.contains('use')) d.createObjectStore('use',{keyPath:'trackId'}); } catch(e) {} };
        q.onerror=q.onblocked=()=>res(null);
        q.onsuccess=()=>{
          const db=q.result;
          try {
            const u=db.transaction('use').objectStore('use').get(ID);
            u.onsuccess=()=>{ const r=u.result; if(!r||!r.key) return res(null);
              const g=db.transaction('takes').objectStore('takes').get(r.key);
              g.onsuccess=()=>{ const t=g.result; res(t&&t.mp3&&t.mp3.arrayBuffer?t.mp3.arrayBuffer().catch(()=>null):null); };
              g.onerror=()=>res(null); };
            u.onerror=()=>res(null);
          } catch(e) { res(null); }
        };
      } catch(e) { res(null); }
    });
  }
  function net() { return fetch('music/'+ID+'.mp3').then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.arrayBuffer(); }); }
  function decode(ab) { return new Promise((res,rej)=>{ const p=ctx.decodeAudioData(ab,res,rej); if(p&&p.catch) p.catch(rej); }); }

  function ensureCtx() {
    if(ctx) return true;
    const C=window.AudioContext||window.webkitAudioContext; if(!C) return false;
    try { ctx=new C(); } catch(e) { return false; }
    out=ctx.createGain(); out.gain.value=0; out.connect(ctx.destination);
    return true;
  }
  function load() {
    if(buf||loading||!ensureCtx()) return;
    loading=true;
    phoneTake().then(ab=>ab||net()).then(ab=>decode(ab).catch(()=>net().then(decode)))   // a bad phone take falls back to the built-in track
      .then(b=>{ buf=b; loading=false; tryStart(); }).catch(()=>{ loading=false; });
  }

  // ---- playback: copies of the buffer crossfading into each other ----
  function copy(t,from) {
    const src=ctx.createBufferSource(), g=ctx.createGain();
    src.buffer=buf; src.connect(g); g.connect(out);
    const first=!copies.length, rest=buf.duration-from;
    if(first) g.gain.setValueAtTime(1,t); else { g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(1,t+XF); }
    if(copies.length) { const p=copies[copies.length-1]; p.g.gain.setValueAtTime(1,t); p.g.gain.linearRampToValueAtTime(0,t+XF); try { p.src.stop(t+XF+.05); } catch(e) {} }
    src.start(t,from);
    const cp={src,g}; copies.push(cp);
    src.onended=()=>{ try { g.disconnect(); } catch(e) {} const i=copies.indexOf(cp); if(i>=0) copies.splice(i,1); };
    nextAt=t+rest-XF;
  }
  function tryStart() {
    if(started||!mine()||!wantOn()||document.hidden) return;
    if(ctx.state!=='running') { try { ctx.resume(); } catch(e) {} if(ctx.state!=='running') return; }
    // carry on from the last admin page when it left a moment ago
    let from=0;
    try { const s=JSON.parse(localStorage.getItem(KEY)||'null');
      if(s&&typeof s.pos==='number'&&Date.now()-s.at<30000&&s.dur===Math.round(buf.duration)) from=(s.pos+(Date.now()-s.at)/1000)%buf.duration; } catch(e) {}
    started=true; startedAt=ctx.currentTime; offset=from;
    out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setValueAtTime(0,ctx.currentTime);
    copy(ctx.currentTime+.05,from);
    fade(target(),2);
    timer=setInterval(()=>{ if(ctx.currentTime>nextAt-.4) copy(Math.max(nextAt,ctx.currentTime+.02),0); },200);
    saveTimer=setInterval(save,1000);
  }
  function position() { return buf?(offset+(ctx.currentTime-startedAt))%buf.duration:0; }
  function save() { if(!started||!buf) return; try { localStorage.setItem(KEY,JSON.stringify({pos:position(),at:Date.now(),dur:Math.round(buf.duration)})); } catch(e) {} }
  function stop() {
    if(!started) return; started=false; clearInterval(timer); clearInterval(saveTimer); save();
    fade(0,.3); const cs=copies.slice(); setTimeout(()=>{ for(const c of cs) { try { c.src.stop(); } catch(e) {} } },400); copies=[];
  }

  // ---- hold: anything else making sound on the page ----
  function hold(why,on) { if(on) holds.add(why); else holds.delete(why); apply(on?.4:1.5); }
  function holdLater(why) { setTimeout(()=>hold(why,false),0); }
  // media elements (clips and tracks played with new Audio().play() or <audio>)
  { const p=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function() {
      const el=this; hold(el,true);
      // Release only when the element is really silent: a pause or emptied event from the clip it just replaced can arrive after the new play().
      if(!el.__amDone) { el.__amDone=()=>{ if(!el.paused&&!el.ended&&!el.muted) return; hold(el,false); };
        el.addEventListener('pause',el.__amDone); el.addEventListener('ended',el.__amDone); }
      let r; try { r=p.apply(this,arguments); } catch(e) { hold(el,false); throw e; }
      if(r&&r.catch) r.catch(()=>hold(el,false));
      if(el.muted) holdLater(el);                 // the silent unlock clip makes no sound
      return r;
    }; }
  // microphone (the Voice Library records takes: no music bleeding into a recording)
  try { const md=navigator.mediaDevices;
    if(md&&md.getUserMedia) { const g=md.getUserMedia.bind(md);
      md.getUserMedia=function(c) {
        const why='mic'+Math.random(); hold(why,true);
        return g(c).then(stream=>{
          const tracks=stream.getAudioTracks(); let left=tracks.length;
          const one=()=>{ if(--left<=0) hold(why,false); };
          if(!left) hold(why,false);
          for(const t of tracks) { let ended=false; const fin=()=>{ if(!ended) { ended=true; one(); } };
            const s=t.stop.bind(t); t.stop=function() { s(); fin(); }; t.addEventListener('ended',fin); }
          return stream;
        },e=>{ hold(why,false); throw e; });
      }; } } catch(e) {}

  // ---- start up and keep going ----
  function kick() { load(); if(buf&&!started) tryStart(); else if(started&&ctx.state==='suspended') { try { ctx.resume(); } catch(e) {} } }
  ['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,kick,{capture:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) { if(started) { save(); fade(0,.3); setTimeout(()=>{ if(document.hidden&&ctx&&ctx.state==='running') ctx.suspend(); },400); } }
    else { if(ctx&&ctx.state==='suspended') { try { ctx.resume(); } catch(e) {} } if(started) apply(2); else kick(); } });
  window.addEventListener('pagehide',save);
  window.addEventListener('storage',e=>{ if(e.key==='le-music'||e.key===OFF_KEY) { if(wantOn()) kick(); else stop(); syncUi(); }
    else if(e.key===VOL_KEY) { apply(.2); syncUi(); } });

  // ---- the controls in the page's top bar ----
  let uiBtn=null, uiRange=null;
  function syncUi() {
    if(!uiBtn) return;
    const on=wantOn(), game=(()=>{ try { return localStorage.getItem('le-music')==='off'; } catch(e) { return false; } })();
    uiBtn.textContent=on?'Music On':'Music Off'; uiBtn.setAttribute('aria-pressed',on?'true':'false');
    uiBtn.title=game?'The game music switch is off, so admin music is silent too':'';
    uiRange.value=Math.round(volume()*100); uiRange.disabled=!on;
  }
  function buildUi() {
    const h=document.querySelector('header'); if(!h||document.getElementById('amctl')) return;
    const w=document.createElement('span'); w.id='amctl';
    w.style.cssText='display:inline-flex;align-items:center;gap:6px;flex:none;font:12px system-ui,sans-serif;color:#cfd0ee';
    uiBtn=document.createElement('button'); uiBtn.type='button';
    uiBtn.style.cssText='min-height:30px;padding:3px 10px;border-radius:8px;border:1px solid #4a4585;background:#241f4d;color:#fff;font:inherit;cursor:pointer';
    uiRange=document.createElement('input'); uiRange.type='range'; uiRange.min=0; uiRange.max=100; uiRange.step=1;
    uiRange.setAttribute('aria-label','Admin music volume'); uiRange.style.cssText='width:64px;margin:0;accent-color:#e9b949';
    uiBtn.addEventListener('click',()=>{
      const on=wantOn();
      try { if(on) localStorage.setItem(OFF_KEY,'1'); else { localStorage.removeItem(OFF_KEY); localStorage.removeItem('le-music'); } } catch(e) {}
      if(wantOn()) kick(); else stop();
      syncUi(); });
    uiRange.addEventListener('input',()=>{
      try { localStorage.setItem(VOL_KEY,String(uiRange.value/100)); } catch(e) {}
      apply(.1); });
    w.appendChild(uiBtn); w.appendChild(uiRange); h.appendChild(w); syncUi();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',buildUi); else buildUi();
  load();
  window.adminMusic={hold,stop,kick,get volume() { return volume(); },get playing() { return started; },get level() { return out?out.gain.value:0; },
    get state() { return {ctx:ctx&&ctx.state,loaded:!!buf,started,holds:holds.size,pos:position()}; }};
})();
