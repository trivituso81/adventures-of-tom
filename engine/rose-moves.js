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
  // Two lambs (canon, 26 Oct): Lamby, the original, worn and a bit grubby (the default); Backup Lamby (o.v 'backup'),
  // newer, bright and clean. o.v 'new' is the old clean palette.
  const V=o.v||'worn',worn=V==='worn';
  if(!o.drawn&&(pose==='held'||pose==='fly')&&(V==='worn'||V==='backup')&&PROPART.draw(V==='backup'?'rose/backup_lamby':'rose/lamby',0,0,{h:32})) { gfx.restore(); return; }   // painted Lamby; o.drawn forces the drawn one (Tom's hair is drawn onto it)
  const PL=V==='backup'?['#fffdf7','#e9e0cf','#ffffff','#f6ead6','#e6d3b6']:(worn?['#ddd1ba','#bfae92','#e9e0cc','#d6c1a0','#bca37f']:['#eee5d4','#d6c9b2','#faf6ec','#ecdcc3','#d9c3a3']);
  const fur=PL[0],furD=PL[1],furL=PL[2],muz=PL[3],muzD=PL[4],bead='#16110e',st='#5a4636';
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
  // well-loved: grubby smudges and a sewn-on patch (Lamby only)
  if(worn) { gfx.globalAlpha*=.32; E(-3,5,4.5,2.6,'#7a6040'); E(10,-1,3,2,'#7a6040'); E(-8,1,2.4,1.6,'#7a6040'); gfx.globalAlpha/=.32;
    R(2,-4,6,6,OUT); R(2.8,-3.2,4.4,4.4,'#b9a0cc'); for(const [a,b] of [[2.6,-4.6],[6.2,-4.6],[2.6,1.6],[6.2,1.6]]) R(a,b,1,1,st); }
  // tag on the bum
  R(13,3,4,6,OUT); R(13.8,3.8,2.4,4.4,worn?'#e8e0d0':'#ffffff'); R(13.8,5.6,2.4,1.4,worn?'#c98a5a':'#f08a3c');
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
  E(hx-4,hy+2.5,7.6,6.6,muzD); E(hx-4.5,hy+2,6.8,5.8,muz); E(hx-6,hy,3,2,worn?'#e4d4bc':'#f6ead6');
  if(worn) { gfx.globalAlpha*=.3; E(hx-2,hy+5,2.6,1.6,'#7a6040'); gfx.globalAlpha/=.3; }
  // tiny wide-set bead eyes
  if(o.glow) { gfx.globalAlpha*=.5; E(hx-8,hy-1,4.5,4.5,'#ffe08a'); E(hx+1,hy-2,4.5,4.5,'#ffe08a'); gfx.globalAlpha/=.5; E(hx-8,hy-1,1.9,1.9,'#ffe08a'); E(hx+1,hy-2,1.9,1.9,'#ffe08a'); }
  else if(pose==='splat') { Ln(hx-9.5,hy-1,hx-6.5,hy-1,1.2,bead); Ln(hx-.5,hy-2,hx+2.5,hy-2,1.2,bead); }
  else { E(hx-8,hy-1,1.5,1.6,bead); E(hx+1,hy-2,1.5,1.6,bead); R(hx-8.6,hy-2,.8,.8,'#ffffff'); }
  // stitched Y nose
  Ln(hx-7,hy+3,hx-5,hy+4.4,1,st); Ln(hx-3,hy+3,hx-5,hy+4.4,1,st); Ln(hx-5,hy+4.4,hx-5,hy+6,1,st);
  gfx.restore();
}
RFX.plush=plush; RFX.lamb=lamb;   // the set pieces at the end of this file draw Lamby too
PROP2.lamby=(q,u)=>{ const tumble=q.tumble?Math.sin(u*Math.PI*2.2)*.7-u*.6:0; if(q.lines) for(let k=0;k<3;k++) R(22+k*8,-6+k*5,10-k*2,2,'rgba(255,246,220,'+(.7-k*.2)+')'); if(PROPART.draw('rose/lamby',0,0,{h:46,flip:!!q.flip,rot:tumble})) return; plush(0,0,1.5,{flip:q.flip,pose:'fly',rot:tumble}); };
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
  enqueue(()=>{ setMessage('Rose has decided the Grump needs an outfit. The Grump wasn\'t consulted.'); say('rose','dressup',.2); sfx.giggle(); fit=scene('outfit',5.2,{n:0});
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
  enqueue(()=>{ setMessage('Rose turns off the lights. She has a story. It\'s not a nice one.'); say('rose','bedtime',.3); scene('dark',5.2,{a:.72,back:true,c:'#06061a'}); sfx.sulk(); scene('torch',4.4,{});
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
  enqueue(()=>{ setMessage('Lamby takes the telescope. It\'s backwards. Lamby is confident.'); say('rose','lookout_lamby'); scene('r_telescope',1.0,{}); pose(fx,'expr',.9); },
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
    [plan.seat,()=>{ scene('ro_clinic',(end-plan.seat-300)/1000,{x:cx,y:cy}); sfx.select(); setMessage('The waiting room is a cushion. There\'s a sign.'); }],
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
    [0,()=>{ setMessage('Rose holds Lamby up high. Lamby takes the telescope. It\'s backwards.'); say(m.id,'lookout_lamby'); scene('ro_scope',1.3,{st}); }],
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

// ================= Move review rebuilds (2026-10-24, claude/move-review.md) =================
// Tom's review: every move is something a six-year-old actually does, with one big readable moment and props 2 to 3x
// larger. Boop (basic, via RM.rose.boopShow from engine/battle2-moves.js), Boo!!, Dress-Up Tiara, Giggle Storm, Lamby Hug,
// Floor Is Lava!, Piggyback Pounce, Bedtime Story, Lamby Boomerang, Pillow Fort. RASPBERRY (key silly) and Lookout Lamby
// keep their set pieces above. Same engine/stage.js standard; scenes prefix rv_.
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
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',PURP='#c9a6f0',RED='#e0402e',SKIN='#f6d4b8',SKY='#9fd8ff',NAVY='#1c2448',LAVA='#ff6a2a',LAVA2='#ffc53a';
ST.nw('rv_');
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
const lieDy=()=>RH()*.5-RW()*.5+2;
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const all=(list,k=.4)=>{ for(const f of list) ST.jolt(f,k); };
const tomUp=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
// Move a monster's body for a moment (engine/battle2-ui.js f.spin/f.ox/f.oy; only counts while refreshed each frame).
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
// Where a monster's nose is: between its eyes and mouth (data/monsters.js eyes/mouth are sprite pixels).
const noseOf=f=>{ const F=ST.unit(f),d=f.def||MONSTERS[f.id]||{},S=d.sprite;
  if(!S||!d.eyes) return {x:F.x,y:F.top+F.h*.45};
  const W=S[0].length,H=S.length,ex=(d.eyes[0][0]+d.eyes[1][0])/2,ey=(d.eyes[0][1]+(d.mouth?d.mouth[1]:d.eyes[0][1]+2))/2;
  return {x:F.x-F.w/2+F.w*(ex+.5)/W,y:F.top+F.h*(ey+.5)/H}; };
const ride=tom=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx],q=BATTLE_POS[tom.idx],sp=BATTLE_SPRITES.tom,a=d||{cx:q.x*3,base:q.base*3,h:sp.idle.length*sp.scale}; return {x:a.cx+2,y:a.base-a.h+20}; };

// ---------- Shared scenes ----------
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
// A big outlined word that pops in (s.sc 3 to 5). s.st follows Rose's head.
SC.rv_big=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+8,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||PINK,sc); gfx.restore(); };
SC.rv_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.7); R(0,0,576,324,s.c||'#ffffff'); };
SC.rv_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5);
  star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||PINK),u*4+k); } };
SC.rv_rings=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.4-k*.18); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; gfx.strokeStyle=k%2?GOLD:(s.c||PINK2); gfx.lineWidth=5*(1-q)+1;
  gfx.beginPath(); gfx.ellipse(s.x,s.y,6+q*(s.r||40),5+q*(s.r||40)*.8,0,0,Math.PI*2); gfx.stroke(); } };
SC.rv_hearts=(s,u)=>{ for(let k=0;k<(s.n||6);k++) { const a=-Math.PI/2+(k-(s.n||6)/2+.5)*.45,d=ez(u)*(s.r||46); gfx.globalAlpha=fade(u,.6); heart(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,(s.sz||7)*(1-u*.3),k%2?'#ff6b9a':PINK2); } };

// ---------- Boop (basic) ----------
// Rose marches up, reaches up on tiptoe and boops it right on the nose with a big pointing finger. BOOP!
SC.rv_finger=(s,u)=>{ const ms=s.t*1000+(s.t0||0); if(ms<0) return; const h=hand(),n=s.n,reach=ms<s.at?ez((ms-s.from)/(s.at-s.from)):(ms<s.back?1:1-ez((ms-s.back)/250));
  if(reach<=0) return; const g=reach,tx=lerp(h.x,n.x+7,g),ty=lerp(h.y,n.y,g),a=Math.atan2(ty-h.y,tx-h.x); gfx.globalAlpha=1;
  LnO(h.x,h.y,tx,ty,9,SKIN); gfx.save(); gfx.translate(tx,ty); gfx.rotate(a); EO(-4,0,8,7,SKIN); RO(-2,-3,14,7,SKIN); E(11,0,3,3,'#ffd9e6'); gfx.restore();
  if(ms>s.at&&ms<s.at+260) { gfx.globalAlpha=1-(ms-s.at)/260; E(n.x,n.y,14,12,'#ffffff'); } };
Rm.boopShow=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,16),n=noseOf(f);
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:6,hn:7},{t:1000,x:p.x,y:p.y,f:'idle'},{t:1150,f:'expr',dy:u=>-ez(u)*9,sc:u=>1+ez(u)*.05},
    {t:1600,f:'act',dy:-9,sc:1.05,dx:u=>-ez(u/.4)*10},{t:1950,f:'act',dy:-9,dx:-10},{t:2150,f:'celeb',hop:16},{t:2600,f:'celeb',hop:9,hn:2},{t:3050,f:'runR'},{t:3750,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose marches right up to '+f.name+'.'); say(m.id,'boop'); }],
    [1150,()=>{ setMessage('Up on her tiptoes. Finger out. Steady...'); scene('rv_finger',1.3,{n,from:1150,at:1600,back:2000,t0:1150}); sfx.select(); }],
    ['hf',1600],
    [1600,()=>{ sfx.boop?sfx.boop():sfx.bonk(); ST.jolt(f,.35); landHit(100); scene('rv_big',1.1,{x:F.x,y:F.top-74,txt:'BOOP!',c:PINK2,sc:5});
      scene('rv_rings',.6,{x:n.x,y:n.y,r:34}); scene('rv_burst',.7,{x:n.x,y:n.y,n:8,r:40,sz:6}); }],
    [2150,()=>{ sfx.giggle(); scene('ro_text',.9,{st,txt:'HEE HEE',c:PINK,sc:2}); }],
    [3850,'end',res(E2)+'Boop. Right on the nose.']]); };

// ---------- Boo!! (A1) ----------
// Rose tiptoes round the back of the monster, crouches, then jumps out yelling BOO. It leaps out of its skin, then laughs.
SC.rv_dots=(s,u)=>{ gfx.globalAlpha=fade(u,.85); const n=Math.floor(s.t*3)%4; label('.'.repeat(n),s.x,s.y,CREAM,3); };
SC.rv_scare=(s,u)=>{ const f=s.f,ms=s.t*1000,F=ST.unit(f);
  if(ms<650) { const q=ms/650; lift(f,-Math.sin(q*Math.PI)*58,Math.sin(q*Math.PI*3)*.25*(1-q)); }
  else if(ms<1000) { const q=(ms-650)/350; lift(f,Math.sin(q*Math.PI)*5,0); }
  else lift(f,0,Math.sin(ms/70)*.1*(1-u));
  if(ms<900) { gfx.globalAlpha=1; const y=F.top-30-Math.sin(cl(ms/650)*Math.PI)*58; bigWord('!!',F.x,y-20,'#ff4a4a',5); for(let k=0;k<6;k++) { const a=k*Math.PI/3+.3; Ln(F.x+Math.cos(a)*44,y+18+Math.sin(a)*36,F.x+Math.cos(a)*58,y+18+Math.sin(a)*48,3,CREAM); } }
  if(ms>1050) { gfx.globalAlpha=fade(u,.85); label('HA HA',F.x+Math.sin(ms/90)*3,F.top-26,GOLD,2); } };
Rm.boo=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),me=ST.unit(m);
  const w1={x:Math.min(560,F.x+F.w*.5+34),y:Math.max(128,F.base-62)},w2={x:F.x,y:Math.max(122,F.base-74)},pB={x:Math.max(22,F.x-F.w*.5-18),y:Math.min(314,F.base+2)};
  const tip=(u,tt)=>-Math.abs(Math.sin(tt*5))*7;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',dy:tip,sc:.94},{t:1150,x:w1.x,y:w1.y,f:'walk',dy:tip,sc:.92},{t:1900,x:w2.x,y:w2.y,f:'walk',dy:tip,sc:.92},
    {t:2450,x:pB.x,y:pB.y,f:'kneel',sc:.92},{t:2950,f:'celeb',hop:34,sc:u=>.92+ez(u/.3)*.4},{t:3450,f:'celeb',sc:1.3,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},
    {t:3800,f:'celeb',hop:10,hn:2},{t:4200,f:'runR'},{t:5100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose tiptoes. Very quietly. Extremely quietly.'); say(m.id,'boo'); }],
    [400,()=>{ scene('ro_text',1.1,{st,txt:'SHHH',c:CREAM,sc:2}); sfx.select(); }],
    [1150,()=>{ scene('rv_dots',1.6,{x:F.x+F.w*.3,y:F.top-22}); setMessage(cap(t.def?t.def.the:t.name)+' has no idea. None.'); }],
    [2450,()=>{ setMessage('Right behind it. She crouches down...'); sfx.slideWhistle(); }],
    ['hf',2950],
    [2950,()=>{ E2.apply(); sfx.boo?sfx.boo():sfx.boing(); sfx.boing(); scene('rv_flash',.25,{a:.75}); scene('rv_big',1.3,{x:pB.x+20,y:F.top-104,txt:'BOO!!',c:'#ff5a8a',sc:5,rot:-.08});
      scene('rv_scare',1.8,{f:t}); ST.jolt(t,.5); }],
    [4000,()=>{ sfx.giggle(); setMessage('It jumped right out of its skin. Then it laughed. Rose laughs too.'); }],
    [5200,'end',()=>t&&B2.move&&B2.move.kindOnFoe?kindLine(t):'It jumped out of its skin. Then it laughed.']]); };

// ---------- Dress-Up Tiara (A2) ----------
// Rose skips over holding a giant plastic tiara over her head, jumps up and crowns the monster. It admires itself.
SC.rv_tiara=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f); let x,y,sc,tilt;
  if(ms<P.toss) { const p=head(s.st,-14); x=p.x-4; y=p.y+Math.sin(ms/120)*2; sc=.7; tilt=Math.sin(ms/200)*.12; }
  else if(ms<P.on) { const q=ez((ms-P.toss)/(P.on-P.toss)),p=head(s.st,-14); x=lerp(p.x-4,F.x,q); y=lerp(p.y,F.top+2,q)-Math.sin(q*Math.PI)*30; sc=lerp(.7,.95,q); tilt=q*6.28; }
  else { const q=ez((ms-P.on)/350); x=F.x+(s.f.ox||0); y=F.top+2+(s.f.oy||0); sc=.95; tilt=lerp(.5,0,q)+(s.f.spin||0); }
  gfx.globalAlpha=fade(u,.94); gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(sc,sc); PROP2.tiara({},0); gfx.restore();
  if(ms>P.on) for(let k=0;k<3;k++) { const tw=(Math.sin(ms/150+k*2)+1)/2; star(x-26+k*26,y-26-k%2*8,3+tw*4,CREAM,ms/300); } };
SC.rv_preen=(s,u)=>{ const ms=s.t*1000; lift(s.f,-Math.abs(Math.sin(ms/220))*4,Math.sin(ms/260)*.14); };
Rm.dress_up_tiara=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,24),plan={toss:1500,on:1750};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:9,hn:6},{t:1100,x:p.x,y:p.y,f:'expr'},{t:1300,f:'celeb',hop:46},{t:1800,f:'idle'},{t:2000,f:'act'},
    {t:2700,f:'celeb',hop:10,hn:2},{t:3200,f:'walkR',hop:6,hn:5},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose skips over with the biggest tiara in the dress-up box.'); say(m.id,'dress_up_tiara'); scene('rv_tiara',4.3,{st,f,plan}); }],
    [1300,()=>{ sfx.jumpWhistle(); }],
    ['hf',plan.on],
    [plan.on,()=>{ sfx.ding(); sfx.bonk(); ST.jolt(f,.35); landHit(100); scene('rv_burst',.8,{x:F.x,y:F.top,n:10,r:52,c:GOLD,c2:PINK}); scene('rv_big',1.1,{x:F.x,y:F.top-74,txt:'CROWNED!',c:GOLD,sc:3}); }],
    [2000,()=>{ scene('rv_preen',1.7,{f}); setMessage(cap(f.def?f.def.the:f.name)+' looks at itself. And looks. And looks.'); }],
    [2300,()=>{ scene('ro_text',1.1,{x:F.x+62,y:F.top-8,txt:'SO PRETTY',c:PINK,sc:2}); sfx.giggle(); }],
    [4300,'end',res(E2)+'It\'s too busy admiring its tiara to stand up straight.']]); };

// ---------- Giggle Storm (A3) ----------
// Rose gets the giggles, falls over laughing, and the giggles become a pink storm cloud that rains HA HA HA on the row.
const GIG=['HA','HEE','HO','HA','TEE','HA'];
SC.rv_storm=(s,u)=>{ const G=s.G,ms=s.t*1000,g=ez(ms/450),cx=G.x,cy=Math.max(40,G.top-48),w=(G.w/2+70)*g;
  gfx.globalAlpha=fin(u,.05)*fade(u,.86);
  for(let k=0;k<7;k++) { const a=k/7*Math.PI*2+ms/900; EO(cx+Math.cos(a)*w*.7,cy+Math.sin(a)*14*g,26*g+.1,18*g+.1,k%2?PINK:'#ffd0e2'); }
  E(cx,cy,w*.8+.1,20*g+.1,'#ffd0e2');
  for(let k=0;k<22;k++) { const q=((ms/700)+k*.137)%1,x=cx-w+((k*53)%100)/100*w*2,y=cy+10+q*(G.base-cy-6); gfx.globalAlpha=fin(u,.05)*fade(u,.86)*(1-q*.4);
    label(GIG[k%GIG.length],x+Math.sin(ms/200+k)*5,y,k%3?PINK2:CREAM,k%4?2:3); }
  for(let k=0;k<10;k++) { const q=((ms/1300)+k*.1)%1,x=lerp(576,0,q),y=50+((k*37)%140)+Math.sin(ms/240+k)*10; gfx.globalAlpha=fade(u,.86)*.8; label(GIG[(k+2)%GIG.length],x,y,k%2?PINK:GOLD,2); } };
SC.rv_laughs=(s,u)=>{ const ms=s.t*1000; for(const f of s.list) lift(f,-Math.abs(Math.sin(ms/110+f.idx))*6,Math.sin(ms/90+f.idx)*.12); };
Rm.giggle_storm=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,52),lie=lieDy();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'celeb',hop:10},{t:1000,f:'expr',dx:(u,tt)=>Math.sin(tt*40)*1.5},
    {t:1400,f:'idle',rot:u=>-ez(u/.15)*1.45,dy:(u,tt)=>ez(u/.15)*lie-Math.abs(Math.sin(tt*16))*4},{t:3300,f:'celeb',hop:16},{t:3600,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose runs over. She\'s trying not to laugh. She\'s failing.'); say(m.id,'giggle_storm'); }],
    [1000,()=>{ sfx.giggle(); scene('ro_text',.7,{st,txt:'PFFT',c:PINK,sc:2}); }],
    [1400,()=>{ sfx.giggle(); scene('rv_storm',2.4,{G}); setMessage('She falls over giggling. The giggles turn into a storm.'); }],
    [1900,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(34); scene('rv_laughs',1.6,{list}); }],
    [2300,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(33); }],
    ['hf',2700],
    [2700,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(33); scene('rv_big',1.2,{x:G.x,y:G.top-74,txt:'HA HA HA',c:PINK2,sc:4}); }],
    [4400,'end',res(E2)+'Nobody can keep a straight face. Not even the monsters.']]); };

// ---------- Lamby Hug (A4) ----------
// Rose carries Lamby over and squishes him onto a friend for a big hug. Hearts everywhere.
SC.rv_hug=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,sc=1.25,rot=.3,sx=1,sy=1;
  if(ms<P.press||ms>P.back) { const h=hand(); x=h.x-2; y=h.y+4; }
  else { const q=ez((ms-P.press)/220),sq=ms<P.back-150?Math.abs(Math.sin((ms-P.press)/140))*.16:0; x=lerp(hand().x-2,P.tx,q); y=lerp(hand().y+4,P.ty,q); sc=lerp(1.25,1.6,q); rot=lerp(.3,-.1,q); sx=1+sq; sy=1-sq; }
  gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(sx,sy); plush(0,0,sc,{pose:'held',rot}); gfx.restore();
  if(ms>P.press+150&&ms<P.back-100) label('SQUISH',P.tx,P.ty-44+Math.sin(ms/80)*2,PINK2,2); };
Rm.lamby_hug=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,20),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'expr'},{t:1200,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*3},{t:2500,f:'celeb',hop:10},{t:2900,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:5,hn:6},{t:1100,x:sp.x,y:sp.y,f:'expr'},{t:1400,f:'act',dx:u=>-ez(u)*8},{t:2500,f:'celeb',hop:10},{t:2900,f:'walkR',hop:4,hn:5},{t:3900,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),press=self?1200:1400,end=self?3400:4000;
  const plan={press,back:2500,tx:self?H.x-6:H.x+4,ty:self?H.mid+2:H.mid};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose gives Lamby the biggest squeeze. Lamby squeezes back. Probably.':'Rose carries Lamby over to '+t.name+'. Lamby has hugs to give.'); say(m.id,'lamby_hug'); scene('rv_hug',end/1000,{plan}); }],
    [press,()=>{ sfx.boing(); }],
    ['hf',press+300],
    [press+300,()=>{ E2.apply(); sfx.baa(); sfx.heal(); scene('ro_glow',1,{x:H.x,y:H.mid,c:PINK}); scene('rv_hearts',1.1,{x:H.x,y:H.top+6,n:7,r:52,sz:8}); hopOf(t!==m?t:null); }],
    [press+700,()=>{ scene('rv_big',1,{x:H.x,y:H.top-26,txt:'SQUEEZE',c:PINK,sc:3}); sfx.ding(); }],
    [end,'end',kindLine(t,'Lamby hugs are proven to work. Rose proved it.')]]); };

// ---------- Floor Is Lava! (A5) ----------
// Rose yells THE FLOOR IS LAVA, throws down a cushion and hops on it. Lava floods under the row; the monsters hot-foot it.
SC.rv_cush=(s,u)=>{ const g=ez(u/.08); gfx.globalAlpha=fade(u,.94); const x=s.x,y=s.y; EO(x,y-6,34*g+.1,12*g+.1,PURP); E(x-6,y-10,20*g+.1,4*g+.1,'#dcc4fa');
  for(const sd of [-1,1]) { E(x+sd*34*g,y-6,4,4,GOLD); } E(x,y-7,3,3,'#8a5ad0'); };
SC.rv_lava=(s,u)=>{ const G=s.G,ms=s.t*1000,grow=ez(ms/400),drain=ms>s.drainAt?ez((ms-s.drainAt)/400):0,g=grow*(1-drain); if(g<=0) return;
  gfx.globalAlpha=.95;
  for(const p of G.list) { const rx=(p.w*.5+22)*g+.1,ry=13*g+.1; E(p.x,p.base+3,rx+3,ry+3,'#7a1a0a'); E(p.x,p.base+3,rx,ry,LAVA); E(p.x-rx*.2,p.base,rx*.55,ry*.45,LAVA2);
    for(let k=0;k<4;k++) { const q=((ms/520)+k*.25+p.x*.01)%1,x=p.x-rx*.7+k*rx*.47,y=p.base+2-q*16; gfx.globalAlpha=(1-q)*g; EO(x,y,2.5+q*3,2.5+q*3,k%2?LAVA2:'#ff9a3a'); }
    gfx.globalAlpha=g*.22; E(p.x,p.base-p.h*.4,rx*.9,p.h*.6,'#ff8a3a'); gfx.globalAlpha=.95; } };
SC.rv_hotfoot=(s,u)=>{ const ms=s.t*1000; for(const f of s.list) { const F=ST.unit(f); lift(f,-Math.abs(Math.sin(ms/95+f.idx*1.7))*18,Math.sin(ms/120+f.idx)*.08);
  if(Math.floor(ms/300+f.idx)%2) { gfx.globalAlpha=fade(u,.85); label('HOT',F.x+(f.idx%2?-14:14),F.top-20,'#ff5a2a',2); } } };
Rm.floor_is_lava=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,46),cush={x:p.x,y:p.y};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:700,x:p.x,y:p.y,f:'idle'},{t:800,f:'expr',dx:(u,tt)=>Math.sin(tt*35)*1.5},
    {t:1350,f:'celeb',hop:30},{t:1700,f:'balance',dy:u=>-9,rot:(u,tt)=>Math.sin(tt*6)*.12},{t:3500,f:'celeb',hop:12,dy:-9},{t:3800,f:'runR'},{t:4500,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose runs right up to the enemies.'); say(m.id,'floor_is_lava'); }],
    [800,()=>{ scene('rv_big',1.4,{st,txt:'THE FLOOR IS LAVA!',c:'#ff7a3a',sc:2}); sfx.charge(); }],
    [1250,()=>{ scene('rv_cush',3.0,{x:cush.x,y:cush.y}); sfx.thud(); }],
    [1350,()=>{ sfx.jumpWhistle(); setMessage('She hops onto a cushion. Everybody else is standing in lava.'); }],
    [1500,()=>{ scene('rv_lava',2.2,{G,drainAt:1800}); sfx.whoosh(); }],
    ['hf',1900],
    [1900,()=>{ sfx.boing(); sfx.bonk(); all(list); landHit(100); scene('rv_hotfoot',1.3,{list}); scene('rv_big',1.1,{x:G.x,y:G.top-74,txt:'HOT HOT!',c:'#ff5a2a',sc:4}); }],
    [2300,()=>{ sfx.boing(); }],
    [2700,()=>{ sfx.boing(); }],
    [3500,()=>{ scene('ro_text',.8,{st,txt:'SAFE',c:PINK}); sfx.ding(); }],
    [4600,'end',res(E2)+'House rule: lava means cushions.']]); };

