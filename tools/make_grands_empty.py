#!/usr/bin/env python3
"""cutpolish4b: the empty baking island after the muffin heist. Cuts the table top (cake stand included, no muffins) out of the approved
Art Library picture art/raw/props/ch1-kitchen-empty-island-v1.png and writes two patches the kitchen draws over its two layers while the flag
'muffins-gone' is set: art/grands-empty.webp (back layer) and art/grands-empty-fg.webp (the part of it that sits in the foreground layer).
Patch box on the 1254 px kitchen picture: PATCH_BOX. Run with /usr/bin/python3 if PIL is broken."""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
S=1254
old=Image.open('art/grands.webp').convert('RGB')
fg=Image.open('art/grands-fg.webp').convert('RGBA')
new=Image.open('art/raw/props/ch1-kitchen-empty-island-v1.png').convert('RGB').resize((S,S),Image.LANCZOS)
# polygon in 2x crop coordinates of the box (150,480): x_img=150+dx/2, y_img=480+dy/2
D=[(143,88),(335,88),(335,150),(578,150),(548,352),(86,352),(86,236),(143,214)]
P=[(150+x/2,480+y/2) for x,y in D]
m=Image.new('L',(S,S),0); ImageDraw.Draw(m).polygon(P,fill=255)
m=m.filter(ImageFilter.GaussianBlur(1.6))
x0,y0,x1,y1=[int(v) for v in (min(p[0] for p in P)-6,min(p[1] for p in P)-6,max(p[0] for p in P)+6,max(p[1] for p in P)+6)]
box=(x0,y0,x1,y1)
patch=new.convert('RGBA'); patch.putalpha(m)
patch.crop(box).save('art/grands-empty.webp',quality=90,method=6)
fa=fg.split()[3].filter(ImageFilter.MaxFilter(9))          # old foreground silhouette, grown 4 px
fp=new.convert('RGBA'); fp.putalpha(ImageChops.multiply(m,fa))
fp.crop(box).save('art/grands-empty-fg.webp',quality=90,method=6)
print('box',box)
