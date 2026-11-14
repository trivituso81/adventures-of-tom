"""Bakes the approved chapter 5 Library pictures (art/raw/props/ch5-*, art/raw/characters/ch5-rose-grin-v1).
Writes art/closeup/ch5-coin.webp (the gold kickball coin), ch5-coffees, ch5-binder (open, tabs), ch5-gummynote (bag of gummy worms and TNB's note),
ch5-phone (the photo for the next flight west), ch5-clipboard (clipboard with the coin under the clip), ch5-grin (Rose's gap-toothed grin),
each 512 px square and transparent, and art/props/schoolyard/ch5_block.webp (the washing-machine-sized orange block with the kickball and the sneaker,
trimmed, 384 px on the long side). Same keying as bake_story_ch4.py."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bake_closeup_ch2 import key, trim, square
from PIL import Image
os.makedirs('art/closeup',exist_ok=True); os.makedirs('art/props/schoolyard',exist_ok=True)
for out,src in (('ch5-coin','props/ch5-coin-v1'),('ch5-coffees','props/ch5-coffees-v1'),('ch5-binder','props/ch5-binder-open-v1'),
                ('ch5-gummynote','props/ch5-gummy-note-v1'),('ch5-phone','props/ch5-phone-rose-v1'),('ch5-clipboard','props/ch5-clipboard-coin-v1'),
                ('ch5-grin','characters/ch5-rose-grin-v1')):
    square(trim(key('art/raw/'+src+'.png')),512).save('art/closeup/%s.webp'%out,quality=92,method=6)
p=trim(key('art/raw/props/ch5-orange-block-v1.png')); sc=384/max(p.size)
p.resize((max(1,round(p.width*sc)),max(1,round(p.height*sc))),Image.LANCZOS).save('art/props/schoolyard/ch5_block.webp',quality=92,method=6)
print('ok')
