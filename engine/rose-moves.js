'use strict';
// engine/rose-moves.js — Rose's attacks, built from her hobbies: being silly, her gingham dress, Lamby, jumping on top of people, and scaring them.
// Same shape as tom-moves.js: RECRUIT_MOVES.rose[key] queues steps, registers scenes (RFX.SC) and props (PROP2).
// Rose herself moves through fx.path (see battle-draw.js): a timed function that places, scales, hides or re-poses her sprite.
RECRUIT_MOVES.rose={};
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const rr=(s,k)=>{ const n=Math.sin((s.seed||1)*12.9898+k*78.233)*43758.5453; return n-Math.floor(n); };
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const poly=(pts,c,o)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=(E2,d,c)=>landHit(d==null?E2.dmg:d,c==null?E2.crit:c);
const confuse=()=>{ battle.enemyStunned=2; sfx.stun(); };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const path=(fx,dur,fn)=>{ fx.path={t:0,dur,fn}; return fx.path; };
const Rm=RECRUIT_MOVES.rose;
// Where Rose is right now (battle.actorPos while she acts) and where the Grump's head is.
const rose=()=>battle.actorPos||{cx:516,base:309,h:68};
const top=()=>battle.enemyTop||177;
const EX=()=>battle.enemyX||GX;
const split=(dmg,n)=>{ const per=Math.max(1,Math.floor(dmg/n)); const out=Array(n-1).fill(per); out.push(Math.max(1,dmg-per*(n-1))); return out; };

// Sounds just for Rose.
sfx.boo=()=>{ tone({type:'sawtooth',f0:70,f1:180,dur:.35,vol:.3,filter:600,q:3}); noise({dur:.3,vol:.2,f0:200,f1:1800,type:'bandpass',q:.6}); tone({type:'square',f0:2400,f1:900,dur:.18,vol:.12,delay:.05}); };
sfx.baa=(d=0)=>{ for(let k=0;k<5;k++) tone({type:'triangle',f0:k%2?520:440,f1:k%2?440:520,dur:.09,vol:.16,delay:d+k*.08}); tone({type:'sawtooth',f0:330,f1:280,dur:.3,vol:.08,delay:d+.4,filter:900}); };
sfx.spin=()=>{ for(let k=0;k<6;k++) noise({dur:.14,vol:.12,delay:k*.11,f0:900+k*300,f1:2400+k*300,type:'bandpass',q:1}); tone({type:'sine',f0:300,f1:1200,dur:.7,vol:.1,sweep:'linear'}); };
sfx.shutter=()=>{ noise({dur:.05,vol:.3,f0:3000,f1:6000,type:'bandpass',q:1}); tone({type:'square',f0:1800,dur:.04,vol:.1,delay:.06}); noise({dur:.08,vol:.2,f0:2000,f1:600,type:'lowpass',delay:.08}); };
sfx.hooves=(n=10)=>{ for(let k=0;k<n;k++) { noise({dur:.06,vol:.12,delay:k*.13,f0:400,f1:150,type:'lowpass'}); tone({type:'triangle',f0:110,f1:60,dur:.08,vol:.14,delay:k*.13}); } };
sfx.roar=()=>{ tone({type:'sawtooth',f0:60,f1:140,dur:.9,vol:.32,filter:500,q:4}); noise({dur:.9,vol:.2,f0:150,f1:900,type:'bandpass',q:.5}); tone({type:'sawtooth',f0:140,f1:50,dur:.6,vol:.2,delay:.6,filter:400}); };

// ================= Lamby =================
// A real lamb (the Stampede flock), drawn facing left at (x,y) = middle of the body. sc scales. eyes: 'glow' lights them up.
function lamb(x,y,sc=1,o={}) {
  gfx.save(); gfx.translate(x,y); gfx.scale(sc*(o.flip?-1:1),sc);
  const w='#fff8f0',w2='#f1e6d8',dk='#3a3a44';
  // legs
  for(const lx of [-9,-3,5,11]) { R(lx-2,6,5,11,OUT); R(lx-1,7,3,9,dk); }
  // fluffy body
  const puffs=[[-12,-2,9],[-2,-6,10],[9,-3,9],[4,4,8],[-7,5,8],[13,4,6]];
  for(const [px,py,r] of puffs) E(px,py,r+2,r+1.5,OUT);
  for(const [px,py,r] of puffs) E(px,py,r,r-.5,w);
  E(-4,-5,5,3,'#ffffff'); E(6,6,5,2.5,w2);
  // tail
  E(18,-2,4.5,4.5,OUT); E(18,-2,3,3,w);
  // head
  E(-17,-6,9,8,OUT); E(-17,-6,7.4,6.4,dk);
  E(-13,-13,4.5,4,OUT); E(-13,-13,3,2.6,w); E(-21,-12,4,3,OUT); E(-21,-12,2.6,1.8,dk);
  const ec=o.glow?'#ffe08a':'#ffffff';
  E(-21,-7,2.4,2.4,ec); E(-15,-7,2.4,2.4,ec); if(!o.glow) { R(-22,-8,2,2,OUT); R(-16,-8,2,2,OUT); }
  if(o.glow) { gfx.globalAlpha*=.5; E(-21,-7,5,5,'#ffe08a'); E(-15,-7,5,5,'#ffe08a'); gfx.globalAlpha/=.5; }
  R(-20,-2,4,1.5,'#c98a9a');
  // bow at the neck
  poly([[-10,-9],[-5,-12],[-5,-6]],'#ff6b9a',true); poly([[-10,-9],[-15,-12],[-15,-6]],'#ff6b9a',true); E(-10,-9,2,2,'#ffb3cf');
  gfx.restore();
}
// Plush Lamby: Rose's real stuffed lamb, from Tom's photos. A floppy, well-loved cream terry lovey: limp tube limbs,
// small head with a smooth beige muzzle, tiny wide-set bead eyes, a stitched Y nose, curly topknot, ears that stick out sideways,
// and a little tag on the bum. No bow. Centered at (x,y); faces left.
// o.pose: 'held' (limbs dangle), 'fly' (limbs flail), 'splat' (flattened, limbs splayed). o.glow lights the eyes. o.rot tilts.
function plush(x,y,sc=1,o={}) {
  const t=battle.time||performance.now()/1000,pose=o.pose||'held',sq=pose==='splat'?.72:1;
  gfx.save(); gfx.translate(x,y); gfx.scale(sc*(o.flip?-1:1),sc); if(o.rot) gfx.rotate(o.rot);
  const fur='#eee5d4',furD='#d6c9b2',furL='#faf6ec',muz='#ecdcc3',muzD='#d9c3a3',bead='#16110e',st='#5a4636';
  const tube=(x0,y0,a,len,w)=>{ const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len; Ln(x0,y0,x1,y1,w+3,OUT); E(x1,y1,w/2+1.8,w/2+1.6,OUT); Ln(x0,y0,x1,y1,w,fur); E(x1,y1,w/2+.3,w/2,furD); E(x1-.6,y1-.6,w/2-1,w/2-1.2,fur); };
  // limbs: [attach x, attach y, angle]
  const fl=k=>Math.sin(t*(pose==='fly'?15:4)+k*1.9)*(pose==='fly'?.55:.22);
  const L={held:[[-7,8,2.0],[-2,9,1.45],[8,8,1.75],[12,6,1.2]],fly:[[-8,6,2.7],[-3,8,2.3],[9,7,.5],[12,4,.05]],splat:[[-9,4,2.6],[-6,8,1.95],[9,8,1.15],[12,3,.4]]}[pose];
  const far=L.filter((_,k)=>k%2),near=L.filter((_,k)=>!(k%2));
  gfx.save(); gfx.scale(1,sq);
  for(const [lx,ly,a] of far) { gfx.globalAlpha*=1; tube(lx,ly,a+fl(lx),pose==='splat'?11:10,6); }
  // floppy body
  E(3,3,15,10.5,OUT); E(3,3,13.4,9,fur); E(6,7,9,4,furD); E(-1,-1,8,4,furL);
  // terry curls
  for(let k=0;k<14;k++) { const cx=-8+(k*7.3)%22,cy=-3+((k*5.1)%10); E(cx,cy,1.3,.9,k%3?furD:furL); }
  // tag on the bum
  R(13,3,4,6,OUT); R(13.8,3.8,2.4,4.4,'#ffffff'); R(13.8,5.6,2.4,1.4,'#f08a3c');
  for(const [lx,ly,a] of near) tube(lx,ly,a+fl(lx+3),pose==='splat'?11:10,6.5);
  gfx.restore();
  // head
  const hy=pose==='splat'?-3:-6, hx=-12;
  // far ear sticks out up and back, near ear out to the side
  const flap=pose==='fly'?Math.sin(t*18)*.35:Math.sin(t*3)*.08;
  for(const [ex,ey,rot,near] of [[hx+7,hy-6,-.35+flap,0],[hx-8,hy-4,2.95-flap,1]]) { gfx.save(); gfx.translate(ex,ey); gfx.rotate(rot); E(4,0,6,3.6,OUT); E(4,0,4.6,2.4,near?fur:furD); E(4.5,.3,2.6,1.2,muzD); gfx.restore(); }
  E(hx,hy,11,10,OUT); E(hx,hy,9.6,8.6,fur);
  // curly topknot
  for(const [tx,ty,r] of [[hx-3,hy-8,3.4],[hx+2,hy-9,3.6],[hx+6,hy-6,3],[hx-6,hy-5,2.8]]) E(tx,ty,r+1.4,r+1.2,OUT);
  for(const [tx,ty,r] of [[hx-3,hy-8,3.4],[hx+2,hy-9,3.6],[hx+6,hy-6,3],[hx-6,hy-5,2.8]]) { E(tx,ty,r,r-.3,fur); E(tx-.8,ty-.8,r*.45,r*.35,furL); }
  // smooth muzzle, pushed toward the front (left)
  E(hx-4,hy+2.5,7.6,6.6,muzD); E(hx-4.5,hy+2,6.8,5.8,muz); E(hx-6,hy,3,2,'#f6ead6');
  // tiny wide-set bead eyes
  if(o.glow) { gfx.globalAlpha*=.5; E(hx-8,hy-1,4.5,4.5,'#ffe08a'); E(hx+1,hy-2,4.5,4.5,'#ffe08a'); gfx.globalAlpha/=.5; E(hx-8,hy-1,1.9,1.9,'#ffe08a'); E(hx+1,hy-2,1.9,1.9,'#ffe08a'); }
  else if(pose==='splat') { Ln(hx-9.5,hy-1,hx-6.5,hy-1,1.2,bead); Ln(hx-.5,hy-2,hx+2.5,hy-2,1.2,bead); }
  else { E(hx-8,hy-1,1.5,1.6,bead); E(hx+1,hy-2,1.5,1.6,bead); R(hx-8.6,hy-2,.8,.8,'#ffffff'); }
  // stitched Y nose
  Ln(hx-7,hy+3,hx-5,hy+4.4,1,st); Ln(hx-3,hy+3,hx-5,hy+4.4,1,st); Ln(hx-5,hy+4.4,hx-5,hy+6,1,st);
  gfx.restore();
}
RFX.plush=plush; RFX.lamb=lamb;   // the set pieces at the end of this file draw Lamby too
PROP2.lamby=(q,u)=>{ const tumble=q.tumble?Math.sin(u*Math.PI*2.2)*.7-u*.6:0; if(q.lines) for(let k=0;k<3;k++) R(22+k*8,-6+k*5,10-k*2,2,'rgba(255,246,220,'+(.7-k*.2)+')'); plush(0,0,1.5,{flip:q.flip,pose:'fly',rot:tumble}); };
PROP2.bow=(q,u)=>{ const c='#ff6b9a',c2='#ffb3cf'; for(const sd of [-1,1]) poly([[0,0],[sd*30,-18],[sd*26,16]],c,true); for(const sd of [-1,1]) poly([[sd*8,-2],[sd*24,-12],[sd*22,10]],c2); E(0,0,7,7,OUT); E(0,0,5,5,c); for(const sd of [-1,1]) poly([[sd*2,4],[sd*18,22],[sd*8,24]],c,true); };
PROP2.tutu=(q,u)=>{ const c='#ffb3cf',c2='#ff8fb8'; gfx.globalAlpha*=.92; for(let k=0;k<2;k++) { gfx.beginPath(); for(let a=0;a<=Math.PI*2+.01;a+=Math.PI/12) { const r=(k?44:52)+Math.sin(a*6)*5; gfx.lineTo(Math.cos(a)*r,Math.sin(a)*r*.38+k*3); } gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=k?c2:c; gfx.fill(); } E(0,-3,30,8,'#ffd3e0'); };
PROP2.tiara=(q,u)=>{ const g='#ffd166',g2='#fff1b0'; poly([[-30,10],[-22,-10],[-14,2],[0,-20],[14,2],[22,-10],[30,10]],g,true); poly([[-26,10],[-21,-2],[-16,6],[0,-8],[16,6],[21,-2],[26,10]],g2); R(-30,8,60,6,OUT); R(-29,9,58,4,g); for(const [jx,jy] of [[0,-10],[-22,-2],[22,-2]]) { E(jx,jy,4,4,OUT); E(jx,jy,2.6,2.6,'#8fd0ff'); } };

