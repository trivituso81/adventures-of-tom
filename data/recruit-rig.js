'use strict';
// data/recruit-rig.js — Builds the battle sprites for Amy, Deedee, Boppy and TNB.
// Three-quarter figures facing left, like Tom, Grace and Rose: the head is rotated as a cylinder (front overworld frame for
// the face, side frame for the ear and back of the head), the body is turned with a per-row remap, and both arms are redrawn
// with two-bone IK (far arm darker and tucked behind the body when standing). Poses crouch or stretch the legs and lean the body.
// Output: RECRUIT_BT[id] = {frames:{pose:rows}, pal, eye:{pose:{col,row}}, hand:{pose:{n,f}}, skin, w, h}.
const RECRUIT_BT={};
(function(){
const PADL=14,PADT=12,PADR=10;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

// ---------- Mask helpers ----------
function newMask(w,h){ const m=[]; for(let y=0;y<h;y++) m.push(new Array(w).fill(false)); return m; }
function setM(m,x,y){ if(y>=0&&y<m.length&&x>=0&&x<m[0].length) m[y][x]=true; }
function disc(m,cx,cy,r){ for(let y=Math.floor(cy-r-1);y<=Math.ceil(cy+r+1);y++) for(let x=Math.floor(cx-r-1);x<=Math.ceil(cx+r+1);x++) { const dx=x-cx,dy=y-cy; if(dx*dx+dy*dy<=r*r+.3) setM(m,x,y); } }
function seg(m,x0,y0,x1,y1,r0,r1) {
  if(r1===undefined) r1=r0;
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;
  for(let i=0;i<=n;i++) { const t=i/n; disc(m,lerp(x0,x1,t),lerp(y0,y1,t),lerp(r0,r1,t)); }
}
function rect(m,x0,y0,x1,y1) { for(let y=Math.round(y0);y<Math.round(y1);y++) for(let x=Math.round(x0);x<Math.round(x1);x++) setM(m,x,y); }
function poly(m,pts) {
  const ys=pts.map(p=>p[1]),y0=Math.floor(Math.min(...ys)),y1=Math.ceil(Math.max(...ys));
  for(let y=y0;y<=y1;y++) {
    const yc=y+.5,xs=[];
    for(let i=0;i<pts.length;i++) {
      const a=pts[i],b=pts[(i+1)%pts.length];
      if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc)) xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));
    }
    xs.sort((p,q)=>p-q);
    for(let k=0;k+1<xs.length;k+=2) for(let x=Math.round(xs[k]);x<Math.round(xs[k+1]);x++) setM(m,x,y);
  }
}
function softCorners(m,top=true,bottom=true) {
  const h=m.length,w=m[0].length,kill=[];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(m[y][x]) {
    const L=x>0&&m[y][x-1],R=x<w-1&&m[y][x+1],T=y>0&&m[y-1][x],B=y<h-1&&m[y+1][x];
    if(top&&!T&&((!L&&R)||(!R&&L))) kill.push([x,y]);
    if(bottom&&!B&&((!L&&R)||(!R&&L))) kill.push([x,y]);
  }
  for(const [x,y] of kill) m[y][x]=false;
}

// ---------- Painter ----------
function paint(g,m,c,opt={}) {
  const h=m.length,w=m[0].length,at=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&m[y][x];
  if(!opt.noOutline) for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(!m[y][x]&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))) g[y][x]=c.o;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(m[y][x]) {
    const L=!at(x-1,y),R=!at(x+1,y),T=!at(x,y-1),B=!at(x,y+1);
    let ch=c.b;
    if((L||T)&&!(R||B)) ch=c.l; else if((R||B)&&!(L||T)) ch=c.d;
    if(opt.flat) ch=c.b;
    g[y][x]=ch;
  }
}
function dot(g,x,y,ch) { x=Math.round(x); y=Math.round(y); if(y>=0&&y<g.length&&x>=0&&x<g[0].length) g[y][x]=ch; }
function hline(g,x0,x1,y,ch) { for(let x=Math.round(x0);x<=Math.round(x1);x++) dot(g,x,y,ch); }
function line(g,x0,y0,x1,y1,ch) { const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1; for(let i=0;i<=n;i++) dot(g,lerp(x0,x1,i/n),lerp(y0,y1,i/n),ch); }

