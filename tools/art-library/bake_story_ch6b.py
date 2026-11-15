"""Chapter 6 stage 4 (the return): bakes the approved Library pictures the lemon, hat and call scenes draw.
art/props/griffith/ch6_tree_color (the lemon tree in colour, same 238x384 frame as the grey ch2_tree so it stands in the same place),
art/props/stage7/ch6_hatstand (the hat on its stand, no block), art/props/sundial/ch6_fish (the fish landing in a splash),
art/props/schoolyard/ch6_sneaker (Moss's sneaker), art/ui/ch6_callframe (Tom and TNB on the porch, the corner of the video call).
NOT baked on purpose: ch6-lemon (came out as a lemon inside a yellow block), ch6-dragonfly and ch6-kickball (the white key ate their wings and
highlights). Those three are drawn in code (engine/block-break.js) until they are regenerated. Same keying as bake_story_ch5.py."""
import os, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from bake_closeup_ch2 import key, trim
from PIL import Image
def put(src,out,long=None,size=None):
    p=trim(key('art/raw/props/'+src+'-v1.png'))
    if size: p=p.resize(size,Image.LANCZOS)
    else:
        s=long/max(p.size); p=p.resize((max(1,round(p.width*s)),max(1,round(p.height*s))),Image.LANCZOS)
    os.makedirs(os.path.dirname(out),exist_ok=True); p.save(out,quality=92,method=6); print(out,p.size)
put('ch6-lemon-tree-color','art/props/griffith/ch6_tree_color.webp',size=(238,384))
put('ch6-hat-stand','art/props/stage7/ch6_hatstand.webp',long=256)
put('ch6-fish-splash','art/props/sundial/ch6_fish.webp',long=300)
put('ch6-sneaker','art/props/schoolyard/ch6_sneaker.webp',long=192)
os.makedirs('art/ui',exist_ok=True)
Image.open('art/raw/props/ch6-videocall-frame-v1.png').convert('RGB').resize((320,320),Image.LANCZOS).save('art/ui/ch6_callframe.webp',quality=88,method=6); print('art/ui/ch6_callframe.webp')