// ================= Scenes =================
// The hush before the BOO: dots where Rose was, question marks over the Grump.
SC.hush=(s,u)=>{ gfx.globalAlpha=env(u,.1,.8); const n=Math.floor(s.t*3)%4; label('. . .'.slice(0,n*2),s.x,s.y,'#fff1cb',3); for(let k=0;k<2;k++) label('?',EX()+(k?36:-30),top()-14-Math.round(Math.abs(Math.sin(s.t*5+k))*8),'#fff1cb',3); };
// A gingham dress twister: grows around Rose, travels to the Grump, lifts him, fades.
SC.twister=(s,u)=>{
  const p=rose(),grow=ez(u/.3),go=ez(cl((u-.38)/.22)),x=lerp(p.cx,EX(),go),base=lerp(p.base+2,266,go),fade=u>.9?(1-u)/.1:1;
  gfx.globalAlpha=fade; const H=(90+go*70)*grow,W=(44+go*30)*grow;
  // rings of the cone, striped like the dress
  for(let k=0;k<9;k++) { const q=k/8,ry=base-H*q,rw=W*(.25+.75*q)*(1+.08*Math.sin(s.t*20+k)),sx=x+Math.sin(s.t*9+k*1.3)*6*q; E(sx,ry,rw+2,6,OUT); E(sx,ry,rw,4.5,k%2?'#f3d872':'#fff1b0'); for(let c=0;c<4;c++) R(sx-rw+rw*2*((c+.5)/4)+Math.sin(s.t*12+k)*6-2,ry-2,4,4,'#e0b84a'); }
  // leaves and petals caught in it
  for(let k=0;k<10;k++) { const a=rr(s,k),ang=s.t*8+k,q=(a+s.t*.4)%1,ry=base-H*q,rw=W*(.3+.7*q); R(x+Math.cos(ang)*rw-3,ry-3,6,4,k%3?'#8fb07a':'#ff9ac0'); }
  if(u<.35) label('WHEEE',p.cx,p.base-p.h-28-Math.round(u*30),'#ffe08a',3);
};
// Little stars when Rose is dizzy.
SC.dizzy=(s,u)=>{ const p=rose(); gfx.globalAlpha=env(u,.1,.8); for(let k=0;k<3;k++) { const a=s.t*5+k*2.1; label('*',p.cx+Math.round(Math.cos(a)*18),p.base-p.h-6+Math.round(Math.sin(a)*5),k%2?'#ffe08a':'#fff6c8',2); } };
// Lamby in Rose's arms (held up) or above her head, with a glow when s.glow.
SC.lambyHold=(s,u)=>{ const p=rose(),up=s.up?ez(cl(u/.3)):0,fade=u>.9?(1-u)/.1:1;
  if(s.hug) { const x=p.cx-14,y=p.base-p.h*.56,sq=1+Math.sin(s.t*7)*.04; gfx.globalAlpha=fade; gfx.save(); gfx.translate(x,y); gfx.scale(sq,2-sq); plush(0,0,1.25,{pose:'held',rot:.35}); gfx.restore();
    const hq=cl((u-.15)/.7); gfx.globalAlpha=fade*(1-hq); const hx=x-6,hy=y-34-hq*30; E(hx-4,hy,5,5,'#ff6b9a'); E(hx+4,hy,5,5,'#ff6b9a'); poly([[hx-9,hy+1],[hx+9,hy+1],[hx,hy+11]],'#ff6b9a'); E(hx-5,hy-2,1.8,1.4,'#ffd3e0'); return; }
  const x=p.cx-24,y=p.base-p.h*.45-up*(p.h*.6+8); gfx.globalAlpha=fade; if(s.glow&&u>.3) { const g=cl((u-.3)/.3); gfx.globalAlpha*=.35*g; E(x,y,30+g*30,24+g*20,'#ffe08a'); gfx.globalAlpha=fade; } plush(x,y,1.4,{glow:s.glow&&u>.45,pose:'held'}); };
// Lamby flomped flat on the Grump's face, then peeling off and sliding down.
SC.lambyStuck=(s,u)=>{ const x=EX()+16,y0=top()+40,slide=ez(cl((u-.55)/.45)),y=y0+slide*34,wob=Math.sin(s.t*30)*(1-u)*.12; gfx.globalAlpha=1; plush(x,y,1.7,{pose:'splat',rot:wob+slide*.5}); if(u<.5) label('FLOMP',x-56,y0-34-Math.round(u*12),'#fff8f0',3); };
// The outfit the Grump is wearing. s.n counts the pieces on so far.
SC.outfit=(s,u)=>{
  const x=EX(),y=top(),fade=u>.92?(1-u)/.08:1; gfx.globalAlpha=fade;
  if(s.n>=2) { gfx.save(); gfx.translate(x,y+58); PROP2.tutu({},0); gfx.restore(); }
  if(s.n>=1) { gfx.save(); gfx.translate(x-30,y+4); gfx.rotate(-.3); gfx.scale(.9,.9); PROP2.bow({},0); gfx.restore(); }
  if(s.n>=3) { gfx.save(); gfx.translate(x+6,y-6); PROP2.tiara({},0); gfx.restore(); }
  if(s.n>=1) for(let k=0;k<6;k++) { if(Math.floor(s.t*5+k)%3) continue; const a=rr(s,k),b=rr(s,k+5); label('+',x-60+a*120,y-20+b*90,k%2?'#fff6c8':'#ffb3cf',2); }
};
// Camera flash and the photo frame.
SC.photo=(s,u)=>{ gfx.globalAlpha=env(u,.05,.85); gfx.lineWidth=6; gfx.strokeStyle='#fff8e8'; gfx.strokeRect(EX()-70,top()-24,140,124); for(const [cx,cy] of [[EX()-70,top()-24],[EX()+70,top()-24],[EX()-70,top()+100],[EX()+70,top()+100]]) { Ln(cx-10,cy,cx+10,cy,6,'#fff8e8'); Ln(cx,cy-10,cx,cy+10,6,'#fff8e8'); } };
// Flashlight under Rose's chin.
SC.torch=(s,u)=>{
  const p=rose(),x=p.cx-6,y=p.base-p.h*.72,e=env(u,.08,.92); gfx.globalAlpha=e*.55;
  poly([[x-4,y+8],[x+4,y+8],[x+34,y-110],[x-42,y-110]],'#fff1b0');
  gfx.globalAlpha=e*.3; E(x,y-14,22,20,'#fff1b0');
  gfx.globalAlpha=e; R(x-5,y+6,10,16,OUT); R(x-4,y+7,8,14,'#5e6670'); E(x,y+6,6,3,OUT); E(x,y+6,4,2,'#fff1b0');
};
// The shadow puppet monster looming over the Grump.
SC.shadowmon=(s,u)=>{
  const grow=ez(cl(u/.35)),x=EX()+10,base=268,H=(150+Math.sin(s.t*3)*8)*grow,W=70*grow,fade=u>.88?(1-u)/.12:1,sway=Math.sin(s.t*2.2)*.12*grow;
  gfx.globalAlpha=fade*.92; gfx.save(); gfx.translate(x,base); gfx.rotate(sway);
  // body with a jagged mouth and claws
  const pts=[[-W,0],[-W*.9,-H*.5],[-W*.6,-H*.8],[-W*.2,-H],[W*.2,-H*.96],[W*.6,-H*.8],[W*.9,-H*.5],[W,0]];
  poly(pts,'#140f1c');
  for(const sd of [-1,1]) { const ax=sd*W*.95,ay=-H*.62; poly([[ax*.8,ay+10],[ax*1.6,ay-24*grow],[ax*1.75,ay-10],[ax*1.5,ay+8],[ax*1.8,ay+22],[ax*1.3,ay+18],[ax*.9,ay+26]],'#140f1c'); }
  const op=cl((u-.42)/.1); // mouth opens, eyes light
  if(u>.3) { const ex=-W*.3,ey=-H*.72; E(ex,ey,10*grow,8*grow+op*6,'#fff6c8'); E(-ex,ey,10*grow,8*grow+op*6,'#fff6c8'); R(ex-3,ey-3,6,6,'#140f1c'); R(-ex-3,ey-3,6,6,'#140f1c'); }
  if(op>0) { gfx.fillStyle='#fff6c8'; gfx.beginPath(); gfx.moveTo(-W*.55,-H*.45); for(let k=0;k<=8;k++) gfx.lineTo(-W*.55+W*1.1*k/8,-H*.45+(k%2?op*26:0)); gfx.lineTo(W*.55,-H*.45+op*34); gfx.lineTo(-W*.55,-H*.45+op*34); gfx.closePath(); gfx.fill(); poly([[-W*.5,-H*.45+op*34],[W*.5,-H*.45+op*34],[W*.3,-H*.45+op*22],[0,-H*.45+op*30],[-W*.3,-H*.45+op*22]],'#a8283a'); }
  gfx.restore();
};
// The Grump's reaction mark.
SC.yikes=(s,u)=>{ gfx.globalAlpha=env(u,.1,.75); const b=Math.round(Math.abs(Math.sin(s.t*12))*8); label('!!',EX()+Math.round(Math.sin(s.t*30)*4),top()-26-b,s.c||'#ffe08a',4); for(let k=0;k<4;k++) { const a=k*1.6+s.t*2,r=16+u*22; E(EX()+Math.cos(a)*(50+r),top()+40+Math.sin(a)*r*.4,2.4,3.4,'#9fd8ff'); } };
// A hundred Lambies bounce across the stage from the right and through the Grump.
SC.stampede=(s,u)=>{
  const N=26; gfx.globalAlpha=u>.92?(1-u)/.08:1;
  for(let k=0;k<N;k++) { const a=rr(s,k),b=rr(s,k+40),st=k*.028+a*.02,q=(u-st)/.42; if(q<0||q>1) continue; const sc=.75+b*.55,lane=250+b*22,x=lerp(640,-80,q),y=lane-Math.abs(Math.sin(q*18+a*6))*(22+b*20)-sc*8; if(Math.floor(s.t*9+k)%2) E(x+18,lane+4,10*sc,3,'rgba(230,220,190,.6)'); lamb(x,y,sc,{}); }
  for(let k=0;k<8;k++) { const a=rr(s,k+70),q=(s.t*.9+a)%1; gfx.globalAlpha*=1; E(100+a*400,268-q*20,8+q*10,4,'rgba(230,220,190,'+(.5*(1-q))+')'); }
  if(u>.12&&u<.86&&Math.floor(s.t*6)%3===0) label('BAAA',120+Math.round(rr(s,Math.floor(s.t*6))*300),70+Math.round(rr(s,Math.floor(s.t*6)+9)*40),'#fff8f0',2);
};
SC.zz=(s,u)=>{ gfx.globalAlpha=env(u,.1,.8); for(let k=0;k<3;k++) { const q=(s.t*.6+k/3)%1; label('z',EX()+30+Math.round(q*30),top()-6-Math.round(q*44),k?'#fff1cb':'#ffe08a',2+(k%2)); } };

// ================= Moves =================
// Peekaboo: Rose covers her eyes and sinks out of sight. Silence. Then she pops up in the Grump's face, enormous. BOO.
Rm.peekaboo=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose covers her eyes. Where did Rose go? Nobody knows.'); say('rose','peekaboo',1.6); sfx.boop();
      path(fx,3.4,(q,c)=>{ if(q<.18) return {sc:1-ez(q/.18),frame:c.sp.celeb,noShadow:q>.1}; if(q<.5) return {hide:true}; if(q<.58) { const k=ez((q-.5)/.08); return {cx:EX()+64,base:top()+74,sc:.4+k*1.4,frame:c.sp.expr,noShadow:true}; } if(q<.86) return {cx:EX()+64+Math.round(Math.sin(c.t*40)*2),base:top()+74,sc:1.8,frame:Math.floor(c.t*10)%2?c.sp.expr:c.sp.celeb,noShadow:true}; const k=ez((q-.86)/.14); return {cx:lerp(EX()+64,c.origX,k),base:lerp(top()+74,c.origBase,k)-Math.sin(k*Math.PI)*40,sc:1.8-k*.8,frame:c.sp.idle,noShadow:k<.9}; }); },
    600,()=>{ const p=rose(); scene('hush',1.1,{x:p.cx,y:p.base-30}); },
    1150,()=>{ sfx.boo(); sfx.thud(); battle.enemyWobble=.9; battle.enemyKnock=.45; battle.shakeEnemy=.5; battle.flashEnemy=.3; scene('flash',.3,{a:.5,c:'#ffffff'}); scene('burst',.6,{x:EX()+20,y:top()+40,r:70,n:12,c:'#ffb3cf'}); scene('yikes',1.2,{}); bt('BOO!',70,26,'#ffb3cf',6,1.1); hit(E2); },
    1700,E2.result+' The Grump jumped a full foot.',()=>checkEnemy()); };
// Twirl Tornado: Rose spins until her dress is a twister. It wanders over and picks the Grump up.
Rm.twirl=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose twirls. And twirls. The dress has become weather.'); say('rose','twirl',.3); sfx.spin();
      path(fx,3.6,(q,c)=>{ if(q<.5) { const sp=4+q*30,f=Math.floor(c.t*sp)%4; return {frame:[c.sp.idle,c.sp.celeb,c.sp.flip,c.sp.celebFlip][f],base:c.origBase-Math.round(Math.abs(Math.sin(c.t*14))*6)}; } return {frame:Math.floor(c.t*6)%2?c.sp.expr:c.sp.idle,cx:c.origX+Math.round(Math.sin(c.t*7)*5),rot:Math.sin(c.t*7)*.08}; });
      scene('twister',3.2,{}); },
    900,()=>{ sfx.spin(); },
    900,()=>{ scene('dizzy',1.8,{}); sfx.whoosh(); },
    500,()=>{ battle.lift={t:0,dur:1.2}; sfx.slideWhistle(); scene('ring',1,{x:GX,y:266,r:80,c:'#f3d872',sq:.2}); bt('WHOOSH',70,40,'#ffe08a',3,.9); },
    1150,()=>{ sfx.thud(); battle.shakeEnemy=.6; scene('dust',.7,{x:GX,y:262,n:8,sp:22,up:20}); hit(E2); },
    600,E2.result+' Rose is a little dizzy. Worth it.',()=>checkEnemy()); };
// Lamby Launch: Rose gives Lamby a squeeze for luck and flings him. Lamby flops through the air, flomps flat on the Grump's face,
// slides off, and flops right back into her arms for another squeeze.
Rm.lamby=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose gives Lamby a squeeze for luck. Lamby has agreed to this.'); say('rose','lamby',.2); scene('lambyHold',1.0,{hug:true}); sfx.boing();
      path(fx,4.0,(q,c)=>{ if(q<.22) return {frame:c.sp.expr}; if(q<.3) return {frame:c.sp.celeb,cx:c.origX+Math.round(ez((q-.22)/.08)*10),rot:.15}; if(q<.38) return {frame:c.sp.act,cx:c.origX-8,rot:-.1}; if(q<.72) return {frame:c.sp.idle}; if(q<.86) return {frame:c.sp.expr}; return {frame:c.sp.celeb,base:c.origBase-Math.round(Math.abs(Math.sin(c.t*12))*14)}; }); },
    1050,()=>{ const p=rose(); toss('lamby',p.cx-20,p.base-p.h*.6,EX()+16,top()+40,0,.6,80,{lines:true,spin:false,tumble:true}); sfx.whoosh(); },
    600,()=>{ sfx.bonk(); sfx.baa(); battle.enemyKnock=.45; battle.shakeEnemy=.4; scene('lambyStuck',1.0,{}); scene('burst',.5,{x:EX()+16,y:top()+40,r:56,n:10,c:'#fff8f0'}); bt('BAA!',60,24,'#fff8f0',5,.9); hit(E2); },
    1000,()=>{ const p=rose(); toss('lamby',EX()+16,top()+74,p.cx-14,p.base-p.h*.56,0,.65,100,{flip:true,spin:false,tumble:true}); sfx.boing(); },
    660,()=>{ scene('lambyHold',1.1,{hug:true}); sfx.giggle(); bt('CAUGHT',96,46,'#ffb3cf',2,.8); },
    1000,E2.result+' Lamby is fine. Lamby is always fine.',()=>checkEnemy()); };