// ---------- Piggyback Pounce (B2) ----------
// Rose climbs up onto Tom's shoulders (or a cushion tower if he is away), springs off in a big flip and double-stomps
// the monster. The wind-up is cancelled and the most hurt friend gets a nudge.
SC.rv_tower=(s,u)=>{ gfx.globalAlpha=fade(u,.9); const g=ez(u/.1); if(PROPART.draw('rose/stack_of_cushions',s.x,s.y+1-22*g,{h:46*g+.1})) return; for(let k=0;k<3;k++) EO(s.x,s.y-6-k*13*g,30-k*3,7,[PURP,PINK,SKY][k]); };
Rm.piggyback_pounce=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),tom=tomUp(),me=ST.unit(m),top={x:F.x,y:F.top+8},fp=front(F,20);
  const TU=tom?ST.unit(tom):null;
  const perch=tom?(()=>ride(tom)):(()=>({x:me.x,y:me.base-40}));
  const K=[{t:0,x:'home',y:'home',f:tom?'run':'idle'}];
  if(tom) K.push({t:650,x:TU.x+28,y:TU.base+3,f:'celeb',hop:46,ns:true});
  else K.push({t:650,f:'celeb',hop:30,ns:true});
  K.push({t:1100,x:()=>perch().x,y:()=>perch().y,f:'celeb',ns:true},{t:1500,f:'kneel',ns:true},
    {t:1750,x:()=>perch().x,y:()=>perch().y,f:'celeb',ns:true,dy:u=>-Math.sin(u*Math.PI)*110,rot:u=>-ez(u)*Math.PI*2,sc:1.12,ease:'lin'},
    {t:2400,x:top.x,y:top.y,f:'kneel',ns:true,dy:u=>-Math.abs(Math.sin(u*Math.PI))*30},{t:2700,f:'kneel',ns:true},{t:2800,f:'celeb',ns:true,hop:24},
    {t:3150,x:fp.x,y:fp.y,f:'celeb',hop:8},{t:3500,f:'runR'},{t:4200,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage(tom?'Rose climbs up Tom like a tree.':'Rose builds a cushion tower and climbs it.'); say(m.id,'piggyback_pounce'); if(!tom) scene('rv_tower',2.0,{x:me.x,y:me.base}); }],
    [1100,()=>{ scene('ro_text',.8,{st,txt:'GIDDYUP',c:PINK,sc:2}); if(tom) battle.fx[tom.idx].hop=.25; sfx.select(); }],
    [1750,()=>{ sfx.jumpWhistle(); if(tom) battle.fx[tom.idx].hop=.4; setMessage('She springs off. Full flip.'); }],
    ['hf',2400],
    [2400,()=>{ sfx.thud(); sfx.boing(); ST.jolt(f,.6); landHit(50); scene('rv_rings',.6,{x:F.x,y:F.top+4,r:46}); scene('rv_big',.9,{x:F.x,y:F.top-74,txt:'BOING!',c:PINK2,sc:4}); }],
    [2700,()=>{ sfx.thud(); sfx.boing(); ST.jolt(f,.6); landHit(50); scene('rv_burst',.7,{x:F.x,y:F.top,n:8,r:44}); }],
    [3150,()=>{ E2.apply(); const low=b2LiveParty().slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]; if(low) { const L=ST.unit(low); scene('ro_tip',1.0,{x:L.x+L.w*.5+6,y:L.mid}); if(low!==m) battle.fx[low.idx].hop=.3; } sfx.ding(); }],
    [4300,'end',res(E2)+(tom?'Tom has been used as a diving board. Again.':'The cushion tower held. Mostly.')]]); };

// ---------- Bedtime Story (B3) ----------
// Rose sits down by a friend with Lamby and a big picture book. The lights go down, the stars come out, Zzz, THE END.
SC.rv_night=(s,u)=>{ const ms=s.t*1000+(s.t0||0),g=ez((ms-(s.t0||0))/400)*(ms>s.upAt?1-ez((ms-s.upAt)/400):1); if(g<=0) return;
  const gr=gfx.createRadialGradient(s.x,s.y,24,s.x,s.y,170); gr.addColorStop(0,'rgba(28,36,72,0)'); gr.addColorStop(1,'rgba(20,26,58,.72)');
  gfx.globalAlpha=g; gfx.fillStyle=gr; gfx.fillRect(0,0,576,324);
  EO(470,46,16,16,'#fff4c8'); E(477,41,13,13,'#2a3460');
  for(let k=0;k<14;k++) { const tw=(Math.sin(ms/220+k*1.7)+1)/2; star(30+(k*41)%520,18+(k*29)%80,2+tw*3,'#fff4c8',0); } };
SC.rv_book=(s,u)=>{ const P=s.plan,ms=s.t*1000+P.sit; if(ms<P.sit) return; const g=ez((ms-P.sit)/250),x=P.bx,y=P.by;
  const page=ms<P.turn1?0:(ms<P.turn2?1:2),flip=(at)=>ms>at&&ms<at+300?Math.cos(cl((ms-at)/300)*Math.PI):1;
  gfx.globalAlpha=fade(u,.95); gfx.save(); gfx.translate(x,y); gfx.scale(g,g);
  if(PROPART.draw('rose/picture_book',0,0,{w:94})) { if(page===2) { RO(-24,-20,48,36,CREAM); label('THE',0,-16,'#5a3a8a',2); label('END',0,0,'#5a3a8a',2); } gfx.restore(); plush(x-62,y+14,1.05,{pose:'held',rot:Math.sin(ms/500)*.05}); return; }
  RO(-46,-30,92,60,'#5a8ad0'); R(-43,-27,42,54,CREAM); R(1,-27,42,54,CREAM); R(-1,-30,2,60,OUT);
  if(page===0) { E(-22,-6,10,10,'#ffe08a'); E(-18,-9,8,8,CREAM); for(let k=0;k<3;k++) R(8,-16+k*10,28,3,'#9aa3b8'); }
  else if(page===1) { gfx.save(); gfx.translate(-22,4); plush(0,0,.55,{pose:'held'}); gfx.restore(); for(let k=0;k<3;k++) R(8,-16+k*10,28,3,'#9aa3b8'); }
  else { label('THE',22,-14,'#5a3a8a',2); label('END',22,2,'#5a3a8a',2); heart(-22,0,9,'#ff6b9a'); }
  const fl=flip(P.turn1)*flip(P.turn2); if(fl<1) { gfx.save(); gfx.scale(Math.abs(fl),1); R(0,-27,42,54,'#f2ead6'); gfx.restore(); }
  gfx.restore(); plush(x-62,y+14,1.05,{pose:'held',rot:Math.sin(ms/500)*.05}); };
SC.rv_zzz=(s,u)=>{ for(let k=0;k<3;k++) { const q=((s.t*1000/900)+k/3)%1; gfx.globalAlpha=(1-q)*fade(u,.85); label('Z',s.x+8+q*22+Math.sin(q*6)*4,s.y-q*40,'#cfe0ff',2+(k===1?1:0)); } };
Rm.bedtime_story=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,34),self=t===m;
  // The spoken line is about 7.2 s long (baked clip), so the whole story runs past it: page turns at 3.2 s and 5.0 s,
  // heal at 6.0 s, THE END at 6.5 s, Rose finishes and walks home by about 8.8 s.
  const sit=self?400:1000,end=self?8200:8800,turn1=3200,turn2=5000,healAt=6000,endAt=6500;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:sit,f:'sitStory'},{t:7000,f:'celeb',hop:8},{t:7500,f:'idle'},{t:7900,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:6},{t:sit,x:sp.x,y:sp.y,f:'sitStory'},{t:7000,f:'celeb',hop:8},{t:7500,f:'walkR',hop:4,hn:5},{t:8400,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),bx=Math.min(520,sp.x+(self?-40:-48)),by=sp.y-34;
  const plan={sit,turn1,turn2,bx,by};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose sits down with Lamby and her favorite book.':'Rose brings Lamby and her favorite book over to '+t.name+'.'); say(m.id,'bedtime_story'); scene('ro_carry',sit/1000,{dy:8,sc:1}); }],
    [sit,()=>{ scene('rv_book',(end-sit-200)/1000,{plan}); scene('rv_night',(endAt+400-sit)/1000,{x:(bx+H.x)/2,y:H.mid,upAt:endAt,t0:sit}); sfx.select(); setMessage('Lights down. Once upon a time...'); }],
    [2200,()=>{ scene('rv_zzz',(healAt-2200)/1000,{x:H.x+H.w*.25,y:H.top}); }],
    [turn1,()=>{ sfx.whoosh(); }],
    ['hf',healAt],
    [healAt,()=>{ E2.apply(); sfx.baa(); sfx.heal(); scene('ro_glow',1,{x:H.x,y:H.mid,c:'#ffd27a'}); scene('ro_flakes',1,{x:H.x,y:H.base,h:H.h}); hopOf(t!==m?t:null); }],
    [turn2,()=>{ sfx.whoosh(); }],
    [endAt,()=>{ scene('rv_big',1.2,{x:bx,y:by-46,txt:'THE END',c:PURP,sc:3}); sfx.ding(); }],
    [end,'end',kindLine(t,'Lamby fell asleep first. He always does.')]]); };

// ---------- Lamby Boomerang (B4) ----------
// Rose ties her hair ribbon to Lamby, whirls him round over her head and lets go. He flies down the row and comes back.
SC.rv_boomer=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); let x,y,rot=0,sc=1.35,trail=false;
  if(ms<P.swing) { x=h.x-4; y=h.y+4; sc=1.1; rot=.3; }
  else if(ms<P.go) { const a=(ms-P.swing)/1000*14,p=head(s.st,-8); x=p.x+Math.cos(a)*36; y=p.y-10+Math.sin(a)*14; rot=a; LnO(h.x,h.y,x,y,2,PINK2); }
  else if(ms<P.back) { const q=(ms-P.go)/(P.back-P.go),a=q*Math.PI*2,cx=(P.x0+P.lx)/2,rx=(P.lx-P.x0)/2; x=cx+Math.cos(a)*rx; y=P.y-Math.sin(a)*P.ry; rot=q*22; trail=true;
    for(let k=1;k<7;k++) { const qq=Math.max(0,q-k*.02),aa=qq*Math.PI*2; gfx.globalAlpha=.5-k*.06; E(cx+Math.cos(aa)*rx,P.y-Math.sin(aa)*P.ry,4,4,PINK2); } }
  else { x=h.x-4; y=h.y+2; sc=1.2; rot=.2; }
  gfx.globalAlpha=1; plush(x,y,sc,{pose:trail||ms<P.go&&ms>P.swing?'fly':'held',rot}); };
Rm.lamby_boomerang=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,58);
  const plan={swing:1300,go:2100,back:3400,x0:Math.max(14,G.x0-24),lx:p.x-16,y:Math.min(G.base-14,G.top+(G.base-G.top)*.55),ry:Math.max(40,(G.base-G.top)*.45)};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:6},{t:900,x:p.x,y:p.y,f:'expr'},{t:1300,f:(u,tt)=>Math.floor(tt*10)%2?'act':'celeb'},
    {t:2100,f:'act',dx:u=>-ez(u/.3)*10},{t:2400,f:'idle',dx:-10},{t:3400,f:'celeb',hop:16},{t:3800,f:'walkR',hop:4,hn:5},{t:4800,x:'home',y:'home',f:'idle'}]);
  const hitAt=k=>{ const q=k===0?.3:.72; return Math.round(plan.go+q*(plan.back-plan.go)); };
  ST.play(E2,[
    [0,()=>{ setMessage('Rose walks up and ties her hair ribbon to Lamby. Double knot.'); say(m.id,'lamby_boomerang'); scene('rv_boomer',4.9,{st,plan}); }],
    [plan.swing,()=>{ sfx.spin?sfx.spin():sfx.whoosh(); setMessage('Round and round and round...'); }],
    [plan.go,()=>{ sfx.whoosh(); scene('rv_big',1,{st,txt:'WHEEE!',c:PINK2,sc:3}); }],
    ['hf',hitAt(0)],
    [hitAt(0),()=>{ sfx.baa(); sfx.bonk(); all(list); landHit(50); scene('rv_burst',.6,{x:G.x,y:G.top+10,n:8,r:44,c:GOLD,c2:PINK}); }],
    [hitAt(1),()=>{ sfx.bonk(); all(list); landHit(50); }],
    [plan.back,()=>{ sfx.ding(); scene('rv_hearts',.9,{x:p.x-6,y:p.y-RH()*.7,n:5,r:36,sz:6}); scene('ro_text',.9,{st,txt:'GOT HIM',c:PINK,sc:2}); }],
    [4900,'end',res(E2)+'Lamby always comes back. That\'s the rule.']]); };

// ---------- Pillow Fort (B5) ----------
// Rose runs into the middle of everyone and cushions fly in from every direction; a big quilt goes over the top.
// PASSWORD? sign. The party is Guarded; Tom gets a little rest.
const CUSH=[PURP,PINK,SKY,GOLD,'#a8e0b0'];
const cushion=(x,y,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); RO(-15,-7,30,14,c); E(0,0,2,2,OUT); for(const sd of [-1,1]) E(sd*15,sd*7,2.5,2.5,c); gfx.restore(); };
SC.rv_fort=(s,u)=>{ const ms=s.t*1000,P=s.plan,U=P.U; gfx.globalAlpha=fade(u,.92);
  U.forEach((q,i)=>{ for(let k=0;k<3;k++) { const at=P.fly+i*120+k*90,qq=ez((ms-at)/280); if(qq<=0) continue; const tx=q.x-20+k*20,ty=q.base-4-(k===1?12:0),sx=k%2?600:q.x+(k-1)*120,sy=k%2?q.base-120:-30;
    cushion(lerp(sx,tx,qq),lerp(sy,ty,qq)-Math.sin(qq*Math.PI)*30,CUSH[(i+k)%CUSH.length],(1-qq)*4+(k-1)*.12); } });
  const dq=ez((ms-P.drape)/350); if(dq>0) { const x0=P.x0-12,x1=P.x1+12,yt=P.top-20,yb=lerp(yt,P.top-8,dq);
    gfx.beginPath(); gfx.moveTo(x0,yb+18); gfx.lineTo(x0+6,yt); gfx.quadraticCurveTo((x0+x1)/2,yt-26*dq,x1-6,yt); gfx.lineTo(x1,yb+18);
    for(let k=6;k>=0;k--) gfx.lineTo(x0+(x1-x0)*k/6,yb+18+(k%2?6:0)); gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); gfx.fillStyle='#f3b0c8'; gfx.fill();
    gfx.save(); gfx.clip(); for(let i=0;i<10;i++) for(let j=0;j<3;j++) if((i+j)%2) R(x0+i*(x1-x0)/10,yt-30+j*18,(x1-x0)/10,18,'#ffd6e4'); gfx.restore();
    if(ms>P.sign) { const g=ez((ms-P.sign)/200),sx=(x0+x1)/2,sy=yt-24*dq; RO(sx-1,sy-30*g,3,30*g,'#8a5a30'); gfx.save(); gfx.translate(sx,sy-30*g); gfx.scale(g,g); RO(-34,-16,68,18,CREAM); label('PASSWORD?',0,-12,'#5a3a8a',1); gfx.restore(); } } };
Rm.pillow_fort=E2=>{ const {m,fx}=E2,who=(E2.targets&&E2.targets.length?E2.targets:b2LiveParty()),foe=who.find(u=>u.side==='foe'),tom=!foe&&who.find(u=>u.id==='tom'&&b2Alive(u));
  const U=who.map(u=>ST.unit(u)),me=ST.unit(m);
  const x0=Math.min(...U.map(q=>q.x-q.w*.5)),x1=Math.max(...U.map(q=>q.x+q.w*.5)),topY=Math.max(26,Math.min(...U.map(q=>q.top))-6);
  const px=foe?front(U[0],24).x:Math.round((x0+x1)/2),py=foe?front(U[0],24).y:Math.min(314,Math.max(...U.map(q=>q.base))+4);
  const plan={U,fly:900,drape:1800,sign:2250,x0:foe?Math.min(x0,px-20):x0,x1:foe?Math.max(x1,px+20):x1,top:topY};
  const K=[{t:0,x:'home',y:'home',f:px<me.x?'run':'runR'},{t:800,x:px,y:py,f:'celeb',hop:10,hn:2},{t:1700,f:'kneel'},{t:3100,f:'celeb',hop:16},{t:3450,f:px<me.x?'runR':'run'},{t:4200,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage(foe?'Rose runs over to '+foe.name+'. It needs a fort.':'Rose runs into the middle of everyone. Fort time.'); say(m.id,'pillow_fort'); scene('rv_fort',4.3,{plan}); }],
    [900,()=>{ sfx.whoosh(); setMessage('Cushions. Every cushion in the house.'); }],
    [1200,()=>{ sfx.thud(); }],[1500,()=>{ sfx.thud(); }],
    [1800,()=>{ sfx.whoosh(); setMessage('And the big blanket over the top.'); }],
    ['hf',2150],
    [2150,()=>{ E2.apply(); for(const u of who) { if(u.side==='party'&&u!==m) battle.fx[u.idx].hop=.25; else if(u.side==='foe') ST.jolt(u,.15); } sfx.ding(); sfx.heal(); scene('rv_big',1.3,{x:(plan.x0+plan.x1)/2,y:plan.top-92,txt:'PILLOW FORT!',c:PINK2,sc:3}); }],
    ...(tom?[[2600,()=>{ const T=ST.unit(tom); scene('ro_heart',1.1,{x:T.x,y:T.top-6,r:8}); battle.fx[tom.idx].hop=.3; }]]:[]),
    [3100,()=>{ sfx.giggle(); scene('ro_text',.9,{st,txt:'NO MONSTERS',c:PINK,sc:2}); }],
    [4300,'end',foe?kindLine(foe):'Nobody gets in without the password. The password is Lamby.']]); };
})();

// ================= Option 3 Ultimates (phase 5b, 2026-10-24) =================
// Rose's two Primary Ultimates (Option 2 cards, option3-implementation-brief.md core rule 2), held to the move review rules:
// a six-year-old doing it for real. Tea Party with Lamby (A6): a long kids' table with a lacy pink cloth rolls out under the
// enemies, tiny pink chairs pop up, Lamby sits at the head in a bow tie, Rose pours invisible tea from a big plastic teapot,
// DRINK UP!, every monster lifts a toy cup with its pinky out, and the pretend tea goes off like rainbow fireworks that launch
// the table. Operation Shoulder Mecha (B6): she climbs onto Tom's shoulders, taped-up cardboard boxes dock onto him (chest box
// with a crayon TA-TA 01), a box visor drops over her head, crayon crosshairs lock every enemy, she pulls two paper-towel-tube
// levers and the chest fires a rainbow glitter laser plus a cardboard rocket fist; the boxes fall off and she stays up top.
// Scenes prefix r5_ (no warp). BAR=24 thin letterbox and inBox() clipping, as in Grace's fifth IIFE.
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
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const PO=(pts,c,o=2)=>{ gfx.beginPath(); gfx.moveTo(pts[0][0],pts[0][1]); for(let i=1;i<pts.length;i++) gfx.lineTo(pts[i][0],pts[i][1]); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); if(o) { gfx.strokeStyle=OUT; gfx.lineWidth=o; gfx.lineJoin='round'; gfx.stroke(); } };
const ring=(x,y,rx,ry,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.beginPath(); gfx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2); gfx.stroke(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',HOT='#ff5a9a',GOLD='#ffe08a',CREAM='#fff8e8',PURP='#c9a6f0',SKY='#9fd8ff',MINT='#9be39a',RED='#e0402e';
const BOX='#c9995a',BOXD='#a97a3e',BOXL='#e2bb80',TAPE='#efe0a8';
const RAINBOW=['#ff5a5a','#ffb04a','#ffe08a','#9be39a','#5cb8ff','#c39bff'];
ST.nw('r5_');
const res=E2=>E2.result?E2.result+' ':'';
const foesOf=E2=>{ const l=(E2.targets||[]).filter(t=>t.side==='foe'); return l.length?l:b2LiveFoes(); };
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const plush=(x,y,sc,o)=>RFX.plush(x,y,sc,o||{});
const RSP=()=>BATTLE_SPRITES.rose,RH=()=>RSP().idle.length*RSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const tomUp=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
// Where a monster's mouth is (data/monsters.js mouth pixel), for the toy cups.
const mouthOf=f=>{ const F=ST.unit(f),d=f.def||MONSTERS[f.id]||{},S=d.sprite;
  if(!S||!d.mouth) return {x:F.x-F.w*.2,y:F.top+F.h*.55};
  const W=S[0].length,H=S.length; return {x:F.x-F.w/2+F.w*(d.mouth[0]+.5)/W,y:F.top+F.h*(d.mouth[1]+.5)/H}; };
const BAR=24;
SC.r5_bars=(s,u)=>{ const k=ez(u/.08)*(u>.93?(1-u)/.07:1); R(0,0,576,BAR*k,'#000'); R(0,324-BAR*k,576,BAR*k,'#000'); };
const inBox=fn=>(s,u)=>{ gfx.save(); gfx.beginPath(); gfx.rect(0,BAR,576,324-BAR*2); gfx.clip(); fn(s,u); gfx.restore(); };
SC.r5_big=inBox((s,u)=>{ const pop=u<.12?ez(u/.12)*1.3:lerp(1.3,1,cl((u-.12)/.12)),sc=s.sc||4,w=(s.txt.length*4-1)*sc;
  let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+BAR+16,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5-ez(u/.3)*4,s.c||PINK,sc); gfx.restore(); gfx.globalAlpha=1; });
SC.r5_flash=(s,u)=>{ gfx.globalAlpha=(1-u)*(s.a||.6); R(0,0,576,324,s.c||'#ffffff'); gfx.globalAlpha=1; };
SC.r5_burst=(s,u)=>{ const n=s.n||10; for(let k=0;k<n;k++) { const a=k/n*Math.PI*2+(s.seed||0),d=ez(u)*(s.r||48); gfx.globalAlpha=fade(u,.5);
  star(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.75,(s.sz||7)*(1-u*.5),k%2?(s.c2||GOLD):(s.c||PINK),u*4+k); } gfx.globalAlpha=1; };
SC.r5_hearts=(s,u)=>{ for(let k=0;k<(s.n||6);k++) { const a=-Math.PI/2+(k-(s.n||6)/2+.5)*.45,d=ez(u)*(s.r||46); gfx.globalAlpha=fade(u,.6); heart(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d,(s.sz||7)*(1-u*.3),k%2?'#ff6b9a':PINK2); } gfx.globalAlpha=1; };
SC.r5_glow=(s,u)=>{ gfx.globalAlpha=fin(u,.2)*fade(u,.6)*.4; E(s.x,s.y,s.rx||36,s.ry||50,s.c||GOLD); gfx.globalAlpha=1; };

// ---------- Tea Party with Lamby (A6) ----------
// Every enemy gets its own little kids' table with a lacy pink cloth and a tiny pink chair to perch on. Lamby sits on his
// own chair at the head of the party in a red bow tie. Rose walks round with a big plastic teapot pouring invisible tea into
// a toy cup at every place, claps DRINK UP!, every monster lifts its cup with the pinky out, and the pretend tea goes off
// like rainbow fireworks that launch the tables. P: the plan (timings in absolute ms, places).
const CUPSRC=[[0,0,88,52],[82,24,76,66],[0,58,88,68]];   // pink, blue and purple cup cut out of the painted toy_teacups set
const teacup=(x,y,sc=1,pinky=false,vr=0)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  if(PROPART.draw('rose/toy_teacups',0,1,{w:21,src:CUPSRC[vr%3]})) { if(pinky) { LnO(10,-5,13,-11,2,'#f0c8a8'); EO(13,-11,1.4,1.4,'#f0c8a8'); } gfx.restore(); return; }
  EO(0,4,9,2.5,CREAM); PO([[-7,-6],[7,-6],[5,3],[-5,3]],'#ffffff',2); R(-6,-4,12,2,PINK2); heart(0,-.5,1.6,PINK2);
  gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.beginPath(); gfx.arc(8,-2,3.5,-1.3,1.3); gfx.stroke(); gfx.strokeStyle='#ffffff'; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(8,-2,3.5,-1.3,1.3); gfx.stroke();
  if(pinky) { LnO(10,-5,13,-11,2,'#f0c8a8'); EO(13,-11,1.4,1.4,'#f0c8a8'); } gfx.restore(); };
// The big pink plastic teapot: lid knob, spout (left), handle, a white heart.
const teapot=(x,y,sc,tilt)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(sc,sc);
  if(PROPART.draw('rose/pink_teapot',-1,-4,{w:40})) { gfx.restore(); return; }
  gfx.strokeStyle=OUT; gfx.lineWidth=5; gfx.beginPath(); gfx.arc(9,-1,6,-1.4,1.4); gfx.stroke(); gfx.strokeStyle=PINK2; gfx.lineWidth=2.5; gfx.beginPath(); gfx.arc(9,-1,6,-1.4,1.4); gfx.stroke();
  PO([[-8,-2],[-17,-10],[-19,-9],[-11,3]],PINK2,2);
  EO(0,0,11,9,PINK2); E(-3,-3,5,3,'#ffd0e4'); RO(-7,-11,14,3,HOT); EO(0,-13,2.5,2,HOT); heart(2,2,3,'#ffffff'); gfx.restore(); };
