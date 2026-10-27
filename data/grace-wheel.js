'use strict';
// data/grace-wheel.js: Grace's cartwheel poses for G.cartwheelShow (engine/grace-moves.js).
// Her own head and torso pixels are kept; arms and legs are redrawn as limbs (two-bone IK, like data/recruit-rig.js).
// Front-facing poses use the celeb frame's head and torso; the kick poses use the idle frame (three-quarter, facing left).
// Every frame is the same square canvas with the hip at its exact centre, so the body rotates about the hip and the
// move can place the hip anywhere. Pose angles follow docs/reference/cartwheel-preview.html: 0 is straight down,
// negative points left (toward the monsters), 180 is straight up.
// Output: GRACE_WHEEL = {N, C, scale, frame(name), pose(name), tips(pose,th), low(pose,th), mix(a,b,t), P}.
const GRACE_WHEEL=(function(){
const N=65,C=32.5,D=Math.PI/180;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const B=GRACE_BT,pal=B.pal;
// Extra shades (added once to Grace's palette).
pal.A='#ffd0ad'; pal.B='#47526a';
const SKIN={b:'t',l:'A',d:'q',o:'a'},LEGC={b:'g',l:'B',d:'d',o:'a'},SHOE={b:'u',l:'z',d:'r',o:'a'};
const HAIR=new Set('cefhilmp'.split(''));

// ---------- Mask helpers (as in data/recruit-rig.js) ----------
const newMask=()=>{ const m=[]; for(let y=0;y<N;y++) m.push(new Array(N).fill(false)); return m; };
const setM=(m,x,y)=>{ if(y>=0&&y<N&&x>=0&&x<N) m[y][x]=true; };
function disc(m,cx,cy,r) { for(let y=Math.floor(cy-r-1);y<=Math.ceil(cy+r+1);y++) for(let x=Math.floor(cx-r-1);x<=Math.ceil(cx+r+1);x++) { const dx=x+.5-cx,dy=y+.5-cy; if(dx*dx+dy*dy<=r*r+.15) setM(m,x,y); } }
function seg(m,x0,y0,x1,y1,r0,r1) { const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1; for(let i=0;i<=n;i++) { const t=i/n; disc(m,lerp(x0,x1,t),lerp(y0,y1,t),lerp(r0,r1,t)); } }
function paint(g,m,c) {
  const at=(x,y)=>x>=0&&y>=0&&x<N&&y<N&&m[y][x];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(!m[y][x]&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))) g[y][x]=c.o;
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(m[y][x]) {
    const L=!at(x-1,y),R=!at(x+1,y),T=!at(x,y-1),Bm=!at(x,y+1);
    let ch=c.b; if((L||T)&&!(R||Bm)) ch=c.l; else if((R||Bm)&&!(L||T)) ch=c.d;
    g[y][x]=ch;
  }
}
function ik(sx,sy,tx,ty,a,b,bend) {
  let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);
  const maxd=a+b-.05;
  if(d>maxd) { tx=sx+dx/d*maxd; ty=sy+dy/d*maxd; dx=tx-sx; dy=ty-sy; d=maxd; }
  d=Math.max(d,Math.abs(a-b)+.3);
  const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),ang=Math.acos(ca),base=Math.atan2(dy,dx),k=base+bend*ang;
  return {ex:sx+Math.cos(k)*a,ey:sy+Math.sin(k)*a,tx,ty};
}

// ---------- Body patches: head and torso only, arms and legs removed ----------
// Celeb (front, arms up): arm pixels by row as [from,to] column ranges, left arm and right arm. Legs start at row 28.
const FRONT_ARMS={4:[[0,7],[25,32]],5:[[0,7],[25,32]],6:[[0,7],[25,32]],7:[[0,7],[25,32]],8:[[0,7],[25,32]],9:[[0,7],[25,32]],10:[[0,7],[25,32]],11:[[0,7],[25,32]],
  12:[[0,8],[25,32]],13:[[0,8],[25,32]],14:[[4,9],[24,32]],15:[[6,10],[24,26]],16:[[7,9],[24,25]],17:[[8,9],[25,25]]};