// Piggyback Pounce: Rose leaps onto the Grump's head and rides him. Every bounce counts.
Rm.pounce=E2=>{ const {fx,dmg,crit}=E2,hits=split(dmg,3);
  enqueue(()=>{ setMessage('Rose jumps on the Grump. On top of him. Giddyup.'); say('rose','pounce',.1); sfx.jumpWhistle();
      path(fx,4.4,(q,c)=>{ const sit=()=>({cx:EX()+2,base:top()+16}); if(q<.2) { const k=ez(q/.2),s=sit(); return {cx:lerp(c.origX,s.cx,k),base:lerp(c.origBase,s.base,k)-Math.sin(k*Math.PI)*170,frame:c.sp.celeb,noShadow:true,rot:-k*.3}; } if(q<.8) { const s=sit(),ph=(q-.2)/.6,b=Math.abs(Math.sin(ph*Math.PI*3)); return {cx:s.cx+Math.round(Math.sin(c.t*9)*3),base:s.base-Math.round(b*26),frame:b>.4?c.sp.celeb:c.sp.idle,noShadow:true}; } const k=ez((q-.8)/.2),s=sit(); return {cx:lerp(s.cx,c.origX,k),base:lerp(s.base,c.origBase,k)-Math.sin(k*Math.PI)*120,frame:c.sp.celeb,noShadow:k<.9,rot:k*.25}; }); },
    880,()=>{ sfx.thud(); battle.shakeEnemy=.4; scene('dust',.6,{x:GX,y:262,n:7,sp:20,up:14}); bt('GIDDYUP',44,36,'#ffe08a',3,1); sfx.bonk(); hit(E2,hits[0],false); },
    880,()=>{ sfx.bonk(); battle.shakeEnemy=.4; battle.enemyWobble=.4; bt('BOUNCE',56,40,'#ffb3cf',3,.8); hit(E2,hits[1],false); },
    880,()=>{ sfx.bonk(); battle.shakeEnemy=.5; battle.enemyWobble=.6; battle.flashEnemy=.3; bt('YEEHAW',48,34,'#ffe08a',4,.9); hit(E2,hits[2],crit); sfx.giggle(); },
    900,()=>{ sfx.boing(); },
    900,E2.result+' The Grump has been ridden.',()=>checkEnemy()); };
// Dress-Up Day: the Grump gets a bow, a tutu and a tiara, whether he likes it or not. Then a photo.
Rm.dressup=E2=>{ const {fx,dmg,crit}=E2,hits=split(dmg,3); let fit;
  const throwAt=(kind,dx,dy,arc)=>{ const p=rose(); toss(kind,p.cx-16,p.base-p.h*.55,EX()+dx,top()+dy,0,.55,arc,{spin:true}); sfx.whoosh(); };
  enqueue(()=>{ setMessage('Rose has decided the Grump needs an outfit. The Grump was not consulted.'); say('rose','dressup',.2); sfx.giggle(); fit=scene('outfit',5.2,{n:0});
      path(fx,5.4,(q,c)=>{ if(q>.78) return {frame:c.sp.celeb,base:c.origBase-Math.round(Math.abs(Math.sin(c.t*10))*16)}; const th=[.16,.36,.56].some(a=>q>a-.04&&q<a+.08); return {frame:th?c.sp.act:(Math.floor(c.t*4)%2?c.sp.celeb:c.sp.idle),cx:c.origX+(th?-6:0)}; }); },
    700,()=>{ throwAt('bow',-30,4,80); },
    560,()=>{ fit.n=1; sfx.bonk(); sfx.ding(); battle.shakeEnemy=.3; bt('BOW',70,36,'#ffb3cf',3,.8); hit(E2,hits[0],false); },
    520,()=>{ throwAt('tutu',0,58,90); },
    560,()=>{ fit.n=2; sfx.bonk(); sfx.ding(); battle.shakeEnemy=.3; battle.enemyWobble=.4; bt('TUTU',64,40,'#ffb3cf',3,.8); hit(E2,hits[1],false); },
    520,()=>{ throwAt('tiara',6,-6,100); },
    560,()=>{ fit.n=3; sfx.bonk(); sfx.levelChime(); battle.shakeEnemy=.4; bt('TIARA',58,34,'#ffe08a',3,.8); hit(E2,hits[2],crit); },
    700,()=>{ sfx.shutter(); scene('flash',.35,{a:.8}); scene('photo',1.6,{}); bt('CHEESE',52,30,'#fff8e8',4,1.2); },
    500,()=>{ bt('SO PRETTY',30,46,'#ffb3cf',3,1.1); sfx.giggle(); },
    1200,E2.result+' The Grump looks lovely and knows it.',()=>checkEnemy()); };
// Monster Under the Bed: lights out, flashlight under the chin, a story, and a shadow monster that is far too big.
Rm.bedtime=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose turns off the lights. She has a story. It is not a nice one.'); say('rose','bedtime',.3); scene('dark',5.2,{a:.72,back:true,c:'#06061a'}); sfx.sulk(); scene('torch',4.4,{});
      path(fx,5.6,(q,c)=>{ if(q<.72) return {frame:Math.floor(c.t*2)%2?c.sp.expr:c.sp.idle,cx:c.origX-10}; return {frame:c.sp.celeb,base:c.origBase-Math.round(Math.abs(Math.sin(c.t*11))*18),cx:c.origX}; }); },
    700,()=>{ const p=rose(); bt('ONCE UPON',Math.round(p.cx/3)-46,Math.round((p.base-p.h)/3)-26,'#fff1cb',2,1.1); bt('A TIME...',Math.round(p.cx/3)-44,Math.round((p.base-p.h)/3)-18,'#fff1cb',2,1.1); },
    1000,()=>{ const p=rose(); bt('THE SOCK',Math.round(p.cx/3)-46,Math.round((p.base-p.h)/3)-26,'#ffb3cf',2,1.1); bt('MONSTER...',Math.round(p.cx/3)-48,Math.round((p.base-p.h)/3)-18,'#ffb3cf',2,1.1); scene('shadowmon',3.2,{}); sfx.charge(); },
    1300,()=>{ scene('yikes',1.4,{c:'#9fd8ff'}); sfx.stun(); },
    500,()=>{ sfx.roar(); battle.enemyWobble=1.0; battle.shakeEnemy=.7; battle.enemyKnock=.45; battle.flashEnemy=.4; scene('flash',.4,{a:.6,c:'#fff6c8'}); scene('burst',.7,{x:EX()+10,y:top()+30,r:90,n:14,c:'#9fd8ff',c2:'#fff6c8'}); bt('AAAAH',36,26,'#9fd8ff',6,1.2); hit(E2); },
    1000,()=>{ sfx.giggle(); bt('JUST KIDDING',20,44,'#ffb3cf',3,1.2); sfx.giggle(); },
    1100,E2.result+' The Grump wants a night light now.',()=>checkEnemy()); };
// Lamby Stampede: Rose holds Lamby to the sky. Lamby calls the flock. The flock arrives. The Grump counts sheep.
Rm.stampede=E2=>{ const {fx,dmg,crit}=E2,hits=split(dmg,5);
  enqueue(()=>{ setMessage('Rose lifts Lamby high. Lamby’s eyes begin to glow. Somewhere, a hundred lambs look up.'); say('rose','stampede',.2); scene('lambyHold',2.4,{up:true,glow:true}); sfx.charge();
      path(fx,6.0,(q,c)=>{ if(q<.4) return {frame:c.sp.celeb,base:c.origBase-Math.round(ez(cl((q-.2)/.1))*8)}; if(q<.9) return {frame:Math.floor(c.t*8)%2?c.sp.celeb:c.sp.celebFlip,base:c.origBase-Math.round(Math.abs(Math.sin(c.t*12))*18)}; return {frame:c.sp.celeb}; }); },
    1300,()=>{ sfx.baa(); bt('BAAAA',60,24,'#fff8f0',5,1.0); },
    800,()=>{ sfx.baa(); sfx.baa(.3); scene('stampede',3.2,{}); sfx.hooves(14); battle.shakeEnemy=.3; scene('dust',1.2,{x:420,y:266,n:9,sp:26,up:10}); },
    700,...[0,1,2,3,4].flatMap(k=>[k===0?0:330,()=>{ sfx.bonk(); battle.shakeEnemy=.35; battle.enemyWobble=.4; scene('dust',.5,{x:GX,y:262,n:6,sp:18,up:12}); hit(E2,hits[k],k===4&&crit); if(k===4) { sfx.hooves(6); bt('STAMPEDE',32,30,'#ffe08a',4,1.1); } }]),
    800,()=>{ sfx.baa(); scene('zz',2.0,{}); confuse(); battle.flashEnemy=.3; bt('1 SHEEP... 2 SHEEP...',8,50,'#fff8f0',2,1.6); },
    1300,E2.result+' The Grump is counting sheep.',()=>checkEnemy()); };
})();

// ================= Option 3 Primary kit (phase 3c) =================
// Cards: adventures-of-tom-ability-revamp.md (Rose). Same beat plan as Tom's and Grace's kits: beat 1 setup (0.5 s),
// beat 2 impact about 1.05 s in (inside the High-Five window, engine/feel.js B7_HF), beat 3 the small joke.
// Scenes drawn at real unit positions are in B2_NOWARP so the aim warp does not move them twice.
(function(){
const SC=RFX.SC,{scene,GX,GY}=RFX;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,rx,ry,c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const env=(u,a=.15,b=.85)=>u<a?u/a:(u>b?(1-u)/(1-b):1);
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const bt=(txt,x,y,c,sc,dur=1)=>battle.texts.push({txt,x,y,color:c,sc,t:0,dur});
const hit=E2=>landHit(E2.dmg,E2.crit);
const gpos=()=>battle.actorPos||{cx:516,base:309,h:68};
const hand=()=>{ const p=gpos(); return {x:p.cx-16,y:p.base-Math.round(p.h*.5)}; };
const toss=(kind,x0,y0,x1,y1,delay,dur,arc=60,extra={})=>battle.props.push(Object.assign({kind,x0,y0,x1,y1,arc,spin:true,t:-delay,dur},extra));
const pose=(fx,k,d)=>{ fx.poseK=k; fx.pose=d; };
const home=u=>{ if(u.side==='foe') { const p=b2FoeCanvasPos(u); return {x:p.x,base:p.y,h:p.h}; } const q=BATTLE_POS[u.idx],sp=BATTLE_SPRITES[u.id]; return {x:q.x*3,base:q.base*3,h:sp?sp.idle.length*sp.scale:90}; };
const top=()=>battle.enemyTop||177;
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const foesOf=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const box=list=>{ const P=list.map(f=>b2FoeCanvasPos(f)); if(!P.length) return {x0:GX-40,x1:GX+40,y0:GY-50,y1:GY+40};
  return {x0:Math.min(...P.map(p=>p.x-p.w/2)),x1:Math.max(...P.map(p=>p.x+p.w/2)),y0:Math.min(...P.map(p=>p.y-p.h)),y1:Math.max(...P.map(p=>p.y))}; };
// Lamby, drawn by the prop (the plush lives in the first IIFE). sc scales from the prop's own size.
const lamby=(x,y,sc=.6,flip=false)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); PROP2.lamby({flip},0); gfx.restore(); };
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',PURP='#c9a6f0',JELLY='#ff9ac0';
const Rm=RECRUIT_MOVES.rose;
const IMPACT=550;   // ms after beat 2 starts (beat 1 is 500)
const UI=1.05/1.8;  // where the impact sits in a 1.8 s scene started on beat 1
const NW_LIST=[];
const nowarp=(...k)=>NW_LIST.push(...k);
const NW=()=>{ if(typeof B2_NOWARP!=='undefined') for(const x of NW_LIST) B2_NOWARP.add(x); };
nowarp('r_pinch','r_breath','r_giggles','r_hands','r_tiara','r_cup','r_appt','r_sticker','r_jellyfloor','r_telescope','r_cushion','r_spool','r_ribbontip','r_book','r_pocketfan','r_parasol','r_warmside');

// ---------- Scenes ----------
// Tiny Tap: a minuscule gap between finger and thumb by her hand, then a huge IMPORTANCE stamp behind a tiny contact dot.
SC.r_pinch=(s,u)=>{ const p=hand(),x=p.x-6,y=p.y-10; gfx.globalAlpha=fade(u,.8); E(x,y-6,4,4,OUT); E(x,y-6,2.5,2.5,'#f6d4b8'); E(x,y+6,4,4,OUT); E(x,y+6,2.5,2.5,'#f6d4b8');
  Ln(x+10,y-5,x+10,y+5,1.5,CREAM); Ln(x+7,y-5,x+13,y-5,1.5,CREAM); Ln(x+7,y+5,x+13,y+5,1.5,CREAM); label('1 MM',x+28,y-3,CREAM,1); };
SC.r_stamp=(s,u)=>{ const x=GX,y=GY-24,pop=u<.2?ez(u/.2)*1.3:lerp(1.3,1,cl((u-.2)/.15)); gfx.globalAlpha=fade(u,.7); gfx.save(); gfx.translate(x,y); gfx.rotate(-.18); gfx.scale(pop,pop);
  gfx.strokeStyle=OUT; gfx.lineWidth=10; gfx.strokeRect(-60,-22,120,44); gfx.strokeStyle='#e0402e'; gfx.lineWidth=6; gfx.strokeRect(-60,-22,120,44); gfx.globalAlpha*=.85; label('IMPORTANCE',0,-4,'#e0402e',2); gfx.restore();
  E(x,y+30,5,5,OUT); E(x,y+30,3,3,GOLD); };

