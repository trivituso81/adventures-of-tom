"""Bakes the approved chapter 4 Library pictures (art/raw/props/ch4-*).
Writes art/closeup/ch4-coin.webp (the cowboy hat coin), ch4-visitor.webp and ch4-crew.webp (the two lanyards) and ch4-phone.webp (Tom's phone with the photo of TNB), each 512 px square and transparent, and art/props/stage7/ch4_block.webp
(the beach-ball-sized orange block with the cowboy hat, trimmed, 384 px on the long side). Same keying as bake_closeup_ch2.py."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bake_closeup_ch2 import key, trim, square
from PIL import Image
RAW='art/raw/props'
os.makedirs('art/closeup',exist_ok=True); os.makedirs('art/props/stage7',exist_ok=True)
for out,src in (('ch4-coin','ch4-coin-v1'),('ch4-visitor','ch4-lanyard-visitor-v1'),('ch4-crew','ch4-lanyard-crew-v1'),('ch4-phone','ch4-phone-tnb-prize-v1')):
    square(trim(key(RAW+'/'+src+'.png')),512).save('art/closeup/%s.webp'%out,quality=92,method=6)
p=trim(key(RAW+'/ch4-orange-block-v1.png')); sc=384/max(p.size)
p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/stage7/ch4_block.webp',quality=92,method=6)
print('ok')
