# Builds art/blvd-fg.webp: the Downtown LA foreground cutouts (foliage by colour, plus hand polygons for tanks, the tower crown and
# planters) with transparency everywhere else. engine/plate.js (PLATE_BEHIND.blvd, fg:true zones) draws it over anyone standing behind.
# Usage: python3 tools/make_blvd_fg.py   (re-run after art/blvd.webp changes; writes tools/shots/blvd-fg-preview.png too)
import os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plate=Image.open(os.path.join(ROOT,'art/blvd.webp')).convert('RGB'); W,H=plate.size
hsv=plate.convert('HSV'); Hh,Ss,Vv=hsv.split()
def green_mask(box):
    # leaf colours: yellow-green to green hue, enough saturation, not black
    h=Hh.crop(box).point(lambda v:255 if 33<=v<=125 else 0); s=Ss.crop(box).point(lambda v:255 if v>=70 else 0); v=Vv.crop(box).point(lambda v:255 if v>=35 else 0)
    m=ImageChops.multiply(ImageChops.multiply(h,s),v)
    m=m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # close pin holes, grow a hair
    return m
alpha=Image.new('L',(W,H),0)
def add_green(box): alpha.paste(ImageChops.lighter(alpha.crop(box),green_mask(box)),box[:2])
def add_poly(pts):
    d=ImageDraw.Draw(alpha); d.polygon([tuple(p) for p in pts],fill=255)
GREEN=[ (0,1462,175,1664), (412,1466,502,1622), (660,1466,780,1562), (632,1562,812,1664), (1128,1466,1220,1562), (1116,1562,1240,1664),
        (1408,1466,1500,1622), (1768,1462,1920,1664),
        (330,820,430,912), (635,860,720,912), (735,860,850,912), (1015,850,1080,912), (1590,850,1660,912) ]
for b in GREEN: add_green(b)
POLY=[ [[236,842],[252,832],[300,832],[316,845],[316,900],[300,935],[236,935]],                 # wardrobe water tank
       [[1160,770],[1195,770],[1200,800],[1215,800],[1218,840],[1238,845],[1245,880],[1262,885],[1270,908],[1090,908],[1100,890],[1112,885],[1118,850],[1135,845],[1140,810],[1158,805]],   # tower crown
       [[1262,860],[1300,860],[1300,915],[1262,915]],                                           # tower roof pipes
       [[1664,885],[1690,872],[1752,870],[1772,885],[1776,960],[1664,960]] ]                     # cab water tank
POLY+=[ [[58,1530],[96,1530],[104,1652],[52,1652]],            # left palm trunk
        [[1866,1520],[1906,1520],[1912,1664],[1860,1664]],      # bottom-right palm trunk
        [[438,1560],[470,1560],[474,1600],[434,1600]] ]          # pot palm trunks (the pots are rectangles below)
for p in POLY: add_poly(p)
for r in [(235,1490,342,1582),(488,1515,588,1610),(1260,1495,1364,1590),(1718,1560,1792,1642),(133,1580,222,1650),(418,1566,498,1622),(1412,1566,1494,1622)]:  # planters (box, flowers)
    ImageDraw.Draw(alpha).rectangle(r,fill=255)
alpha=alpha.filter(ImageFilter.GaussianBlur(.7)).point(lambda v:255 if v>140 else int(v*1.4) if v>60 else 0)
fg=plate.convert('RGBA'); fg.putalpha(alpha)
fg.save(os.path.join(ROOT,'art/blvd-fg.webp'),lossless=True,method=6)
prev=Image.new('RGB',(W,H),(255,0,255)); prev.paste(fg,(0,0),fg)
prev.crop((0,760,1920,1010)).save(os.path.join(ROOT,'tools/shots/blvd-fg-preview-roof.png')); prev.crop((0,1440,1920,1664)).save(os.path.join(ROOT,'tools/shots/blvd-fg-preview-plaza.png'))
print('wrote art/blvd-fg.webp',os.path.getsize(os.path.join(ROOT,'art/blvd-fg.webp'))//1024,'KB')