// SILLY: a very serious breath (puffed cheeks ring), a wobbly tongue-shaped sound ring flops over the target, an amused face.
SC.r_breath=(s,u)=>{ const p=gpos(),x=p.cx+4,y=p.base-p.h*.78,g=ez(u/.5); gfx.globalAlpha=fade(u,.8)*.8; ring(x,y,10+g*8,8+g*6,3,CREAM); if(u>.5) label('AHEM',x,y-22,CREAM,1); };
SC.r_rasp=(s,u)=>{ const x=GX,y=GY-20,w=ez(u/.3); gfx.globalAlpha=fade(u,.8);
  for(let k=0;k<4;k++) { const q=cl((u-k*.08)/.5),wob=Math.sin(s.t*14+k)*5*w; gfx.save(); gfx.translate(x-46+k*26,y+wob); gfx.rotate(Math.sin(s.t*9+k)*.3); EO(0,0,13*q,19*q,'#ff8aa8'); Ln(0,-8*q,0,8*q,2,'#d64a74'); gfx.restore(); }
  if(u>.55) { gfx.globalAlpha=fade(u,.8); label('PBBBT',x,y-44,PINK,2); } };

// Where Did I Go?: two very small hands over her eyes (nothing else hidden); a huge question mark turns the target the wrong way.
SC.r_hands=(s,u)=>{ const p=gpos(),x=p.cx-2,y=p.base-p.h*.74,g=ez(u/.2),rev=u>.72?ez((u-.72)/.15):0; gfx.globalAlpha=fade(u,.92);
  const dx=lerp(0,14,rev); EO(x-8-dx,y+rev*6,7*g,6*g,'#f6d4b8'); EO(x+8+dx,y+rev*6,7*g,6*g,'#f6d4b8'); if(rev>.8) label('TA-DA',x,y-24,PINK,1); };
SC.r_qmark=(s,u)=>{ const x=GX+40,y=top()-30,g=ez(u/.25),sw=Math.sin(s.t*3)*.15; gfx.globalAlpha=fade(u,.75); gfx.save(); gfx.translate(x,y); gfx.rotate(sw); gfx.scale(g,g);
  gfx.strokeStyle=OUT; gfx.lineWidth=14; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(0,-18,16,Math.PI*1.1,Math.PI*2.35); gfx.lineTo(0,10); gfx.stroke(); gfx.strokeStyle=GOLD; gfx.lineWidth=8; gfx.beginPath(); gfx.arc(0,-18,16,Math.PI*1.1,Math.PI*2.35); gfx.lineTo(0,10); gfx.stroke();
  E(0,24,7,7,OUT); E(0,24,4,4,GOLD); gfx.restore(); if(u>.4&&u<.72) { LnO(x-30,y+40,x+6,y+40,3,CREAM); LnO(x+6,y+40,x-2,y+34,3,CREAM); LnO(x+6,y+40,x-2,y+46,3,CREAM); } };

// Royal Inspection: a crooked tiara straightened and a soft scepter in her hand; a TOO POKY tag springs out of the seam, then flips to a heart.
SC.r_tiara=(s,u)=>{ const p=gpos(),x=p.cx,y=p.base-p.h-6,tilt=lerp(.35,0,ez(u/.3)); gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(.5,.5); PROP2.tiara({},0); gfx.restore();
  const h=hand(); gfx.save(); gfx.translate(h.x-4,h.y-6); gfx.rotate(-.5-Math.sin(s.t*2)*.1); RO(-3,-30,6,34,PURP); EO(0,-34,8,8,GOLD); E(-2,-36,2,2,CREAM); gfx.restore(); };
SC.r_pokytag=(s,u)=>{ const x=GX+30,y=GY-30,g=ez(u/.2),flip=u>.6?ez((u-.6)/.2):0,w=36*Math.abs(Math.cos(flip*Math.PI)); gfx.globalAlpha=fade(u,.88);
  Ln(GX+8,GY-12,x,y+10,2,'#8a7a90'); gfx.save(); gfx.translate(x,y); gfx.rotate(.25); gfx.scale(g,g); RO(-w/2,-14,w,28,flip>.5?PINK:'#f1d58c'); E(-w/2+6,-8,2.5,2.5,OUT);
  if(w>20) { if(flip<.5) { label('TOO',4,-7,'#7a1a14',1); label('POKY',4,2,'#7a1a14',1); } else heart(2,-2,7,'#ff6b9a'); } gfx.restore(); };

// Giggle Echo: a paper cup held sideways by her mouth; three numbered giggle bubbles rebound across the row; the last puffs.
SC.r_cup=(s,u)=>{ const p=gpos(),x=p.cx-20,y=p.base-p.h*.72; gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(x,y); gfx.rotate(-1.3); RO(-7,-12,14,24,CREAM); R(-7,-12,14,4,PINK); gfx.restore(); };
SC.r_giggles=(s,u)=>{ const B=box(s.foes||[]),p=gpos(); gfx.globalAlpha=fade(u,.9);
  for(let k=0;k<3;k++) { const q=cl((u-k*.14)/.5); if(q<=0) continue; const x=lerp(p.cx-30,lerp(B.x0,B.x1,k/2),ez(q)),y=lerp(p.base-p.h*.7,B.y0+10,ez(q))-Math.abs(Math.sin(q*Math.PI*2))*30,r=12+k*3;
    if(k===2&&q>=1) { const pf=cl((u-.78)/.2); gfx.globalAlpha=fade(u,.9)*(1-pf); ring(x,y,r+pf*20,r+pf*20,3,CREAM); gfx.globalAlpha=fade(u,.9); continue; }
    EO(x,y,r,r*.85,k===1?PINK:CREAM); label(''+(k+1),x,y-3,'#2b2a26',1); if(q>.5&&q<1) label('HA',x,y-r-10,PINK2,1); } };

// Lamby's Appointment: Lamby behind an APPOINTMENTS sign with a clipboard by the recipient; a CUDDLES box gets checked; a sticker.
SC.r_appt=(s,u)=>{ const x=s.x+(s.foe?48:-48),y=s.y+8; gfx.globalAlpha=fade(u,.9);
  RO(x-26,y+14,52,14,'#e8cfa0'); label('APPTS',x,y+18,'#2b2a26',1); lamby(x,y-2,.5,!s.foe);
  const bx=x+(s.foe?-34:34),by=y-10; RO(bx-12,by-16,24,32,'#9fc4f0'); R(bx-9,by-13,18,26,CREAM); R(bx-5,by-19,10,5,'#6a6f7a');
  label('CUDDLES',bx,by-6,'#2b2a26',1); gfx.strokeStyle='#2b2a26'; gfx.lineWidth=1.5; gfx.strokeRect(bx-5,by+1,8,8); if(u>UI-.02) check(bx-1,by+4,3,'#2f9a4a'); };
SC.r_sticker=(s,u)=>{ const x=s.x,y=s.y-s.h*.7,g=ez(u/.2); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(-.3); gfx.scale(g,g); EO(0,0,14,10,GOLD); label('GOOD',0,-3,'#7a4a10',1); gfx.restore(); heart(x+16,y-12,4,'#ff6b9a'); };

// The Floor Is Jelly: a jelly-shaped outline under the row that gives one huge wobble; soft blobs under each target; a toe pat.
SC.r_jellyfloor=(s,u)=>{ const B=box(s.foes||[]),cx=(B.x0+B.x1)/2,w=(B.x1-B.x0)/2+30,draw=ez(u/.3),wob=u>UI-.04&&u<UI+.22?Math.sin(cl((u-UI+.04)/.26)*Math.PI*3)*(1-cl((u-UI+.04)/.26)):0;
  gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(cx,B.y1+8); gfx.scale(1+wob*.12,1-wob*.3);
  gfx.strokeStyle=OUT; gfx.lineWidth=7; gfx.beginPath(); gfx.ellipse(0,0,w*draw+.1,14*draw+.1,0,0,Math.PI*2); gfx.stroke(); gfx.strokeStyle=JELLY; gfx.lineWidth=4; gfx.beginPath(); gfx.ellipse(0,0,w*draw+.1,14*draw+.1,0,0,Math.PI*2); gfx.stroke();
  gfx.globalAlpha*=.35; E(0,0,w*draw+.1,14*draw+.1,JELLY); gfx.restore();
  if(u>UI&&u<UI+.3) { gfx.globalAlpha=fade(u,.9); for(const f of (s.foes||[])) { const c=b2FoeCanvasPos(f),q=cl((u-UI)/.3); EO(c.x,c.y-6,22*(1+q*.4),8*(1-q*.6)+.1,JELLY); } }
  if(u>.72) { gfx.globalAlpha=fade(u,.9); label('WOBBLE',cx,B.y0-24,JELLY,2); } };

// Lookout Lamby: a backwards toy telescope at Lamby's face by her hand; a padded pennant taps the enemy; a lookout cushion if Tom is away.
SC.r_telescope=(s,u)=>{ const p=hand(),x=p.x-10,y=p.y-8; gfx.globalAlpha=fade(u,.85); lamby(x,y,.5,false);
  gfx.save(); gfx.translate(x+18,y-10); gfx.rotate(-.4); RO(0,-5,22,10,'#6a6f7a'); RO(22,-7,10,14,'#9aa3c8'); R(-2,-3,4,6,'#2b2a26'); gfx.restore(); if(u>.3) label('BACKWARDS',x+30,y-34,CREAM,1); };
SC.r_pennant=(s,u)=>{ const x=GX+20,y=top()-6,q=ez(u/.25),sw=u>UI-.02&&u<UI+.15?Math.sin(cl((u-UI+.02)/.17)*Math.PI)*.7:0; gfx.globalAlpha=fade(u,.85); gfx.save(); gfx.translate(x,y); gfx.rotate(-.6+sw);
  RO(-2,-60*q,4,60*q+.1,'#e8cfa0'); gfx.beginPath(); gfx.moveTo(2,-60*q); gfx.lineTo(44*q,-48*q); gfx.lineTo(2,-36*q); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=PINK; gfx.fill(); gfx.restore();
  if(sw>.5) label('BONK',x,y-80,GOLD,2); };
SC.r_cushion=(s,u)=>{ const p=gpos(),g=ez(u/.3); gfx.globalAlpha=fade(u,.85); EO(p.cx,p.base+4,34*g+.1,10*g+.1,PURP); for(let k=0;k<4;k++) E(p.cx-24+k*16,p.base+2,3,3,CREAM); if(u>.4) label('LOOKOUT',p.cx,p.base-p.h-18,PURP,1); };

// Ribbon Rescue: a spool rolls toward the wind-up icon, a bow ties around it and tugs it flat; the ribbon tip points at the most hurt ally.
SC.r_spool=(s,u)=>{ const p=gpos(),T=s.foe?home(s.foe):{x:GX,base:GY+30,h:80},x0=p.cx-20,x1=T.x,q=ez(cl(u/UI)),x=lerp(x0,x1,q),y=p.base+4; gfx.globalAlpha=fade(u,.9);
  Ln(x0,y-2,x,y-2,3,PINK); gfx.save(); gfx.translate(x,y-8); gfx.rotate(q*9); RO(-8,-8,16,16,PINK); R(-8,-3,16,6,PINK2); gfx.restore();
  if(u>UI-.05) { const b=ez((u-UI+.05)/.15),bx=T.x,by=T.base-T.h-18-b*0; EO(bx-10,by,9*b,6*b,PINK); EO(bx+10,by,9*b,6*b,PINK); E(bx,by,4*b,4*b,OUT); E(bx,by,2.5*b,2.5*b,PINK2); Ln(bx-4,by+4,bx-8,by+16*b,3,PINK); Ln(bx+4,by+4,bx+8,by+16*b,3,PINK); if(b>.9&&u<UI+.3) label('TIED',bx,by-18,PINK,1); } };
SC.r_ribbontip=(s,u)=>{ const x=s.x+26,y=s.base-s.h*.5,g=ez(u/.3); gfx.globalAlpha=fade(u,.8); LnO(x+30,y-30*g,x+8*g,y-8*g,3,PINK); LnO(x+8,y-8,x+16,y-8,3,PINK); LnO(x+8,y-8,x+8,y-16,3,PINK); if(g>.9) label('YOU NEXT',x+40,y-44,PINK,1); };

// Lamby Fixes the Ending: a little picture book by the recipient with a cold frown; Lamby's hoof rotates it to a warm sun.
SC.r_book=(s,u)=>{ const x=s.x+(s.foe?46:-46),y=s.y-6,rot=u<UI-.04?0:ez((u-UI+.04)/.2)*Math.PI; gfx.globalAlpha=fade(u,.92);
  gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-22,-16,44,32,'#5a8ad0'); R(-20,-14,19,28,CREAM); R(1,-14,19,28,CREAM); R(-1,-16,2,32,OUT);
  const warm=rot>Math.PI/2; if(!warm) { gfx.strokeStyle='#2f6fb0'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(10,2,6,Math.PI*1.15,Math.PI*1.85); gfx.stroke(); E(7,-6,1.5,1.5,'#2f6fb0'); E(13,-6,1.5,1.5,'#2f6fb0'); }
  else { gfx.rotate(Math.PI); E(-10,0,7,7,GOLD); for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(-10+Math.cos(a)*9,Math.sin(a)*9,-10+Math.cos(a)*12,Math.sin(a)*12,2,GOLD); } gfx.strokeStyle='#c2561e'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.arc(-10,1,3,Math.PI*.15,Math.PI*.85); gfx.stroke(); }
  gfx.restore(); lamby(x+(s.foe?-28:28),y+10,.42,s.foe); if(u>UI+.05) { gfx.globalAlpha=fade(u,.92); for(let k=0;k<5;k++) { const fy=s.y-10+((u*60+k*14)%50); R(s.x-16+k*8,fy,4,4,'#e8b048'); } } };