// A tiny pink chair (seat, back, legs). sd: which side the back is on.
const chair=(x,y,sc=1,sd=-1)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(sc,sc);
  if(PROPART.draw('rose/tiny_pink_chair',0,-7,{h:38,flip:sd<0})) { gfx.restore(); return; }
  for(const lx of [-9,7]) { R(lx-1,-2,5,14,OUT); R(lx,-1,3,12,HOT); } R(sd*11-2,-24,6,24,OUT); R(sd*11-1,-23,4,22,HOT); RO(sd*11-5,-26,12,5,PINK2); RO(-12,-6,24,5,PINK2); gfx.restore(); };
// One place: a little table in front of the enemy (cloth, scallops, dots), its chair, and the cup once it is poured.
SC.r5_tables=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+(s.t0||0); gfx.globalAlpha=1;
  for(const c of P.places) { const g=ms>c.at?ez((ms-c.at)/260):0; if(g<=0) continue;
    const up=ms>P.boom?ez((ms-P.boom-c.k*60)/650):0,dy=-up*380,rot=up*(c.k%2?.6:-.6);
    // the chair under the monster's back half (the monster perches on it)
    if(!up) chair(c.chx,c.chy+(1-ez((ms-c.at)/200))*20,1,-1);
    const x0=c.x0,x1=lerp(c.x0+8,c.x1,g),y=c.y+dy;
    gfx.save(); gfx.translate((x0+x1)/2,y); gfx.rotate(rot); gfx.translate(-(x0+x1)/2,-y);
    { const tw=Math.max(56,Math.min(90,(c.x1-c.x0)*.6))*(.4+.6*g),th=tw/1.19;   // painted lace-cloth kids' table under the cup
      if(PROPART.draw('rose/lacy_kids_table',c.cx,y-2+th*.28,{w:tw,h:th})) { if(ms>c.pour&&!(ms>P.drink+c.k*90)) teacup(c.cx,y-9,1.5,false,c.k); if(up) teacup(c.cx,y-9,1.5,false,c.k); gfx.restore(); continue; } }
    for(const lx of [x0+6,x1-8]) { R(lx-3,y,6,16,OUT); R(lx-2,y,4,15,'#f0e2d2'); }
    RO(x0,y-5,x1-x0,6,'#f6ead8');
    R(x0-2,y,x1-x0+4,10,OUT); R(x0,y,x1-x0,9,PINK);
    for(let x=x0;x<x1-4;x+=10) { E(x+5,y+9,6,4.5,OUT); E(x+5,y+9,5,3.5,PINK); E(x+5,y+10,1.6,1.2,'#ffffff'); }
    for(let x=x0+5;x<x1-3;x+=9) E(x,y+4,1.3,1.3,'#ffffff');
    if(ms>c.pour&&!(ms>P.drink+c.k*90)) teacup(c.cx,y-9,1.5,false,c.k);
    if(up) teacup(c.cx,y-9,1.5,false,c.k);
    gfx.restore(); } });
// Raised cups: they float up to each enemy's mouth with the pinky out, and wobble as it sips.
SC.r5_sip=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+P.drink; if(ms>P.boom) return; for(const c of P.places) { const q=ez((ms-P.drink-c.k*90)/400); if(q<=0) continue;
  const x=lerp(c.cx,c.mx+12,q),y=lerp(c.y-9,c.my+4,q)+Math.sin(ms/150+c.k)*1.5*q; teacup(x,y,1.7,q>.5,c.k);
  if(q>=1&&Math.floor(ms/260+c.k)%2) label('SIP',c.mx+34,c.my-22,PINK2,2); } });
// The teapot in her hand, tilted while she pours; invisible tea is a little trickle of sparkles.
SC.r5_pot=(s,u)=>{ const P=s.plan,ms=s.t*1000+P.potUp; if(ms>P.potDown) return; const h=hand(),pouring=P.places.find(c=>ms>c.pour0&&ms<c.pour);
  const tilt=pouring?.8+Math.sin(ms/140)*.1:.1,x=h.x-14,y=h.y+4; teapot(x,y,1.7,-tilt);
  if(pouring) { const sx=x-30,sy=y+4; for(let k=0;k<7;k++) { const q=((ms/280)+k/7)%1; gfx.globalAlpha=1-q; star(sx-q*6+Math.sin(k*2)*3,sy+q*26,2+q*1.5,k%2?'#ffffff':SKY,q*4); } gfx.globalAlpha=1; } };
// Lamby: carried in, sitting on his own chair at the head of the party in a red bow tie, then carried home.
SC.r5_lamby=(s,u)=>{ const P=s.plan,ms=s.t*1000; let x,y,sc=1.1,rot=.25; const seated=ms>=P.seat&&ms<=P.pick;
  if(seated) chair(P.lx+4,P.ly+16,1.05,1);
  if(!seated) { const h=hand(); x=h.x+2; y=h.y+6; if(ms>P.pick) { const q=ez((ms-P.pick)/200); x=lerp(P.lx,h.x+2,q); y=lerp(P.ly,h.y+6,q); sc=lerp(1.35,1.1,q); } }
  else { const q=ez((ms-P.seat)/200),h=hand(); x=lerp(h.x+2,P.lx,q); y=lerp(h.y+6,P.ly,q); sc=lerp(1.1,1.35,q); rot=lerp(.25,0,q); }
  if(seated&&ms>P.clap&&ms<P.clap+700) rot=Math.sin((ms-P.clap)/60)*.12;
  if(seated&&ms>P.boom&&ms<P.boom+900) y-=Math.abs(Math.sin((ms-P.boom)/120))*8;
  plush(x,y,sc,{pose:'held',rot});
  if(seated) { const bx=x-12*sc+9,by=y+4*sc; PO([[bx,by],[bx-7,by-5],[bx-7,by+5]],RED,1.5); PO([[bx,by],[bx+7,by-5],[bx+7,by+5]],RED,1.5); EO(bx,by,2,2,'#ff8a7a'); } };
// The geyser: each cup becomes a column of rainbow sparkle fireworks with hearts.
SC.r5_geyser=inBox((s,u)=>{ for(const c of s.places) { const h=ez(u/.3)*200,x=c.mx+12;
  for(let k=0;k<6;k++) { gfx.globalAlpha=.75*fade(u,.6); R(x-12+k*4,c.my-h+k*3,4,h,RAINBOW[k]); }
  for(let k=0;k<12;k++) { const q=cl(u*1.6-k*.05); if(q<=0||q>=1) continue; const a=k/12*Math.PI*2+c.k,d=q*80; gfx.globalAlpha=1-q;
    star(x+Math.cos(a)*d,c.my-h*.8+Math.sin(a)*d*.7,6*(1-q)+2,RAINBOW[k%6],q*5); if(k%3===0) heart(x+Math.cos(a+1)*d*.6,c.my-h*.6+Math.sin(a+1)*d*.5,6,'#ff6b9a'); } }
  gfx.globalAlpha=1; });
// Confetti hearts over the party when the tea refreshes everyone.
SC.r5_refresh=inBox((s,u)=>{ for(let k=0;k<40;k++) { const sp=.6+((k*37)%10)/12,x=s.x0+((k*97+29)%(s.x1-s.x0))+Math.sin(s.t*3+k)*10,y=BAR-10+((s.t*sp*160)+(k*53)%110)%300;
  gfx.globalAlpha=fin(u,.05)*fade(u,.8); if(k%3) heart(x,y,4+(k%2)*2,k%2?PINK:'#ff6b9a'); else star(x,y,3,GOLD,s.t*5+k); } gfx.globalAlpha=1; });
// Enemies perch on their tiny chairs (raised a little, tipped back), wobble while sipping, and are launched at the boom.
SC.r5_sit=(s,u)=>{ const P=s.plan,ms=s.t*1000+(s.t0||0); for(const c of P.places) { const f=c.f;
  if(ms>P.boom) { const q=(ms-P.boom)/1000; lift(f,-Math.max(0,Math.sin(Math.min(1,q*1.4)*Math.PI))*44,Math.sin(q*12)*.12*(1-q)); continue; }
  const g=ms>c.at+150?ez((ms-c.at-150)/200):0,sip=ms>P.drink?Math.sin((ms-P.drink)/170+c.k)*.05:0; lift(f,-g*8,-g*.06+sip); } };
Rm.teaparty_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),party=b2LiveParty(),me=ST.unit(m);
  const order=list.slice().sort((a,b)=>ST.foe(b).x-ST.foe(a).x||ST.foe(a).base-ST.foe(b).base);
  const n=order.length,per=Math.min(520,1300/Math.max(1,n)),S0=1150;
  const places=order.map((f,k)=>{ const F=ST.foe(f),M=mouthOf(f),y=Math.min(286,F.base-6),at0=S0+k*per;
    return {f,k,x0:F.x-F.w*.5-6,x1:F.x+F.w*.5+12,y,cx:F.x+F.w*.5-6,chx:F.x-F.w*.5,chy:Math.min(290,F.base+4),mx:M.x,my:M.y,top:F.top,
      at:300+k*170,pour0:at0+per*.45,pour:at0+per-60,arrive:at0+per*.4,depart:at0,spot:{x:Math.min(548,F.x+F.w*.5+34),y:Math.min(292,F.base+4)}}; });
  const head={x:Math.min(310,Math.round(Gp.x1+100)),y:Math.min(286,Math.round(Gp.base-24))};
  const P={places,drink:2900,boom:3900,potUp:1050,potDown:2550,seat:850,pick:5000,clap:2650,lx:head.x-50,ly:head.y-18};
  const K=[{t:0,x:'home',y:'home',f:'run'},{t:650,x:head.x,y:head.y,f:'idle'},{t:850,f:'act',dx:u=>ez(u)*4},{t:1050,f:'idle'}];
  for(const c of places) K.push({t:c.depart,f:'walk',hop:4,hn:3},{t:c.arrive,x:c.spot.x,y:c.spot.y,f:'act',dx:(u,tt)=>-Math.sin(tt*6)*3,dy:(u,tt)=>-Math.abs(Math.sin(tt*6))*2});
  K.push({t:S0+n*per,f:'walkR',hop:4,hn:3},{t:2600,x:head.x,y:head.y,f:'idle'},{t:2650,f:'celeb',hop:14,hn:2},
    {t:3100,f:'expr',dy:(u,tt)=>-Math.abs(Math.sin(tt*7))*3},{t:3900,f:'celeb',hop:18},{t:4400,f:'celeb',hop:10,hn:2},{t:5000,f:'act'},{t:5300,f:'runR',hop:4,hn:4},{t:6100,x:'home',y:'home',f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ scene('r5_bars',6.4,{}); setMessage('Rose is having a tea party. Everyone is invited. Everyone HAS to come.'); say(m.id,'teaparty_ult'); sfx.ding(); scene('r5_lamby',6.1,{plan:P}); }],
    [300,()=>{ scene('r5_tables',5.9,{plan:P,t0:300}); scene('r5_sit',4.6,{plan:P,t0:300}); sfx.whoosh(); places.forEach(c=>b7Later(()=>sfx.boing(),c.at-300+150)); }],
    [450,()=>{ setMessage('Little lacy tables roll out. Tiny pink chairs pop up under every enemy.'); }],
    [850,()=>{ sfx.baa(); scene('r5_big',1,{x:P.lx,y:P.ly-36,txt:'BOW TIE',c:CREAM,sc:2}); setMessage('Lamby sits at the head of the table. He\'s wearing a bow tie.'); }],
    [1050,()=>{ scene('r5_pot',1.5,{plan:P}); sfx.select(); }],
    [S0,()=>{ setMessage('Rose pours everybody tea. It\'s invisible. It\'s VERY hot.'); places.forEach(c=>b7Later(()=>{ sfx.ting?sfx.ting():sfx.ding(); },c.pour0-S0+120)); }],
    [Math.round(places[0]?places[0].pour0:S0),()=>{ const c=places[0]; if(c) scene('r5_big',1.2,{x:c.cx,y:c.top-30,txt:'INVISIBLE TEA',c:SKY,sc:2}); }],
    [2650,()=>{ sfx.dance&&sfx.dance(); scene('r5_big',1.1,{st,txt:'DRINK UP!',c:PINK2,sc:3}); setMessage('Rose claps. DRINK UP!'); }],
    [2900,()=>{ scene('r5_sip',1.0,{plan:P}); setMessage('Every enemy lifts a tiny cup. Pinkies up.'); places.forEach(c=>b7Later(()=>sfx.ting?sfx.ting():sfx.select(),c.k*90+400)); }],
    [3050,()=>{ scene('r5_big',.85,{x:Gp.x,y:Gp.top-58,txt:'PINKIES UP!',c:CREAM,sc:3}); }],
    ['hf',3900],
    [3900,()=>{ sfx.whoosh(); sfx.fanfare&&sfx.fanfare(); sfx.bonk(); for(const f of list) ST.jolt(f,.5); landHit(100); scene('r5_flash',.35,{a:.5});
      scene('r5_geyser',1.4,{places}); for(const c of places) scene('r5_burst',.8,{x:c.mx+12,y:c.my,n:10,r:50,c:PINK2,c2:SKY,seed:c.k});
      scene('r5_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'TEA PARTY!',c:GOLD,sc:4}); setMessage('The pretend tea goes off like fireworks!'); }],
    [4400,()=>{ E2.apply(); sfx.heal(); scene('r5_refresh',1.4,{x0:300,x1:570}); for(const p of party) { const q=ST.unit(p); scene('r5_glow',1,{x:q.x,y:q.mid,c:PINK}); scene('r5_hearts',1,{x:q.x,y:q.top+6,n:5,r:40,sz:6}); } }],
    [5000,()=>{ sfx.baa(); scene('r5_big',.9,{st,txt:'THANK YOU!',c:PINK,sc:2}); }],
    [6300,'end',()=>res(E2)+'Best tea party ever. Lamby says everyone had lovely manners.']]); };

// ---------- Operation Shoulder Mecha (B6) ----------
// The base of the mecha: Tom as he is drawn this frame (Rose on his shoulders), or Rose herself if he is down.
const baseOf=(tom,st)=>{ if(tom) { const d=battle.drawnAt&&battle.drawnAt[tom.idx],q=BATTLE_POS[tom.idx],sp=BATTLE_SPRITES.tom,h=sp.idle.length*sp.scale,w=sp.idle[0].length*sp.scale;
    const a=d||{cx:q.x*3,base:q.base*3,h}; return {x:a.cx,base:a.base,h:a.h||h,w}; }
  return {x:st&&st.x!=null?st.x:ST.unit(B2.party.find(p=>p.id==='rose')).x,base:st&&st.y!=null?st.y:300,h:RH(),w:RSP().idle[0].length*RSP().scale}; };
const ride=tom=>{ const b=baseOf(tom); return {x:b.x+2,y:b.base-b.h+20}; };
// Diagonal anime speed lines behind everyone.
SC.r5_speed=(s,u)=>{ const k=fin(u,.1)*fade(u,.7); for(let j=0;j<26;j++) { const q=((s.t*2.6)+j*.137)%1,x=-120+((j*83)%820)-q*260,y=-40+((j*47)%400)+q*130;
  gfx.globalAlpha=k*(.25+(j%3)*.12); Ln(x,y,x+90+(j%4)*30,y-45-(j%4)*15,2+(j%3),j%2?'#ffffff':PINK); } gfx.globalAlpha=1; };
// One cardboard box with tape and crayon. w,h: size; o: {txt, arrow, scrib}
const box=(x,y,w,h,o={})=>{ RO(x-w/2,y-h/2,w,h,BOX); R(x-w/2,y-h/2,w,3,BOXL); R(x-w/2,y+h/2-3,w,3,BOXD); R(x-3,y-h/2,6,h,TAPE);
  if(o.arrow) { Ln(x+w/2-7,y+h/2-4,x+w/2-7,y-h/2+6,1.5,'#5a3a1a'); Ln(x+w/2-10,y-h/2+9,x+w/2-7,y-h/2+6,1.5,'#5a3a1a'); Ln(x+w/2-4,y-h/2+9,x+w/2-7,y-h/2+6,1.5,'#5a3a1a'); }
  if(o.scrib) for(let k=0;k<3;k++) Ln(x-w/2+5,y-h/2+6+k*4,x-w/2+5+w*.25,y-h/2+5+k*4,1.5,['#3a7ad8','#2fa84a','#e0402e'][k]); };
// The armor plan: pieces fly in from off-screen to docking spots on the base, then fall off at P.off.
SC.r5_armor=inBox((s,u)=>{ const P=s.plan,ms=s.t*1000+P.t0,b=baseOf(P.tom,P.st),H=b.h,W=b.w,sm=P.tom?1:.7;
  const spots=[{k:'legF',x:b.x+W*.18,y:b.base-H*.12,w:20*sm,h:24*sm,from:[620,260]},{k:'legB',x:b.x-W*.18,y:b.base-H*.12,w:20*sm,h:24*sm,from:[-60,300]},
    {k:'armB',x:b.x-W*.46,y:b.base-H*.42,w:18*sm,h:30*sm,from:[-60,60]},{k:'chest',x:b.x,y:b.base-H*.42,w:44*sm,h:36*sm,from:[300,-60],chest:true},{k:'armF',x:b.x+W*.46,y:b.base-H*.42,w:18*sm,h:30*sm,from:[640,80]}];
  spots.forEach((p,i)=>{ const at=P.dock0+i*P.step; if(ms<at-300) return; let x,y,rot=0;
    if(ms<at) { const q=ez(1-(at-ms)/300); x=lerp(p.from[0],p.x,q); y=lerp(p.from[1],p.y,q); rot=(1-q)*3; }
    else if(ms>P.off+i*70) { const q=(ms-P.off-i*70)/700; if(q>1.2) return; x=p.x+(i-2)*q*34; y=p.y+q*q*160-Math.sin(Math.min(1,q)*Math.PI)*30; rot=q*(i%2?4:-4); }
    else { x=p.x; y=p.y+(ms<at+120?-Math.sin((ms-at)/120*Math.PI)*4:0); }
    gfx.save(); gfx.translate(x,y); gfx.rotate(rot); const paintedChest=p.chest&&PROPART.draw('rose/cardboard_chest_armor',0,0,{w:p.w*1.1,h:p.h*1.1}); if(!paintedChest) box(0,0,p.w,p.h,{arrow:p.k==='armF'||p.k==='legB',scrib:!p.chest});
    if(p.chest) { const gl=ms>P.charge0&&ms<P.off?.5+.5*Math.sin(ms/60):0; if(gl) { gfx.globalAlpha=gl*.8; E(0,2,16*sm,12*sm,'#ffffff'); gfx.globalAlpha=1; }
      if(!paintedChest) { EO(0,2,10*sm,9*sm,ms>P.charge0&&ms<P.off?GOLD:'#ffe8b0'); star(0,2,6*sm,ms>P.charge0&&ms<P.off?'#ffffff':PINK2);
      label('TA-TA 01',0,-p.h/2+5,'#3a5ad8',1);
      for(const sd of [-1,1]) { EO(sd*16*sm,10*sm,3.5*sm,3.5*sm,sd<0?'#e0402e':'#2fa84a'); Ln(sd*16*sm,10*sm,sd*16*sm+2,7*sm,1.5,OUT); } } }
    gfx.restore(); });
  // the box visor on Rose's head: a cereal-size box with a crayon crosshair window
  if(ms>P.visor&&ms<P.off+300) { const r=P.st&&P.st.x!=null?head(P.st,4):{x:b.x,y:b.base-H}; const q=ez((ms-P.visor)/200),dy=(1-q)*-40,fall=ms>P.off?(ms-P.off)/300:0;
    gfx.save(); gfx.translate(r.x,r.y+dy+fall*fall*60); gfx.rotate(fall*2); if(!PROPART.draw('rose/cereal_box_visor',0,1,{w:34})) { box(0,0,28,24,{}); RO(-11,-4,22,11,'#1c2448'); } ring(0,1,5,5,1.5,'#ff5a5a'); Ln(-9,1,9,1,1,'#ff5a5a'); Ln(0,-4,0,7,1,'#ff5a5a');
      if(ms>P.lock&&ms<P.fire) { gfx.globalAlpha=.5+.5*Math.sin(ms/50); E(0,1,3,3,'#ff5a5a'); gfx.globalAlpha=1; } gfx.restore(); }
  // the paper-towel-tube levers, one in each of Rose's hands, pulled down while it charges
  if(ms>P.charge0-200&&ms<P.off) { const r=P.st&&P.st.x!=null?head(P.st,0):{x:b.x,y:b.base-H}; const pull=ms>P.charge0?ez((ms-P.charge0)/250):0;
    if(PROPART.draw('rose/paper_tube_levers',r.x+2,r.y+20+pull*7,{w:56,rot:(pull-.5)*.25})) {} else
    for(const sd of [-1,1]) { const bx=r.x+sd*22,by=r.y+18; const a=-Math.PI/2+sd*(.5+pull*.7); LnO(bx,by,bx+Math.cos(a)*24,by+Math.sin(a)*24,6,'#f4ecdc'); EO(bx+Math.cos(a)*24,by+Math.sin(a)*24,4,4,sd<0?'#e0402e':'#3a7ad8'); } }
  });
// Crayon crosshairs on every enemy (scribbly red circles).
SC.r5_lock=inBox((s,u)=>{ for(const F of s.list) { const q=ez(u/.15),r=lerp(70,Math.max(26,F.w*.45),q),a=s.t*2;
  gfx.globalAlpha=fade(u,.85); for(let k=0;k<2;k++) ring(F.x+Math.sin(a+k)*1.5,F.mid+Math.cos(a+k)*1.5,r+k*3,r*.85+k*2,2.5,'#ff3a3a');
  Ln(F.x-r-8,F.mid,F.x-r+10,F.mid,2.5,'#ff3a3a'); Ln(F.x+r-10,F.mid,F.x+r+8,F.mid,2.5,'#ff3a3a'); Ln(F.x,F.mid-r-8,F.x,F.mid-r+10,2.5,'#ff3a3a'); Ln(F.x,F.mid+r-10,F.x,F.mid+r+8,2.5,'#ff3a3a'); } gfx.globalAlpha=1; });
// Charge: rainbow rings shrinking into the chest emblem.
SC.r5_charge=(s,u)=>{ const P=s.plan,b=baseOf(P.tom,P.st),c={x:b.x,y:b.base-b.h*.42+2}; for(let k=0;k<4;k++) { const q=((s.t*1.8)+k/4)%1; gfx.globalAlpha=q*.9; ring(c.x,c.y,(1-q)*70+6,(1-q)*60+5,3,RAINBOW[k%6]); }
  gfx.globalAlpha=1; };
// The glitter laser: six rainbow bands from the chest emblem across every enemy, with glitter; and a rocket fist.
SC.r5_laser=inBox((s,u)=>{ const P=s.plan,b=baseOf(P.tom,P.st),c={x:b.x-6,y:b.base-b.h*.42+2},Gp=P.Gp,g=ez(u/.12)*fade(u,.7),xe=-20;
  const ya=Gp.top-6,yb=Gp.base-6;
  for(let k=0;k<6;k++) { const w0=lerp(ya,yb,k/6)+Math.sin(s.t*20+k)*3,w1=lerp(ya,yb,(k+1)/6)+Math.sin(s.t*20+k+1)*3; gfx.globalAlpha=g*.85;
    PO([[c.x,c.y-9+k*3],[lerp(c.x,xe,g),lerp(c.y,w0,g)],[lerp(c.x,xe,g),lerp(c.y,w1,g)],[c.x,c.y-6+k*3]],RAINBOW[k],0); }
  gfx.globalAlpha=g*.7; PO([[c.x,c.y-3],[lerp(c.x,xe,g),lerp(c.y,(ya+yb)/2-10,g)],[lerp(c.x,xe,g),lerp(c.y,(ya+yb)/2+10,g)],[c.x,c.y+3]],'#ffffff',0);
  for(let k=0;k<26;k++) { const q=((s.t*2.4)+k/26)%1,x=lerp(c.x,xe,q),y=lerp(c.y,lerp(ya,yb,(k*7%26)/26),q); gfx.globalAlpha=g*(1-q*.5); star(x,y,2+(k%3),k%2?'#ffffff':GOLD,k); }
  gfx.globalAlpha=1; EO(c.x,c.y,10+Math.sin(s.t*40)*2,10,'#ffffff'); });
SC.r5_fist=inBox((s,u)=>{ const x=lerp(s.x0,-60,ez(u)),y=s.y+Math.sin(u*Math.PI*3)*6; for(let k=0;k<4;k++) { gfx.globalAlpha=.7-k*.15; E(x+36+k*16,y,15-k*3,10-k*2,k%2?'#ffb04a':'#ff5a3a'); }
  gfx.globalAlpha=1; if(PROPART.draw('rose/cardboard_rocket_fist',x,y,{w:66})) return; gfx.save(); gfx.translate(x,y); gfx.scale(1.6,1.6); box(0,0,30,24,{scrib:true}); for(let k=0;k<3;k++) RO(-17,-9+k*7,6,5,BOXL); gfx.restore(); });
