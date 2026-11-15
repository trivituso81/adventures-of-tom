"""Bakes the approved chapter 6 Library pictures used as close-ups (art/raw/props/ch6-*, art/raw/npcs/ch6-bernadette-bag-v1).
Writes art/closeup/ch6-acorn, ch6-board (the squirrels' corkboard, the whole painting, 768 px wide, not keyed), ch6-jarcoin (the jar with
a gold coin stuck to the bottom), ch6-crusted (the coin crusted with dried starter), ch6-crock (the empty crock), each 512 px square and transparent.
Same keying as bake_story_ch5.py. art/closeup/ch6-coin.webp (the clean coin the block-break close-up uses) is not touched."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bake_closeup_ch2 import key, trim, square
os.makedirs('art/closeup',exist_ok=True)
for out,src in (('ch6-acorn','props/ch6-acorn-x-v1'),('ch6-jarcoin','props/ch6-jar-coin-v1'),('ch6-crusted','props/ch6-coin-crusted-v1'),('ch6-crock','props/ch6-crock-empty-v1')):
    square(trim(key('art/raw/'+src+'.png')),512).save('art/closeup/%s.webp'%out,quality=92,method=6)
from PIL import Image
b=Image.open('art/raw/props/ch6-corkboard-v1.png').convert('RGB'); b=b.resize((768,round(768*b.height/b.width)),Image.LANCZOS)
c=Image.new('RGBA',(768,768),(0,0,0,0)); c.paste(b,(0,(768-b.height)//2)); c.save('art/closeup/ch6-board.webp',quality=90,method=6)   # the whole painting (cork and all), not a cut-out, centred on a square
print('ok')
# the crock on Tom's kitchen island once TNB has given it to him (art/props/tomhouse/ch6_crock.webp, 256 px on the long side, the starter inside)
from bake_closeup_ch2 import key as _k, trim as _t
os.makedirs('art/props/tomhouse',exist_ok=True)
_p=_t(_k('art/raw/props/ch6-crock-full-v1.png')); _s=256/max(_p.size)
_p.resize((max(1,round(_p.width*_s)),max(1,round(_p.height*_s))),Image.LANCZOS).save('art/props/tomhouse/ch6_crock.webp',quality=92,method=6)