// Two-bone IK. bend picks which way the middle joint points.
function ik(sx,sy,tx,ty,a,b,bend) {
  let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);
  const maxd=a+b-.05;
  if(d>maxd) { tx=sx+dx/d*maxd; ty=sy+dy/d*maxd; dx=tx-sx; dy=ty-sy; d=maxd; }
  d=Math.max(d,Math.abs(a-b)+.3);
  const ca=clamp((a*a+d*d-b*b)/(2*a*d),-1,1),ang=Math.acos(ca),base=Math.atan2(dy,dx),k=base+bend*ang;
  return {ex:sx+Math.cos(k)*a,ey:sy+Math.sin(k)*a,tx,ty};
}

// ---------- Characters ----------
// hEnd: last head row. fc/fw: face centre column and half width for the turn. shL/shR: shoulder points. boxL/boxR: [x0,x1,y0,y1] cleared when the arms are redrawn.
// hang: resting hand tips. legCut: a plain row of the legs that is repeated or dropped to crouch or stretch. cuts: row ranges removed for the kneel. hip: row where leaning stops.
const SPECS={
  amy:{src:()=>AMY_OW,hEnd:24,fc:15,fw:6,s:3,eye:[9,16],shL:[7,32],shR:[23,32],boxL:[3,8,32,42],boxR:[21,27,32,42],hang:{n:[5,40],f:[24,40]},legCut:46,cuts:[[44,50],[36,39]],hip:43,back:[1,24],eyes:[[15,7,'bbbkb'],[16,7,'bhbkb'],[15,16,'bbbkb'],[16,16,'bbbkh']],hair:['#322016','#57341c','#7a4728'],
    skin:{b:'#f7a469',l:'#f6bc8c',d:'#df8c57'},o:'#040506',armR:1.9,A:5,B:5.5},
  deedee:{src:()=>DEEDEE_OW,hEnd:24,fc:13,fw:6,s:3,eye:[8,15],shL:[7,28],shR:[19,28],boxL:[1,7,27,40],boxR:[19,25,27,40],hang:{n:[4,39],f:[21,39]},legCut:42,cuts:[[44,47],[34,36]],hip:40,back:[1,21],eyes:[[16,6,'bbblb'],[17,6,'jjblb'],[16,16,'bbbll']],hair:['#ab7a47','#885f38','#634226','#ca9764','#452e1b'],
    skin:{b:'#fcaf7e',l:'#fdbd92',d:'#e88c5d'},o:'#040404',armR:2.0,A:6,B:6.5},
  boppy:{src:()=>BOPPY_OW,hEnd:25,fc:14,fw:6,s:2,eye:[10,16],shL:[6,28],shR:[23,28],boxL:[0,6,27,40],boxR:[23,29,27,40],hang:{n:[3,38],f:[26,38]},legCut:42,cuts:[[41,44],[34,36]],hip:38,back:[1,19],eyes:[[16,9,'bbqj'],[17,9,'bcqj']],backFrac:.14,hair:['#525053','#68676c','#9c9b9d','#b9b8b8','#d2d1d1','#eee8e4'],
    skin:{b:'#f2a678',l:'#f6c098',d:'#dd8d65'},o:'#050506',armR:2.0,A:6,B:6.5,sleeve:{b:'#5383a6',l:'#6fa1c6',d:'#3a5c74'}},
  tnb:{src:()=>TNB_OW,hEnd:24,fc:15,fw:6,s:2,eye:[11,15],shL:[7,28],shR:[24,28],boxL:[0,7,27,42],boxR:[24,30,27,42],hang:{n:[3,39],f:[28,39]},legCut:43,cuts:[[42,45],[33,36]],hip:38,back:[1,17],eyes:[[15,10,'aama'],[16,10,'iaqc'],[15,18,'naop'],[16,18,'rcr']],hair:['#795338','#9c714b','#3f2c21'],
    skin:{b:'#f7ad7c',l:'#fdceb3',d:'#d39368'},o:'#050504',armR:2.2,A:6,B:6.5,sleeve:{b:'#7b8087',l:'#9aa1a9',d:'#555b63'}}
};