SC.r5_stars=(s,u)=>{ for(const F of s.list) { for(let k=0;k<4;k++) { const a=s.t*5+k/4*Math.PI*2; gfx.globalAlpha=fade(u,.75); star(F.x+Math.cos(a)*F.w*.35,F.top-8+Math.sin(a)*6,5,k%2?GOLD:'#ffffff',a); } } gfx.globalAlpha=1; };
Rm.mecha_ult=E2=>{ const {m,fx}=E2,list=foesOf(E2),Gp=ST.group(list),tom=tomUp(),me=ST.unit(m);
  const TU=tom?ST.unit(tom):null,perch=()=>tom?ride(tom):{x:me.x,y:me.base};
  const K=[{t:0,x:'home',y:'home',f:tom?'run':'idle'}];
  if(tom) K.push({t:550,x:TU.x+28,y:TU.base+3,f:'celeb',hop:46,ns:true},{t:900,x:()=>perch().x,y:()=>perch().y,f:'celeb',ns:true});
  else K.push({t:550,f:'celeb',hop:14},{t:900,f:'idle'});
  const sit=Object.assign({ns:!!tom},{x:()=>perch().x,y:()=>perch().y});
  K.push(Object.assign({t:1000,f:'expr',dy:(u,tt)=>-Math.abs(Math.sin(tt*8))*2},sit),Object.assign({t:2400,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*12))*1.5},sit),
    Object.assign({t:3500,f:'celeb',hop:12},sit),Object.assign({t:4100,f:'celeb',dy:(u,tt)=>-Math.abs(Math.sin(tt*6))*3},sit),Object.assign({t:5000,f:'celeb',hop:8,hn:2},sit),
    Object.assign({t:5600,f:'idle'},sit),Object.assign({t:7000,f:'idle'},sit));
  if(!tom) { K.splice(K.length-1,1,{t:6000,x:'home',y:'home',f:'idle'}); }
  const st=ST.keys(fx,K);
  const P={tom,st,t0:0,dock0:1050,step:190,visor:2050,lock:2300,charge0:2700,fire:3500,off:4800,Gp};
  const bounce=k=>{ if(tom) battle.fx[tom.idx].hop=k; };
  ST.play(E2,[
    [0,()=>{ scene('r5_bars',6.2,{}); scene('r5_speed',2.2,{back:true}); setMessage(tom?'Rose scrambles up onto Tom\'s shoulders. Operation Shoulder Mecha!':'Tom is down. Rose builds the mecha around herself.'); say(m.id,'mecha_ult'); sfx.siren&&sfx.siren(); }],
    [900,()=>{ bounce(.3); scene('r5_armor',5.0,{plan:Object.assign({},P,{t0:900})}); sfx.select(); }],
    [1050,()=>{ for(let i=0;i<5;i++) b7Later(()=>{ sfx.chunk?sfx.chunk():sfx.thud(); bounce(.15); },i*190); setMessage('Cardboard boxes fly in and snap on. Tape. Crayon. Robot.'); }],
    [1950,()=>{ scene('r5_big',1.1,{x:300,y:BAR+40,txt:'DOCKING COMPLETE!',c:GOLD,sc:3}); sfx.ding(); }],
    [2050,()=>{ sfx.thud(); setMessage('Rose pulls down her visor. It\'s a cereal box.'); }],
    [2300,()=>{ scene('r5_lock',1.4,{list:list.map(f=>ST.foe(f))}); sfx.beep?sfx.beep():sfx.select(); b7Later(()=>sfx.beep?sfx.beep():sfx.select(),180);
      scene('r5_big',1.2,{x:Gp.x+30,y:Gp.top-58,txt:'TARGET LOCKED: BAD GUYS',c:'#ff6a5a',sc:2}); }],
    [2700,()=>{ scene('r5_charge',.8,{plan:P}); sfx.charge(); setMessage('She pulls both levers. The chest starts to glow.'); }],
    [3100,()=>{ if(tom) scene('r5_big',.6,{x:baseOf(tom).x,y:baseOf(tom).base-baseOf(tom).h-46,txt:'BEEP BOOP',c:SKY,sc:2}); }],
    ['hf',3500],
    [3500,()=>{ sfx.laser(); sfx.whoosh(); scene('r5_laser',1.0,{plan:P}); const b=baseOf(tom,st); scene('r5_fist',.7,{x0:b.x-30,y:b.base-b.h*.5});
      for(const f of list) ST.jolt(f,.6); landHit(100); scene('r5_flash',.35,{a:.55}); bounce(.4);
      scene('r5_big',1.2,{x:Gp.x,y:Gp.top-74,txt:'GLITTER LASER!',c:PINK2,sc:4}); setMessage('GLITTER LASER! And a cardboard rocket punch!'); }],
    [3750,()=>{ sfx.bonk(); for(const f of list) { const F=ST.foe(f); scene('r5_burst',.7,{x:F.x,y:F.mid,n:10,r:50,c:PINK,c2:SKY}); } }],
    [4300,()=>{ E2.apply(); sfx.stun&&sfx.stun(); scene('r5_stars',1.4,{list:list.map(f=>ST.foe(f))}); }],
    [5000,()=>{ scene('r5_big',.9,{st,txt:'WE DID IT!',c:PINK,sc:2}); sfx.ding(); }],
    [4800,()=>{ for(let i=0;i<5;i++) b7Later(()=>sfx.thud(),i*90+400); setMessage(tom?'The boxes fall off. Rose stays up top. Obviously.':'The boxes fall off. Mecha Rose powers down.'); }],
    [6100,'end',()=>res(E2)+(tom?'Mecha Tom Zero. Made of boxes. Piloted by a six-year-old.':'Mecha Rose. Made of boxes. Still counts.')]]); };
})();

// ================= Polish pass (2026-10-24, claude/move-review.md) =================
// RASPBERRY: a big wobbly raspberry spray right across the screen, with a giant wobbly PBBBBT. Dress-Up Tiara: a giant
// tiara that drops onto the monster's head and lands with a CLINK. Lamby Hug: a bigger Lamby squish with a fountain of
// hearts. Lamby Boomerang: a bigger spinning Lamby with a real ribbon trail. Same numbers, same beats. Overrides
// RM.rose.sillyShow, RM.rose.dress_up_tiara, SC.rv_tiara, SC.rv_hug and SC.rv_boomer. Scenes prefix rp_.
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
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const heartO=(x,y,r,c)=>{ heart(x,y,r+2,OUT); heart(x,y,r,c); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',SPIT='#ff8aa8',SPIT2='#ffd0de';
ST.nw('rp_');
const res=E2=>E2.result?E2.result+' ':'';
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const front=(F,gap=26)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const plush=(x,y,sc,o)=>RFX.plush(x,y,sc,o||{});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const RSP=()=>BATTLE_SPRITES.rose,RH=()=>RSP().idle.length*RSP().scale,RW=()=>RSP().idle[0].length*RSP().scale;
const lieDy=()=>RH()*.5-RW()*.5+2;
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };

// ---------- RASPBERRY: a wobbly spray across the screen ----------
// s.mx,s.my = Rose's mouth when she blows; the spray runs left past the monster to the edge of the screen.
SC.rp_spray=(s,u)=>{ const ms=s.t*1000,mx=s.mx,my=s.my,reach=ez(ms/320),x1=lerp(mx,-30,reach),F=s.F; gfx.globalAlpha=fade(u,.78);
  const yAt=(x,b)=>{ const d=mx-x; return my+d*.16*b+Math.sin(d/20-ms/38+b*1.7)*(3+d*.05); };
  for(const [b,w,c] of [[-1,9,SPIT2],[1,9,SPIT2],[0,13,SPIT]]) { gfx.lineJoin='round'; gfx.lineCap='round';
    for(const [ww,cc] of [[w+5,OUT],[w,c]]) { gfx.strokeStyle=cc; gfx.lineWidth=ww; gfx.beginPath(); for(let x=mx;x>=x1;x-=6) { const y=yAt(x,b); if(x===mx) gfx.moveTo(x,y); else gfx.lineTo(x,y); } gfx.stroke(); } }
  for(let k=0;k<30;k++) { const q=((ms/520)+k*.137)%1,d=(mx+30)*q; if(mx-d<x1) continue; const b=((k*37)%21)/10-1,x=mx-d,y=yAt(x,b*1.4)+((k*13)%9-4),r=2+((k*7)%5)+q*2;
    E(x,y,r+1.5,r+1.5,OUT); E(x,y,r,r,k%3?SPIT:'#ffffff'); }
  if(F&&ms>260) for(let k=0;k<7;k++) { const q=((ms-260)/700+k*.21)%1,x=F.x-F.w*.35+((k*29)%70)/100*F.w,y=F.top+F.h*.2+q*F.h*.6; gfx.globalAlpha=fade(u,.78)*(1-q*.6); E(x,y,4,5+q*3,SPIT); } };
// A giant wobbly PBBBBT, one letter at a time.
SC.rp_pbbt=(s,u)=>{ const ms=s.t*1000,txt=s.txt||'PBBBBBT!',sc=s.sc||5,n=txt.length,w=n*4*sc,pop=u<.1?ez(u/.1)*1.25:lerp(1.25,1,cl((u-.1)/.12));
  const x0=Math.max(8,Math.min(568-w*pop,s.x-w*pop/2)); gfx.globalAlpha=fin(u,.05)*fade(u,.75);
  for(let k=0;k<n;k++) { const x=x0+(k*4*sc+1.5*sc)*pop,y=s.y+Math.sin(ms/55+k*.9)*6,a=Math.sin(ms/70+k*1.3)*.18; gfx.save(); gfx.translate(x,y); gfx.rotate(a); gfx.scale(pop,pop); bigWord(txt[k],0,-sc*2.5,k%2?PINK2:SPIT2,sc); gfx.restore(); } };
Rm.sillyShow=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),cx=Math.min(470,F.x+F.w*.5+96),cy=Math.min(312,F.base+6),lie=lieDy();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:5},{t:900,x:cx,y:cy,f:'idle'},{t:1100,f:'expr',sc:u=>1+ez(u)*.16},{t:1800,f:'celeb',sc:u=>1.16-ez(u)*.16,dx:(u,tt)=>Math.sin(tt*45)*2},
    {t:2650,f:'idle',rot:u=>-ez(u/.3)*1.45,dy:(u,tt)=>ez(u/.3)*lie-Math.abs(Math.sin(tt*16))*3},{t:3350,f:'celeb',hop:22},{t:3650,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose walks to centre stage and takes an extravagantly serious breath.'); say(m.id,'silly'); }],
    [1100,()=>{ scene('ro_breath',.8,{st}); sfx.charge(); }],
    [1800,()=>{ sfx.raspberry(); b7Later(()=>sfx.raspberry(),380); b7Later(()=>sfx.raspberry(),760); if(sfx.spray) sfx.spray(); const p=head(st,12);
      scene('rp_spray',1.15,{mx:p.x-14,my:p.y,F}); scene('rp_pbbt',1.25,{x:(p.x+F.x)/2-10,y:Math.max(34,F.top-86),sc:5}); }],
    ['hf',2350],
    [2350,()=>{ E2.apply(); sfx.boing(); ST.jolt(t,.6); scene('ro_goof',1.6,{x:F.x,y:F.top}); scene('ro_poof',.5,{x:F.x,y:F.mid,c:SPIT,n:12,r:34}); }],
    [2650,()=>{ sfx.giggle(); setMessage('Rose has made an excellent point. She falls over laughing at it.'); }],
    [3000,()=>{ sfx.giggle(); }],
    [4400,'end',()=>t&&t.st.goofed?'Rose has made an excellent point. Goofed!':(t?cap(t.def.the)+' is unmoved. Mostly.':'Pbbbt.')]]); };

// ---------- Dress-Up Tiara: a giant tiara that lands with a CLINK ----------
const TSC=2.2;
SC.rv_tiara=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f),sit=F.top+16-14*TSC; let x,y,sc,tilt,sy=1;
  if(ms<P.toss) { const p=head(s.st,-30); x=p.x-4; y=p.y+Math.sin(ms/120)*3; sc=1.15; tilt=Math.sin(ms/200)*.14; }
  else if(ms<P.on) { const q=(ms-P.toss)/(P.on-P.toss),p=head(s.st,-30); x=lerp(p.x-4,F.x,ez(q)); y=lerp(p.y,sit,q*q)-Math.sin(q*Math.PI)*70; sc=lerp(1.15,TSC,ez(q)); tilt=ez(q)*6.28; }
  else { const d=ms-P.on,b=Math.abs(Math.sin(d/90))*14*Math.exp(-d/220); x=F.x+(s.f.ox||0); y=sit+(s.f.oy||0)-b; sc=TSC; tilt=(s.f.spin||0)+Math.sin(d/70)*.12*Math.exp(-d/300); sy=d<110?.82:1; }
  gfx.globalAlpha=fade(u,.94); gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(sc,sc*sy); PROP2.tiara({},0); gfx.restore();
  if(ms>P.on) for(let k=0;k<5;k++) { const tw=(Math.sin(ms/150+k*2)+1)/2; star(x-60+k*30,y-46-(k%2)*14,4+tw*6,k%2?GOLD:CREAM,ms/300+k); } };
SC.rp_clink=(s,u)=>{ for(let k=0;k<3;k++) { const q=cl(u*1.5-k*.15); if(q<=0||q>=1) continue; gfx.globalAlpha=1-q; gfx.strokeStyle=k%2?GOLD:CREAM; gfx.lineWidth=5*(1-q)+1;
  gfx.beginPath(); gfx.ellipse(s.x,s.y,10+q*90,5+q*28,0,0,Math.PI*2); gfx.stroke(); }
  gfx.globalAlpha=fade(u,.5); for(let k=0;k<8;k++) { const a=k/8*Math.PI*2,d=20+ez(u)*50; Ln(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.5,s.x+Math.cos(a)*(d+14),s.y+Math.sin(a)*(d+14)*.5,3,k%2?GOLD:CREAM); } };
Rm.dress_up_tiara=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,24),plan={toss:1500,on:1750},sit=F.top+16-14*TSC;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:9,hn:6},{t:1100,x:p.x,y:p.y,f:'expr'},{t:1300,f:'celeb',hop:46},{t:1800,f:'idle'},{t:2000,f:'act'},
    {t:2700,f:'celeb',hop:10,hn:2},{t:3200,f:'walkR',hop:6,hn:5},{t:4200,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose skips over with the biggest tiara in the dress-up box. It\'s bigger than her head.'); say(m.id,'dress_up_tiara'); scene('rv_tiara',4.3,{st,f,plan}); }],
    [1300,()=>{ sfx.jumpWhistle(); }],
    ['hf',plan.on],
    [plan.on,()=>{ (sfx.ting?sfx.ting():sfx.ding()); sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('rp_clink',.8,{x:F.x,y:sit+14*TSC});
      scene('rv_big',.9,{x:F.x+F.w*.5+78,y:F.top+4,txt:'CLINK!',c:CREAM,sc:3,rot:.1}); }],
    [plan.on+260,()=>{ (sfx.ting?sfx.ting():sfx.ding()); scene('rv_burst',.8,{x:F.x,y:sit,n:12,r:70,c:GOLD,c2:PINK,sz:9}); }],
    [plan.on+500,()=>{ scene('rv_big',.8,{x:F.x,y:F.top-100,txt:'CROWNED!',c:GOLD,sc:3}); sfx.ding(); }],
    [2000,()=>{ scene('rv_preen',1.7,{f}); setMessage(cap(f.def?f.def.the:f.name)+' looks at itself. And looks. And looks.'); }],
    [3050,()=>{ scene('rv_big',1.1,{x:F.x,y:F.top-100,txt:'SO PRETTY',c:PINK,sc:3}); sfx.giggle(); }],
    [4300,'end',res(E2)+'It\'s too busy admiring its tiara to stand up straight.']]); };

// ---------- Lamby Hug: bigger squish, a fountain of hearts ----------
SC.rv_hug=(s,u)=>{ const ms=s.t*1000,P=s.plan; let x,y,sc=1.45,rot=.3,sx=1,sy=1;
  if(ms<P.press||ms>P.back) { const h=hand(); x=h.x-2; y=h.y+2; }
  else { const q=ez((ms-P.press)/220),sq=ms<P.back-150?Math.abs(Math.sin((ms-P.press)/150))*.3:0; x=lerp(hand().x-2,P.tx,q); y=lerp(hand().y+2,P.ty,q); sc=lerp(1.45,2.05,q); rot=lerp(.3,-.08,q); sx=1+sq; sy=1-sq*.85; }
  if(ms>P.press+150&&ms<P.back+500) for(let k=0;k<10;k++) { const q=((ms-P.press-150)/950+k/10)%1,hx=P.tx+Math.sin(k*2.3+q*5)*(26+q*20),hy=P.ty-30-q*90; if(ms>P.back&&q<.1) continue;
    gfx.globalAlpha=Math.sin(q*Math.PI)*(ms>P.back?cl(1-(ms-P.back)/500):1); heartO(hx,hy,5+Math.sin(q*Math.PI)*6,k%2?'#ff6b9a':PINK2); }
  gfx.globalAlpha=1; gfx.save(); gfx.translate(x,y); gfx.scale(sx,sy); plush(0,0,sc,{pose:'held',rot}); gfx.restore();
  if(ms>P.press+150&&ms<P.back-100) { const sq=Math.abs(Math.sin((ms-P.press)/150)); bigWord('SQUISH',Math.max(44,P.tx-96),P.ty-8-sq*6,PINK2,3); } };

// ---------- Lamby Boomerang: bigger spinning Lamby, ribbon trail ----------
SC.rv_boomer=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); let x,y,rot=0,sc=1.5,pose='held';
  const cx=(P.x0+P.lx)/2,rx=(P.lx-P.x0)/2,at=q=>{ const a=q*Math.PI*2; return [cx+Math.cos(a)*rx,P.y-Math.sin(a)*P.ry]; };
  if(ms<P.swing) { x=h.x-4; y=h.y+2; sc=1.3; rot=.3; }
  else if(ms<P.go) { const a=(ms-P.swing)/1000*14,p=head(s.st,-10); x=p.x+Math.cos(a)*44; y=p.y-14+Math.sin(a)*16; rot=a; pose='fly'; LnO(h.x,h.y,x,y,3,PINK2);
    for(let k=1;k<6;k++) { const aa=a-k*.28; gfx.globalAlpha=.55-k*.09; Ln(p.x+Math.cos(aa)*44,p.y-14+Math.sin(aa)*16,p.x+Math.cos(aa+.28)*44,p.y-14+Math.sin(aa+.28)*16,7-k,PINK2); } gfx.globalAlpha=1; }
  else if(ms<P.back) { const q=(ms-P.go)/(P.back-P.go); [x,y]=at(q); rot=q*24; sc=2.3; pose='fly';
    const N=18,pts=[]; for(let k=0;k<=N;k++) { const qq=q-k*.016; if(qq<0) break; const [px,py]=at(qq),wv=Math.sin(qq*40-ms/60)*(3+k*.6); pts.push([px,py+wv]); }
    for(const pass of [0,1]) for(let k=pts.length-1;k>0;k--) { gfx.globalAlpha=1-k/(N*1.5); const w=Math.max(4,15-k*.55);
      if(pass) Ln(pts[k][0],pts[k][1],pts[k-1][0],pts[k-1][1],w,k%4<2?'#ff5f9e':PINK); else Ln(pts[k][0],pts[k][1],pts[k-1][0],pts[k-1][1],w+5,OUT); }
    gfx.globalAlpha=.7; for(let k=0;k<3;k++) { const qq=q-.05-k*.03; if(qq<0) continue; const [px,py]=at(qq); Ln(px-10,py-26+k*20,px+12,py-26+k*20,2,CREAM); } }
  else { const d=ms-P.back; x=h.x-4; y=h.y+2; sc=lerp(1.8,1.3,cl(d/300)); rot=.2; }
  gfx.globalAlpha=1; plush(x,y,sc,{pose,rot}); };
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const spotFor=(m,t,gap=24)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:u.base+3}; };
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
Rm.lamby_hug=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,20),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'expr'},{t:1200,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*3},{t:2500,f:'celeb',hop:10},{t:2900,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:5,hn:6},{t:1100,x:sp.x,y:sp.y,f:'expr'},{t:1400,f:'act',dx:u=>-ez(u)*8},{t:2500,f:'celeb',hop:10},{t:2900,f:'walkR',hop:4,hn:5},{t:3900,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),press=self?1200:1400,end=self?3400:4000;
  const plan={press,back:2500,tx:self?H.x-6:H.x+4,ty:self?H.mid+2:H.mid};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose gives Lamby the biggest squeeze. Lamby squeezes back. Probably.':'Rose carries Lamby over to '+t.name+'. Lamby has hugs to give.'); say(m.id,'lamby_hug'); scene('rv_hug',end/1000,{plan}); }],
    [press,()=>{ sfx.boing(); }],
    ['hf',press+300],
    [press+300,()=>{ E2.apply(); sfx.baa(); sfx.heal(); scene('ro_glow',1,{x:H.x,y:H.mid,c:PINK}); scene('rv_hearts',1.1,{x:H.x,y:H.top+6,n:9,r:64,sz:10}); hopOf(t!==m?t:null); }],
    [press+700,()=>{ scene('rv_big',1,{x:H.x,y:H.top-80,txt:'SQUEEZE',c:PINK,sc:3}); sfx.ding(); }],
    [end,'end',kindLine(t,'Lamby hugs are proven to work. Rose proved it.')]]); };
})();

// ================= Tom's move feedback (2026-10-26, claude/rose-moves-feedback.md) =================
// Boop: a real one-finger poke (poke, poke, BOOP). RASPBERRY: no words, a real lip-flap raspberry (sfx.pbbt) with her
// tongue out and cheeks puffed. Boo!!: poof out, poof in behind the monster, BOOOO!!. Giggle Storm is now Tickle Storm
// (feathers). Lamby Hug, Bedtime Story and Tea Party bring Backup Lamby too. Pillow Fort is a couch-cushion fort.
// Macaroni Crown (A2, key dress_up_tiara) replaces Dress-Up Tiara. Lamby Boomerang (B1, key lookout_lamby, both Lambys,
// ends on Tom's shoulders) replaces Lookout Lamby. Ms. Cathy's Snack Attack (B4, key lamby_boomerang) is new: Rose's
// sitter walks in and throws treats at the row. Keys stay the same so saves, likes and stamps keep working. Prefix rf_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); };
const EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const rrect=(x,y,w,h,r)=>{ gfx.beginPath(); gfx.moveTo(x+r,y); gfx.arcTo(x+w,y,x+w,y+h,r); gfx.arcTo(x+w,y+h,x,y+h,r); gfx.arcTo(x,y+h,x,y,r); gfx.arcTo(x,y,x+w,y,r); gfx.closePath(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',PURP='#c9a6f0',SKIN='#fcb284',SKIND='#e08a5c',SKY='#9fd8ff',SPIT='#ff8aa8',SPIT2='#ffd0de';
ST.nw('rf_');
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
const lieDy=()=>RH()*.5-RW()*.5+2;
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const all=(list,k=.4)=>{ for(const f of list) ST.jolt(f,k); };
const tomUp=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const lift=(f,oy,spin=0,ox=0)=>{ if(!f||f.side!=='foe') return; f.spinAt=performance.now(); f.oy=oy; f.spin=spin; f.ox=ox; };
const noseOf=f=>{ const F=ST.unit(f),d=f.def||MONSTERS[f.id]||{},S=d.sprite; if(!S||!d.eyes) return {x:F.x,y:F.top+F.h*.45};
  const W=S[0].length,H=S.length,ex=(d.eyes[0][0]+d.eyes[1][0])/2,ey=(d.eyes[0][1]+(d.mouth?d.mouth[1]:d.eyes[0][1]+2))/2;
  return {x:F.x-F.w/2+F.w*(ex+.5)/W,y:F.top+F.h*(ey+.5)/H}; };
const ride=tom=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx],q=BATTLE_POS[tom.idx],sp=BATTLE_SPRITES.tom,a=d||{cx:q.x*3,base:q.base*3,h:sp.idle.length*sp.scale}; return {x:a.cx+2,y:a.base-a.h+20}; };
// Where Rose's mouth is on the frame she is drawn with (BATTLE_SPRITES.rose.mouth, sprite pixels).
// A path's sc scales the body about its middle, so the top moves up by half the extra height.
const mouthAt=st=>{ const sp=RSP(),fr=st.frame||sp.idle,k=st.sc||1,sc=sp.scale*k,W0=fr[0].length*sp.scale,H0=fr.length*sp.scale,mo=sp.mouth||{col:9,row:16};
  return {x:st.x-W0*k/2+(mo.col+.5)*sc+5*k,y:st.y-H0/2-H0*k/2+(mo.row+.5)*sc-4*k,sc}; };   // nudged onto the drawn mouth (checked on frames)
SC.rf_word=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.25:lerp(1.25,1,cl((u-.12)/.12)),sc=s.sc||3,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+28,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.78); gfx.save(); gfx.translate(x,y); gfx.rotate(s.rot||0); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5,s.c||PINK2,sc); gfx.restore(); };
// A cartoon poof: puffs swell and fade, a few stars fly out.
SC.rf_poof=(s,u)=>{ const g=ez(u/.35),r=s.r||30; gfx.globalAlpha=fade(u,.3);
  for(let k=0;k<9;k++) { const a=k/9*Math.PI*2+(s.seed||0),d=g*r*.75; EO(s.x+Math.cos(a)*d,s.y-r*.4+Math.sin(a)*d*.7,r*.42*(.6+g*.5),r*.38*(.6+g*.5),k%2?'#f4f0ea':'#dcd6ce'); }
  E(s.x,s.y-r*.4,r*.55*g+.1,r*.5*g+.1,'#ffffff');
  for(let k=0;k<5;k++) { const a=k/5*Math.PI*2+.4,d=ez(u)*r*1.6; star(s.x+Math.cos(a)*d,s.y-r*.4+Math.sin(a)*d*.8,5*(1-u)+1,k%2?GOLD:PINK,u*5); } };

// ---------- Sounds ----------
// A real raspberry: lips flapping about 28 times a second (bursts of buzz and breath), a slight wobble, a wet finish.
sfx.pbbt=(dur=.9,vol=.6,delay=0)=>{ const c=sound.enabled&&audio(); if(!c) return;
  const sr=c.sampleRate,n=Math.ceil(sr*dur),buf=c.createBuffer(1,n,sr),d=buf.getChannelData(0); let ph=0,ph2=0,fl=28;
  for(let i=0;i<n;i++) { const t=i/sr; if(i%400===0) fl=24+6*Math.sin(t*9)+Math.random()*5; ph+=fl/sr; ph2+=(90+30*Math.sin(t*4)+Math.random()*6)/sr;
    const open=Math.pow(Math.max(0,Math.sin(ph*Math.PI*2)),2.2),buzz=(ph2%1)*2-1,env=Math.min(1,t/.025)*Math.min(1,(dur-t)/.16);
    d[i]=(buzz*.6+(Math.random()*2-1)*.55)*open*env; }
  const src=c.createBufferSource(); src.buffer=buf;
  const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1900; lp.Q.value=.7;
  const pk=c.createBiquadFilter(); pk.type='peaking'; pk.frequency.value=480; pk.gain.value=9; pk.Q.value=1.1;
  const g=c.createGain(); g.gain.value=vol; src.connect(lp); lp.connect(pk); pk.connect(g); g.connect(sound.master);
  const t0=c.currentTime+delay; src.start(t0); src.stop(t0+dur+.05);
  noise({dur:.12,vol:.12,delay:delay+dur-.08,f0:2400,f1:900,type:'bandpass',q:.8}); };
