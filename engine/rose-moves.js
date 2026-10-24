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