// ---------- Poses ----------
// dy: crouch (+) or stretch (-) by repeating or dropping leg rows. lean: forward tilt (negative leans toward the Grump).
// nh/fh: hand targets from the near (left) and far (right) shoulder. keep: keep the overworld arms. body: which overworld frame supplies the body.
const POSES={
  idle:{back:1,nh:[-1,14],fh:[1,14]},
  idle2:{back:1,dy:1,nh:[-.5,14],fh:[1.5,14]},
  run1:{back:1,body:1,lean:-2,nh:[-6,9],fh:[5,9.5]},
  run2:{back:1,body:2,lean:-2,nh:[3,10],fh:[-5,9]},
  act:{dy:1,lean:-5,nh:[-15,1],fh:[5,6]},
  wind:{dy:1,lean:3,nh:[8,-4],fh:[-6,4]},
  throw:{dy:1,lean:-4,nh:[-12,-6],fh:[5,6]},
  celeb:{dy:-1,nh:[-13,-9],fh:[9,-12]},
  celeb2:{dy:-2,lean:1,nh:[-12,-3],fh:[10,-3]},
  aim:{dy:1,lean:-3,nh:[-11,4],fh:[-8,4]},
  spread:{nh:[-14,0],fh:[14,0]},
  clap:{lean:-1,nh:[-8,3],fh:[-8,3]},
  hip:{nh:[3,8],fh:[-3,8]},
  kneel:{kneel:1,lean:-2,nh:[-5,8],fh:[4,7]},
  sit:{kneel:1,lean:1,hd:1,nh:[4,7],fh:[6,3]}
};

// Three-quarter turn. A few columns are dropped from the far (left) cheek, between the head's outer edge and the far eye,
// the same columns on every row so features stay aligned; eyes, nose and mouth are kept pixel for pixel, so the face
// slides left. On rows with hair at the back, the freed width on the right is filled with back-of-head hair from the
// side frame; on the other rows (jaw, chin) the row simply ends sooner, which narrows the back of the jaw.
const BACK=.24,BODY_G=.62;
const spanOf=row=>{ let L=-1,R=-1; for(let k=0;k<row.length;k++) if(row[k]!=='.') { if(L<0) L=k; R=k; } return [L,R]; };
function turnHead(rows,side,hEnd,dTop,hairKeys,spec,OUT) {
  const out=[],map=[],ends=[];
  // pick the dropped columns from the band between the outer edge and the far eye
  let headL=99,headR=-1; for(let r=spec.eye[1]-3;r<=spec.eye[1]+3;r++) { const [L,R]=spanOf(rows[r]); if(L>=0) { headL=Math.min(headL,L); headR=Math.max(headR,R); } }
  const band=[]; for(let x=headL+1;x<=spec.eye[0]-3;x++) band.push(x);
  const want=Math.min(band.length,Math.round((headR-headL)*(spec.backFrac||BACK))),drop=new Set();
  for(let i=0;i<want;i++) drop.add(band[Math.floor((i+.5)*band.length/want)]);
  // the gap between the eyes also narrows in a three-quarter view: drop one column from its middle
  const gL=spec.eye[0]+3,gR=spec.fc-1; if(gR-gL>=2) drop.add(Math.round((gL+gR)/2));
  for(let r=0;r<=hEnd;r++) {
    const row=rows[r],W=row.length,nr=new Array(W).fill('.'),mp=new Array(W).fill(-1);
    const [Lx,Rx]=spanOf(row);
    if(Lx<0) { out.push(nr); map.push(mp); continue; }
    const keep=[]; for(let x=Lx+1;x<Rx;x++) if(!drop.has(x)) keep.push(x);
    const k=(Rx-Lx-1)-keep.length;
    nr[Lx]=row[Lx]; mp[Lx]=Lx;
    keep.forEach((sx,i)=>{ nr[Lx+1+i]=row[sx]; mp[Lx+1+i]=sx; });
    // back-of-head strip from the side frame (hair colours only)
    const srow=side[clamp(r+dTop,0,side.length-1)],[Ls,Rs]=spanOf(srow),strip=[];
    if(k>0&&Ls>=0&&r>=spec.back[0]&&r<=spec.back[1]) for(let x=Ls+Math.round((Rs-Ls)*.62);x<Rs;x++) if(hairKeys.has(srow[x])) strip.push(srow[x]);
    let end=Lx+1+keep.length;
    if(strip.length) { for(let i=0;i<k;i++) nr[end+i]=strip[Math.min(strip.length-1,Math.floor(i*strip.length/k))]; end+=k; }
    nr[end]=row[Rx]; mp[end]=Rx;
    // where this row ends short of the row above (hair strip stops at the jaw), close the outline with a ledge
    const prev=ends.length?ends[ends.length-1]:-1;
    if(prev>end+1) for(let x=end+1;x<prev;x++) nr[x]=OUT;
    out.push(nr); map.push(mp); ends.push(end);
  }
  return {rows:out,map};
}
// Body: monotone remap per row. Output position p' samples source position p'^BODY_G.
function turnRow(row) {
  const [Lx,Rx]=spanOf(row); if(Lx<0||Rx-Lx<3) return row;
  const nr=row.slice(),w=Rx-Lx;
  for(let u=Lx+1;u<Rx;u++) { const sx=clamp(Math.round(Lx+Math.pow((u-Lx)/w,BODY_G)*w),Lx+1,Rx-1); nr[u]=row[sx]; }
  return nr;
}
const turnFwd=(x,row)=>{ const [Lx,Rx]=spanOf(row); if(Lx<0||Rx-Lx<3) return x; const w=Rx-Lx; return Lx+Math.pow(clamp((x-Lx)/w,0,1),1/BODY_G)*w; };