// Pocket Princess: a minuscule folded fan from a pocket opens sideways into three enormous royal crests that clap across the row.
SC.r_pocketfan=(s,u)=>{ const p=hand(),x=p.x-6,y=p.y-6,B=box(s.foes||[]),open=u<.3?0:ez((u-.3)/(UI-.3)),back=u>.8?ez((u-.8)/.15):0; gfx.globalAlpha=fade(u,.95);
  if(u<.3||back>.95) { RO(x-4,y-6,8,12,PURP); R(x-2,y-4,4,8,GOLD); if(u<.3) label('TINY',x,y-20,CREAM,1); return; }
  const sc=open*(1-back); for(let k=0;k<3;k++) { const cx=lerp(x,lerp(B.x0,B.x1,k/2),sc),cy=lerp(y,B.y0-6,sc),r=4+34*sc; gfx.save(); gfx.translate(cx,cy); gfx.rotate((k-1)*.25*sc);
    gfx.beginPath(); gfx.moveTo(0,0); gfx.arc(0,0,r,Math.PI*1.15,Math.PI*1.85); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=k===1?GOLD:PURP; gfx.fill();
    for(let j=0;j<5;j++) { const a=Math.PI*(1.15+j*.175); Ln(0,0,Math.cos(a)*r,Math.sin(a)*r,1.5,OUT); } if(r>24) { E(0,-r*.6,5,5,OUT); E(0,-r*.6,3,3,PINK); } gfx.restore(); }
  if(open>.95&&!back) label('ROYAL',(B.x0+B.x1)/2,B.y0-56,GOLD,2); };

// Princess Parasol: a lace-edged parasol with a painted sun outside; turned inside out, the sun warms the friends under a clear outline.
SC.r_parasol=(s,u)=>{ const p=hand(),x=p.x,y=p.y-50,flip=u<UI-.06?0:ez((u-UI+.06)/.14),sq=Math.cos(flip*Math.PI); gfx.globalAlpha=fade(u,.9);
  RO(x-2,y,4,52,'#8a5a30'); gfx.save(); gfx.translate(x,y); gfx.scale(1,Math.max(.12,Math.abs(sq)));
  gfx.beginPath(); gfx.moveTo(-42,0); gfx.quadraticCurveTo(0,-44,42,0); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=sq>0?PINK:GOLD; gfx.fill();
  for(let k=0;k<7;k++) E(-36+k*12,0,5,4,CREAM); if(sq>0) { E(0,-18,8,8,GOLD); } else { E(0,-18,8,8,'#ffb45a'); for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(Math.cos(a)*11,-18+Math.sin(a)*11,Math.cos(a)*15,-18+Math.sin(a)*15,2,'#ffb45a'); } }
  gfx.restore(); if(flip>.95) label('INSIDE OUT',x,y-52,GOLD,1); };
SC.r_warmside=(s,u)=>{ const x=s.x,y=s.y,g=ez(u/.25); gfx.globalAlpha=fade(u,.75); E(x,y,34*g,46*g,'rgba(255,200,90,.2)'); ring(x,y,34*g,46*g,3,GOLD);
  for(let k=0;k<4;k++) { const a=s.t*3+k*Math.PI/2; R(x+Math.cos(a)*30*g-2,y+Math.sin(a)*40*g-2,4,4,CREAM); } if(s.first&&u>.3) heart(x,y-s.h*.7-6,5,'#ff6b9a'); };

// ---------- Moves ----------
Rm.tiny_tap=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose measures the gap very carefully.'); say('rose','tiny_tap'); scene('r_pinch',.9,{}); pose(fx,'expr',.5); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ scene('r_stamp',.9,{}); pose(fx,'act',.4); sfx.boop?sfx.boop():sfx.bonk(); battle.shakeEnemy=.2; hit(E2); },
    350,()=>{ pose(fx,'celeb',.6); },
    400,res(E2)+'Rose considers this a major intervention.',()=>checkEnemy()); };
Rm.sillyShow=E2=>{ const {m,fx}=E2,t=E2.targets[0];
  enqueue(()=>{ setMessage('Rose takes an extravagantly serious breath.'); say('rose','silly',.6); scene('r_breath',.9,{}); pose(fx,'expr',.8); sfx.charge(); },
    500,()=>{ fx.tongue=1.4; sfx.raspberry(); scene('r_rasp',1.1,{}); b7Later(()=>sfx.raspberry(),420); },
    IMPACT,()=>{ E2.apply(); sfx.boing(); battle.enemyWobble=.6; },
    500,()=>{ pose(fx,'celeb',.6); sfx.giggle(); },
    300,t&&t.st.goofed?'Rose has made an excellent point. Goofed!':(t?cap(t.def.the)+' is unmoved. Mostly.':'Pbbbt.'),()=>checkEnemy()); };
Rm.where_did_i_go=E2=>{ const {fx}=E2,t=E2.targets[0];
  enqueue(()=>{ setMessage('Rose hides her eyes. Only her eyes.'); say('rose','where_did_i_go'); scene('r_hands',1.8,{}); pose(fx,'expr',1.0); },
    500,()=>{ scene('r_qmark',1.1,{}); sfx.slideWhistle(); },
    IMPACT,()=>{ E2.apply(); sfx.ding(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.giggle(); },
    300,kindLine(t,'The disguise is completely transparent.'),()=>checkEnemy()); };
Rm.royal_inspection=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose straightens her tiara. This is official.'); say('rose','royal_inspection'); scene('r_tiara',1.8,{}); pose(fx,'expr',.9); },
    500,()=>{ sfx.whoosh(); },
    IMPACT,()=>{ scene('r_pokytag',1.0,{}); pose(fx,'act',.4); sfx.bonk(); battle.shakeEnemy=.35; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,res(E2)+'The armor fails the princess test.',()=>checkEnemy()); };
Rm.giggle_echo=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose giggles into a paper cup held sideways.'); say('rose','giggle_echo'); scene('r_cup',.9,{}); pose(fx,'expr',.9); sfx.giggle(); },
    500,()=>{ scene('r_giggles',1.3,{foes:foesOf(E2)}); sfx.giggle(); },
    IMPACT-200,()=>{ sfx.bonk(); battle.shakeEnemy=.25; landHit(34); },
    200,()=>{ sfx.bonk(); battle.shakeEnemy=.3; landHit(33); },
    200,()=>{ sfx.bonk(); battle.shakeEnemy=.35; landHit(33); },
    400,()=>{ pose(fx,'celeb',.5); sfx.giggle(); },
    300,res(E2)+'The echo finds the joke even funnier.',()=>checkEnemy()); };
Rm.lamby_appointment=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Lamby is seeing patients. The waiting room is a cushion.'); say('rose','lamby_appointment'); scene('r_appt',1.8,{x:h.x,y:h.base-h.h*.6,foe:t.side==='foe'}); pose(fx,'expr',.9); },
    500,()=>{ sfx.select(); },
    IMPACT,()=>{ E2.apply(); sfx.baa(); sfx.heal(); },
    500,()=>{ scene('r_sticker',1.0,{x:h.x,y:h.base,h:h.h}); pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'The prescription is remarkably soft.'),()=>checkEnemy()); };
Rm.floor_is_jelly=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose stamps once. New rule: the floor is jelly.'); say('rose','floor_is_jelly'); scene('r_jellyfloor',1.9,{foes:foesOf(E2)}); pose(fx,'act',.5); sfx.thud(); },
    500,()=>{ sfx.charge(); },
    IMPACT,()=>{ sfx.boing(); sfx.bonk(); battle.enemyWobble=.9; battle.shakeEnemy=.4; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); sfx.boing(); },
    300,res(E2)+'The rule is new but immediately binding.',()=>checkEnemy()); };
Rm.lookout_lamby=E2=>{ const {m,fx}=E2,tom=B2.party.find(p=>p.id==='tom'&&b2Alive(p));
  enqueue(()=>{ setMessage('Lamby takes the telescope. It is backwards. Lamby is confident.'); say('rose','lookout_lamby'); scene('r_telescope',1.0,{}); pose(fx,'expr',.9); },
    500,()=>{ scene('r_pennant',1.1,{}); sfx.whoosh(); },
    IMPACT,()=>{ sfx.bonk(); sfx.baa(); battle.shakeEnemy=.35; hit(E2); },
    400,()=>{ E2.apply(); if(!tom) scene('r_cushion',1.1,{}); pose(fx,'celeb',.6); sfx.boing(); },
    400,res(E2)+(tom?'Lamby has spotted something extremely bonkable. Rose is up on Tom.':'Lamby has spotted something extremely bonkable.'),()=>checkEnemy()); };
Rm.ribbon_rescue=E2=>{ const {fx}=E2,t=foesOf(E2)[0];
  enqueue(()=>{ setMessage('A ribbon spool rolls toward the wind-up.'); say('rose','ribbon_rescue'); scene('r_spool',1.9,{foe:t}); pose(fx,'act',.6); sfx.whoosh(); },
    500,()=>{ sfx.slideWhistle(); },
    IMPACT,()=>{ sfx.bonk(); battle.enemyKnock=.25; battle.shakeEnemy=.35; hit(E2); },
    300,()=>{ E2.apply(); const low=b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(low) { const h=home(low); scene('r_ribbontip',1.1,{x:h.x,base:h.base,h:h.h}); } pose(fx,'celeb',.5); sfx.ding(); },
    500,res(E2)+'The ribbon has become a safety feature.',()=>checkEnemy()); };
Rm.lamby_ending=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,h=home(t);
  enqueue(()=>{ setMessage('Rose opens a little picture book. The ending looks cold.'); say('rose','lamby_ending'); scene('r_book',1.8,{x:h.x,y:h.base-h.h*.55,foe:t.side==='foe'}); pose(fx,'expr',.9); },
    500,()=>{ sfx.select(); },
    IMPACT,()=>{ E2.apply(); sfx.baa(); sfx.heal(); },
    500,()=>{ pose(fx,'celeb',.5); sfx.ding(); },
    300,kindLine(t,'The happy ending was facing the wrong way.'),()=>checkEnemy()); };
Rm.pocket_princess=E2=>{ const {fx}=E2;
  enqueue(()=>{ setMessage('Rose pulls a very small fan out of a very small pocket.'); say('rose','pocket_princess'); scene('r_pocketfan',1.9,{foes:foesOf(E2)}); pose(fx,'expr',.6); },
    500,()=>{ pose(fx,'act',.6); sfx.whoosh(); sfx.charge(); },
    IMPACT,()=>{ sfx.bonk(); sfx.ding(); battle.flashEnemy=.3; battle.shakeEnemy=.45; hit(E2); },
    500,()=>{ pose(fx,'celeb',.5); },
    300,res(E2)+'The royal entrance exceeds its advertised size.',()=>checkEnemy()); };
Rm.princess_parasol=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),tom=who.find(u=>u.id==='tom');
  enqueue(()=>{ setMessage('Rose opens a parasol. The sun is painted on the outside. For now.'); say('rose','princess_parasol'); scene('r_parasol',1.8,{}); pose(fx,'expr',1.0); },
    500,()=>{ sfx.slideWhistle(); },
    IMPACT,()=>{ E2.apply(); for(const u of who) { const h=home(u); scene('r_warmside',1.1,{x:h.x,y:h.base-h.h*.5,h:h.h,first:u===tom}); } sfx.ding(); sfx.heal(); },
    500,()=>{ for(const u of who) if(u.side==='party'&&u!==m) battle.fx[u.idx].hop=.25; pose(fx,'celeb',.5); },
    300,who.some(u=>u.side==='foe')?kindLine(who.find(u=>u.side==='foe')):'Rose puts the warm part where her friends are.',()=>checkEnemy()); };
// Every move registers the unwarped scenes first (see NW above).
for(const k of ['tiny_tap','sillyShow','where_did_i_go','royal_inspection','giggle_echo','lamby_appointment','floor_is_jelly','lookout_lamby',
  'ribbon_rescue','lamby_ending','pocket_princess','princess_parasol']) { const f=Rm[k]; Rm[k]=E2=>{ NW(); return f(E2); }; }
})();

// ================= Option 3 set pieces (animation quality pass, 2026-10-24) =================
// Replaces the phase-3c animations above (1.6 s beats from her stance) with 3.5 to 5 s set pieces on engine/stage.js,
// the standard TNB's and Nara's moves use: Rose walks, sneaks, jumps, rolls about laughing and carries Lamby, then goes
// home. Timelines are absolute ms at 1x (RFX.ST.play); ['hf',ms] marks the impact. Scenes are real coordinates, prefix ro_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const poly=(pts,c,o=true)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); if(o) { gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); } gfx.fillStyle=c; gfx.fill(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const check=(x,y,s,c)=>{ LnO(x-s,y,x-s*.3,y+s*.7,s*.45,c); LnO(x-s*.3,y+s*.7,x+s,y-s*.8,s*.45,c); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',PURP='#c9a6f0',JELLY='#ff9ac0',RED='#e0402e',SKIN='#f6d4b8',SKY='#9fd8ff';
ST.nw('ro_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const foes=E2=>(E2.targets||[]).filter(t=>t.side==='foe');
const front=(F,gap=26)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const rowSpot=(G,gap=44)=>({x:Math.min(552,G.x1+gap),y:Math.min(314,G.base+6)});
const spotFor=(m,t,gap=24)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:u.base+3}; };
const plush=(x,y,sc,o)=>RFX.plush(x,y,sc,o||{});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const RSP=()=>BATTLE_SPRITES.rose,RH=()=>RSP().idle.length*RSP().scale,RW=()=>RSP().idle[0].length*RSP().scale;
const lieDy=()=>RH()*.5-RW()*.5+2;   // lying on her back: lower the rotated body onto the floor
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const all=list=>{ for(const f of list) ST.jolt(f,.4); };
const tomUp=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };

