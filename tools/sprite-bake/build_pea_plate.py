#!/usr/bin/env python3
"""Builds art/props/tnb/pea_plate.webp (Foraged at Dawn): the painted tombo/dinner_plate plus a gold rim,
herb-oil swoosh, microgreens, a flower and one glossy pea. Re-run to rebuild. 160 x 120, plate centre at (80, 77)."""
import math, os
from PIL import Image, ImageDraw, ImageFilter
ROOT=os.path.join(os.path.dirname(__file__),'..','..')
S=4; PAD=34
base=Image.open(os.path.join(ROOT,'art/props/tombo/dinner_plate.webp')).convert('RGBA')
W,H=base.width,base.height+PAD
cv=Image.new('RGBA',(W*S,H*S),(0,0,0,0))
big=base.resize((base.width*S,base.height*S),Image.LANCZOS)
cv.paste(big,(0,PAD*S),big)
cx,cy=W*S//2,(PAD+base.height//2)*S
def layer(): return Image.new('RGBA',cv.size,(0,0,0,0))
# gold rim along the plate edge
l=layer(); d=ImageDraw.Draw(l)
d.ellipse((6*S,(PAD+4)*S,(W-6)*S,(PAD+base.height-5)*S),outline=(214,170,70,255),width=int(2.2*S))
d.ellipse((12*S,(PAD+9)*S,(W-12)*S,(PAD+base.height-10)*S),outline=(236,205,120,200),width=int(1.2*S))
cv=Image.alpha_composite(cv,l)
# herb-oil swoosh
l=layer(); d=ImageDraw.Draw(l)
pts=[(cx+(t/40-.5)*100*S, cy+4*S+math.sin(t/40*math.pi)*-6*S) for t in range(41)]
for i,(x,y) in enumerate(pts[:-1]):
    w=int((5-3.5*abs(i/40-.5)*2)*S*.8)+S
    d.line([pts[i],pts[i+1]],fill=(150,205,110,235),width=w)
l=l.filter(ImageFilter.GaussianBlur(S*.5)); cv=Image.alpha_composite(cv,l)
# sauce dots
l=layer(); d=ImageDraw.Draw(l)
for dx,dy,r in [(-44,6,2.2),(-36,9,1.6),(40,7,2.0),(48,4,1.4),(-52,2,1.3)]:
    d.ellipse((cx+dx*S-r*S,cy+dy*S-r*S,cx+dx*S+r*S,cy+dy*S+r*S),fill=(170,215,125,255))
cv=Image.alpha_composite(cv,l)
# microgreen leaves
def leaf(x,y,a,L,col):
    global cv
    l=layer(); d=ImageDraw.Draw(l); pts=[]
    for t in range(0,21):
        u=t/20; px=u*L; py=math.sin(u*math.pi)*L*.28
        pts.append((px,py))
    pts=pts+[(px,-py) for px,py in reversed(pts)]
    ca,sa=math.cos(a),math.sin(a)
    pp=[(x+(px*ca-py*sa)*S,y+(px*sa+py*ca)*S) for px,py in pts]
    d.polygon(pp,fill=col+(255,),outline=(40,100,40,255))
    d.line([(x,y),(x+L*ca*S*.9,y+L*sa*S*.9)],fill=(40,110,50,255),width=max(1,S//2))
    cv=Image.alpha_composite(cv,l)
for dx,dy,a,L,c in [(-26,-4,-.7,12,(90,176,80)),(-24,-3,-2.4,10,(70,150,70)),(26,-2,-.4,11,(90,176,80)),(30,-1,-2.6,9,(110,190,90)),(-8,-9,-1.6,8,(120,200,100))]:
    leaf(cx+dx*S,cy+dy*S,a,L,c)
# flower
l=layer(); d=ImageDraw.Draw(l)
for k in range(5):
    a=k/5*math.tau; px,py=cx+38*S+math.cos(a)*3.6*S, cy-6*S+math.sin(a)*3*S
    d.ellipse((px-2.8*S,py-2.5*S,px+2.8*S,py+2.5*S),fill=(255,150,190,255),outline=(190,80,120,255))
d.ellipse((cx+38*S-2*S,cy-6*S-2*S,cx+38*S+2*S,cy-6*S+2*S),fill=(255,224,120,255))
cv=Image.alpha_composite(cv,l)
# the pea: shadow, sphere with radial shading, highlight
px,py,R=cx,cy-8*S,10*S
l=layer(); d=ImageDraw.Draw(l)
d.ellipse((px-R*.95,py+R*.55,px+R*1.15,py+R*1.05),fill=(30,60,30,110)); l=l.filter(ImageFilter.GaussianBlur(S*1.2)); cv=Image.alpha_composite(cv,l)
sph=layer(); sd=ImageDraw.Draw(sph)
for i in range(40,0,-1):
    u=i/40; r=R*u; ox=-R*.28*(1-u); oy=-R*.3*(1-u)
    g=(int(40+150*(1-u)),int(120+110*(1-u)),int(40+60*(1-u)))
    sd.ellipse((px+ox-r,py+oy-r,px+ox+r,py+oy+r),fill=g+(255,))
mask=Image.new('L',cv.size,0); ImageDraw.Draw(mask).ellipse((px-R,py-R,px+R,py+R),fill=255)
sph.putalpha(mask); cv=Image.alpha_composite(cv,sph)
l=layer(); d=ImageDraw.Draw(l)
d.ellipse((px-R,py-R,px+R,py+R),outline=(30,80,35,255),width=int(1.4*S))
d.ellipse((px-R*.55,py-R*.62,px-R*.05,py-R*.28),fill=(235,255,220,235))
d.ellipse((px+R*.25,py+R*.2,px+R*.6,py+R*.5),fill=(70,160,60,120))
cv=Image.alpha_composite(cv,l)
# gold specks on the pea plate
l=layer(); d=ImageDraw.Draw(l)
for dx,dy in [(-14,-17),(12,-18),(20,-12),(-20,-11)]:
    d.ellipse((cx+dx*S-S,cy+dy*S-S,cx+dx*S+S,cy+dy*S+S),fill=(255,214,80,255))
cv=Image.alpha_composite(cv,l)
out=cv.resize((W,H),Image.LANCZOS)
dst=os.path.join(ROOT,'art/props/tnb/pea_plate.webp'); out.save(dst,'WEBP',quality=92,method=6); print('wrote',dst,out.size)