sfx.poof=()=>{ noise({dur:.35,vol:.22,f0:2200,f1:300,type:'lowpass'}); tone({type:'sine',f0:600,f1:180,dur:.25,vol:.12}); };
sfx.poke=()=>{ tone({type:'sine',f0:900,f1:600,dur:.06,vol:.18}); noise({dur:.04,vol:.08,f0:2000,f1:1200}); };

// ---------- Boop (basic): a real one-finger poke ----------
// Rose walks up, sticks out her pointer finger and pokes it: poke, poke, BOOP. Each poke dents it a little.
SC.rf_poke=(s,u)=>{ const ms=s.t*1000+s.t0,n=s.n; if(ms<s.from) return;
  let reach=ez((ms-s.from)/220)*.5; for(const p of s.pokes) { const dd=ms-p; if(dd>-110&&dd<170) reach=Math.max(reach,.5+.5*(dd<0?ez(1+dd/110):1-ez(dd/170))); }
  if(ms>s.back) reach*=1-ez((ms-s.back)/220); if(reach<=.02) return;
  // The fingertip travels from just past her hand to the nose; the fist trails 27 px behind the tip.
  const h=hand(),a=Math.atan2(n.y-h.y,n.x-h.x),D=Math.hypot(n.x-h.x,n.y-h.y),tipD=lerp(30,D,reach),fd=Math.max(4,tipD-40),tx=h.x+Math.cos(a)*fd,ty=h.y+Math.sin(a)*fd;
  gfx.globalAlpha=1; LnO(h.x,h.y,tx,ty,8,SKIN);
  gfx.save(); gfx.translate(tx,ty); gfx.rotate(a); gfx.scale(1.6,1.6);
  EO(0,0,7.5,7,SKIN); for(const k of [-1,0,1]) E(3+k*2.5,5,2.6,2,SKIND);   // fist with curled fingers
  E(0,-6,4,2.4,OUT); E(0,-6,3,1.6,SKIN);                                   // thumb
  rrect(2,-4,22,8,4); gfx.lineWidth=3.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#ffc49e'; gfx.fill();   // pointer finger, a shade lighter
  R(4,-3,16,2,'#ffdcc2'); E(21,-1.6,2.6,1.8,'#ffe6ee'); Ln(11,-4,11,-1.5,1.2,SKIND);   // highlight, nail, knuckle crease
  gfx.restore(); };
Rm.boopShow=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,44),n=noseOf(f),HIT=1500,jx=Math.min(548,n.x+30),jy=cl(n.y+47,p.y-12,p.y+4);   // jab frames: fingertip is 33 px left of her centre and 47 px above her feet
  const pokes=[HIT];   // ONE jab (Tom, 2026-10-27). Damage, sound, flash, BOOP! word and her spoken "Boop!" all land on HIT.
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:6,hn:7},{t:1000,x:p.x,y:p.y,f:'jab0'},{t:1250,f:'jab0',dx:u=>ez(u)*3},
    {t:HIT-110,x:jx,y:jy,f:'jab1'},{t:HIT+250,f:'jab1'},{t:HIT+450,x:p.x,y:p.y,f:'jab2'},
    {t:2200,f:'boopBack',hop:16},{t:2650,f:'celeb',hop:9,hn:2},{t:3050,f:'runR'},{t:3750,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose marches right up to '+f.name+'.'); warmClip('rose','Boop!'); }],   // decode the clip now so it plays instantly later
    [1150,()=>{ setMessage('Pointer finger out.'); }],
    // The baked "Boop!" clip is 2.08 s long and the word itself sits at 1.42 to 1.60 s, so play only that slice (1.39 to 1.75 s).
    // Voice and sound start a little before contact to cover phone audio output delay (about 60 to 100 ms).
    [HIT-80,()=>{ say(m.id,'boop',0,null,{text:'Boop!',len:45756,from:1.39,to:1.75}); }],
    [HIT-50,()=>{ sfx.boop?sfx.boop():sfx.bonk(); }],
    ['hf',HIT],
    [HIT,()=>{ ST.jolt(f,.35); landHit(100); scene('rv_big',1.1,{x:F.x,y:F.top-74,txt:'BOOP!',c:PINK2,sc:5});
      scene('rv_rings',.6,{x:n.x,y:n.y,r:34}); scene('rv_burst',.7,{x:n.x,y:n.y,n:8,r:40,sz:6}); }],
    [2200,()=>{ sfx.giggle(); scene('ro_text',.9,{st,txt:'HEE HEE',c:PINK,sc:2}); }],
    [3850,'end',res(E2)+'Boop. One finger. Right on the nose.']]); };

// ---------- RASPBERRY (signature): tongue out, cheeks puffed, a real pbbbt ----------
SC.rf_tongue=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const ms=s.t*1000,m=mouthAt(st),k=m.sc/1.75,flap=Math.sin(ms/22)*1.4;
  gfx.globalAlpha=1;
  if(ms<s.out) { const q=ez(ms/200); for(const sd of [-1,1]) { gfx.globalAlpha=.75; E(m.x+sd*6*k,m.y-2*k,3*k*q+.1,2.6*k*q+.1,'#ff9a9a'); gfx.globalAlpha=1; } return; }   // puffed cheeks before the blow
  const g=ez((ms-s.out)/120),x=m.x-6*k*g,y=m.y+3*k*g;
  EO(x,y,6.5*k*g+.1,(4.2+flap*.4)*k*g+.1,'#ff5f8f'); Ln(x-4*k*g,y,x+2*k,y-.5,1.5,'#d93a6e'); E(x-2*k,y-1.4*k,2*k*g+.1,1.2*k*g+.1,'#ff9cbc');
  for(const sd of [-1,1]) { gfx.globalAlpha=.7; E(m.x+sd*6*k,m.y-2*k,3*k,2.4*k,'#ff9a9a'); gfx.globalAlpha=1; } };
Rm.sillyShow=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),cx=Math.min(470,F.x+F.w*.5+96),cy=Math.min(312,F.base+6),lie=lieDy();
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:5},{t:900,x:cx,y:cy,f:'idle'},{t:1100,f:'raspberry',sc:u=>1+ez(u)*.16},{t:1800,f:'raspberry',sc:1.16,dx:(u,tt)=>Math.sin(tt*45)*2},
    {t:2700,f:'idle',rot:u=>-ez(u/.3)*1.45,dy:(u,tt)=>ez(u/.3)*lie-Math.abs(Math.sin(tt*16))*3},{t:3350,f:'celeb',hop:22},{t:3650,f:'runR'},{t:4300,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose walks to centre stage and takes an extravagantly serious breath.'); say(m.id,'silly'); }],
    [1100,()=>{ scene('ro_breath',.8,{st}); sfx.charge(); }],
    [1800,()=>{ sfx.pbbt(.95,.65); const p=mouthAt(st);
      scene('rp_spray',1.0,{mx:p.x-20,my:p.y+3,F}); scene('rp_pbbt',1.25,{x:(p.x+F.x)/2-10,y:Math.max(34,F.top-86),sc:5}); }],
    ['hf',2350],
    [2350,()=>{ E2.apply(); sfx.boing(); ST.jolt(t,.6); scene('ro_goof',1.6,{x:F.x,y:F.top}); scene('ro_poof',.5,{x:F.x,y:F.mid,c:SPIT,n:12,r:34}); }],
    [2700,()=>{ sfx.giggle(); setMessage('Rose has made an excellent point. She falls over laughing at it.'); }],
    [3000,()=>{ sfx.giggle(); }],
    [4400,'end',()=>t&&t.st.goofed?'Rose has made an excellent point. Goofed!':(t?cap(t.def.the)+' is unmoved. Mostly.':'Pbbbt.')]]); };

// ---------- Boo!! (A1): poof out, poof in behind it, BOOOO!! ----------
SC.rf_look=(s,u)=>{ const ms=s.t*1000,F=ST.unit(s.f); lift(s.f,0,Math.sin(ms/260)*.16,Math.sin(ms/260)*4);
  gfx.globalAlpha=fade(u,.85); bigWord('?',F.x+Math.sin(ms/260)*10,F.top-24-Math.abs(Math.sin(ms/200))*4,CREAM,3); };
Rm.boo=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t);
  const pR=front(F,26),pB={x:Math.max(22,F.x-F.w*.5-18),y:Math.min(314,F.base+2)},BOO=2100;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:6},{t:750,x:pR.x,y:pR.y,f:'kneel'},{t:1150,x:pR.x,y:pR.y,f:'idle',hide:true},
    {t:1850,x:pB.x,y:pB.y,f:'kneel'},{t:BOO,f:'celeb',hop:34,sc:u=>1+ez(u/.3)*.35},{t:2650,f:'celeb',sc:1.3,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},
    {t:3100,f:'celeb',hop:10,hn:2},{t:3500,x:pB.x,y:pB.y,f:'idle',hide:true},{t:3620,x:'home',y:'home',f:'idle',hide:true},{t:3640,x:'home',y:'home',f:'celeb',hop:10},{t:4100,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose sneaks up. Then she crouches down and winks.'); }],
    [750,()=>{ scene('ro_text',.9,{st,txt:'SHHH',c:CREAM,sc:2}); sfx.select(); }],
    [1150,()=>{ sfx.poof(); scene('rf_poof',.7,{x:pR.x,y:pR.y,r:34}); scene('rf_look',.75,{f:t}); setMessage('POOF. She\'s gone. Where did she go?'); }],
    [1850,()=>{ sfx.poof(); scene('rf_poof',.6,{x:pB.x,y:pB.y,r:30,seed:1}); setMessage('POOF. She\'s right behind it.'); }],
    ['hf',BOO],
    [BOO,()=>{ say(m.id,'boo'); E2.apply(); sfx.boo?sfx.boo():sfx.boing(); sfx.boing(); scene('rv_flash',.25,{a:.75}); scene('rv_big',1.3,{x:pB.x+30,y:F.top-104,txt:'BOOOO!!',c:'#ff5a8a',sc:5,rot:-.08});
      scene('rv_scare',1.8,{f:t}); ST.jolt(t,.5); }],
    [3100,()=>{ sfx.giggle(); setMessage('It jumped right out of its skin. Then it laughed. Rose laughs too.'); }],
    [3500,()=>{ sfx.poof(); scene('rf_poof',.5,{x:pB.x,y:pB.y,r:26}); }],
    [3620,()=>{ const me=ST.unit(m); scene('rf_poof',.5,{x:me.x,y:me.base,r:26,seed:2}); }],
    [4300,'end',()=>t&&B2.move&&B2.move.kindOnFoe?kindLine(t):'It jumped out of its skin. Then it laughed.']]); };

// ---------- Tickle Storm (A3, renamed from Giggle Storm) ----------
SC.rf_feathers=(s,u)=>{ const G=s.G,ms=s.t*1000; gfx.globalAlpha=fin(u,.08)*fade(u,.85);
  for(let k=0;k<9;k++) { const q=((ms/1100)+k/9)%1,x=G.x0-10+((k*61)%100)/100*(G.w+20)+Math.sin(ms/260+k)*16,y=Math.max(40,G.top-30)+q*(G.base-G.top+20),a=Math.sin(ms/180+k*2)*.9+.6;
    gfx.save(); gfx.translate(x,y); gfx.rotate(a);
    if(PROPART.draw('rose/rainbow_feather',0,0,{h:36,rot:.87})) { gfx.restore(); continue; }
    gfx.beginPath(); gfx.ellipse(0,0,15,5,0,0,Math.PI*2); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=k%3?PINK:PURP; gfx.fill();
    for(let j=-2;j<=2;j++) Ln(j*5,-4,j*5+2,4,1,'#ffffff88'); Ln(-18,0,15,0,1.5,'#7a4a6a'); gfx.restore(); } };
SC.rf_wiggle=(s,u)=>{ const st=s.st; if(!st||st.x==null) return; const p=head(st,10),ms=s.t*1000; gfx.globalAlpha=fade(u,.85);
  for(const sd of [-1,1]) for(let k=0;k<4;k++) Ln(p.x-14+sd*10+k*3,p.y+14,p.x-14+sd*10+k*3+Math.sin(ms/40+k)*2,p.y+6,2,SKIN); };
// Painted frames (data/rose-hires.js tk): ready, creepA/B, launch, air, land, tickleA to D, feather_draw, feather_swish, feather_twirl, finale, doubled, proud.
// Beats: sneak (0.5 to 1.35 s), crouch and pounce (1.35 to 1.75), tickle blur (1.75 to 2.45), feather (2.45 to 3.6), finale, laugh, proud, run home.
// Hits and the spoken line keep their old times (1.9, 2.3, 2.7 s).
Rm.giggle_storm=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,52),me=ST.unit(m);
  const s1={x:lerp(me.x,p.x,.62),y:lerp(me.base,p.y,.62)},TK=['tk_tickleA','tk_tickleB','tk_tickleC','tk_tickleD'];
  const st=ST.keys(fx,[
    {t:0,x:'home',y:'home',f:'tk_ready',dx:(u,tt)=>Math.sin(tt*34)*.8},
    {t:500,x:s1.x,y:s1.y,f:(u)=>Math.floor(u*7)%2?'tk_creepB':'tk_creepA',hop:3,hn:7},
    {t:1350,f:'tk_launch',dy:u=>Math.sin(u*40)*.6},
    {t:1500,x:p.x,y:p.y,f:'tk_air',ease:'lin',dy:u=>-Math.sin(u*Math.PI)*44},
    {t:1750,f:'tk_land'},
    {t:1850,f:u=>TK[Math.floor(u*14)%4],dx:(u,tt)=>Math.sin(tt*52)*1.4,dy:(u,tt)=>-Math.abs(Math.sin(tt*20))*1.5},
    {t:2450,f:'tk_feather_draw'},
    {t:2650,f:'tk_feather_swish',dx:u=>-ez(u)*4},
    {t:3100,f:'tk_feather_twirl',dx:u=>-4+ez(u)*4,dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*5},
    {t:3650,f:'tk_finale',hop:12,hn:2},
    {t:4050,f:'tk_doubled',dy:(u,tt)=>-Math.abs(Math.sin(tt*18))*2.5,dx:(u,tt)=>Math.sin(tt*30)*1},
    {t:4550,f:'tk_proud'},
    {t:4900,f:'runR'},
    {t:5550,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose flexes her tickle fingers. Then she starts to sneak.'); say(m.id,'giggle_storm'); }],
    [500,()=>{ sfx.select(); }],
    [1350,()=>{ sfx.boing(); setMessage('She crouches. She is going to pounce.'); }],
    [1500,()=>{ sfx.boing(); }],
    [1750,()=>{ scene('rf_word',.8,{st,txt:'TICKLE TICKLE',c:PINK,sc:2}); sfx.giggle(); setMessage('POUNCE. Tickle fingers, everywhere.'); }],
    [1900,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(34); scene('rv_laughs',1.6,{list}); }],
    [2300,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(33); }],
    [2450,()=>{ sfx.select(); setMessage('She pulls out a rainbow feather.'); }],
    [2600,()=>{ scene('rv_storm',2.2,{G}); scene('rf_feathers',2.2,{G}); setMessage('The tickles turn into a storm of feathers.'); }],
    ['hf',2700],
    [2700,()=>{ sfx.giggle(); sfx.bonk(); all(list); landHit(33); scene('rv_big',1.2,{x:G.x,y:G.top-74,txt:'TICKLE STORM!',c:PINK2,sc:3}); }],
    [3650,()=>{ sfx.giggle(); }],
    [4050,()=>{ sfx.giggle(); sfx.giggle(.15); }],
    [5600,'end',res(E2)+'Nobody can keep a straight face. Not even the monsters.']]); };

// ---------- Lamby Hug (A4): Lamby and Backup Lamby, a double squish ----------
SC.rv_hug=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(); let x=h.x-2,y=h.y+2,sc=1.35,rot=.3,sx=1,sy=1,bx=h.x+14,by=h.y+8,bsc=1.2,brot=-.3;
  const pressing=ms>=P.press&&ms<=P.back;
  if(pressing) { const q=ez((ms-P.press)/220),sq=ms<P.back-150?Math.abs(Math.sin((ms-P.press)/150))*.26:0;
    x=lerp(h.x-2,P.tx-14,q); y=lerp(h.y+2,P.ty,q); sc=lerp(1.35,1.8,q); rot=lerp(.3,-.1,q); sx=1+sq; sy=1-sq*.85;
    bx=lerp(h.x+14,P.tx+16,q); by=lerp(h.y+8,P.ty+2,q); bsc=lerp(1.2,1.75,q); brot=lerp(-.3,.1,q); }
  if(ms>P.press+150&&ms<P.back+500) for(let k=0;k<12;k++) { const q=((ms-P.press-150)/950+k/12)%1,hx=P.tx+Math.sin(k*2.3+q*5)*(30+q*22),hy=P.ty-30-q*90; if(ms>P.back&&q<.1) continue;
    gfx.globalAlpha=Math.sin(q*Math.PI)*(ms>P.back?cl(1-(ms-P.back)/500):1); heart(hx,hy,7+Math.sin(q*Math.PI)*6,OUT); heart(hx,hy,5+Math.sin(q*Math.PI)*6,k%2?'#ff6b9a':PINK2); }
  gfx.globalAlpha=1;
  gfx.save(); gfx.translate(bx,by); gfx.scale(sx,sy); plush(0,0,bsc,{pose:'held',rot:brot,v:'backup',flip:pressing}); gfx.restore();
  gfx.save(); gfx.translate(x,y); gfx.scale(sx,sy); plush(0,0,sc,{pose:'held',rot}); gfx.restore();
  if(ms>P.press+150&&ms<P.back-100) { const sq=Math.abs(Math.sin((ms-P.press)/150)); bigWord('SQUISH',Math.max(44,P.tx-100),P.ty-10-sq*6,PINK2,3); } };
Rm.lamby_hug=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,22),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'expr'},{t:1200,f:'act',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*3},{t:2500,f:'celeb',hop:10},{t:2900,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:5,hn:6},{t:1100,x:sp.x,y:sp.y,f:'expr'},{t:1400,f:'act',dx:u=>-ez(u)*8},{t:2500,f:'celeb',hop:10},{t:2900,f:'walkR',hop:4,hn:5},{t:3900,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),press=self?1200:1400,end=self?3400:4000;
  const plan={press,back:2500,tx:self?H.x-6:H.x+4,ty:self?H.mid+2:H.mid};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose squeezes Lamby and Backup Lamby at the same time. They squeeze back. Probably.':'Rose brings Lamby AND Backup Lamby over to '+t.name+'. Two lambs. Double hug.'); say(m.id,'lamby_hug'); scene('rv_hug',end/1000,{plan}); }],
    [press,()=>{ sfx.boing(); }],
    ['hf',press+300],
    [press+300,()=>{ E2.apply(); sfx.baa(); sfx.baa(.2); sfx.heal(); scene('ro_glow',1,{x:H.x,y:H.mid,c:PINK}); scene('rv_hearts',1.1,{x:H.x,y:H.top+6,n:9,r:64,sz:10}); hopOf(t!==m?t:null); }],
    [press+700,()=>{ scene('rv_big',1,{x:H.x,y:H.top-80,txt:'DOUBLE SQUEEZE',c:PINK,sc:2}); sfx.ding(); }],
    [end,'end',kindLine(t,'Two Lambys, one hug. Backup Lamby is still learning.')]]); };

// ---------- Bedtime Story (B3): both Lambys listen ----------
// Wraps the book scene: Backup Lamby sits on the other side of the open book, facing it.
{ const book=SC.rv_book;
  SC.rv_book=(s,u)=>{ book(s,u); const P=s.plan,ms=s.t*1000+P.sit; if(ms<P.sit) return; const g=ez((ms-P.sit)/250);
    gfx.globalAlpha=fade(u,.95); plush(P.bx+62,P.by+14,1.0*g+.01,{pose:'held',rot:-Math.sin(ms/520)*.05,v:'backup',flip:true});
    if(ms>5600&&ms<6600) { gfx.globalAlpha=1-(ms-5600)/1000; label('Z',P.bx+74,P.by-14-(ms-5600)/40,'#cfe0ff',2); } }; }
{ const carry=SC.ro_carry; if(carry) SC.ro_carry=(s,u)=>{ carry(s,u); const h=hand(); gfx.globalAlpha=1; plush(h.x+14,h.y+10,1.0,{pose:'held',rot:-.25,v:'backup'}); }; }
{ const bed=Rm.bedtime_story; Rm.bedtime_story=E2=>{ bed(E2); const t=E2.targets[0]||E2.m;
    b7Later(()=>setMessage(t===E2.m?'Rose sits down with Lamby, Backup Lamby and her favorite book.':'Rose brings Lamby, Backup Lamby and her favorite book over to '+t.name+'.'),30); }; }

// ---------- Tea Party with Lamby (A6): Backup Lamby gets a seat too ----------
const miniChair=(x,y,s)=>{ gfx.save(); gfx.translate(x,y); gfx.scale(s,s); RO(-11,-24,4,26,'#f39ac0'); RO(-11,-4,22,5,'#ffc1dc'); RO(-9,1,3,12,'#f39ac0'); RO(6,1,3,12,'#f39ac0'); gfx.restore(); };
{ const lam=SC.r5_lamby;
  SC.r5_lamby=(s,u)=>{ const P=s.plan,ms=s.t*1000,seated=ms>=P.seat+80&&ms<=P.pick+80,h=hand(); let x,y,sc=1.05,rot=-.2;
    const sx=P.lx-66,sy=P.ly+2;
    if(seated) { miniChair(sx+4,sy+16,1.0); const q=ez((ms-P.seat-80)/220); x=lerp(h.x+16,sx,q); y=lerp(h.y+10,sy,q); sc=lerp(1.0,1.25,q); rot=lerp(-.2,0,q);
      if(ms>P.clap&&ms<P.clap+700) rot=Math.sin((ms-P.clap)/60+1)*.12; if(ms>P.boom&&ms<P.boom+900) y-=Math.abs(Math.sin((ms-P.boom)/120+.6))*8; }
    else { x=h.x+16; y=h.y+10; if(ms>P.pick+80) { const q=ez((ms-P.pick-80)/200); x=lerp(sx,h.x+16,q); y=lerp(sy,h.y+10,q); } }
    gfx.globalAlpha=1; plush(x,y,sc,{pose:'held',rot,v:'backup'});
    lam(s,u); }; }
{ const tea=Rm.teaparty_ult; Rm.teaparty_ult=E2=>{ tea(E2); b7Later(()=>setMessage('Lamby and Backup Lamby sit at the head of the table. Lamby is wearing a bow tie.'),880); }; }

// ---------- Pillow Fort (B5): a real couch-cushion fort ----------
// Square couch cushions in one sofa fabric, with piping and a tufted button: seat cushions stacked at each end, back
// cushions standing on top as walls, more leaning in, and a blanket roof across the top. PASSWORD? sign.
const SOFA='#7f9fc4',SOFAD='#5f7fa6',SOFAL='#a9c2de',PIPE='#e8eef6';
const couchCush=(x,y,w,h,rot=0,sq=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(1,sq);
  rrect(-w/2,-h/2,w,h,Math.min(7,h*.3)); gfx.lineWidth=4; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=SOFA; gfx.fill();
  rrect(-w/2+3,-h/2+3,w-6,h-6,Math.min(5,h*.22)); gfx.lineWidth=1.5; gfx.strokeStyle=PIPE; gfx.stroke();
  R(-w/2+4,h/2-6,w-8,3,SOFAD); R(-w/2+5,-h/2+4,w*.4,2,SOFAL);
  E(0,0,2.4,2.4,SOFAD); Ln(-5,-2,-1.5,-.5,1,SOFAD); Ln(5,2,1.5,.5,1,SOFAD); gfx.restore(); };
SC.rv_fort=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.92);
  const base=P.base!=null?P.base:Math.min(316,Math.max(...P.U.map(q=>q.base))+4),x0=Math.max(30,P.x0-26),x1=Math.min(548,P.x1+26),wallTop=Math.max(P.top+4,base-106);
  // [x, y (centre), w, h, rotation, arrival ms, comes from x, from y]
  const C=[[x0,base-9,48,18,0,0,x0-160,-20],[x1,base-9,48,18,0,90,x1+160,-20],[x0,base-27,46,18,.04,180,x0-60,-40],[x1,base-27,46,18,-.04,270,x1+80,-40],
    [x0,base-62,24,52,-.05,380,x0-90,-60],[x1,base-62,24,52,.05,470,x1+90,-60],[x0+30,base-46,22,46,-.42,580,x0,-80],[x1-30,base-46,22,46,.42,670,x1,-80]];
  for(const [cx,cy,w,h,r,at,fx,fy] of C) { const q=ez((ms-P.fly-at)/300); if(q<=0) continue; const land=ms-P.fly-at-300,sq=land>0&&land<160?1-Math.sin(land/160*Math.PI)*.12:1;
    couchCush(lerp(fx,cx,q),lerp(fy,cy,q)-Math.sin(q*Math.PI)*40,w,h,r+(1-q)*3,sq); }
  const dq=ez((ms-P.drape)/350); if(dq>0) { const xa=x0-8,xb=x1+8,yt=wallTop-6,yb=lerp(yt-4,yt+10,dq);
    gfx.beginPath(); gfx.moveTo(xa,yb+14); gfx.lineTo(xa+6,yt); gfx.quadraticCurveTo((xa+xb)/2,yt-22*dq,xb-6,yt); gfx.lineTo(xb,yb+14);
    for(let k=8;k>=0;k--) gfx.lineTo(xa+(xb-xa)*k/8,yb+14+(k%2?6:0)); gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); gfx.fillStyle='#f3b0c8'; gfx.fill();
    gfx.save(); gfx.clip(); for(let i=0;i<12;i++) for(let j=0;j<3;j++) if((i+j)%2) R(xa+i*(xb-xa)/12,yt-30+j*16,(xb-xa)/12,16,'#ffd6e4'); gfx.restore();
    if(ms>P.sign) { const g=ez((ms-P.sign)/200),sxx=(xa+xb)/2,syy=yt-22*dq; RO(sxx-1,syy-30*g,3,30*g,'#8a5a30'); gfx.save(); gfx.translate(sxx,syy-30*g); gfx.scale(g,g); RO(-34,-16,68,18,CREAM); label('PASSWORD?',0,-12,'#5a3a8a',1); gfx.restore(); } } };
{ const fort=Rm.pillow_fort; Rm.pillow_fort=E2=>{ fort(E2);
    b7Later(()=>setMessage('Couch cushions. Every couch cushion in the house.'),Math.round(920)); }; }

