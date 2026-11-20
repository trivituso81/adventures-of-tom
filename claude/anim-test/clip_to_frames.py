import sys, os, glob, subprocess, io
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
clip, name, H = sys.argv[1], sys.argv[2], int(sys.argv[3])
d=f'/home/claude/pipe/{name}'; os.makedirs(d,exist_ok=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',clip,f'{d}/r%03d.png'],check=True)
fs=sorted(glob.glob(f'{d}/r*.png'))
keyed=[]
for f in fs:
    a=np.asarray(Image.open(f).convert('RGB')).astype(float)
    bg=np.median(a[:40,:40].reshape(-1,3),0)
    dd=np.sqrt(((a-bg)**2).sum(2))
    al=ndi.gaussian_filter(np.clip((dd-60)/60,0,1),0.6)
    rgb=a.copy()
    sp=np.clip(np.minimum(rgb[...,0],rgb[...,2])-rgb[...,1]-40,0,None)*(al<0.98)
    rgb[...,0]-=sp*0.8; rgb[...,2]-=sp*0.8
    keyed.append(np.dstack([np.clip(rgb,0,255),al*255]).astype('uint8'))
# fixed crop box for the whole clip (union), so the character does not jitter
u=np.zeros(keyed[0].shape[:2],bool)
for k in keyed: u|=k[...,3]>25
ys,xs=np.where(u); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
bw,bh=x1-x0,y1-y0; W=int(round(bw*H/bh))
print(name,'crop',bw,bh,'->',W,H, 'frames',len(keyed))
out=[]
for k in keyed:
    im=Image.fromarray(k[y0:y1,x0:x1],'RGBA').resize((W,H),Image.LANCZOS)
    out.append(im)
import pickle
pickle.dump((W,H,[i.tobytes() for i in out],(y1-y0,x0,x1,y0,y1)),open(f'{d}/frames.pkl','wb'))
for step,label in [(1,"30fps"),(2,"15fps")]:
    tot=0
    for i in out[::step]:
        b=io.BytesIO(); i.save(b,'WEBP',quality=80,method=4); tot+=b.tell()
    print(label,'all frames kb',round(tot/1024))