function patch(src,arms,legRow,ox,oy) {
  const rows=src.map(r=>r.split('')),H=rows.length,W=rows[0].length;
  for(const r in arms) for(const [a,b] of arms[r]) for(let x=a;x<=b;x++) rows[r][x]='.';
  for(let r=legRow;r<H;r++) rows[r].fill('.');
  const g=[]; for(let y=0;y<N;y++) g.push(new Array(N).fill('.'));
  for(let r=0;r<H;r++) for(let x=0;x<W;x++) if(rows[r][x]!=='.') g[r+oy][x+ox]=rows[r][x];
  return g;
}
// Close the outline where limbs were cut away, and drop outline pixels left with nothing beside them.
function reline(g) {
  const fill=(x,y)=>{ const c=(g[y]||[])[x]; return c&&c!=='.'&&c!=='a'; };
  for(let pass=0;pass<2;pass++) { const kill=[];
    for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(g[y][x]==='a') { let f=false; for(let dy=-1;dy<=1&&!f;dy++) for(let dx=-1;dx<=1;dx++) if(fill(x+dx,y+dy)) { f=true; break; } if(!f) kill.push([x,y]); }
    for(const [x,y] of kill) g[y][x]='.'; }
  const add=[]; for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(g[y][x]==='.'&&(fill(x-1,y)||fill(x+1,y)||fill(x,y-1)||fill(x,y+1))) add.push([x,y]);
  for(const [x,y] of add) g[y][x]='a';
  return g;
}
// Source hip centre (16.5, 28.5) in celeb and (16.5, 29.5) in idle: offsets put it on the canvas centre (32.5, 32.5).
const FRONT=reline(patch(B.celeb,FRONT_ARMS,28,16,4));
const SIDE=reline(patch(B.idle,{},29,16,3));
// Joints in canvas coordinates. Shoulders and hips relative to the hip centre C.
const J={front:{shA:[C-6.5,C-11],shB:[C+7,C-11.5],hpA:[C-3.5,C+.5],hpB:[C+4,C+.5],belt:[C-5,C-.5,C+5,C+2]},
         side:{shA:[C-6,C-11],shB:[C+4,C-11],hpA:[C-4,C+.5],hpB:[C+3,C+.5],belt:[C-5.5,C-.5,C+5,C+2]}};
const ARM=12.5,LEG=11.5,TL=11;

// ---------- Poses ----------
// lA/lB: legs (A is screen-left), aA/aB: arms, lean (degrees, applied as the rotation), bend: knee fold 0..1 per leg,
// side: use the three-quarter body (kick); arms:false keeps the idle frame's own arms.
const P={
  stand:{lA:-5,lB:5,aA:-14,aB:14,lean:0},
  lunge:{lA:-34,lB:12,aA:-168,aB:168,lean:-12,bA:.25},
  star:{lA:-42,lB:42,aA:-148,aB:148,lean:0},
  land:{lA:-12,lB:12,aA:-170,aB:170,lean:0},
  chamber:{lA:-60,lB:6,lean:8,bA:.55,side:1},
  kick:{lA:-95,lB:6,lean:16,side:1},
  sstand:{lA:-6,lB:6,lean:0,side:1}};
const mix=(a,b,t)=>{ const o={}; for(const k in a) o[k]=typeof a[k]==='number'?lerp(a[k],b[k]==null?0:b[k],t):a[k]; for(const k in b) if(!(k in o)) o[k]=typeof b[k]==='number'?lerp(0,b[k],t):b[k]; if(t>=.5) o.side=b.side; else o.side=a.side; return o; };
const lv=(a,L)=>[Math.sin(a*D)*L,Math.cos(a*D)*L];
// Limb tips relative to the hip centre (before rotation). Used for the rolling table and for standing heights.
function tipsRel(q) { const j=q.side?J.side:J.front,R=[];
  if(!q.side) { for(const [s,a,cf] of [[j.shA,q.aA,q.cA||0],[j.shB,q.aB,q.cB||0]]) { const v=lv(a,ARM*(q.al||1)*(1-cf*.55)); R.push([s[0]-C+v[0],s[1]-C+v[1]]); } }
  for(const [h,a,b] of [[j.hpA,q.lA,q.bA||0],[j.hpB,q.lB,q.bB||0]]) { const v=lv(a,LEG*(1-b*.35)); R.push([h[0]-C+v[0],h[1]-C+v[1]]); }
  return R; }
const rot=(v,th)=>{ const c=Math.cos(th),s=Math.sin(th); return [v[0]*c-v[1]*s,v[0]*s+v[1]*c]; };
const tips=(q,th)=>tipsRel(q).map(v=>rot(v,th));
const low=(q,th)=>Math.max(...tips(q,th).map(v=>v[1]))+2.2;   // shoe or hand radius plus outline