// ---------- Macaroni Crown (A2, key dress_up_tiara): arts and crafts ----------
// Rose kneels and makes a paper crown: crayon scribbles, glitter glue, macaroni stuck on, a shake of glitter. TA-DA.
// She hops up and plonks it on the monster's head (SPLAT of glue). It is too busy being fancy to stand up straight.
const MAC='#f2c85a',MACD='#c9962e';
const crown=(x,y,sc,pr,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  const pts=[[-26,8],[-26,-6],[-18,-18],[-10,-6],[0,-22],[10,-6],[18,-18],[26,-6],[26,8]];
  gfx.beginPath(); pts.forEach((p,i)=>i?gfx.lineTo(p[0],p[1]):gfx.moveTo(p[0],p[1])); gfx.closePath(); gfx.lineJoin='round'; gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#ffb84a'; gfx.fill();
  gfx.save(); gfx.clip();
  const cr=pr.crayon||0,cols=['#e83a3a','#3a7ae8','#3ab45a','#9a4ae0'];
  for(let k=0;k<4;k++) { const q=cl(cr*4-k); if(q<=0) continue; gfx.strokeStyle=cols[k]; gfx.lineWidth=2; gfx.beginPath(); for(let i=0;i<=12*q;i++) { const xx=-24+i*4,yy=-2+k*3+(i%2?-4:3); i?gfx.lineTo(xx,yy):gfx.moveTo(xx,yy); } gfx.stroke(); }
  gfx.restore();
  const g=pr.glue||0; for(let k=0;k<7;k++) if(g*7>k) { gfx.globalAlpha*=.8; E(-21+k*7,3,2.4,1.6,'#f4f8ff'); gfx.globalAlpha/=.8; }
  const nm=Math.floor((pr.mac||0)*6); for(let k=0;k<nm;k++) { const mx=-20+k*8,my=-1+(k%2)*5; gfx.save(); gfx.translate(mx,my); gfx.rotate(k*.9);
    gfx.beginPath(); gfx.arc(0,3,4,Math.PI*1.1,Math.PI*1.9); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.lineWidth=3; gfx.strokeStyle=MAC; gfx.stroke(); E(-3,1.2,.8,.8,MACD); gfx.restore(); }
  if(pr.glit) { const t=battle.time||0; for(let k=0;k<12;k++) { const tw=(Math.sin(t*9+k*1.7)+1)/2; if(tw<.3) continue; star(-24+((k*37)%48),-16+((k*23)%22),1.5+tw*2.5,k%3?GOLD:(k%2?PINK:SKY),t*3+k); } }
  gfx.restore(); };
SC.rf_crown=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f),st=s.st; if(!st||st.x==null) return;
  const pr={crayon:cl((ms-P.draw)/(P.glue-P.draw)),glue:cl((ms-P.glue)/250),mac:cl((ms-P.glue-150)/(P.shake-P.glue-150)),glit:ms>P.shake};
  let x,y,sc=1,rot=0;
  if(ms<P.up) { x=st.x-26; y=st.y-4; sc=1; rot=0; }
  else if(ms<P.toss) { const p=head(st,-34); x=p.x; y=p.y+Math.sin(ms/120)*2; sc=1.2; }
  else if(ms<P.on) { const q=(ms-P.toss)/(P.on-P.toss),p=head(st,-34),sit=F.top+4; x=lerp(p.x,F.x,ez(q)); y=lerp(p.y,sit,q*q)-Math.sin(q*Math.PI)*60; sc=lerp(1.2,1.7,ez(q)); rot=-q*.6; }
  else { const d=ms-P.on,b=Math.abs(Math.sin(d/90))*10*Math.exp(-d/200); x=F.x+(s.f.ox||0); y=F.top+4+(s.f.oy||0)-b; sc=1.7; rot=(s.f.spin||0)-.12; }
  gfx.globalAlpha=fade(u,.94); crown(x,y,sc,pr,rot);
  if(ms>P.draw&&ms<P.glue) { const t=(ms-P.draw)/(P.glue-P.draw),cx=st.x-26-24+t*48*0+Math.sin(ms/45)*14,cy=st.y-10; gfx.save(); gfx.translate(cx,cy); gfx.rotate(-.7); RO(-2,-14,5,16,'#e83a3a'); R(-2,-14,5,4,'#ffe0c0'); gfx.restore(); }
  if(ms>P.glue&&ms<P.shake) { const cx=st.x-26+Math.sin(ms/90)*16,cy=st.y-26; gfx.save(); gfx.translate(cx,cy); gfx.rotate(2.6); RO(-5,-8,10,14,'#f4f8ff'); RO(-2,-14,4,6,'#ff7fb3'); gfx.restore(); } };
SC.rf_splat=(s,u)=>{ gfx.globalAlpha=fade(u,.4); for(let k=0;k<10;k++) { const a=k/10*Math.PI*2,d=ez(u)*44; E(s.x+Math.cos(a)*d,s.y+Math.sin(a)*d*.5,3*(1-u)+1,3*(1-u)+1,k%2?'#f4f8ff':GOLD); }
  for(let k=0;k<16;k++) { const a=k*2.4,d=ez(u)*70*(.4+(k%4)/4); star(s.x+Math.cos(a)*d,s.y-10+Math.sin(a)*d*.6,2+(k%3),k%3?GOLD:PINK,u*6+k); } };
Rm.dress_up_tiara=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,46),plan={draw:1000,glue:1700,shake:2300,up:2450,toss:2800,on:3100};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:6,hn:6},{t:850,x:p.x,y:p.y,f:'kneel'},{t:1000,f:'kneel',dx:(u,tt)=>Math.sin(tt*30)*1},
    {t:2450,f:'celeb',hop:10},{t:2800,f:'celeb',hop:40},{t:3150,f:'idle'},{t:3400,f:'celeb',hop:8,hn:2},{t:4000,f:'walkR',hop:6,hn:5},{t:4800,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Craft time. Rose sits down right in front of '+f.name+' with her art box.'); say(m.id,'dress_up_tiara'); scene('rf_crown',4.9,{st,f,plan}); }],
    [plan.draw,()=>{ setMessage('Crayons first. Lots of crayons. Outside the lines is fine.'); scene('rf_word',.8,{x:p.x-20,y:p.y-RH()-30,txt:'SCRIBBLE',c:CREAM,sc:2}); for(let k=0;k<5;k++) b7Later(()=>sfx.step&&sfx.step(),k*130); }],
    [plan.glue,()=>{ setMessage('Glitter glue. Then macaroni. Then more glue on the macaroni.'); sfx.splat&&sfx.splat(); scene('rf_word',.8,{x:p.x-20,y:p.y-RH()-30,txt:'GLUE',c:'#f4f8ff',sc:2}); }],
    [plan.shake,()=>{ sfx.dance&&sfx.dance(); scene('rv_burst',.6,{x:p.x-26,y:p.y-20,n:10,r:40,c:GOLD,c2:PINK}); }],
    [plan.up,()=>{ scene('rf_word',.8,{st,txt:'TA-DA!',c:GOLD,sc:3}); sfx.ding(); }],
    [plan.toss,()=>{ sfx.jumpWhistle(); }],
    ['hf',plan.on],
    [plan.on,()=>{ sfx.splat?sfx.splat():sfx.bonk(); sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('rf_splat',.9,{x:F.x,y:F.top+6}); scene('rv_big',1,{x:F.x,y:F.top-90,txt:'SPLAT!',c:GOLD,sc:3}); }],
    [3400,()=>{ scene('rv_preen',1.5,{f}); setMessage(cap(f.def?f.def.the:f.name)+' is wearing macaroni now. It feels very fancy.'); }],
    [3600,()=>{ scene('rf_word',1.0,{x:F.x,y:F.top-90,txt:'SO FANCY',c:PINK,sc:3}); sfx.giggle(); }],
    [4900,'end',res(E2)+'It\'s too busy being fancy to stand up straight.']]); };

// ---------- Lamby Boomerang (B1, key lookout_lamby): both Lambys, then up onto Tom ----------
// Rose whirls Lamby and Backup Lamby on her ribbons and lets go: one loops high, one loops low, both bonk the monster
// and come back. She catches them and climbs onto Tom's shoulders (or Guards herself if he is down).
SC.rf_boom2=(s,u)=>{ const ms=s.t*1000,P=s.plan,h=hand(),st=s.st;
  const loop=(q,hi)=>{ const a=q*Math.PI*2,cx=(P.x0+P.lx)/2,rx=(P.lx-P.x0)/2; return [cx+Math.cos(a)*rx,P.y+(hi?-1:1)*Math.sin(a)*P.ry]; };
  const one=(hi,v,delay)=>{ let x,y,rot=0,sc=1.3,pose='held',fl=false;
    if(ms<P.swing) { x=h.x-2+(hi?0:16); y=h.y+4+(hi?0:6); sc=1.1; rot=hi?.3:-.3; fl=!hi; }
    else if(ms<P.go+delay) { const a=(ms-P.swing)/1000*13+(hi?0:Math.PI),p=head(st,-10); x=p.x+Math.cos(a)*40; y=p.y-12+Math.sin(a)*14; rot=a; pose='fly'; LnO(h.x,h.y,x,y,2,hi?PINK2:SKY); }
    else if(ms<P.back+delay) { const q=(ms-P.go-delay)/(P.back-P.go); [x,y]=loop(q,hi); rot=q*20*(hi?1:-1); sc=1.9; pose='fly';
      for(let k=1;k<10;k++) { const qq=q-k*.018; if(qq<0) break; const [px,py]=loop(qq,hi); gfx.globalAlpha=.55-k*.05; E(px,py,5-k*.35,5-k*.35,hi?PINK2:SKY); } gfx.globalAlpha=1; }
    else { x=h.x-2+(hi?0:16); y=h.y+4+(hi?0:6); sc=1.15; rot=hi?.2:-.2; fl=!hi; if(ms>P.mountAt) return; }
    gfx.globalAlpha=1; plush(x,y,sc,{pose,rot,v,flip:fl}); };
  one(false,'backup',140); one(true,undefined,0); };
Rm.lookout_lamby=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,70),tom=tomUp(),TU=tom?ST.unit(tom):null;
  const plan={swing:900,go:1500,back:2600,x0:Math.max(14,F.x-F.w*.5-30),lx:p.x-18,y:Math.min(F.base-14,F.top+F.h*.55),ry:Math.max(34,F.h*.5),mountAt:tom?3200:99999};
  const hitA=Math.round(plan.go+.32*(plan.back-plan.go)),hitB=hitA+140;
  const K=[{t:0,x:'home',y:'home',f:'walk',hop:4,hn:6},{t:800,x:p.x,y:p.y,f:'expr'},{t:900,f:(u,tt)=>Math.floor(tt*10)%2?'act':'celeb'},
    {t:1500,f:'act',dx:u=>-ez(u/.3)*10},{t:1800,f:'idle',dx:-10},{t:2600,f:'celeb',hop:16},{t:2900,f:'runR'}];
  if(tom) K.push({t:3300,x:TU.x+30,y:TU.base+3,f:'celeb',hop:50,ns:true},{t:3700,x:()=>ride(tom).x,y:()=>ride(tom).y,f:'idle',ns:true},{t:4600,x:()=>ride(tom).x,y:()=>ride(tom).y,f:'idle',ns:true});
  else K.push({t:3600,x:'home',y:'home',f:'kneel'},{t:3900,f:'celeb',hop:8},{t:4200,f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose ties a ribbon on Lamby and one on Backup Lamby. Double knots.'); say(m.id,'lookout_lamby'); scene('rf_boom2',(tom?3.3:4.3),{st,plan}); }],
    [plan.swing,()=>{ sfx.spin?sfx.spin():sfx.whoosh(); setMessage('Round and round and round...'); }],
    [plan.go,()=>{ sfx.whoosh(); scene('rv_big',.9,{st,txt:'WHEEE!',c:PINK2,sc:3}); }],
    ['hf',hitA],
    [hitA,()=>{ sfx.baa(); sfx.bonk(); ST.jolt(f,.4); landHit(50); scene('rv_burst',.5,{x:F.x,y:F.top+8,n:8,r:40,c:PINK2,c2:GOLD}); }],
    [hitB,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(50); scene('rf_word',.7,{x:F.x,y:F.top-60,txt:'BONK BONK',c:GOLD,sc:3}); }],
    [plan.back,()=>{ sfx.ding(); scene('ro_text',.9,{st,txt:'GOT THEM',c:PINK,sc:2}); }],
    ...(tom?[[3300,()=>{ sfx.jumpWhistle(); }],[3700,()=>{ E2.apply(); battle.fx[tom.idx].hop=.3; }]]:[[3600,()=>{ E2.apply(); sfx.select(); }]]),
    [tom?3900:4300,'end',res(E2)+(tom?'Both Lambys came back. Rose is up on Tom.':'Both Lambys came back. That\'s the rule.')]]); };

// ---------- Ms. Cathy's Snack Attack (B4, key lamby_boomerang) ----------
// Rose cups her hands and yells for Ms. Cathy, her sitter (about 60, shoulder-length blonde hair, glasses). Ms. Cathy
// walks in with a tray of treats and throws cookies, cupcakes, donuts and candy at the row. Sugar rush: COOL down.
// Her battle sprite is Deedee's pose set, recolored (blonde hair, teal cardigan) with glasses drawn on.
// Built on first use: Deedee's battle sprite loads after this file.
let CATHY_=null; const cathy=()=>{ if(CATHY_) return CATHY_; const d=BATTLE_SPRITES.deedee; if(!d) return null;
  // Recolor by colour, not letter (each pose uses its own letters), and by body band: hair browns go blonde only in the
  // head rows (above the shoulders), the red dress goes teal only in the body rows. Recoloured rows are cached per pose.
  const hsl=hex=>{ const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,dd=mx-mn;
    if(!dd) return [0,0,l]; const sat=dd/(1-Math.abs(2*l-1)); let h=mx===r?((g-b)/dd)%6:(mx===g?(b-r)/dd+2:(r-g)/dd+4); h*=60; if(h<0) h+=360; return [h,sat,l]; };
  const pal=Object.assign({},d.pal),hair={},dress={};
  for(const k in d.pal) { const c=d.pal[k]; if(typeof c!=='string'||c[0]!=='#'||k.length!==1) continue; const [h,sa,l]=hsl(c);
    if(h>=15&&h<=45&&sa<.52&&l>.26&&l<.63) { const nk=String.fromCharCode(0x100+k.charCodeAt(0)); pal[nk]='hsl(46,'+Math.round(55+sa*30)+'%,'+Math.round(42+l*55)+'%)'; hair[k]=nk; }
    if((h>=338||h<=12)&&sa>.2&&l>.18&&l<.6) { const nk=String.fromCharCode(0x200+k.charCodeAt(0)); pal[nk]='hsl(194,'+Math.round(sa*100)+'%,'+Math.round(l*100)+'%)'; dress[k]=nk; } }
  const cache=new Map(),HEAD=34,BODY=57;
  const rows=fr=>{ if(cache.has(fr)) return cache.get(fr); const out=fr.map((row,r)=>row.split('').map(ch=>r<=HEAD?(hair[ch]||ch):(r<=BODY?(dress[ch]||ch):ch)).join('')); cache.set(fr,out); return out; };
  return CATHY_={sp:d,pal,rows}; };
const drawCathy=(k,cx,base,flip,alpha=1)=>{ const CATHY=cathy(); if(!CATHY) return; const sp=CATHY.sp,rows0=CATHY.rows(sp[k]||sp.idle),rows=flip?rows0.map(r=>r.split('').reverse().join('')):rows0,s=sp.scale,W=rows[0].length*s,H=rows.length*s,x=cx-W/2,y=base-H;
  drawSprite(rows,CATHY.pal,x,y,s,{alpha});
  const e=(sp.eyeAt&&sp.eyeAt.get&&sp.eyeAt.get(sp[k]||sp.idle))||sp.eye||{col:21,row:27},dc=e.col-21,dr=e.row-27;
  const col=c=>flip?rows[0].length-1-c:c,gx=c=>x+col(c+dc)*s,gy=r=>y+(r+dr)*s;
  gfx.globalAlpha=alpha; gfx.strokeStyle='#3a2a20'; gfx.lineWidth=1.6;
  for(const c0 of [19,28]) { const a=Math.min(gx(c0),gx(c0+3)),b=Math.max(gx(c0),gx(c0+3)); gfx.strokeRect(a+.5,gy(25.5),b-a+s-1,s*3); }
  const l1=Math.max(gx(22),gx(19)),r1=Math.min(gx(28),gx(31)); gfx.beginPath(); gfx.moveTo(Math.min(l1,r1)+s,gy(26.5)); gfx.lineTo(Math.max(l1,r1),gy(26.5)); gfx.stroke(); gfx.globalAlpha=1; };
const TREATS=['cookie','cupcake','candy','donut','cookie','cupcake'];
const TREATSRC={cookie:[4,27,76,58,19],cupcake:[77,0,70,80,15],candy:[0,68,84,64,28],donut:[82,86,74,58,21]};   // each treat cut out of the painted treat_set
const treat=(kind,x,y,s,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(s,s);
  { const t=TREATSRC[kind]; if(t&&PROPART.draw('rose/treat_set',0,0,{w:t[4],src:t.slice(0,4)})) { gfx.restore(); return; } }
  if(kind==='cookie') { EO(0,0,9,9,'#d9a35a'); for(const [a,b] of [[-3,-3],[3,-1],[-1,4],[4,4],[-5,2]]) E(a,b,1.6,1.4,'#5a3420'); }
  else if(kind==='cupcake') { gfx.beginPath(); gfx.moveTo(-7,0); gfx.lineTo(7,0); gfx.lineTo(5,10); gfx.lineTo(-5,10); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#8ac6e8'; gfx.fill();
    EO(0,-2,9,6,'#ff9cc8'); E(0,-8,2.6,2.6,'#e83a3a'); for(let k=0;k<4;k++) R(-6+k*4,-4,2,1,['#fff','#ffe08a','#9be39a','#9fd8ff'][k]); }
  else if(kind==='candy') { for(const sd of [-1,1]) { gfx.beginPath(); gfx.moveTo(sd*6,0); gfx.lineTo(sd*13,-5); gfx.lineTo(sd*13,5); gfx.closePath(); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle='#ff7fb3'; gfx.fill(); } EO(0,0,7,5.5,'#ff7fb3'); Ln(-4,-3,2,4,2,'#ffffff'); }
  else { EO(0,0,10,10,'#e8a860'); E(0,-1,8,7,'#c86aa8'); E(0,0,3.4,3.4,OUT); E(0,0,2.2,2.2,'#3a5a4a'); for(let k=0;k<6;k++) { const a=k; R(Math.cos(a)*5.5,Math.sin(a)*4.5-1,2,1,['#fff','#ffe08a','#9be39a'][k%3]); } }
  gfx.restore(); };
SC.rf_cathy=(s,u)=>{ const ms=s.t*1000,P=s.plan,CATHY=cathy(); if(!CATHY) return; let x,k,flip=false;
  if(ms<P.arrive) { const q=ez(ms/P.arrive); x=lerp(620,P.cx,q); k=Math.floor(ms/150)%2?'run1':'run2'; }
  else if(ms<P.throwEnd) { const i=Math.floor((ms-P.throw0)/P.gap); k=ms<P.throw0?'idle':((ms-P.throw0)%P.gap<P.gap*.45?'wind':'throw'); x=P.cx; if(ms>P.throwEnd-200) k='celeb'; }
  else if(ms<P.leave) { x=P.cx; k=ms<P.wave?'celeb':'hip'; }
  else { const q=ez((ms-P.leave)/(P.gone-P.leave)); x=lerp(P.cx,640,q); k=Math.floor(ms/150)%2?'run1':'run2'; flip=true; }
  if(!CATHY.sp[k]) k='idle';
  E(x,P.y+3,22,5,'rgba(0,0,0,.18)'); drawCathy(k,x,P.y,flip);
  if(ms>P.arrive-200&&ms<P.throwEnd&&k!=='throw') { const hx=x-16,hy=P.y-52; if(!PROPART.draw('rose/snack_tray',hx,hy-7,{w:38})) { RO(hx-16,hy,32,5,'#c9c9d4'); treat('cupcake',hx-8,hy-6,.7,0); treat('cookie',hx+7,hy-4,.7,.3); } }
  if(ms>P.arrive&&ms<P.arrive+900) { gfx.globalAlpha=fade((ms-P.arrive)/900,.7); label('MS. CATHY',x,P.y-138,CREAM,2); gfx.globalAlpha=1; } };
Rm.lamby_boomerang=E2=>{ const {m,fx}=E2,list=foes(E2),G=ST.group(list),p=rowSpot(G,64),order=list.slice().sort((a,b)=>ST.foe(b).x-ST.foe(a).x);
  const cx=Math.min(548,p.x+78),plan={arrive:1400,throw0:1600,gap:240,cx,y:Math.min(316,p.y+4)}; const n=6; plan.throwEnd=plan.throw0+n*plan.gap+200; plan.wave=plan.throwEnd+500; plan.leave=plan.throwEnd+900; plan.gone=plan.leave+800;
  const END=plan.gone+200;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'run'},{t:600,x:p.x,y:p.y,f:'act'},{t:900,f:'celeb',hop:12,hn:2},{t:plan.throw0,f:(u,tt)=>Math.floor(tt*6)%2?'celeb':'idle',hop:10,hn:5},
    {t:plan.throwEnd,f:'celeb',hop:14},{t:plan.leave,f:'runR'},{t:END-100,x:'home',y:'home',f:'idle'}]);
  const tosses=[]; for(let i=0;i<n;i++) { const f=order[i%order.length],at=plan.throw0+i*plan.gap+plan.gap*.5; tosses.push([Math.round(at+380),()=>{ sfx.bonk(); ST.jolt(f,.35); landHit(i<n-1?Math.floor(100/n):100-Math.floor(100/n)*(n-1)); const F=ST.unit(f); scene('rv_burst',.4,{x:F.x,y:F.top+10,n:6,r:26,c:GOLD,c2:PINK,seed:i}); }]);
    tosses.push([Math.round(at),()=>{ const F=ST.unit(f),kind=TREATS[i%TREATS.length],y0=plan.y-60; ST.fly((x,y,uu)=>treat(kind,x,y,1.3,uu*8),cx-14,y0,F.x,F.top+F.h*.3,.38,46); sfx.whoosh&&sfx.whoosh(); }]); }
  ST.play(E2,[
    [0,()=>{ setMessage('Rose cups her hands. MS. CATHY!'); say(m.id,'lamby_boomerang'); scene('rf_cathy',END/1000,{plan}); }],
    [700,()=>{ scene('rf_word',.9,{st,txt:'MS. CATHY!',c:PINK2,sc:3}); }],
    [900,()=>{ for(let k=0;k<4;k++) b7Later(()=>sfx.step&&sfx.step(),k*150); setMessage('Ms. Cathy walks in with a tray of treats. She came prepared. She always comes prepared.'); }],
    ['hf',plan.throw0+plan.gap*.5+380],
    ...tosses,
    [plan.throwEnd,()=>{ scene('rv_big',1.1,{x:G.x,y:G.top-74,txt:'SUGAR RUSH!',c:PINK2,sc:3}); setMessage('Snack attack! Everybody gets a treat. Nobody can sit still now.'); sfx.ding(); }],
    [plan.wave,()=>{ scene('rf_word',.8,{x:cx,y:plan.y-150,txt:'BYE ROSE!',c:CREAM,sc:2}); }],
    [END,'end',res(E2)+'Ms. Cathy always has snacks. That\'s why she\'s the best.']]); };
})();