// ---------- Shared scenes ----------
SC.ro_text=(s,u)=>{ gfx.globalAlpha=fin(u,.1)*fade(u,.8); let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-30); x=p.x; y=p.y; } label(s.txt,x,y-ez(u/.3)*8,s.c||CREAM,s.sc||2); };
SC.ro_poof=(s,u)=>{ for(let k=0;k<(s.n||8);k++) { const a=k/(s.n||8)*Math.PI*2+s.seed,d=ez(u)*(s.r||26); gfx.globalAlpha=1-u; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.6,4*(1-u)+1,4*(1-u)+1,s.c||CREAM); } };
SC.ro_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); };
SC.ro_heart=(s,u)=>{ gfx.globalAlpha=fade(u,.75); heart(s.x,s.y-ez(u)*18,s.r||6,'#ff6b9a'); };
SC.ro_flakes=(s,u)=>{ for(let k=0;k<8;k++) { const q=cl(u*1.3-k*.04),x=s.x-18+k*5+Math.sin(k*2.3+q*4)*6,y=s.y-s.h*.7+q*(s.h*.7); gfx.globalAlpha=1-q; R(x,y,4,4,k%2?'#e8b048':'#ffd27a'); } };
// Lamby carried in Rose's arms (follows her hand); s.until (ms after the scene starts) puts him down.
SC.ro_carry=(s,u)=>{ const ms=s.t*1000; if((s.until&&ms>s.until)||(s.from&&ms<s.from)) return; const h=hand(); gfx.globalAlpha=1; plush(h.x+(s.dx||-2),h.y+(s.dy||6),s.sc||.85,{pose:'held',rot:.35}); };
// Lamby sitting on Rose's head (lookout post).
SC.ro_lambyhead=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,-12); gfx.globalAlpha=fade(u,.96); plush(p.x+2,p.y,.62,{pose:'held',glow:s.glow}); };

// ---------- Tiny Tap ----------
SC.ro_pinch=(s,u)=>{ const p=hand(),x=p.x-8,y=p.y-14,g=ez(u/.3); gfx.globalAlpha=fade(u,.8); EO(x,y-6+g*3,4,4,SKIN); EO(x,y+6-g*3,4,4,SKIN);
  Ln(x+11,y-4,x+11,y+4,1.5,CREAM); Ln(x+8,y-4,x+14,y-4,1.5,CREAM); Ln(x+8,y+4,x+14,y+4,1.5,CREAM); label('1 MM',x+30,y-3,CREAM,1); };
SC.ro_stamp=(s,u)=>{ const pop=u<.15?ez(u/.15)*1.35:lerp(1.35,1,cl((u-.15)/.12)); gfx.globalAlpha=fade(u,.7); gfx.save(); gfx.translate(s.x,s.y); gfx.rotate(-.18); gfx.scale(pop*.85,pop*.85);
  gfx.strokeStyle=OUT; gfx.lineWidth=10; gfx.strokeRect(-62,-22,124,44); gfx.strokeStyle=RED; gfx.lineWidth=6; gfx.strokeRect(-62,-22,124,44); label('IMPORTANCE',0,-4,RED,2); gfx.restore();
  };
Rm.tiny_tap=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,22);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:7,hn:7},{t:1150,x:p.x,y:p.y,f:'expr'},{t:1650,f:'expr',dx:u=>-ez(u)*8},{t:1750,f:'act',dx:-10},{t:2050,f:'act',dx:u=>-10+ez(u)*10},
    {t:2500,f:'idle'},{t:2750,f:'celeb',hop:12},{t:3000,f:'runR'},{t:3650,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose tiptoes over. This requires precision.'); say(m.id,'tiny_tap'); }],
    [1150,()=>{ scene('ro_pinch',.6,{}); sfx.select(); }],
    ['hf',1750],
    [1750,()=>{ sfx.boop?sfx.boop():sfx.bonk(); ST.jolt(f,.2); scene('ro_stamp',1.1,{x:F.x-6,y:F.top-14,back:true}); landHit(100); }],
    [2050,()=>{ scene('ro_text',.5,{st,txt:'...',sc:2}); }],
    [2500,()=>{ scene('ro_text',.9,{st,txt:'SETTLED',c:PINK}); sfx.ding(); }],
    [3750,'end',res(E2)+'Rose considers this a major intervention.']]); };

// ---------- SILLY ----------
SC.ro_breath=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,6),g=ez(u/.6); gfx.globalAlpha=fade(u,.8)*.8; ring(p.x-10,p.y,8+g*10,7+g*8,3,CREAM); if(u>.4) label('AHEM',p.x,p.y-34,CREAM,1); };
const tongue=(x,y,u,k)=>{ const q=.6+u*.6; gfx.save(); gfx.translate(x,y); gfx.rotate(Math.sin(u*12+k)*.4); EO(0,0,11*q,15*q,'#ff8aa8'); Ln(0,-7*q,0,7*q,2,'#d64a74'); gfx.restore(); };
SC.ro_goof=(s,u)=>{ gfx.globalAlpha=fade(u,.8); for(let k=0;k<3;k++) { const a=s.t*5+k*2.1; label('*',s.x+Math.cos(a)*30,s.y-12+Math.sin(a)*8,k%2?GOLD:PINK,2); }
  if(u>.2) label('HEE HEE',s.x,s.y-34-ez((u-.2)/.3)*6,PINK,2); };
Rm.sillyShow=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),cx=Math.min(470,F.x+F.w*.5+96),cy=Math.min(312,F.base+6),lie=lieDy();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:5},{t:900,x:cx,y:cy,f:'idle'},{t:1100,f:'expr',sc:u=>1+ez(u)*.16},{t:1800,f:'celeb',sc:u=>1.16-ez(u)*.16,dx:(u,tt)=>Math.sin(tt*45)*2},
    {t:2650,f:'idle',rot:u=>-ez(u/.3)*1.45,dy:(u,tt)=>ez(u/.3)*lie-Math.abs(Math.sin(tt*16))*3},{t:3350,f:'celeb',hop:22},{t:3650,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose walks to centre stage and takes an extravagantly serious breath.'); say(m.id,'silly'); }],
    [1100,()=>{ scene('ro_breath',.8,{st}); sfx.charge(); }],
    [1800,()=>{ sfx.raspberry(); b7Later(()=>sfx.raspberry(),420); const p=head(st,10); for(let k=0;k<4;k++) ST.fly((x,y,u)=>tongue(x,y,u,k),p.x-14,p.y,F.x+(k-1.5)*12,F.mid-6,.5,30+k*8,k*.11); }],
    ['hf',2350],
    [2350,()=>{ E2.apply(); sfx.boing(); ST.jolt(t,.5); scene('ro_goof',1.6,{x:F.x,y:F.top}); scene('ro_poof',.5,{x:F.x,y:F.mid,c:'#ff8aa8',n:10}); }],
    [2650,()=>{ sfx.giggle(); setMessage('Rose has made an excellent point. She falls over laughing at it.'); }],
    [3000,()=>{ sfx.giggle(); }],
    [4400,'end',()=>t&&t.st.goofed?'Rose has made an excellent point. Goofed!':(t?cap(t.def.the)+' is unmoved. Mostly.':'Pbbbt.')]]); };
// The SILLY handler in engine/battle2-moves.js calls RM.rose.sillyShow for the Option 3 version.

// ---------- Where Did I Go? ----------
SC.ro_hands=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000; if(ms>s.until) return; const p=head(st,2),g=ez(u/.08); gfx.globalAlpha=1; for(const hx of [p.x-11,p.x+1]) { RO(hx-4,p.y-4-6*(1-g),9,8,SKIN); for(let k=0;k<3;k++) R(hx-3+k*3,p.y-8-6*(1-g),2,5,SKIN); R(hx-4,p.y-9-6*(1-g),9,1,OUT); } };
SC.ro_qmark=(s,u)=>{ const x=s.x,y=s.y,g=ez(u/.2),sw=lerp(-.2,.55,ez((u-.2)/.5))+Math.sin(s.t*4)*.08; gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(sw); gfx.scale(g,g);
  for(const [w,c] of [[14,OUT],[8,GOLD]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(0,-18,16,Math.PI*1.1,Math.PI*2.35); gfx.lineTo(0,10); gfx.stroke(); }
  E(0,24,7,7,OUT); E(0,24,4,4,GOLD); gfx.restore();
  if(u>.3&&u<.85) { const ax=x+30,ay=y+44; LnO(ax,ay,ax+40,ay,3,CREAM); LnO(ax+40,ay,ax+32,ay-7,3,CREAM); LnO(ax+40,ay,ax+32,ay+7,3,CREAM); label('THAT WAY?',ax+20,ay+10,CREAM,1); } };
SC.ro_smile=(s,u)=>{ gfx.globalAlpha=fade(u,.75); const y=s.y-ez(u/.3)*8; EO(s.x,y,12,12,GOLD); E(s.x-4,y-3,1.6,1.6,OUT); E(s.x+4,y-3,1.6,1.6,OUT); gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(s.x,y+1,5,Math.PI*.15,Math.PI*.85); gfx.stroke(); };
Rm.where_did_i_go=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),pR=front(F,20),pL={x:Math.max(26,F.x-F.w*.5-20),y:Math.min(314,F.base+6)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:800,x:pR.x,y:pR.y,f:'expr'},{t:1350,f:'walk',hop:4,hn:6,dy:u=>Math.sin(u*Math.PI)*12},{t:2350,x:pL.x,y:pL.y,f:'expr'},
    {t:2450,f:'celeb',hop:26},{t:2950,f:'runR',dy:u=>Math.sin(u*Math.PI)*14},{t:3950,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose runs right up to '+t.name+' and hides her eyes. Only her eyes.'); say(m.id,'where_did_i_go'); }],
    [800,()=>{ scene('ro_hands',2.0,{st,until:1650}); sfx.select(); }],
    [1000,()=>{ scene('ro_qmark',1.8,{x:F.x+10,y:F.top-26}); sfx.slideWhistle(); }],
    [1350,()=>{ setMessage('She tiptoes right past. In plain view. '+cap(t.def?t.def.the:t.name)+' looks the other way.'); }],
    ['hf',2450],
    [2450,()=>{ E2.apply(); sfx.ding(); sfx.giggle(); scene('ro_text',.9,{st,txt:'TA-DA',c:PINK,sc:2}); scene('ro_smile',1.2,{x:F.x+F.w*.5,y:F.top-8}); ST.jolt(t,.12); }],
    [4050,'end','The disguise is completely transparent.']]); };

// ---------- Royal Inspection ----------
SC.ro_tiara=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,p=head(st,-RH()*.12),tilt=lerp(.45,0,ez((ms-s.fix)/400)); gfx.globalAlpha=fade(u,.95);
  gfx.save(); gfx.translate(p.x+1,p.y); gfx.rotate(tilt); gfx.scale(.34,.34); PROP2.tiara({},0); gfx.restore(); };
SC.ro_scepter=(s,u)=>{ const ms=s.t*1000,h=hand(),poke=ms>s.pokeAt&&ms<s.pokeAt+450?Math.sin(cl((ms-s.pokeAt)/450)*Math.PI):0,a=-.6-Math.sin(s.t*2)*.08+poke*-.9; gfx.globalAlpha=fade(u,.9);
  gfx.save(); gfx.translate(h.x-2,h.y-4); gfx.rotate(a); RO(-3,-34-poke*10,6,38,PURP); EO(0,-38-poke*10,8,8,GOLD); E(-2,-40-poke*10,2,2,CREAM); gfx.restore(); };
SC.ro_poky=(s,u)=>{ const g=ez(u/.15),flip=u>.5?ez((u-.5)/.15):0,w=40*Math.abs(Math.cos(flip*Math.PI)),x=s.x+28,y=s.y-10; gfx.globalAlpha=fade(u,.85);
  Ln(s.x+4,s.y+6,x,y+10,2,'#8a7a90'); gfx.save(); gfx.translate(x,y); gfx.rotate(.25); gfx.scale(g,g); RO(-w/2,-15,w,30,flip>.5?PINK:'#f1d58c'); E(-w/2+6,-9,2.5,2.5,OUT);
  if(w>22) { if(flip<.5) { label('TOO',4,-8,'#7a1a14',1); label('POKY',4,1,'#7a1a14',1); } else heart(2,-2,7,'#ff6b9a'); } gfx.restore(); };
Rm.royal_inspection=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6,rot:(u,tt)=>Math.sin(tt*6)*.06},{t:1200,x:p.x,y:p.y,f:'idle'},{t:1300,f:'expr'},
    {t:1700,f:'walk',hop:3,hn:4,dx:u=>-Math.sin(u*Math.PI)*28,dy:u=>Math.sin(u*Math.PI*2)*6},{t:2400,f:'act',dx:u=>-ez(u)*14},{t:2550,f:'act',dx:-14},
    {t:2950,f:'kneel'},{t:3300,f:'celeb',hop:8},{t:3550,f:'walkR',hop:3,hn:5,rot:(u,tt)=>Math.sin(tt*6)*.06},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose processes over. Royally. Very slowly.'); say(m.id,'royal_inspection'); scene('ro_tiara',4.5,{st,fix:1300}); scene('ro_scepter',3.0,{pokeAt:2400}); }],
    [1300,()=>{ setMessage('She straightens her tiara. This inspection is official.'); sfx.select(); }],
    [1700,()=>{ scene('ro_text',.9,{st,txt:'HMM',c:CREAM}); }],
    [2400,()=>{ sfx.whoosh(); }],
    ['hf',2550],
    [2550,()=>{ sfx.bonk(); ST.jolt(f,.4); scene('ro_poky',1.6,{x:F.x,y:F.mid}); landHit(100); }],
    [2950,()=>{ sfx.ding(); scene('ro_text',.8,{st,txt:'CURTSEY',c:PINK}); }],
    [4600,'end',res(E2)+'The armor fails the princess test.']]); };