// Handstand body (q.hang): the long hair down her left side is cut away and the hair hangs from the top of her head
// instead (toward the floor once the body is turned upside down). Built once on first use.
let HANG=null;
function hangBody() { if(HANG) return HANG;
  const rows=B.celeb.map(r=>r.split('')),H=rows.length;
  for(const r in FRONT_ARMS) for(const [a,b] of FRONT_ARMS[r]) for(let x=a;x<=b;x++) rows[r][x]='.';
  for(let r=28;r<H;r++) rows[r].fill('.');
  for(let r=15;r<28;r++) for(let x=0;x<=10;x++) rows[r][x]='.';   // side hair and the hem behind it
  const g=[]; for(let y=0;y<N;y++) g.push(new Array(N).fill('.'));
  for(let r=0;r<H;r++) for(let x=0;x<rows[0].length;x++) if(rows[r][x]!=='.') g[r+4][x+16]=rows[r][x];
  // Hanging hair: strands above the head top (canvas rows 0..4), longer in the middle, two shades.
  const L=[2,3,4,4,4,4,4,4,4,4,4,4,3,2],cols=[];
  for(let x=9;x<=22;x++) cols.push(x);
  cols.forEach((x,i)=>{ const n=L[i]; for(let k=1;k<=n;k++) { const y=4-k+1; if(y<0) continue; g[y][x+16]=(x+k)%3===0?'i':((x+k)%3===1?'h':'f'); } });
  HANG=reline(g); return HANG; }
function build(q) {
  const j=q.side?J.side:J.front,base=q.side?SIDE:(q.hang?hangBody():FRONT);
  const g=[]; for(let y=0;y<N;y++) g.push(new Array(N).fill('.'));
  // Legs behind the body: hips block, then each leg (two-bone, knee bends forward), shoes at the tips.
  const lm=newMask(); const b=j.belt; for(let y=Math.round(b[1]);y<=Math.round(b[3]);y++) for(let x=Math.round(b[0]);x<=Math.round(b[2]);x++) setM(lm,x,y);
  const feet=[];
  for(const [h,a,bd,far] of [[j.hpB,q.lB,q.bB||0,1],[j.hpA,q.lA,q.bA||0,0]]) {
    const v=lv(a,LEG*(1-bd*.35)),t=[h[0]+v[0],h[1]+v[1]],kd=far?(q.kB||0):(q.kA||0),r=ik(h[0],h[1],t[0],t[1],LEG/2,LEG/2,kd||(a<0?1:-1));
    seg(lm,h[0],h[1],r.ex,r.ey,2.0,1.7); seg(lm,r.ex,r.ey,r.tx,r.ty,1.7,1.4); feet.push([r.tx,r.ty,a]);
  }
  paint(g,lm,LEGC);
  const sm=newMask(); for(const [x,y,a] of feet) { const v=lv(a,1); disc(sm,x+v[0]*.6,y+v[1]*.6,2.1); }
  paint(g,sm,SHOE);
  // Body on top (its own outline stays where it sits on the legs).
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(base[y][x]!=='.') g[y][x]=base[y][x];
  // Arms in front (front-facing poses only; the idle frame keeps its own guard arms).
  // Optional per pose: cA/cB fold the elbow (0 straight .. 1 tight), eA/eB flip which way the elbow points, al arm length.
  if(!q.side) for(const [s,a,dir,cf,ef] of [[j.shA,q.aA,1,q.cA||0,q.eA||1],[j.shB,q.aB,-1,q.cB||0,q.eB||1]]) {
    const AL=ARM*(q.al||1),am=newMask(),v=lv(a,AL*(1-cf*.55)),r=ik(s[0],s[1],s[0]+v[0],s[1]+v[1],AL/2,AL/2,dir*ef);
    seg(am,s[0],s[1],r.ex,r.ey,1.7,1.6); seg(am,r.ex,r.ey,r.tx,r.ty,1.6,1.5); disc(am,r.tx,r.ty,1.9);
    paint(g,am,SKIN);
  }
  return g.map(r=>r.join(''));
}
const cache={};
// A frame for a pose (by name, or a pose object with a cache key).
const frame=(q,key)=>{ if(typeof q==='string') { key=q; q=P[q]; } return cache[key]||(cache[key]=build(q)); };
// The same frame mirrored left to right (spins and facing the other way).
const mirror=(q,key)=>{ const f=frame(q,key),k='~'+(typeof q==='string'?q:key); return cache[k]||(cache[k]=f.map(r=>r.split('').reverse().join(''))); };
// Blends are snapped to a few steps so the frames can be cached (pixel art does not tween smoothly anyway).
const blend=(a,b,t,steps=4)=>{ const k=Math.round(clamp(t,0,1)*steps); return {q:mix(P[a],P[b],k/steps),key:a+'>'+b+':'+k}; };
for(const k in P) frame(k);
return {N,C,scale:2,P,frame,mirror,blend,mix,tips,low,rot,TL};
})();