// ================= Tom's second Rose review (2026-10-26, round 2) =================
// Boo!!: she vanishes from the party row (no walking up first) and pops out behind the monster. Rainbow Unicorn Cut-Out
// (A2, key dress_up_tiara) replaces Macaroni Crown: she draws a rainbow and a unicorn, cuts it out with safety scissors
// and sticks it on the monster. Lamby Hug: one Lamby in each hand, never overlapping. Lamby Boomerang (B1, key
// lookout_lamby): thrown from her own spot in the party row. Pillow Fort: the cushion walls stand outside the party and
// the blanket roof sits above everyone's heads, so nobody is covered. Tea Party: Backup Lamby holds the teapot.
// Bedtime Story, Tea Party and Lamby Hug have new lines (data/lines.js). Prefix rg_.
(function(){
const SC=RFX.SC,{scene}=RFX,ST=RFX.ST;
const R=(x,y,w,h,c)=>rect(x,y,w,h,c),E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1,fin=(u,a=.12)=>u<a?u/a:1;
const Ln=(x0,y0,x1,y1,w,c)=>{ gfx.strokeStyle=c; gfx.lineWidth=w; gfx.lineCap='round'; gfx.beginPath(); gfx.moveTo(x0,y0); gfx.lineTo(x1,y1); gfx.stroke(); };
const LnO=(x0,y0,x1,y1,w,c)=>{ Ln(x0,y0,x1,y1,w+4,OUT); Ln(x0,y0,x1,y1,w,c); };
const RO=(x,y,w,h,c)=>{ R(x-2,y-2,w+4,h+4,OUT); R(x,y,w,h,c); },EO=(x,y,rx,ry,c)=>{ E(x,y,rx+2,ry+2,OUT); E(x,y,rx,ry,c); };
const rrect=(x,y,w,h,r)=>{ gfx.beginPath(); gfx.moveTo(x+r,y); gfx.arcTo(x+w,y,x+w,y+h,r); gfx.arcTo(x+w,y+h,x,y+h,r); gfx.arcTo(x,y+h,x,y,r); gfx.arcTo(x,y,x+w,y,r); gfx.closePath(); };
const heart=(x,y,r,c)=>{ E(x-r*.5,y-r*.2,r*.6,r*.6,c); E(x+r*.5,y-r*.2,r*.6,r*.6,c); gfx.beginPath(); gfx.moveTo(x-r*1.05,y); gfx.lineTo(x,y+r*1.1); gfx.lineTo(x+r*1.05,y); gfx.closePath(); gfx.fillStyle=c; gfx.fill(); };
const star=(x,y,r,c,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.beginPath(); for(let k=0;k<10;k++) { const a=k*Math.PI/5-Math.PI/2,q=k%2?r*.45:r; gfx.lineTo(Math.cos(a)*q,Math.sin(a)*q); } gfx.closePath();
  gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=3; gfx.stroke(); gfx.fillStyle=c; gfx.fill(); gfx.restore(); };
const bigWord=(txt,x,y,c,sc)=>{ const o=Math.max(2,sc*.6); for(const [ox,oy] of [[-o,0],[o,0],[0,-o],[0,o],[-o,-o],[o,o],[-o,o],[o,-o]]) label(txt,x+ox,y+oy,OUT,sc); label(txt,x,y,c,sc); };
const Rm=RECRUIT_MOVES.rose;
const PINK='#ffb3cf',PINK2='#ff7fb3',GOLD='#ffe08a',CREAM='#fff8e8',SKY='#9fd8ff';
ST.nw('rg_');
const res=E2=>E2.result?E2.result+' ':'';
const kindLine=(t,ally)=>t&&t.side==='foe'?t.name+' warms up a little.':ally;
const firstFoe=E2=>(E2.targets||[]).find(t=>t.side==='foe')||(B2.move&&B2.move.waves[0]&&B2.move.waves[0][0]&&B2.move.waves[0][0].t);
const front=(F,gap=26)=>({x:Math.min(560,F.x+F.w*.5+gap),y:Math.min(314,F.base+3)});
const spotFor=(m,t,gap=24)=>{ const me=ST.unit(m); if(!t||t===m) return {x:me.x,y:me.base,self:true}; const u=ST.unit(t); return {x:Math.min(560,u.x+u.w*.5+gap),y:u.base+3}; };
const plush=(x,y,sc,o)=>RFX.plush(x,y,sc,o||{});
const hand=(dx=0,dy=0)=>ST.hand(dx,dy);
const RSP=()=>BATTLE_SPRITES.rose,RH=()=>RSP().idle.length*RSP().scale,RW=()=>RSP().idle[0].length*RSP().scale;
const head=(st,dy=0)=>({x:st.x,y:st.y-RH()*(st.sc||1)*.84+dy});
const tomUp=()=>B2.party.find(p=>p.id==='tom'&&b2Alive(p));
const hopOf=u=>{ if(u&&u.side==='party') battle.fx[u.idx].hop=.35; else if(u) ST.jolt(u,.15); };
const ride=tom=>{ const d=battle.drawnAt&&battle.drawnAt[tom.idx],q=BATTLE_POS[tom.idx],sp=BATTLE_SPRITES.tom,a=d||{cx:q.x*3,base:q.base*3,h:sp.idle.length*sp.scale}; return {x:a.cx+2,y:a.base-a.h+20}; };
SC.rg_word=(s,u)=>{ let x=s.x,y=s.y; if(s.st&&s.st.x!=null) { const p=head(s.st,-34); x=p.x; y=p.y; }
  const pop=u<.12?ez(u/.12)*1.25:lerp(1.25,1,cl((u-.12)/.12)),sc=s.sc||3,w=(s.txt.length*4-1)*sc;
  x=Math.max(w/2+8,Math.min(568-w/2,x)); y=Math.max(sc*5+28,y);
  gfx.globalAlpha=fin(u,.05)*fade(u,.78); gfx.save(); gfx.translate(x,y); gfx.scale(pop,pop); bigWord(s.txt,0,-sc*2.5,s.c||PINK2,sc); gfx.restore(); };

// ---------- Boo!! (A1): gone from the party row, out from behind the monster ----------
Rm.boo=E2=>{ const {m,fx}=E2,t=E2.targets[0],F=ST.unit(t),me=ST.unit(m);
  const pB={x:Math.max(22,F.x-F.w*.5-18),y:Math.min(314,F.base+2)},OUT1=700,IN=1400,BOO=1650,BACK=3050;
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'kneel'},{t:OUT1,x:'home',y:'home',f:'idle',hide:true},{t:IN,x:pB.x,y:pB.y,f:'kneel'},
    {t:BOO,f:'boo',hop:34,sc:u=>1+ez(u/.3)*.35},{t:2200,f:'celeb',sc:1.3,dy:(u,tt)=>-Math.abs(Math.sin(tt*14))*4},{t:2650,f:'boo',hop:10,hn:2},
    {t:BACK,x:pB.x,y:pB.y,f:'idle',hide:true},{t:BACK+120,x:'home',y:'home',f:'idle',hide:true},{t:BACK+140,x:'home',y:'home',f:'celeb',hop:10},{t:BACK+600,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose crouches down right where she\'s and winks.'); }],
    [250,()=>{ scene('ro_text',.9,{st,txt:'SHHH',c:CREAM,sc:2}); sfx.select(); }],
    [OUT1,()=>{ sfx.poof(); scene('rf_poof',.7,{x:me.x,y:me.base,r:34}); scene('rf_look',(IN-OUT1)/1000+.05,{f:t}); setMessage('POOF. She\'s gone. Where did she go?'); }],
    [IN,()=>{ sfx.poof(); scene('rf_poof',.6,{x:pB.x,y:pB.y,r:30,seed:1}); setMessage('POOF. She\'s right behind it.'); }],
    ['hf',BOO],
    [BOO,()=>{ say(m.id,'boo'); E2.apply(); sfx.boo?sfx.boo():sfx.boing(); sfx.boing(); scene('rv_flash',.25,{a:.75}); scene('rv_big',1.3,{x:pB.x+30,y:F.top-104,txt:'BOOOO!!',c:'#ff5a8a',sc:5,rot:-.08});
      scene('rv_scare',1.8,{f:t}); ST.jolt(t,.5); }],
    [2650,()=>{ sfx.giggle(); setMessage('It jumped right out of its skin. Then it laughed. Rose laughs too.'); }],
    [BACK,()=>{ sfx.poof(); scene('rf_poof',.5,{x:pB.x,y:pB.y,r:26}); }],
    [BACK+120,()=>{ scene('rf_poof',.5,{x:me.x,y:me.base,r:26,seed:2}); }],
    [3850,'end',()=>t&&B2.move&&B2.move.kindOnFoe?kindLine(t):'It jumped out of its skin. Then it laughed.']]); };

// ---------- Rainbow Unicorn Cut-Out (A2, key dress_up_tiara) ----------
// Rose kneels with a sheet of paper: crayons draw a rainbow, then a unicorn standing on it. Safety scissors snip all the
// way around (scraps fall), she holds it up (TA-DA!), and sticks it on the monster. It is too busy admiring it: GRIT down.
const RB=['#ff5a5a','#ffa040','#ffe060','#6ad06a','#5aa0ff','#a070e0'];
// The art, centred on (0,0) in a 64 x 50 box. pr: rb 0..1 (rainbow), uni 0..1 (unicorn parts), cut 0..1, done (cut out).
const art=(x,y,sc,pr,rot=0)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(sc,sc);
  const done=pr.done,cx=0,cy=14,painted=done&&PROPART.draw('rose/unicorn_cut_out',0,-2,{h:62});   // painted cut-out replaces the drawn rainbow + unicorn once she has cut it out
  if(!done) { RO(-34,-26,68,52,'#fffdf6'); for(let k=0;k<4;k++) R(-34,-14+k*11,68,1,'#e6eef8'); }
  // Rainbow: six arcs over the bottom of the page, drawn left to right
  const rb=pr.rb||0; if(rb>0&&!painted) { const a0=Math.PI,a1=Math.PI+Math.PI*rb;
    if(done) { gfx.strokeStyle='#ffffff'; gfx.lineWidth=26; gfx.lineCap='round'; gfx.beginPath(); gfx.arc(cx,cy,19,a0,a1); gfx.stroke(); gfx.strokeStyle=OUT; gfx.lineWidth=2; gfx.beginPath(); gfx.arc(cx,cy,32,a0,a1); gfx.stroke(); }
    gfx.lineCap='butt'; RB.forEach((c,i)=>{ gfx.strokeStyle=c; gfx.lineWidth=3.2; gfx.beginPath(); gfx.arc(cx,cy,29-i*3,a0,a1); gfx.stroke(); });
    if(rb>=1) for(const sx of [-21,21]) { if(done) E(cx+sx,cy+3,9,5,'#ffffff'); E(cx+sx-3,cy+2,5,4,'#f4f8ff'); E(cx+sx+3,cy+2,5,4,'#f4f8ff'); E(cx+sx,cy,5,4.5,'#ffffff'); } }
  // Unicorn standing on top of the rainbow (white body, pink mane, gold horn)
  const un=pr.uni||0; if(un>0&&!painted) { const ux=2,uy=-14,o=(k)=>un*6>k;
    if(done) { gfx.globalAlpha*=1; E(ux,uy,15,10,'#ffffff'); E(ux-13,uy-9,9,8,'#ffffff'); }
    if(o(1)) { for(const [lx,sw] of [[-7,-1],[-3,1],[5,-1],[9,1]]) { Ln(ux+lx,uy+2,ux+lx+sw,uy+11,4.2,OUT); Ln(ux+lx,uy+2,ux+lx+sw,uy+11,2.2,'#fdfaff'); E(ux+lx+sw,uy+11,1.6,1,'#c98ae8'); } }   // legs (behind the body), lilac hooves
    if(o(0)) EO(ux,uy,11,6.5,'#fdfaff');                                                     // body
    if(o(2)) { EO(ux-12,uy-8,5.5,4.5,'#fdfaff'); E(ux-16,uy-7,1.2,1.2,OUT); E(ux-13.5,uy-9.5,1,1,OUT); }   // head and eye
    if(o(3)) { gfx.beginPath(); gfx.moveTo(ux-13,uy-12); gfx.lineTo(ux-17,uy-22); gfx.lineTo(ux-10.5,uy-13); gfx.closePath(); gfx.lineWidth=2; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=GOLD; gfx.fill(); }   // horn
    if(o(4)) { for(let k=0;k<4;k++) E(ux-8+k*1.6,uy-10+k*2.6,2.6,2,['#ff7fb3','#c98ae8','#7fc8ff','#ff7fb3'][k]); }   // mane
    if(o(5)) { for(let k=0;k<3;k++) E(ux+12+k*1.5,uy-2+k*2.5,2.4,2,['#ff7fb3','#c98ae8','#7fc8ff'][k]); E(ux-4,uy-2,2,1.6,'#ffb3cf'); }   // tail, a heart-pink cheek
  }
  // Cutting: a dashed line around the shape, snipped as the scissors go
  if(!done&&(pr.cut||0)>0) { gfx.setLineDash([3,3]); gfx.strokeStyle='#7a7a8a'; gfx.lineWidth=1.2; gfx.beginPath(); gfx.ellipse(0,-2,32,22,0,Math.PI,Math.PI+Math.PI*2*pr.cut); gfx.stroke(); gfx.setLineDash([]); }
  if(done&&pr.glit) { const t=battle.time||0; for(let k=0;k<8;k++) { const tw=(Math.sin(t*8+k*1.9)+1)/2; if(tw<.35) continue; star(-26+((k*29)%52),-26+((k*17)%40),1.4+tw*2.2,k%2?GOLD:PINK,t*3+k); } }
  gfx.restore(); };
const scissors=(x,y,open,rot)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
  if(PROPART.draw('rose/safety_scissors',-1,0,{h:28,rot:.7+open*.1})) { gfx.restore(); return; }
  for(const sd of [-1,1]) { gfx.save(); gfx.rotate(sd*open*.35); RO(-1,-1,14,3,'#c8ccd6'); EO(-5,sd*3,4.2,3.2,'#4a8ae8'); E(-5,sd*3,2,1.4,'#fffdf6'); gfx.restore(); } E(0,0,1.2,1.2,OUT); gfx.restore(); };
SC.rg_craft=(s,u)=>{ const ms=s.t*1000,P=s.plan,F=ST.unit(s.f),st=s.st; if(!st||st.x==null) return;
  const pr={rb:cl((ms-P.rb)/(P.uni-P.rb)),uni:cl((ms-P.uni)/(P.cut-P.uni)),cut:cl((ms-P.cut)/(P.up-P.cut-100)),done:ms>=P.up-100,glit:ms>=P.up-100};
  const px=st.x-40,py=st.y-20; let x=px,y=py,sc=1.2,rot=0;
  if(ms>=P.up&&ms<P.toss) { const p=head(st,-38); x=p.x; y=p.y+Math.sin(ms/120)*2; sc=1.3; }
  else if(ms>=P.toss&&ms<P.on) { const q=(ms-P.toss)/(P.on-P.toss),p=head(st,-38); x=lerp(p.x,F.x,ez(q)); y=lerp(p.y,F.mid,q*q)-Math.sin(q*Math.PI)*60; sc=lerp(1.3,1.5,ez(q)); rot=-q*.4; }
  else if(ms>=P.on) { const d=ms-P.on,b=Math.abs(Math.sin(d/90))*8*Math.exp(-d/200); x=F.x+(s.f.ox||0); y=F.mid+(s.f.oy||0)-b; sc=1.5; rot=(s.f.spin||0)-.1; }
  gfx.globalAlpha=fade(u,.94); art(x,y,sc,pr,rot);
  // A crayon scribbling (rainbow colors in turn), then the scissors working round the page
  if(ms>P.rb&&ms<P.cut) { const t=(ms-P.rb)/(P.cut-P.rb),c=ms<P.uni?RB[Math.min(5,Math.floor(t*12))]:'#ff7fb3',cx=px-20+((ms/40)%40)+Math.sin(ms/35)*3,cy=py-4+Math.cos(ms/45)*6;
    if(!PROPART.draw('rose/crayon',cx-10,cy-12,{h:26,flip:true})) { gfx.save(); gfx.translate(cx,cy); gfx.rotate(-.7); RO(-2,-15,5,16,c); R(-2,-15,5,4,'#ffe0c0'); gfx.restore(); } else E(cx,cy+1,2.2,1.6,c); }
  if(ms>=P.cut&&ms<P.up-100) { const a=Math.PI+Math.PI*2*pr.cut; scissors(px+Math.cos(a)*38,py-2+Math.sin(a)*26,Math.abs(Math.sin(ms/70)),a+Math.PI/2);
    for(let k=0;k<5;k++) { const q=((ms-P.cut)/700+k/5)%1; gfx.globalAlpha=.9*(1-q); gfx.save(); gfx.translate(px-30+k*15,py+20+q*20); gfx.rotate(q*4+k); R(-3,-2,6,4,'#fffdf6'); gfx.restore(); } gfx.globalAlpha=1; } };
Rm.dress_up_tiara=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),p=front(F,48),plan={rb:1000,uni:1800,cut:2500,up:3200,toss:3550,on:3850};
  const st=ST.keys(fx,[{t:0,x:'home',y:'home',f:'walk',hop:6,hn:6},{t:850,x:p.x,y:p.y,f:'kneel'},{t:1000,f:'kneel',dx:(u,tt)=>Math.sin(tt*30)*1},
    {t:plan.up,f:'celeb',hop:10},{t:plan.toss,f:'celeb',hop:36},{t:plan.on+50,f:'idle'},{t:plan.on+300,f:'celeb',hop:8,hn:2},{t:plan.on+900,f:'walkR',hop:6,hn:5},{t:plan.on+1700,x:'home',y:'home',f:'idle'}]);
  ST.play(E2,[
    [0,()=>{ setMessage('Craft time. Rose sits down right in front of '+f.name+' with paper, crayons and her safety scissors.'); say(m.id,'dress_up_tiara'); scene('rg_craft',(plan.on+1800)/1000,{st,f,plan}); }],
    [plan.rb,()=>{ setMessage('A rainbow first. Every color. In order. Mostly.'); for(let k=0;k<6;k++) b7Later(()=>sfx.step&&sfx.step(),k*130); }],
    [plan.uni,()=>{ setMessage('Then a unicorn standing on top. With a VERY pointy horn.'); scene('rg_word',.8,{x:p.x-30,y:p.y-RH()-30,txt:'UNICORN',c:'#c98ae8',sc:2}); }],
    [plan.cut,()=>{ setMessage('Snip snip snip, all the way around.'); for(let k=0;k<5;k++) b7Later(()=>sfx.poke?sfx.poke():sfx.click(),k*130); scene('rg_word',.8,{x:p.x-30,y:p.y-RH()-30,txt:'SNIP SNIP',c:CREAM,sc:2}); }],
    [plan.up,()=>{ const hp=head(st,-112); scene('rg_word',.8,{x:hp.x,y:hp.y,txt:'TA-DA!',c:GOLD,sc:3}); sfx.ding(); }],
    [plan.toss,()=>{ sfx.jumpWhistle(); }],
    ['hf',plan.on],
    [plan.on,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(100); scene('rf_splat',.9,{x:F.x,y:F.mid}); scene('rv_big',1,{x:F.x,y:F.top-90,txt:'STICK!',c:GOLD,sc:3}); }],
    [plan.on+300,()=>{ scene('rv_preen',1.5,{f}); setMessage(cap(f.def?f.def.the:f.name)+' has a unicorn on a rainbow now. It can\'t stop looking at it.'); }],
    [plan.on+500,()=>{ scene('rg_word',1.0,{x:F.x,y:F.top-90,txt:'SO PRETTY',c:PINK,sc:3}); sfx.giggle(); }],
    [plan.on+1800,'end',res(E2)+'It\'s too busy admiring it to stand up straight.']]); };

// ---------- Lamby Hug (A4): one Lamby in each hand ----------
// Lamby in her left hand, Backup Lamby in her right. At the hug they squish in from both sides of the friend, side by side.
SC.rg_hug=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; if(!st||st.x==null) return;
  const hy=st.y-RH()*.42,lx=st.x-RW()*.52,rx=st.x+RW()*.5;   // her two hands at her sides
  let ax=lx,ay=hy,bx=rx,by=hy,sc=1.15,sx=1,sy=1,ra=.25,rb=-.25;
  const pressing=ms>=P.press&&ms<=P.back;
  if(pressing) { const q=ez((ms-P.press)/220),sq=ms<P.back-150?Math.abs(Math.sin((ms-P.press)/150))*.24:0;
    ax=lerp(lx,P.tx-P.gap,q); ay=lerp(hy,P.ty,q); bx=lerp(rx,P.tx+P.gap,q); by=lerp(hy,P.ty,q); sc=lerp(1.15,1.4,q); sx=1+sq; sy=1-sq*.85; ra=lerp(.25,-.1,q); rb=lerp(-.25,.1,q); }
  if(ms>P.press+150&&ms<P.back+500) for(let k=0;k<12;k++) { const q=((ms-P.press-150)/950+k/12)%1,hx=P.tx+Math.sin(k*2.3+q*5)*(30+q*22),hy2=P.ty-34-q*90; if(ms>P.back&&q<.1) continue;
    gfx.globalAlpha=Math.sin(q*Math.PI)*(ms>P.back?cl(1-(ms-P.back)/500):1); heart(hx,hy2,7+Math.sin(q*Math.PI)*6,OUT); heart(hx,hy2,5+Math.sin(q*Math.PI)*6,k%2?'#ff6b9a':PINK2); }
  gfx.globalAlpha=1;
  gfx.save(); gfx.translate(ax,ay); gfx.scale(sx,sy); plush(0,0,sc,{pose:'held',rot:ra}); gfx.restore();
  gfx.save(); gfx.translate(bx,by); gfx.scale(sx,sy); plush(0,0,sc,{pose:'held',rot:rb,v:'backup',flip:true}); gfx.restore();
  if(ms>P.press+150&&ms<P.back-100) { const sq=Math.abs(Math.sin((ms-P.press)/150)); bigWord('SQUISH',Math.max(44,P.tx),P.ty-62-sq*6,PINK2,3); } };
Rm.lamby_hug=E2=>{ const {m,fx}=E2,t=E2.targets[0]||m,H=ST.unit(t),sp=spotFor(m,t,30),self=t===m;
  const K=self?[{t:0,x:'home',y:'home',f:'idle'},{t:600,f:'expr'},{t:1200,f:'hug',dy:(u,tt)=>-Math.abs(Math.sin(tt*9))*3},{t:2500,f:'celeb',hop:10},{t:2900,f:'idle'},{t:3300,x:'home',y:'home',f:'idle'}]
    :[{t:0,x:'home',y:'home',f:'walk',hop:5,hn:6},{t:1100,x:sp.x,y:sp.y,f:'expr'},{t:1400,f:'hug'},{t:2500,f:'celeb',hop:10},{t:2900,f:'walkR',hop:4,hn:5},{t:3900,x:'home',y:'home',f:'idle'}];
  const st=ST.keys(fx,K),press=self?1200:1400,end=self?3400:4000;
  const plan={press,back:2500,tx:H.x,ty:H.mid+8,gap:Math.max(38,H.w*.6)};
  ST.play(E2,[
    [0,()=>{ setMessage(self?'Rose holds Lamby in one hand and Backup Lamby in the other. Double hug.':'Rose brings Lamby in one hand and Backup Lamby in the other over to '+t.name+'.'); say(m.id,'lamby_hug'); scene('rg_hug',end/1000,{plan,st}); }],
    [press,()=>{ sfx.boing(); }],
    ['hf',press+300],
    [press+300,()=>{ E2.apply(); sfx.baa(); sfx.baa(.2); sfx.heal(); scene('ro_glow',1,{x:H.x,y:H.mid,c:PINK}); scene('rv_hearts',1.1,{x:H.x,y:H.top+6,n:9,r:64,sz:10}); hopOf(t!==m?t:null); }],
    [press+700,()=>{ scene('rv_big',1,{x:H.x,y:H.top-80,txt:'DOUBLE SQUEEZE',c:PINK,sc:2}); sfx.ding(); }],
    [end,'end',kindLine(t,'Two Lambys, one hug. One from each side.')]]); };

// ---------- Lamby Boomerang (B1, key lookout_lamby): thrown from the party row ----------
// Rose stays at her own spot. She whirls both Lambys on their ribbons and lets go: one loops high, one loops low, out past
// the monster (bonk, bonk) and back to her. Then she hops onto Tom's shoulders (Guards herself if he is down).
SC.rg_boom=(s,u)=>{ const ms=s.t*1000,P=s.plan,st=s.st; if(!st||st.x==null) return;
  const hs=[st.x-RW()*.5,st.y-RH()*.45],hb=[st.x+RW()*.45,st.y-RH()*.45];
  const one=(hi,v,delay,h0)=>{ let x,y,rot=0,sc=1.25,pose='held',fl=!hi;
    if(ms<P.swing) { x=h0[0]; y=h0[1]; rot=hi?.3:-.3; }
    else if(ms<P.go+delay) { const a=(ms-P.swing)/1000*13+(hi?0:Math.PI),p=head(st,-14); x=p.x+Math.cos(a)*38; y=p.y-10+Math.sin(a)*12; rot=a; pose='fly'; LnO(st.x,st.y-RH()*.7,x,y,2,hi?PINK2:SKY); }
    else if(ms<P.back+delay) { const q=(ms-P.go-delay)/(P.back-P.go); [x,y]=P.path(q,hi); rot=q*20*(hi?1:-1); sc=1.8; pose='fly';
      for(let k=1;k<10;k++) { const qq=q-k*.018; if(qq<0) break; const [px,py]=P.path(qq,hi); gfx.globalAlpha=.55-k*.05; E(px,py,5-k*.35,5-k*.35,hi?PINK2:SKY); } gfx.globalAlpha=1; }
    else { if(ms>P.mountAt) return; x=h0[0]; y=h0[1]; rot=hi?.2:-.2; }
    gfx.globalAlpha=1; plush(x,y,sc,{pose,rot,v,flip:fl}); };
  one(false,'backup',140,hb); one(true,undefined,0,hs); };