// ---------- Giggle Echo ----------
SC.ro_cup=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,10); gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(p.x-16,p.y); gfx.rotate(-1.35+Math.sin(s.t*20)*.05); RO(-7,-12,14,24,CREAM); R(-7,-12,14,4,PINK); gfx.restore(); };
const bubble=(k)=>(x,y,u)=>{ const r=10+k*3; EO(0,0,r,r*.85,k===1?PINK:CREAM); label(''+(k+1),0,-3,'#2b2a26',1); if(u>.3) label('HA',0,-r-12,PINK2,1); };
Rm.giggle_echo=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,46),lie=lieDy();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:750,x:p.x,y:p.y,f:'kneel'},{t:1700,f:'kneel',dx:(u,tt)=>Math.sin(tt*30)*1.5},
    {t:2050,f:'idle',rot:u=>-ez(u/.25)*1.45,dy:(u,tt)=>ez(u/.25)*lie-Math.abs(Math.sin(tt*14))*4},{t:2850,f:'celeb',hop:16},{t:3150,f:'runR'},{t:3800,x:'home',y:'home',f:'idle'}]);
  const from=()=>{ const q=head(st,10); return [q.x-28,q.y]; };
  const shot=(k,at)=>[at,()=>{ const [x0,y0]=from(); sfx.giggle(); ST.fly(bubble(k),x0,y0,G.x0+10+k*6,G.top+6+k*8,.4,46+k*12); }];
  ST.play(E2,[
    [0,()=>{ setMessage('Rose sits down and giggles into a paper cup held sideways.'); say(m.id,'giggle_echo'); }],
    [800,()=>{ scene('ro_cup',1.3,{st}); sfx.giggle(); }],
    shot(0,1500),shot(1,1700),shot(2,1900),
    [1900,()=>{ sfx.bonk(); all(list); landHit(34); }],
    [2100,()=>{ sfx.bonk(); all(list); landHit(33); }],
    ['hf',2300],
    [2300,()=>{ sfx.bonk(); all(list); landHit(33); scene('ro_text',1,{x:G.x,y:G.top-30,txt:'HA HA HA',c:PINK,sc:2}); }],
    [2600,()=>{ scene('ro_poof',.6,{x:G.x0+22,y:G.top+20,c:CREAM,n:12,r:34}); setMessage('The last echo laughs itself into a puff. So does Rose.'); sfx.giggle(); }],
    [3900,'end',res(E2)+'The echo finds the joke even funnier.']]); };

// ---------- Lamby's Appointment ----------
SC.ro_clinic=(s,u)=>{ const x=s.x,y=s.y; gfx.globalAlpha=fin(u,.08)*fade(u,.9); RO(x-24,y-14,48,14,'#e8cfa0'); R(x-22,y-12,44,3,'#c9a874'); label('APPTS',x,y-10,'#2b2a26',1); EO(x,y+2,22,5,PURP); };
SC.ro_lamby=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,sc=.85,pose='held',rot=.3;
  if(ms<P.seat||ms>P.back) { const h=hand(); x=h.x-2; y=h.y+6; }
  else if(ms<P.press) { x=P.sx; y=P.sy-22; sc=.9; rot=0; }
  else { const q=ez((ms-P.press)/300),sq=Math.sin(ms/90)*.06; x=lerp(P.sx,P.tx,q); y=lerp(P.sy-22,P.ty,q); sc=.95+sq; rot=-.2; }
  gfx.globalAlpha=1; plush(x,y,sc,{pose,rot}); };
SC.ro_clip=(s,u)=>{ const h=hand(),x=h.x-14,y=h.y-10; gfx.globalAlpha=fade(u,.9); RO(x-12,y-16,24,32,'#9fc4f0'); R(x-9,y-13,18,26,CREAM); R(x-5,y-19,10,5,'#6a6f7a');
  label('CUDDLES',x,y-8,'#2b2a26',1); gfx.strokeStyle='#2b2a26'; gfx.lineWidth=1.5; gfx.strokeRect(x-5,y+1,9,9); if(s.t*1000>s.checkAt) check(x,y+5,4,'#2f9a4a'); };
SC.ro_sticker=(s,u)=>{ const x=s.x,y=s.y,g=ez(u/.2); gfx.globalAlpha=fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(-.3); gfx.scale(g,g); EO(0,0,14,10,GOLD); label('GOOD',0,-3,'#7a4a10',1); gfx.restore(); heart(x+16,y-12,4,'#ff6b9a'); };
Rm.lamby_appointment=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,22),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:500,f:'kneel'},{t:1500,f:'expr'},{t:1900,f:'act'},{t:2800,f:'celeb',hop:10},{t:3200,f:'idle'},{t:3600,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:1100,x:sp.x,y:sp.y,f:'kneel'},{t:1500,f:'expr'},{t:1900,f:'act',dx:u=>-ez(u)*8},{t:2700,f:'act',dx:-8},{t:2900,f:'celeb',hop:10},
      {t:3200,f:'walkR',hop:3,hn:5},{t:4200,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const cx=Math.min(556,sp.x+30),cy=sp.y,plan={seat:self?500:1100,press:1900,back:2800,sx:cx,sy:cy,tx:H.x+6,ty:H.mid+4};
  const end=self?3700:4300;
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Lamby is seeing patients. The patient today is Rose.':'Rose carries Lamby over. Lamby is seeing patients.'); say(m.id,'lamby_appointment'); scene('ro_lamby',end/1000,{plan}); }],
    [plan.seat,()=>{ scene('ro_clinic',(end-plan.seat-300)/1000,{x:cx,y:cy}); sfx.select(); setMessage('The waiting room is a cushion. There is a sign.'); }],
    [1500,()=>{ scene('ro_clip',1.3,{checkAt:800}); sfx.select(); }],
    [1900,()=>{ sfx.boing(); }],
    ['hf',2300],
    [2300,()=>{ E2.apply(); sfx.baa(); sfx.heal(); scene('ro_glow',.9,{x:H.x,y:H.mid,c:PINK}); scene('ro_heart',1,{x:H.x,y:H.top-4}); hopOf(t!==m?t:null); }],
    [2900,()=>{ scene('ro_sticker',1.1,{x:H.x+4,y:H.mid-6}); sfx.ding(); }],
    [end,'end',kindLine(t,'The prescription is remarkably soft.')]]); };

// ---------- The Floor Is Jelly ----------
SC.ro_jelly=(s,u)=>{ const B=s.G,cx=(B.x0+B.x1)/2,w=(B.x1-B.x0)/2+34,ms=s.t*1000,draw=ez(ms/350),wq=cl((ms-s.wobAt)/700),wob=ms>s.wobAt?Math.sin(wq*Math.PI*4)*(1-wq):0;
  for(const p of B.list) { gfx.globalAlpha=fade(u,.9); gfx.save(); gfx.translate(p.x,p.base+4); gfx.scale(1+wob*.16,1-wob*.4); const rx=(p.w*.5+16)*draw+.1,ry=11*draw+.1;
    for(const [lw,c] of [[7,OUT],[4,JELLY]]) { gfx.strokeStyle=c; gfx.lineWidth=lw; gfx.beginPath(); gfx.ellipse(0,0,rx,ry,0,0,Math.PI*2); gfx.stroke(); }
    gfx.globalAlpha*=.35; E(0,0,rx,ry,JELLY); gfx.restore(); }
  if(ms>s.wobAt&&ms<s.wobAt+600) { gfx.globalAlpha=fade(u,.9); const q=cl((ms-s.wobAt)/600); for(const p of B.list) EO(p.x,p.base-4,22*(1+q*.5),8*(1-q*.6)+.1,JELLY); } };
Rm.floor_is_jelly=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,42);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'celeb',hop:70},{t:1150,f:'kneel'},{t:1350,f:'expr'},{t:1650,f:'celeb',hop:46},
    {t:2050,f:'celeb',hop:100,rot:u=>-ez(u)*Math.PI*2,ns:true},{t:2650,f:'kneel',dx:(u,tt)=>u<.7?-Math.abs(Math.sin(tt*10))*5:0},{t:3050,f:'celeb',hop:10},{t:3300,f:'runR'},{t:3950,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose runs to the enemies and jumps as high as she can.'); say(m.id,'floor_is_jelly'); sfx.jumpWhistle(); }],
    [1150,()=>{ sfx.thud(); scene('ro_jelly',2.7,{G,wobAt:900}); scene('ro_poof',.5,{x:p.x,y:p.y,c:JELLY,n:8}); }],
    [1350,()=>{ setMessage('She stamps once. New rule: the floor is jelly.'); scene('ro_text',.9,{st,txt:'NEW RULE',c:JELLY}); }],
    [1650,()=>{ sfx.jumpWhistle(); }],
    ['hf',2050],
    [2050,()=>{ sfx.boing(); sfx.bonk(); all(list); landHit(100); scene('ro_text',1,{x:G.x,y:G.top-30,txt:'WOBBLE',c:JELLY,sc:2}); }],
    [2300,()=>{ sfx.boing(); }],
    [2700,()=>{ sfx.select(); scene('ro_text',.8,{st,txt:'PAT PAT',c:CREAM}); }],
    [4050,'end',res(E2)+'The rule is new but immediately binding.']]); };

// ---------- Lookout Lamby ----------
SC.ro_scope=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,-26),x=p.x-4,y=p.y-(s.t<.4?ez(s.t/.4)*10:10); gfx.globalAlpha=fade(u,.9); plush(x,y,.7,{pose:'held'});
  gfx.save(); gfx.translate(x-16,y-6); gfx.rotate(.35); RO(-22,-5,22,10,'#6a6f7a'); RO(-30,-7,10,14,'#9aa3c8'); R(-2,-3,4,6,'#2b2a26'); gfx.restore(); if(u>.3) label('BACKWARDS',x-10,y-30,CREAM,1); };
SC.ro_pennant=(s,u)=>{ const ms=s.t*1000,h=hand(),sw=ms>s.swingAt&&ms<s.swingAt+500?Math.sin(cl((ms-s.swingAt)/500)*Math.PI):0,a=-.4-sw*1.3; gfx.globalAlpha=fade(u,.9);
  gfx.save(); gfx.translate(h.x,h.y-2); gfx.rotate(a); RO(-2,-56,4,58,'#e8cfa0'); poly([[2,-56],[34,-46],[2,-36]],PINK); gfx.restore(); };
SC.ro_cushion=(s,u)=>{ const g=ez(u/.3); gfx.globalAlpha=fade(u,.85); EO(s.x,s.y+4,34*g+.1,10*g+.1,PURP); for(let k=0;k<4;k++) E(s.x-24+k*16,s.y+2,3,3,CREAM); if(u>.4) label('LOOKOUT',s.x,s.y-RH()-18,PURP,1); };
Rm.lookout_lamby=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,30),tom=tomUp();
  const ride=()=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx],q=BATTLE_POS[tom.idx],sp=BATTLE_SPRITES.tom,a=d||{cx:q.x*3,base:q.base*3,h:sp.idle.length*sp.scale}; return {x:a.cx+2,y:a.base-a.h+20}; };
  const TU=tom?ST.unit(tom):null,me=ST.unit(m);
  const K=[{t:0,x:'home',y:'home',f:'celeb',hop:5,hn:4},{t:1250,f:'run'},{t:1900,x:p.x,y:p.y,f:'act',dx:u=>-ez(u)*12},{t:2150,f:'act',dx:-12},{t:2550,f:'runR'}];
  if(tom) K.push({t:3250,x:TU.x+30,y:TU.base+3,f:'celeb',hop:50,ns:true},{t:3700,x:()=>ride().x,y:()=>ride().y,f:'idle',ns:true},{t:5000,x:()=>ride().x,y:()=>ride().y,f:'idle',ns:true});
  else K.push({t:3250,x:'home',y:'home',f:'kneel'},{t:3700,f:'celeb',hop:8},{t:4000,f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose holds Lamby up high. Lamby takes the telescope. It is backwards.'); say(m.id,'lookout_lamby'); scene('ro_scope',1.3,{st}); }],
    [1250,()=>{ scene('ro_lambyhead',(tom?4.6:3.2),{st}); scene('ro_pennant',1.45,{swingAt:650}); setMessage('Lamby is confident. Lamby points. Rose charges.'); sfx.baa(); }],
    [1900,()=>{ sfx.whoosh(); }],
    ['hf',2150],
    [2150,()=>{ sfx.bonk(); sfx.baa(); ST.jolt(f,.4); landHit(100); scene('ro_text',.9,{x:F.x+62,y:F.top-10,txt:'BONK',c:GOLD,sc:2}); }],
    ...(tom?[[3250,()=>{ sfx.jumpWhistle(); }],[3650,()=>{ E2.apply(); battle.fx[tom.idx].hop=.3; scene('ro_text',1,{x:TU.x,y:TU.top-34,txt:'LOOKOUT POST',c:PINK}); }]]
      :[[3250,()=>{ scene('ro_cushion',1.2,{x:me.x,y:me.base}); sfx.select(); }],[3400,()=>{ E2.apply(); }]]),
    [tom?3900:4100,'end',res(E2)+(tom?'Lamby has spotted something extremely bonkable. Rose is up on Tom.':'Lamby has spotted something extremely bonkable.')]]); };

