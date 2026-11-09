"""NPC hero head enlarger (2026-11-09). Usage from the repo root: python3 tools/art-library/npc_head.py '[["npc-photo-chet-v2.png",205]]' /tmp/sheet.jpg
Each job is [file in art/raw/npcs, chin row in pixels]. Rows above the chin grow about the neck until the head is a quarter of the height (about 4 heads tall, cap 1.75);
hands and props beside the head stay as painted; the picture is refit to its own size. Output goes to OUT (default /tmp/fix/); look at the sheet before installing.
Chin rows used on 11-09: {"chet": 205, "dash": 205, "wes": 215, "ray": 228, "claudia": 200, "luna": 235, "kit": 235, "bean": 255, "sam": 250, "juniper": 240, "toni": 255, "yesenia": 255}"""
import os
OUT=os.environ.get("OUT","/tmp/fix/")
import sys, json, numpy as np, cv2
from PIL import Image
R='art/raw/npcs/'
def run(name,chin,target=.25,kmax=1.75,T=28,hand=None):
    a=cv2.imread(R+name); H,W=a.shape[:2]
    bgc=np.median(np.concatenate([a[:40,:40].reshape(-1,3),a[:40,-40:].reshape(-1,3)]),0)
    diff=np.abs(a.astype(int)-bgc).max(2)>45
    rows=np.where(diff.sum(1)>6)[0]; top=rows.min()
    # feet: last row with a dark wide run (shoes), ignore soft shadow
    dark=(a.max(2)<110); r2=np.where(dark.sum(1)>12)[0]; bot=r2.max()
    share=(chin-top)/(bot-top); k=min(kmax,target*(1-share)/((1-target)*share))
    if k<1.08: print(name,'share %.3f already fine'%share); return Image.fromarray(a[:,:,::-1]),None
    hc=np.where(diff[top:chin].any(0))[0]; 
    sk=np.where(diff[chin-12:chin, :].any(0))[0]
    ax=float(np.median(np.where(diff[chin-6:chin].sum(0)>0)[0])) if hand is None else hand
    P=int((chin-top)*(k-1))+60
    pad=cv2.copyMakeBorder(a,P,0,0,0,cv2.BORDER_REPLICATE); pad[:P]=cv2.GaussianBlur(pad[:P+20],(0,0),25)[:P]
    A=chin+T+P
    d=np.arange(0,A+1,dtype=np.float64); s=np.where(d>=T,k,1+(k-1)*d/T)
    D=np.concatenate([[0],np.cumsum((s[1:]+s[:-1])/2)])
    yo=np.arange(A); Dq=A-yo; dq=np.interp(Dq,D,d); sq=np.interp(dq,d,s)
    mapy=np.tile(np.arange(pad.shape[0],dtype=np.float32)[:,None],(1,W)); mapx=np.tile(np.arange(W,dtype=np.float32)[None],(pad.shape[0],1))
    mapy[:A]=(A-dq)[:,None]; mapx[:A]=ax+(mapx[:A]-ax)/sq[:,None]
    out=cv2.remap(pad,mapx,mapy,cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REPLICATE)
    # keep hands and props beside the head as painted: only the head's own connected shape is enlarged
    dp=(np.abs(pad.astype(int)-bgc).max(2)>28).astype(np.uint8); dp[chin+P:]=0
    n,lab=cv2.connectedComponents(cv2.morphologyEx(dp,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)))
    cand=lab[chin+P-45:chin+P-8,int(ax)-12:int(ax)+12].ravel(); cand=cand[cand>0]
    M=(lab==np.bincount(cand).argmax()).astype(np.uint8) if len(cand) else dp
    M=cv2.dilate(M,np.ones((15,15),np.uint8)).astype(np.float32); hc=np.where(M[chin+P-10:chin+P-2].any(0))[0]; M[chin+P-4:A+2,hc.min():hc.max()+1]=1
    Mw=cv2.remap(M,mapx,mapy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT); Mw[A:]=0
    Mw=cv2.GaussianBlur(Mw,(0,0),2.5)[...,None]
    out=(out*Mw+pad*(1-Mw)).astype(np.uint8)
    # crop unused top, fit back to W x H
    newtop=A-int(np.interp(chin+T-top,d,D)); y0=max(0,newtop-45); crop=out[y0:]
    sc=H/crop.shape[0]; small=cv2.resize(crop,(int(W*sc),H),interpolation=cv2.INTER_AREA)
    bw=W-small.shape[1]; l=bw//2
    fin=cv2.copyMakeBorder(small,0,0,l,bw-l,cv2.BORDER_REPLICATE)
    if l>0:
        bl=cv2.GaussianBlur(fin,(0,0),18); fin[:,:l+6]=bl[:,:l+6]; fin[:,-(bw-l)-6:]=bl[:,-(bw-l)-6:]
    cv2.imwrite(OUT+name,fin)
    print(name,'top',top,'bot',bot,'share %.3f k %.2f'%(share,k))
    return Image.fromarray(a[:,:,::-1]),Image.fromarray(fin[:,:,::-1])
if __name__=='__main__':
    jobs=json.loads(sys.argv[1]); cells=[]
    for j in jobs:
        o,n=run(*j); cells+=[o]+([n] if n else [])
    sh=Image.new('RGB',(416*min(len(cells),6),624*((len(cells)+5)//6)),'white')
    for i,c in enumerate(cells): sh.paste(c.resize((416,624)),((i%6)*416,(i//6)*624))
    sh.save(sys.argv[2],quality=88)