Rm.lookout_lamby=E2=>{ const {m,fx}=E2,f=firstFoe(E2),F=ST.unit(f),me=ST.unit(m),tom=tomUp(),TU=tom?ST.unit(tom):null;
  // The loop: out from above Rose's head to just past the monster's far side and back, high or low.
  const sx=me.x-10,sy=me.base-RH()*.8,far=Math.max(14,F.x-F.w*.5-34),cx=(sx+far)/2,rx=(sx-far)/2,ry=Math.max(34,F.h*.5);
  const path=(q,hi)=>{ const a=q*Math.PI*2; return [cx+Math.cos(a)*rx,lerp(sy,F.mid,Math.sin(q*Math.PI))+(hi?-1:1)*Math.sin(a)*ry*.6]; };
  const plan={swing:300,go:1100,back:2400,path,mountAt:tom?2900:99999};
  // The out-bound pass reaches the monster's middle at q where cos(2*pi*q) = (F.x-cx)/rx
  const qHit=Math.acos(cl((F.x-cx)/rx,-1,1))/(Math.PI*2),hitA=Math.round(plan.go+qHit*(plan.back-plan.go)),hitB=hitA+140;
  const K=[{t:0,x:'home',y:'home',f:'expr'},{t:plan.swing,f:(u,tt)=>Math.floor(tt*10)%2?'throwWind':'throwRel'},{t:plan.go,f:'throwRel',dx:u=>-ez(u/.3)*8},{t:plan.go+300,f:'idle'},{t:plan.back,f:'celeb',hop:16}];
  if(tom) K.push({t:2900,x:TU.x+30,y:TU.base+3,f:'celeb',hop:50,ns:true},{t:3300,x:()=>ride(tom).x,y:()=>ride(tom).y,f:'idle',ns:true},{t:4200,x:()=>ride(tom).x,y:()=>ride(tom).y,f:'idle',ns:true});
  else K.push({t:3000,x:'home',y:'home',f:'kneel'},{t:3300,f:'celeb',hop:8},{t:3700,f:'idle'});
  const st=ST.keys(fx,K);
  ST.play(E2,[
    [0,()=>{ setMessage('Rose holds Lamby and Backup Lamby up by their ribbons. Right from where she stands.'); say(m.id,'lookout_lamby'); scene('rg_boom',(tom?2.95:3.9),{st,plan}); }],
    [plan.swing,()=>{ sfx.spin?sfx.spin():sfx.whoosh(); setMessage('Round and round and round...'); }],
    [plan.go,()=>{ sfx.whoosh(); scene('rv_big',.9,{st,txt:'WHEEE!',c:PINK2,sc:3}); }],
    ['hf',hitA],
    [hitA,()=>{ sfx.baa(); sfx.bonk(); ST.jolt(f,.4); landHit(50); scene('rv_burst',.5,{x:F.x,y:F.top+8,n:8,r:40,c:PINK2,c2:GOLD}); }],
    [hitB,()=>{ sfx.bonk(); ST.jolt(f,.4); landHit(50); scene('rg_word',.7,{x:F.x,y:F.top-60,txt:'BONK BONK',c:GOLD,sc:3}); }],
    [plan.back,()=>{ sfx.ding(); scene('ro_text',.9,{st,txt:'GOT THEM',c:PINK,sc:2}); }],
    ...(tom?[[2900,()=>{ sfx.jumpWhistle(); }],[3300,()=>{ E2.apply(); battle.fx[tom.idx].hop=.3; }]]:[[3300,()=>{ E2.apply(); sfx.select(); }]]),
    [tom?3500:3900,'end',res(E2)+(tom?'Both Lambys came back. Rose is up on Tom.':'Both Lambys came back. That\'s the rule.')]]); };

// ---------- Pillow Fort (B5): walls outside the party, roof above everyone ----------
// The cushion walls stack up just outside the party's left and right edges, and the blanket roof spans above the
// tallest head, so the fort frames the family without covering anybody.
const SOFA='#7f9fc4',SOFAD='#5f7fa6',SOFAL='#a9c2de',PIPE='#e8eef6';
const cush=(x,y,w,h,rot=0,sq=1)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(1,sq);
  rrect(-w/2,-h/2,w,h,Math.min(6,h*.3)); gfx.lineWidth=3.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.fillStyle=SOFA; gfx.fill();
  rrect(-w/2+3,-h/2+3,w-6,h-6,Math.min(4,h*.22)); gfx.lineWidth=1.3; gfx.strokeStyle=PIPE; gfx.stroke();
  R(-w/2+4,h/2-5,w-8,2.5,SOFAD); R(-w/2+5,-h/2+4,w*.4,2,SOFAL); E(0,0,2.2,2.2,SOFAD); gfx.restore(); };
SC.rv_fort=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.92);
  const base=Math.min(318,Math.max(...P.U.map(q=>q.base))+4),left=Math.min(...P.U.map(q=>q.x-q.w*.5)),right=Math.max(...P.U.map(q=>q.x+q.w*.5));
  const W=22,roofY=Math.max(30,Math.min(...P.U.map(q=>q.top))-16),xl=Math.max(W/2+2,left-W/2-4),xr=Math.min(576-W/2-2,right+W/2+4);
  const n=Math.max(3,Math.ceil((base-roofY)/22)),hh=(base-roofY)/n;
  // Each column: cushions stacked bottom to top, arriving one after another (alternate sides)
  for(let i=0;i<n;i++) for(const [side,cx] of [[0,xl],[1,xr]]) { const at=(i*2+side)*85,q=ez((ms-P.fly-at)/280); if(q<=0) continue;
    const cy=base-hh*(i+.5),land=ms-P.fly-at-280,sq=land>0&&land<160?1-Math.sin(land/160*Math.PI)*.12:1,fx=side?cx+150:cx-150;
    cush(lerp(fx,cx,q),lerp(-30,cy,q)-Math.sin(q*Math.PI)*30,W,hh+2,(i%2?.04:-.04)*(side?-1:1)+(1-q)*3,sq); }
  const dq=ez((ms-P.drape)/350); if(dq>0) { const xa=xl-W/2-4,xb=xr+W/2+4,yt=roofY,yb=lerp(yt-6,yt+4,dq);
    gfx.beginPath(); gfx.moveTo(xa,yb+12); gfx.lineTo(xa+6,yt); gfx.quadraticCurveTo((xa+xb)/2,yt-20*dq,xb-6,yt); gfx.lineTo(xb,yb+12);
    for(let k=10;k>=0;k--) { const xx=xa+(xb-xa)*k/10; gfx.lineTo(xx,yb+(k%2?10:4)-((k>0&&k<10)?8*dq:0)); }   // hem stays above the heads in the middle
    gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); gfx.fillStyle='#f3b0c8'; gfx.fill();
    gfx.save(); gfx.clip(); for(let i=0;i<14;i++) for(let j=0;j<3;j++) if((i+j)%2) R(xa+i*(xb-xa)/14,yt-30+j*14,(xb-xa)/14,14,'#ffd6e4'); gfx.restore();
    if(ms>P.sign) { const g=ez((ms-P.sign)/200),sxx=(xa+xb)/2,syy=yt-20*dq; RO(sxx-1,syy-24*g,3,24*g,'#8a5a30'); gfx.save(); gfx.translate(sxx,syy-24*g); gfx.scale(g,g); RO(-34,-16,68,18,CREAM); label('PASSWORD?',0,-12,'#5a3a8a',1); gfx.restore(); } } };

// ---------- Tea Party with Lamby (A6): Backup Lamby holds the teapot ----------
const teapot=(x,y,s,tilt)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(tilt); gfx.scale(s,s);
  if(PROPART.draw('rose/white_teapot',-1,-3,{w:32})) { gfx.restore(); return; }
  EO(0,0,8,6.5,'#ffffff'); E(-2,-2,3,2,'#ffd6e4'); RO(-3,-9,6,3,'#ffffff'); E(0,-10,1.6,1.6,'#ff7fb3');
  gfx.beginPath(); gfx.moveTo(-7,1); gfx.lineTo(-14,-5); gfx.lineWidth=5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.lineWidth=3; gfx.strokeStyle='#ffffff'; gfx.stroke();
  gfx.beginPath(); gfx.arc(9,-1,4,-1.4,1.4); gfx.lineWidth=4.5; gfx.strokeStyle=OUT; gfx.stroke(); gfx.lineWidth=2.5; gfx.strokeStyle='#ffffff'; gfx.stroke(); gfx.restore(); };
{ const lam=SC.r5_lamby; SC.r5_lamby=(s,u)=>{ lam(s,u); const P=s.plan,ms=s.t*1000; if(!(ms>=P.seat+300&&ms<=P.pick+80)) return;
    const pour=ms>P.clap-400&&ms<P.clap; gfx.globalAlpha=1; teapot(P.lx-66+20,P.ly-2,1,pour?-.6:-.15);
    if(pour) { gfx.globalAlpha=.8; for(let k=0;k<3;k++) E(P.lx-66+7-k*2,P.ly-2+k*4+((ms/60)%4),1.4,2,'#c98a5a'); gfx.globalAlpha=1; } }; }
})();

// ================= Tom's third Rose review (2026-10-26, round 3) =================
// Floor Is Lava: Rose stands on a real couch seat cushion (puffy top, piped front band, a dent under her feet) that
// floats in a lava pool, and the lava runs from her cushion to the monsters. Pillow Fort: the walls are puffy couch
// back cushions (bulging sides, piping, tufted buttons, shading) with throw pillows on top, not blocks. Prefix rh_.
(function(){
const SC=RFX.SC,ST=RFX.ST,Rm=RECRUIT_MOVES.rose;
const E=(x,y,rx,ry,c)=>ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),c);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ez=u=>{ u=cl(u); return u*u*(3-2*u); };
const fade=(u,a=.85)=>u>a?(1-u)/(1-a):1;
const SOFA='#cdb085',SOFAD='#a2825a',SOFAL='#ead9bb',SOFAX='#7c5e3c',PIPE='#f6eedf';
const LAVA='#ff5a1a',LAVA2='#ffb02a',CRUST='#7a1a0a';
// Puffy cushion outline centred on 0,0: rounded corners, every side bulging out by b.
const puff=(w,h,b,c=Math.min(w,h)*.28)=>{ const x0=-w/2,x1=w/2,y0=-h/2,y1=h/2; gfx.beginPath(); gfx.moveTo(x0+c,y0);
  gfx.quadraticCurveTo(0,y0-b,x1-c,y0); gfx.quadraticCurveTo(x1,y0,x1,y0+c); gfx.quadraticCurveTo(x1+b,0,x1,y1-c); gfx.quadraticCurveTo(x1,y1,x1-c,y1);
  gfx.quadraticCurveTo(0,y1+b,x0+c,y1); gfx.quadraticCurveTo(x0,y1,x0,y1-c); gfx.quadraticCurveTo(x0-b,0,x0,y0+c); gfx.quadraticCurveTo(x0,y0,x0+c,y0); gfx.closePath(); };
const tuft=(x,y,r=2.2,c=SOFAX)=>{ gfx.strokeStyle=c; gfx.lineWidth=1; gfx.globalAlpha*=.8; gfx.beginPath();
  for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { gfx.moveTo(x+a*r*.9,y+b*r*.9); gfx.lineTo(x+a*r*2.6,y+b*r*2.2); } gfx.stroke(); gfx.globalAlpha/=.8; E(x,y,r,r,c); E(x-.6,y-.6,r*.45,r*.45,SOFAL); };
// An upright couch back cushion (or any cushion): fabric shading, piping seam, creases at the corners, tufted buttons.
const backCush=(x,y,w,h,rot=0,sq=1,col)=>{ const [c0,c1,c2]=col||[SOFAL,SOFA,SOFAD]; const b=Math.min(w,h)*.14;
  gfx.save(); gfx.translate(x,y); gfx.rotate(rot); gfx.scale(1,sq);
  puff(w,h,b); gfx.lineJoin='round'; gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  const g=gfx.createLinearGradient(-w/2,-h/2,w/2,h/2); g.addColorStop(0,c0); g.addColorStop(.45,c1); g.addColorStop(1,c2); gfx.fillStyle=g; gfx.fill();
  gfx.save(); puff(w,h,b); gfx.clip(); gfx.globalAlpha*=.16; E(-w*.18,-h*.22,w*.3,h*.22,'#ffffff'); gfx.globalAlpha/=.16; gfx.restore();
  gfx.save(); gfx.scale((w-6)/w,(h-6)/h); puff(w,h,b); gfx.restore(); gfx.lineWidth=1.2; gfx.strokeStyle=PIPE; gfx.globalAlpha*=.75; gfx.stroke(); gfx.globalAlpha/=.75;
  gfx.strokeStyle=c2; gfx.lineWidth=1; gfx.beginPath(); const cx=w/2-4,cy=h/2-4;
  for(const [a,bb] of [[-1,-1],[1,-1],[-1,1],[1,1]]) { gfx.moveTo(a*cx,bb*cy); gfx.quadraticCurveTo(a*cx*.8,bb*cy*.7,a*cx*.62,bb*cy*.78); } gfx.stroke();
  const nt=h>w*1.5?2:1; for(let i=0;i<nt;i++) tuft(0,nt===1?0:(i?h*.2:-h*.2));
  gfx.restore(); };
// A throw pillow: square-ish with the four corner ears poking out, piped edge, one button.
const throwPillow=(x,y,s,rot,c0,c1,c2)=>{ gfx.save(); gfx.translate(x,y); gfx.rotate(rot);
  gfx.beginPath(); const k=s/2,p=s*.62; gfx.moveTo(-p,-p); gfx.quadraticCurveTo(0,-k*.6,p,-p); gfx.quadraticCurveTo(k*.6,0,p,p); gfx.quadraticCurveTo(0,k*.6,-p,p); gfx.quadraticCurveTo(-k*.6,0,-p,-p); gfx.closePath();
  gfx.lineJoin='round'; gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); const g=gfx.createLinearGradient(-k,-k,k,k); g.addColorStop(0,c0); g.addColorStop(.5,c1); g.addColorStop(1,c2); gfx.fillStyle=g; gfx.fill();
  tuft(0,0,1.8,c2); gfx.restore(); };

// ---------- Floor Is Lava!: a real couch seat cushion floating on lava ----------
// Drawn in the back layer, so Rose stands ON it. y is the floor spot under her (her feet are at y-9).
const seatCush=(x,y,ms,lit)=>{ const bob=Math.sin(ms/260)*1.2,w=64; y+=bob;
  if(PROPART.draw('rose/couch_cushion',x,y-6,{w:68,h:38})) return;   // painted couch cushion
  // front band (the cushion's thickness) with piping top and bottom
  gfx.save(); gfx.lineJoin='round';
  const bt=y-9,bb=y+5; gfx.beginPath(); gfx.moveTo(x-w/2,bt); gfx.lineTo(x+w/2,bt); gfx.quadraticCurveTo(x+w/2+3,(bt+bb)/2,x+w/2-2,bb); gfx.quadraticCurveTo(x,bb+3,x-w/2+2,bb); gfx.quadraticCurveTo(x-w/2-3,(bt+bb)/2,x-w/2,bt); gfx.closePath();
  gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke(); const g=gfx.createLinearGradient(0,bt,0,bb); g.addColorStop(0,SOFA); g.addColorStop(1,SOFAX); gfx.fillStyle=g; gfx.fill();
  if(lit>0) { gfx.save(); gfx.clip(); gfx.globalAlpha=.45*lit; const o=gfx.createLinearGradient(0,bt,0,bb+2); o.addColorStop(0,'rgba(255,120,40,0)'); o.addColorStop(1,'#ff7a2a'); gfx.fillStyle=o; gfx.fillRect(x-w/2-4,bt,w+8,bb-bt+4); gfx.restore(); gfx.globalAlpha=1; }
  gfx.strokeStyle=PIPE; gfx.lineWidth=1.3; gfx.beginPath(); gfx.moveTo(x-w/2+2,bt+1.5); gfx.lineTo(x+w/2-2,bt+1.5); gfx.moveTo(x-w/2+4,bb-1.5); gfx.quadraticCurveTo(x,bb+1.5,x+w/2-4,bb-1.5); gfx.stroke();
  gfx.strokeStyle=SOFAD; gfx.lineWidth=1; gfx.beginPath(); gfx.moveTo(x-12,bt+4); gfx.quadraticCurveTo(x-10,bt+7,x-13,bb-2); gfx.moveTo(x+15,bt+4); gfx.quadraticCurveTo(x+17,bt+7,x+14,bb-2); gfx.stroke();
  // top face: puffy, seen from above at an angle
  gfx.save(); gfx.translate(x,y-15); puff(w,14,3,6); gfx.lineWidth=3; gfx.strokeStyle=OUT; gfx.stroke();
  const t=gfx.createLinearGradient(-w/2,-7,w/2,7); t.addColorStop(0,SOFAL); t.addColorStop(.5,SOFA); t.addColorStop(1,SOFAD); gfx.fillStyle=t; gfx.fill();
  gfx.save(); gfx.scale((w-6)/w,8/14); puff(w,14,3,6); gfx.restore(); gfx.strokeStyle=PIPE; gfx.lineWidth=1.2; gfx.globalAlpha=.7; gfx.stroke(); gfx.globalAlpha=1;
  // the dent under Rose's feet, with creases running out from it
  gfx.globalAlpha=.55; E(0,5,12,3.2,SOFAX); gfx.globalAlpha=1; gfx.strokeStyle=SOFAD; gfx.lineWidth=1; gfx.beginPath();
  for(const [a,b,c,d] of [[-13,4,-24,1],[13,4,24,1],[-10,2,-17,-3],[10,2,17,-3]]) { gfx.moveTo(a,b); gfx.lineTo(c,d); } gfx.stroke();
  tuft(-21,-1,1.8); tuft(21,-1,1.8); gfx.restore(); gfx.restore(); };
// Lava pool: a blobby molten sheet from the cushion over to the monsters' feet, bubbling, with a dark crust edge.
const lavaSheet=(P,g,ms)=>{ const pts=[],N=26,cx=(P.xa+P.xb)/2,cy=(P.ya+P.yb)/2,rx=(P.xb-P.xa)/2*g,ry=(P.yb-P.ya)/2*g;
  if(g>.02&&PROPART.draw('rose/lava_pool',cx,cy,{w:rx*2.08,h:ry*2.08,rot:Math.sin(ms/900)*.01})) return;   // painted lava pool
  for(let i=0;i<N;i++) { const a=i/N*Math.PI*2,w=1+.06*Math.sin(a*5+ms/400)+.04*Math.sin(a*3-ms/300); pts.push([cx+Math.cos(a)*rx*w,cy+Math.sin(a)*ry*w]); }
  const path=k=>{ gfx.beginPath(); pts.forEach(([px,py],i)=>{ const qx=cx+(px-cx)*k,qy=cy+(py-cy)*k; i?gfx.lineTo(qx,qy):gfx.moveTo(qx,qy); }); gfx.closePath(); };
  gfx.lineJoin='round'; path(1.04); gfx.fillStyle=CRUST; gfx.fill(); path(1); const gr=gfx.createRadialGradient(cx,cy,2,cx,cy,Math.max(rx,ry)); gr.addColorStop(0,LAVA2); gr.addColorStop(.6,LAVA); gr.addColorStop(1,'#d8360e'); gfx.fillStyle=gr; gfx.fill();
  gfx.save(); path(1); gfx.clip();
  gfx.strokeStyle='#ffe07a'; gfx.lineWidth=1.5; gfx.globalAlpha=.7; gfx.beginPath();          // glowing cracks drifting slowly
  for(let k=0;k<7;k++) { const yy=P.ya+(P.yb-P.ya)*((k+.5)/7),off=(ms/40+k*37)%60; for(let xx=P.xa-60+off;xx<P.xb;xx+=60) { gfx.moveTo(xx,yy); gfx.lineTo(xx+12,yy+2); gfx.lineTo(xx+22,yy-1); } } gfx.stroke();
  for(let k=0;k<14;k++) { const q=((ms/700)+k*.137)%1,bx=P.xa+((k*53)%100)/100*(P.xb-P.xa),by=P.ya+((k*31)%100)/100*(P.yb-P.ya);   // bubbles
    gfx.globalAlpha=(1-q)*.9; E(bx,by-q*3,1.5+q*3,1+q*2,q<.8?LAVA2:'#fff0b0'); }
  gfx.restore(); gfx.globalAlpha=1; };
SC.rh_lava=(s,u)=>{ const ms=s.t*1000,P=s.P; gfx.globalAlpha=1;
  const grow=ez((ms-250)/450),drain=ms>s.drainAt?ez((ms-s.drainAt)/450):0,g=grow*(1-drain);
  if(g>0) lavaSheet(P,g,ms);
  const drop=ez(ms/180),land=ms-180,sq=land>0&&land<160?1-Math.sin(land/160*Math.PI)*.1:1;
  gfx.save(); gfx.globalAlpha=fade(u,.94); gfx.translate(P.cx,P.cy); gfx.scale(1,sq); gfx.translate(-P.cx,-P.cy);
  seatCush(P.cx,lerp(P.cy-120,P.cy,drop),ms,g); gfx.restore();
  if(g>0) { gfx.globalAlpha=.5*g; E(P.cx,P.cy+7,36,4,CRUST); gfx.globalAlpha=1; } };   // the cushion's shadow on the lava
SC.rv_cush=()=>{};
SC.rv_lava=()=>{};   // the old flat orange ovals; the painted lava pool (rh_lava) replaces them
{ const lava=Rm.floor_is_lava; Rm.floor_is_lava=E2=>{ lava(E2);
    const list=(E2.targets||[]).filter(t=>t.side==='foe'),G=ST.group(list),p={x:Math.min(552,G.x1+46),y:Math.min(314,G.base+6)};
    const tops=list.map(f=>ST.foe(f)),ya=Math.min(...tops.map(F=>F.base))-8,yb=Math.max(p.y+12,...tops.map(F=>F.base+10));
    const P={cx:p.x,cy:p.y,xa:Math.min(...tops.map(F=>F.x-F.w*.5))-24,xb:p.x+48,ya,yb};
    b7Later(()=>RFX.scene('rh_lava',3.05,{P,drainAt:2100,back:true}),1250); }; }

// ---------- Pillow Fort: real couch cushions ----------
// A wall unit of the fort: painted couch cushions stacked straight up (false until the painting has loaded).
const wallStack=(x,y,h,rot,sq)=>{ if(!PROPART.ready('rose/couch_cushion')) return false; const k=Math.max(1,Math.ceil(h/26)),st=h/k;
  gfx.save(); gfx.translate(x,y); gfx.rotate(rot); for(let j=0;j<k;j++) PROPART.draw('rose/couch_cushion',(j%2?2:-2),h/2-st*(j+.5),{w:40,h:31*sq,rot:(j%2?.03:-.03)}); gfx.restore(); return true; };
SC.rv_fort=(s,u)=>{ const ms=s.t*1000,P=s.plan; gfx.globalAlpha=fade(u,.92);
  const base=Math.min(318,Math.max(...P.U.map(q=>q.base))+4),left=Math.min(...P.U.map(q=>q.x-q.w*.5)),right=Math.max(...P.U.map(q=>q.x+q.w*.5));
  const W=27,roofY=Math.max(30,Math.min(...P.U.map(q=>q.top))-16),xl=Math.max(W/2+5,left-W/2-7),xr=Math.min(576-W/2-5,right+W/2+7);
  const H=base-roofY,n=H>210?3:2,hh=H/n;
  const COLS=[[SOFAL,SOFA,SOFAD],['#e2cfae','#c3a478','#957650']];
  for(let i=0;i<n;i++) for(const [side,cx] of [[0,xl],[1,xr]]) { const at=(i*2+side)*110,q=ez((ms-P.fly-at)/300); if(q<=0) continue;
    const cy=base-hh*(i+.5),land=ms-P.fly-at-300,sq=land>0&&land<160?1-Math.sin(land/160*Math.PI)*.1:1,fx=side?cx+150:cx-150;
    { const wx=lerp(fx,cx,q)+(i%2?3:-3)*(side?-1:1),wy=lerp(-40,cy,q)-Math.sin(q*Math.PI)*30,wr=(i%2?.05:-.05)*(side?-1:1)+(1-q)*3;
      if(!wallStack(wx+(side?6:-6),wy,hh+6,wr,sq)) backCush(wx,wy,W,hh+6,wr,sq,COLS[(i+side)%2]); } }
  const dq=ez((ms-P.drape)/350); if(dq>0) { const xa=xl-W/2-8,xb=xr+W/2+8,yt=roofY,yb=lerp(yt-6,yt+4,dq);
    if(PROPART.ready('rose/patchwork_quilt')) { const nq=Math.max(2,Math.ceil((xb-xa)/46));   // painted patchwork quilts laid side by side as the blanket roof
      for(let i=0;i<nq;i++) PROPART.draw('rose/patchwork_quilt',xa+(i+.5)*(xb-xa)/nq,yt-14+(1-dq)*-8-Math.sin((i+.5)/nq*Math.PI)*6*dq,{w:56,h:46,rot:(i%2?.03:-.03)}); }
    else {
    gfx.beginPath(); gfx.moveTo(xa,yb+12); gfx.lineTo(xa+6,yt); gfx.quadraticCurveTo((xa+xb)/2,yt-20*dq,xb-6,yt); gfx.lineTo(xb,yb+12);
    for(let k=10;k>=0;k--) { const xx=xa+(xb-xa)*k/10; gfx.lineTo(xx,yb+(k%2?10:4)-((k>0&&k<10)?8*dq:0)); }
    gfx.closePath(); gfx.lineJoin='round'; gfx.strokeStyle=OUT; gfx.lineWidth=4; gfx.stroke(); gfx.fillStyle='#f3b0c8'; gfx.fill();
    gfx.save(); gfx.clip(); for(let i=0;i<14;i++) for(let j=0;j<3;j++) if((i+j)%2) gfx.fillStyle='#ffd6e4',gfx.fillRect(xa+i*(xb-xa)/14,yt-30+j*14,(xb-xa)/14,14); gfx.restore(); }
    if(ms>P.sign) { const g=ez((ms-P.sign)/200),sxx=(xa+xb)/2,syy=yt-20*dq; const sgnY=syy-23*g; if(!PROPART.draw('rose/password_sign',sxx,sgnY,{w:56*g+.1,h:50*g+.1})) { gfx.fillStyle=OUT; gfx.fillRect(sxx-3,syy-24*g-2,7,24*g+4); gfx.fillStyle='#8a5a30'; gfx.fillRect(sxx-1,syy-24*g,3,24*g);
      gfx.save(); gfx.translate(sxx,syy-24*g); gfx.scale(g,g); gfx.fillStyle=OUT; gfx.fillRect(-36,-18,72,22); gfx.fillStyle=CREAM_; gfx.fillRect(-34,-16,68,18); label('PASSWORD?',0,-12,'#5a3a8a',1); gfx.restore(); } } }
  // throw pillows plopped on the roof's two corners
  for(const [side,cx,c] of [[0,xl,['#ffd6e4','#ff9ec0','#e07098']],[1,xr,['#fff1b8','#ffd75a','#d9a62a']]]) { const at=n*2*110+side*90,q=ez((ms-P.fly-at)/280); if(q<=0) continue;
    throwPillow(lerp(side?cx+120:cx-120,cx,q),lerp(-30,roofY-12,q),22,(side?.25:-.25)+(1-q)*2,...c); }
  };

const CREAM_='#fff8e8';
})();