function buildOne(id,spec) {
  const src=spec.src(),srcH=src.down[0].length,srcW=src.down[0][0].length;
  const W=srcW+PADL+PADR,H=srcH+PADT;
  const pal=Object.assign({},src.pal);
  const used=new Set(Object.keys(pal)),pool='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').filter(c=>!used.has(c)),rev={};
  for(const k in pal) rev[pal[k].toLowerCase()]=k;
  const L=hex=>{ hex=hex.toLowerCase(); if(rev[hex]) return rev[hex]; const k=pool.shift(); pal[k]=hex; rev[hex]=k; return k; };
  const col=c=>({b:L(c.b),l:L(c.l),d:L(c.d)});
  const skin=col(spec.skin),sleeve=spec.sleeve?col(spec.sleeve):null,OUT=L(spec.o);
  skin.o=OUT; if(sleeve) sleeve.o=OUT;
  const sideRows=src.side[0].map(r=>r.split('').reverse().join(''));
  // Repaint the eyes on a private copy so the gaze points left (pupil left, white right), as in the side frame.
  const front=src.down[0].slice();
  for(const [r,c0,px] of spec.eyes||[]) { const a=front[r].split(''); for(let i=0;i<px.length;i++) a[c0+i]=px[i]; front[r]=a.join(''); }
  const topOf=rows=>rows.findIndex(r=>/[^.]/.test(r));
  const hairKeys=new Set(Object.keys(src.pal).filter(k=>spec.hair.includes(src.pal[k].toLowerCase())));
  const wh=turnHead(front,sideRows,spec.hEnd,topOf(sideRows)-topOf(src.down[0]),hairKeys,spec,OUT);
  // Arm-free body rows of the front frame, used to map shoulder and hand points through the body turn.
  const clearArms=rows=>{
    for(const b of [spec.boxL,spec.boxR]) {
      for(let y=b[2];y<=b[3];y++) for(let x=b[0];x<=b[1];x++) rows[y][x]='.';
      for(let y=b[2]-1;y<=b[3]+1;y++) for(let x=b[0]-1;x<=b[1]+1;x++) {
        if(y<0||y>=srcH||x<0||x>=srcW||rows[y][x]!=='.') continue;
        const nb=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>{ const yy=y+dy,xx=x+dx; return yy>=0&&yy<srcH&&xx>=0&&xx<srcW&&rows[yy][xx]!=='.'&&rows[yy][xx]!==OUT; });
        if(nb) rows[y][x]=OUT;
      }
    }
    return rows;
  };
  const ref=clearArms(src.down[0].map(r=>r.split('')));
  const tp=p=>[turnFwd(p[0],ref[clamp(Math.round(p[1]),0,srcH-1)]),p[1]];
  const shL=tp(spec.shL),shR=tp(spec.shR);
  const eyes={},hands={};
  const m=()=>newMask(W,H);
  function pose(name) {
    const P=POSES[name],g=[];
    for(let y=0;y<H;y++) g.push(new Array(W).fill('.'));
    // 1. rows: warped head, body from the chosen overworld frame
    const bodySrc=src.down[P.body||0];
    let rows=[]; for(let r=0;r<srcH;r++) rows.push(r<=spec.hEnd?wh.rows[r].slice():bodySrc[r].split(''));
    // 2. clear the overworld arms (they are always redrawn) and turn the body
    clearArms(rows);
    for(let r=spec.hEnd+1;r<srcH;r++) rows[r]=turnRow(rows[r]);
    // 3. crouch, stretch or kneel by dropping or repeating rows (all below the shoulders)
    let dy=P.dy||0;
    if(P.kneel) { for(const c of spec.cuts.slice().sort((a,b)=>b[0]-a[0])) rows.splice(c[0],c[1]-c[0]+1); }
    while(dy>0) { rows.splice(spec.legCut,1); dy--; }
    while(dy<0) { rows.splice(spec.legCut,0,rows[spec.legCut].slice()); dy++; }
    const n=rows.length,top=H-n;
    // 4. lean: shear the upper body
    const lean=(P.lean||0)*.5,hip=Math.min(spec.hip,n-1);
    const shiftAt=r=>r<hip?Math.round(lean*(hip-r)/hip)+(r<=spec.hEnd?(P.hd||0):0):0;
    for(let r=0;r<n;r++) {
      const sh=shiftAt(r);
      for(let x=0;x<srcW;x++) { const ch=rows[r][x]; if(ch==='.') continue; const gx=x+PADL+sh,gy=top+r; if(gx>=0&&gx<W&&gy>=0&&gy<H) g[gy][gx]=ch; }
    }
    // 5. arms
    const shP=(s)=>[s[0]+PADL+shiftAt(Math.round(s[1])),s[1]+top];
    // Facing left, the left arm is the far one (drawn first, shaded darker) and the right arm is the near one.
    function arm(far) {
      const s0=shP(far?shL:shR),s=far&&P.back?[s0[0]+1.5,s0[1]]:s0,h=P[far?'nh':'fh'];
      // Elbows point outward and down. When a hand is raised out to its own side, the default bend would fold the
      // elbow up toward the head, so flip it.
      const raisedOut=h[1]<0&&(far?h[0]<0:h[0]>0);
      const tgt=[s[0]+h[0],s[1]+h[1]],r=ik(s[0],s[1],tgt[0],tgt[1],spec.A,spec.B,(far?1:-1)*(raisedOut?-1:1));
      const mk=m(); seg(mk,s[0],s[1],r.ex,r.ey,spec.armR,spec.armR-.1); seg(mk,r.ex,r.ey,r.tx,r.ty,spec.armR-.1,spec.armR-.25); disc(mk,r.tx,r.ty,spec.armR+.2);
      const fc=far?{b:skin.d,l:skin.b,d:skin.d,o:OUT}:skin;
      // In the standing poses the far arm hangs behind the body: paint it on a scratch grid and keep only what shows.
      const behind=far&&P.back,dst=behind?g.map(r=>r.map(()=>'.')):g;
      paint(dst,mk,fc);
      if(sleeve) {
        const ms=m(),t1=.55;
        seg(ms,s[0],s[1],lerp(s[0],r.ex,t1),lerp(s[1],r.ey,t1),spec.armR+.5,spec.armR+.4);
        paint(dst,ms,far?{b:sleeve.d,l:sleeve.b,d:sleeve.d,o:OUT}:sleeve);
      }
      if(behind) for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(dst[y][x]!=='.'&&g[y][x]==='.') g[y][x]=dst[y][x];
      return [r.tx,r.ty];
    }
    const nearT=arm(true),farT=arm(false);
    const er=spec.eye[1],ec=(()=>{ const mp=wh.map[er]; let bu=spec.eye[0],bd=1e9; for(let u=0;u<mp.length;u++) if(mp[u]>=0&&Math.abs(mp[u]-spec.eye[0])<bd) { bd=Math.abs(mp[u]-spec.eye[0]); bu=u; } return bu; })();
    eyes[name]={col:ec+PADL+shiftAt(er),row:er+top};
    hands[name]={n:nearT,f:farT};
    // Drop stray outline pixels left over from removing the overworld arms (outline with no fill beside it).
    for(let pass=0;pass<2;pass++) {
      const kill=[];
      for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(g[y][x]===OUT) {
        let fill=false;
        for(let dy=-1;dy<=1&&!fill;dy++) for(let dx=-1;dx<=1;dx++) { const c=(g[y+dy]||[])[x+dx]; if(c&&c!=='.'&&c!==OUT) { fill=true; break; } }
        if(!fill) kill.push([x,y]);
      }
      for(const [x,y] of kill) g[y][x]='.';
    }
    return g;
  }
  return {pose,W,H,pal,eyes,hands,skin:spec.skin.b};
}

for(const id in SPECS) {
  const b=buildOne(id,SPECS[id]),frames={};
  for(const name in POSES) frames[name]=b.pose(name).map(r=>r.join(''));
  RECRUIT_BT[id]={frames,pal:b.pal,eye:b.eyes,hand:b.hands,skin:b.skin,w:b.W,h:b.H};
}
})();
