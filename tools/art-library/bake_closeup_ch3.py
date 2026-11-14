"""Bakes the approved chapter 3 Library pictures (art/raw/props/ch3-*).
Writes art/closeup/ch3-coin.webp (the fish coin), ch3-hat.webp (Boppy's hat with the coin in the band), ch3-bulbs2.webp (the two
burnt flashbulbs, the left two of the row) and ch3-bulbs3.webp (all three), each 512 px square and transparent, and
art/props/sundial/ch3_block.webp (the watermelon-sized orange block with the jumping fish, trimmed, 384 px on the long side)
and art/props/sundial/ch3_coin.webp (the fish coin at 96 px, for Old Iron-Gill's whiskers on the map).
Same keying as bake_closeup_ch2.py (the magenta background is keyed from the edge)."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bake_closeup_ch2 import key, trim, square
from PIL import Image
RAW='art/raw/props'
os.makedirs('art/closeup',exist_ok=True); os.makedirs('art/props/sundial',exist_ok=True)
square(trim(key(RAW+'/ch3-coin-v1.png')),512).save('art/closeup/ch3-coin.webp',quality=92,method=6)
square(trim(key(RAW+'/ch3-boppy-hat-coin-v1.png')),512).save('art/closeup/ch3-hat.webp',quality=92,method=6)
row=trim(key(RAW+'/ch3-flashbulbs-row-v1.png'))
square(row,512).save('art/closeup/ch3-bulbs3.webp',quality=92,method=6)
# The left two bulbs: cut at the widest transparent gap between the second and third bulb.
import numpy as np
a=np.array(row.getchannel('A'))>20; cols=a.any(axis=0); w=len(cols)
gaps=[x for x in range(int(w*.55),int(w*.8)) if not cols[x]]
cut=(gaps[0]+gaps[-1])//2 if gaps else int(w*.66)
square(trim(row.crop((0,0,cut,row.height))),512).save('art/closeup/ch3-bulbs2.webp',quality=92,method=6)
p=trim(key(RAW+'/ch3-orange-block-v1.png')); sc=384/max(p.size)
p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/sundial/ch3_block.webp',quality=92,method=6)
coin=Image.open('art/closeup/ch3-coin.webp').convert('RGBA').resize((96,96),Image.LANCZOS)
coin.save('art/props/sundial/ch3_coin.webp',quality=92,method=6)   # the same coin, small, caught in Old Iron-Gill's whiskers on the map
print('ok',cut,w)