// ---------- Ribbon Rescue ----------
SC.ro_ribbon=(s,u)=>{ const ms=s.t*1000,h=hand(),cx=s.cx,cy=s.cy,rx=s.rx,ry=s.ry,lap=cl((ms-s.lapAt)/s.lapLen),tug=ms>s.tugAt?1:0; gfx.globalAlpha=fade(u,.94);
  gfx.lineCap='round';
  if(lap>0) { const a1=lap*Math.PI*2; for(const [w,c] of [[6,OUT],[3,PINK]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(cx,cy-s.lift*(tug?1:lap),rx*(tug?.62:1),ry*(tug?.8:1),0,0,a1); gfx.stroke(); } }
  const ex=cx+rx*(tug?.62:1),ey=cy-s.lift*(tug?1:lap);
  if(lap>=1) { for(const [w,c] of [[6,OUT],[3,PINK]]) { gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.moveTo(ex,ey); gfx.quadraticCurveTo((ex+h.x)/2,Math.max(ey,h.y)+(tug?2:18),h.x,h.y); gfx.stroke(); } }
  else if(lap<=0&&s.st&&s.st.x!=null) { const q=ez(ms/s.lapAt),x=Math.max(cx+rx,s.st.x-34-q*30); Ln(h.x,h.y,x,cy-2,3,PINK); gfx.save(); gfx.translate(x,cy-8); gfx.rotate(q*10); RO(-8,-8,16,16,PINK); R(-8,-3,16,6,PINK2); gfx.restore(); }
  if(ms>s.bowAt) { const b=ez((ms-s.bowAt)/200),bx=cx,by=cy-s.lift-2; EO(bx-10,by,9*b,6*b,PINK); EO(bx+10,by,9*b,6*b,PINK); E(bx,by,4*b,4*b,OUT); E(bx,by,2.5*b,2.5*b,PINK2); if(b>.9&&ms<s.tugAt+500) label('TIED',bx,by-18,PINK,1); } };
SC.ro_tip=(s,u)=>{ const h=hand(),g=ez(u/.3),x=lerp(h.x,s.x,g),y=lerp(h.y,s.y,g); gfx.globalAlpha=fade(u,.8); LnO(h.x,h.y,x,y,3,PINK); LnO(x,y,x+7,y-5,3,PINK); LnO(x,y,x+7,y+5,3,PINK); if(g>.9) label('YOU NEXT',s.x,s.y-22,PINK,1); };
Rm.ribbon_rescue=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),rx=F.w*.5+24,ry=14,cx=F.x,cy=Math.min(312,F.base+3),me=ST.unit(m);
  const lapStart=750,lapLen=900;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:lapStart,x:cx+rx,y:cy,f:u=>Math.sin(u*Math.PI*2)>0?'run':'runR',dx:u=>Math.cos(u*Math.PI*2)*rx-rx,dy:u=>Math.sin(u*Math.PI*2)*ry},
    {t:lapStart+lapLen,x:cx+rx+18,y:cy,f:'act',rot:u=>ez(u)*.3,dx:u=>ez(u)*10},{t:2100,f:'act',rot:.3,dx:10},{t:2400,f:'act'},{t:2900,f:'runR'},{t:3600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose rolls a ribbon spool at '+f.name+' and runs after it.'); say(m.id,'ribbon_rescue'); scene('ro_ribbon',3.0,{st,cx,cy,rx,ry,lift:F.h*.45,lapAt:lapStart,lapLen,bowAt:1750,tugAt:2100}); sfx.whoosh(); }],
    [lapStart,()=>{ sfx.slideWhistle(); setMessage('All the way round. Mind the fancy bit.'); }],
    [1750,()=>{ sfx.select(); }],
    ['hf',2100],
    [2100,()=>{ sfx.bonk(); ST.jolt(f,.5); landHit(100); scene('ro_text',.9,{x:F.x+62,y:F.top-10,txt:'TUG',c:PINK,sc:2}); }],
    [2400,()=>{ E2.apply(); const low=b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(low) { const L=ST.unit(low); scene('ro_tip',1.0,{x:L.x+L.w*.5+6,y:L.mid}); if(low!==m) battle.fx[low.idx].hop=.3; } sfx.ding(); }],
    [3700,'end',res(E2)+'The ribbon has become a safety feature.']]); };

// ---------- Lamby Fixes the Ending ----------
SC.ro_book=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,sc=1,rot=0,open=1;
  if(ms<P.sit||ms>P.up) { const h=hand(); x=h.x-6; y=h.y-4; sc=.5; open=0; } else { x=P.bx; y=P.by; rot=ms<P.turn?0:ez((ms-P.turn)/350)*Math.PI; }
  gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc); gfx.rotate(rot); RO(-22,-16,44,32,'#5a8ad0');
  if(open) { R(-20,-14,19,28,CREAM); R(1,-14,19,28,CREAM); R(-1,-16,2,32,OUT);
    if(rot<Math.PI/2) { gfx.strokeStyle='#2f6fb0'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(10,4,6,Math.PI*1.15,Math.PI*1.85); gfx.stroke(); E(7,-4,1.5,1.5,'#2f6fb0'); E(13,-4,1.5,1.5,'#2f6fb0'); R(-16,-8,12,2,'#9aa3b8'); R(-16,-2,10,2,'#9aa3b8'); }
    else { gfx.rotate(Math.PI); E(-10,0,7,7,GOLD); for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(-10+Math.cos(a)*9,Math.sin(a)*9,-10+Math.cos(a)*12,Math.sin(a)*12,2,GOLD); } gfx.strokeStyle='#c2561e'; gfx.lineWidth=1.5; gfx.beginPath(); gfx.arc(-10,1,3,Math.PI*.15,Math.PI*.85); gfx.stroke(); } }
  gfx.restore();
  if(ms>=P.sit&&ms<=P.up) { const reach=ms>P.turn-300&&ms<P.turn+400?Math.sin(cl((ms-P.turn+300)/700)*Math.PI):0,pat=ms>P.pat&&ms<P.pat+400?Math.sin(cl((ms-P.pat)/400)*Math.PI*3)*.08:0;
    plush(P.bx-38+reach*12,P.by+2-reach*4,.62+pat,{pose:'held',rot:-reach*.4}); } };
Rm.lamby_ending=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:400,f:'kneel'},{t:2250,f:'celeb',hop:12,hn:2},{t:2750,f:'kneel'},{t:3100,f:'idle'},{t:3400,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6},{t:1000,x:sp.x,y:sp.y,f:'kneel'},{t:2250,f:'celeb',hop:12,hn:2},{t:2750,f:'kneel'},{t:3100,f:'walkR',hop:3,hn:5},{t:4100,x:'home',y:'home',f:'idle'}];
  ST.keys(fx,K);
  const sit=self?400:1000,up=3100,end=self?3500:4200,plan={sit,up,turn:1800,pat:2800,bx:sp.x-30,by:sp.y-14};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose sits down with a little picture book.':'Rose brings a little picture book over to '+t.name+'.'); say(m.id,'lamby_ending'); scene('ro_book',end/1000,{plan}); scene('ro_carry',(sit+50)/1000,{dy:10,sc:.7}); }],
    [sit+100,()=>{ setMessage('She opens it. The ending looks cold. Lamby has a look.'); sfx.select(); }],
    [1700,()=>{ sfx.whoosh(); }],
    [1900,()=>{ for(let k=0;k<4;k++) ST.fly((x,y)=>{ E(x,y,4,4,GOLD); },plan.bx,plan.by-6,H.x+(k-1.5)*10,H.mid,.35,30,k*.05); }],
    ['hf',2250],
    [2250,()=>{ E2.apply(); sfx.baa(); sfx.heal(); scene('ro_glow',.9,{x:H.x,y:H.mid,c:'#ffd27a'}); scene('ro_flakes',1,{x:H.x,y:H.base,h:H.h}); hopOf(t!==m?t:null); scene('ro_text',.9,{x:plan.bx,y:plan.by-40,txt:'UPSIDE DOWN',c:GOLD}); }],
    [2800,()=>{ scene('ro_heart',.9,{x:plan.bx-38,y:plan.by-22}); sfx.ding(); }],
    [up,()=>{ scene('ro_carry',(end-up)/1000,{dy:10,sc:.7}); }],
    [end,'end',kindLine(t,'The happy ending was facing the wrong way.')]]); };

// ---------- Pocket Princess ----------
SC.ro_fan=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); gfx.globalAlpha=fade(u,.95);
  const folded=(x,y,lab)=>{ RO(x-4,y-6,8,12,PURP); R(x-2,y-4,4,8,GOLD); if(lab) label(lab,x,y-20,CREAM,1); };
  if(ms<P.open) { folded(h.x-6,h.y-6,ms<P.raise?'TINY':null); return; }
  const op=ms<P.clap?ez((ms-P.open)/(P.clap-P.open)):1,back=ms>P.fold?ez((ms-P.fold)/350):0,sc=op*(1-back);
  if(back>=1) { folded(h.x-6,h.y-6); return; }
  const clap=ms>P.clap&&ms<P.clap+300?Math.sin(cl((ms-P.clap)/300)*Math.PI):0;
  for(let k=0;k<3;k++) { const tx=lerp(P.x0,P.x1,k/2),cx=lerp(h.x-6,tx+(1-k)*clap*12,sc),cy=lerp(h.y-6,P.y,sc),r=4+38*sc;
    gfx.save(); gfx.translate(cx,cy); gfx.rotate((k-1)*.25*sc*(1-clap));
    gfx.beginPath(); gfx.moveTo(0,0); gfx.arc(0,0,r,Math.PI*1.15,Math.PI*1.85); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=k===1?GOLD:PURP; gfx.fill();
    for(let j=0;j<5;j++) { const a=Math.PI*(1.15+j*.175); Ln(0,0,Math.cos(a)*r,Math.sin(a)*r,1.5,OUT); } if(r>24) { E(0,-r*.6,5,5,OUT); E(0,-r*.6,3,3,PINK); } gfx.restore(); } };
Rm.pocket_princess=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,60);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:3,hn:6,rot:(u,tt)=>Math.sin(tt*7)*.07},{t:1100,x:p.x,y:p.y,f:'idle'},{t:1150,f:'expr',dx:(u,tt)=>u<.5?Math.sin(tt*30)*1.5:0},
    {t:1550,f:'celeb'},{t:2350,f:(u,tt)=>Math.floor(tt*12)%2?'flip':'idle',hop:12,hn:3},{t:2950,f:'celeb'},{t:3150,f:'kneel'},{t:3450,f:'walkR',hop:3,hn:5,rot:(u,tt)=>Math.sin(tt*7)*.07},{t:4400,x:'home',y:'home',f:'idle'}]);
  const plan={raise:1550,open:1950,clap:2350,fold:2950,x0:G.x0+14,x1:G.x1-14,y:G.top-4};
  ST.play(E2,[
    [0,()=>{ setMessage('Rose sweeps over like a princess arriving at a ball.'); say(m.id,'pocket_princess'); scene('ro_fan',4.4,{plan}); }],
    [1150,()=>{ setMessage('She pulls a very small fan out of a very small pocket.'); sfx.select(); }],
    [1950,()=>{ sfx.whoosh(); sfx.charge(); }],
    ['hf',2350],
    [2350,()=>{ sfx.bonk(); sfx.ding(); all(list); landHit(100); scene('ro_text',1.1,{x:G.x,y:G.top-60,txt:'ROYAL',c:GOLD,sc:2}); }],
    [2400,()=>{ sfx.spin&&sfx.spin(); }],
    [3150,()=>{ scene('ro_text',.8,{st,txt:'CURTSEY',c:PINK}); }],
    [4500,'end',res(E2)+'The royal entrance exceeds its advertised size.']]); };

// ---------- Princess Parasol ----------
SC.ro_parasol=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.96);
  if(ms>P.close) { const h=hand(); gfx.save(); gfx.translate(h.x-4,h.y); gfx.rotate(-.5); RO(-2,-40,4,44,'#8a5a30'); poly([[-6,-40],[6,-40],[2,-10],[-2,-10]],GOLD); gfx.restore(); return; }
  const p=head(st,-14),x=p.x-2,y=p.y-30,flip=ms<P.flip?0:ez((ms-P.flip)/300),sq=Math.cos(flip*Math.PI),spin=ms<P.flip?s.t*6:0;
  RO(x-2,y,4,44,'#8a5a30'); gfx.save(); gfx.translate(x,y); gfx.scale(1,Math.max(.12,Math.abs(sq)));
  gfx.beginPath(); gfx.moveTo(-42,0); gfx.quadraticCurveTo(0,-44,42,0); gfx.closePath(); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=sq>0?PINK:GOLD; gfx.fill();
  for(let k=0;k<7;k++) E(-36+k*12+Math.sin(spin+k)*2,0,5,4,CREAM);
  if(sq>0) E(Math.sin(spin)*14,-18,8,8,GOLD); else { E(0,-18,8,8,'#ffb45a'); for(let k=0;k<8;k++) { const a=k*Math.PI/4; Ln(Math.cos(a)*11,-18+Math.sin(a)*11,Math.cos(a)*15,-18+Math.sin(a)*15,2,'#ffb45a'); } }
  gfx.restore(); if(flip>.95&&ms<P.close-200) label('INSIDE OUT',x,y-52,GOLD,1); };
SC.ro_warmside=(s,u)=>{ const g=ez(u/.25); gfx.globalAlpha=fade(u,.75); E(s.x,s.y,34*g,46*g,'rgba(255,200,90,.2)'); ring(s.x,s.y,34*g,46*g,3,GOLD);
  for(let k=0;k<4;k++) { const a=s.t*3+k*Math.PI/2; R(s.x+Math.cos(a)*30*g-2,s.y+Math.sin(a)*40*g-2,4,4,CREAM); } };
Rm.princess_parasol=E2=>{ const {m,fx}=E2,who=(E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),tom=!foe&&who.find(u=>u.id==='tom'&&b2Alive(u));
  const U=who.map(u=>ST.unit(u)),px=foe?front(U[0],26).x:Math.round(U.reduce((a,q)=>a+q.x,0)/U.length)-10,py=foe?front(U[0],26).y:Math.min(314,Math.round(U.reduce((a,q)=>a+q.base,0)/U.length)+14);
  const me=ST.unit(m),dir=(a,b)=>b<a?'run':'runR';
  const K=[{t:0,x:'home',y:'home',f:px<me.x?'walk':'walkR',hop:3,hn:5},{t:900,x:px,y:py,f:'celeb',hop:4,hn:3},{t:1700,f:'expr'},{t:2050,f:'celeb',hop:10,hn:2}];
  let end=3900;
  if(tom) { const TU=ST.unit(tom); K.push({t:2550,f:dir(px,TU.x+26)},{t:3100,x:TU.x+26,y:TU.base+3,f:'act'},{t:3450,f:dir(TU.x+26,me.x)},{t:4100,x:'home',y:'home',f:'idle'}); end=4200; }
  else K.push({t:2550,f:'celeb',hop:6,hn:2},{t:3000,f:dir(px,me.x)},{t:3800,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K),plan={flip:1700,close:2650};
  ST.play(E2,[
    [0,()=>{ setMessage('Rose carries a parasol to the middle of everyone. The sun is painted on the outside.'); say(m.id,'princess_parasol'); scene('ro_parasol',end/1000,{st,plan}); }],
    [900,()=>{ sfx.spin&&sfx.spin(); }],
    [1700,()=>{ sfx.slideWhistle(); setMessage('She turns it inside out. Obviously. The sunshine goes underneath.'); }],
    ['hf',2050],
    [2050,()=>{ E2.apply(); for(const u of who) { const q=ST.unit(u); scene('ro_warmside',1.2,{x:q.x,y:q.mid}); if(u.side==='party'&&u!==m) battle.fx[u.idx].hop=.25; else if(u.side==='foe') ST.jolt(u,.15); } sfx.ding(); sfx.heal(); }],
    ...(tom?[[3100,()=>{ const T=ST.unit(tom); scene('ro_heart',1.1,{x:T.x,y:T.top-6,r:7}); battle.fx[tom.idx].hop=.3; sfx.ding(); }]]:[]),
    [end,'end',foe?kindLine(foe):'Rose puts the warm part where her friends are.']]); };
})();
