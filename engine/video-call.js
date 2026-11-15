'use strict';
// engine/video-call.js: the video call at the end of chapter 6 (stage 4, story-ch06.md scene 18). Classic script, loaded after engine/scene-props.js.
// Tom is on his porch in Los Angeles; each of the three Long Island scenes fills the screen, with Tom and TNB in a small picture in the corner.
// Scene steps:
//   {callto:{map:'hollow',view:[x,y],cast:[{id:'rose',at:[x,y],dir:'right'},...]}}  moves the view to a Long Island map with Tom's party hidden, and puts the family on it
//   {callframe:true|false}                                                          shows or hides the corner picture (art/ui/ch6_callframe.webp, Library ch6-videocall-frame)
//   {callback:true}                                                                 back to Tom's porch: the family is removed, the party shows again
// `view` is a quiet tile for Tom's hidden body (nobody triggers anything from it). The family are scripted NPCs drawn from their own painted sheets
// (like the girls at home in engine/travel.js); they leave with the call.
const CALL={saved:null,cast:[],frame:null};
function callFrameOn() {
  const host=document.getElementById('game'); if(!host||CALL.frame) return;
  const w=Math.round(Math.max(84,Math.min(150,host.clientWidth*.27)));
  const el=document.createElement('div'); el.id='callframe';
  el.style.cssText='position:absolute;right:10px;top:10px;z-index:55;width:'+w+'px;height:'+w+'px;border:3px solid #fff;border-radius:12px;overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,.55);pointer-events:none;background:#222;opacity:0;transition:opacity .4s';
  const im=new Image(); im.src='art/ui/ch6_callframe.webp?v=ch6s4'; im.alt=''; im.style.cssText='width:100%;height:100%;object-fit:cover;display:block';
  const live=document.createElement('div'); live.textContent='● LIVE'; live.style.cssText='position:absolute;left:5px;top:4px;font:bold 10px system-ui,sans-serif;color:#fff;background:rgba(200,30,30,.85);padding:1px 5px;border-radius:6px;letter-spacing:.5px';
  el.appendChild(im); el.appendChild(live); host.appendChild(el); CALL.frame=el;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.style.opacity='1'; }));
}
function callFrameOff() { const e=CALL.frame||document.getElementById('callframe'); if(e) { e.style.opacity='0'; setTimeout(()=>e.remove(),420); } CALL.frame=null; }
function callRemoveCast() { for(const n of CALL.cast) for(const m of Object.values(worlds)) { const i=m.npcs.indexOf(n); if(i>=0) m.npcs.splice(i,1); } CALL.cast=[]; }
function callTo(o) {
  const M=worlds[o.map]; if(!M) return;
  if(!CALL.saved) CALL.saved={map:currentMap,x:player.x,y:player.y,facing:player.facing,hidden:player.hidden,fh:followers.map(f=>[f,f.hidden])};
  callRemoveCast();
  currentMap=M; player.x=o.view[0]; player.y=o.view[1]; player.move=null; player.hidden=true;
  for(const f of followers) f.hidden=true;
  const MB=MEMBERS();
  for(const c of o.cast) { const m=MB[c.id]; if(!m) continue;
    const n=actor(m.name,c.at[0],c.at[1],'dot',[]);
    Object.assign(n,{sheet:m.id,member:m,scripted:true,callActor:true,roam:0,facing:c.dir||'down',duration:.8,tier:0,maxHp:1,defeatedUntil:0});
    M.npcs.push(n); storyHold(n); n.stagePlaced=true; CALL.cast.push(n); }
  refreshAreaUI(); resize(); camera.snap=true;
}
function callBack() {
  callRemoveCast(); const S0=CALL.saved; if(!S0) return;
  currentMap=S0.map; player.x=S0.x; player.y=S0.y; player.facing=S0.facing; player.move=null; player.hidden=S0.hidden;
  for(const [f,h] of S0.fh) f.hidden=h;
  CALL.saved=null; placeFollowers(); refreshAreaUI(); resize(); camera.snap=true;
}
SCENE_OPS.callto=o=>S.call(()=>callTo(o.callto));
SCENE_OPS.callback=o=>S.call(()=>callBack());
SCENE_OPS.callframe=o=>S.call(()=>{ if(o.callframe) callFrameOn(); else callFrameOff(); });
addEventListener('DOMContentLoaded',()=>{ if(window.__LE) Object.assign(window.__LE,{callTo,callBack,callFrameOn,callFrameOff,CALL}); });
