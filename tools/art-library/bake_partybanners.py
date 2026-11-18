#!/usr/bin/env python3
"""Install the approved party banners (Art Library group "Party banners", entries banner-join-<id> and banner-leave-<id>, partybanner1).
For every approved entry: the newest version in art/raw -> art/banners/<kind>-<id>.webp (cropped to 2:1 from the centre, 1024 x 512),
then writes data/party-banners.js (the list engine/party-banner.js reads). Entries not approved keep the stand-in ribbon.
Usage: python3 tools/art-library/bake_partybanners.py <TAG>      (TAG goes into PARTY_BANNERS_V; then bump_tags.py <TAG> as usual)"""
import json, os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tag = sys.argv[1] if len(sys.argv) > 1 else 'partybanner1'
E = json.load(open(os.path.join(ROOT, 'data/art-prompts.json'), encoding='utf-8'))['entries']
os.makedirs(os.path.join(ROOT, 'art/banners'), exist_ok=True)
keys = []
for e in E:
    if e.get('group') != 'Party banners' or e.get('status') != 'approved' or not e.get('versions'): continue
    src = e['versions'][-1].get('file') or e['versions'][-1].get('path')
    key = e['id'][len('banner-'):]   # join-grace
    im = Image.open(os.path.join(ROOT, src)).convert('RGB')
    w, h = im.size
    if w / h > 2: nw = 2 * h; im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = w // 2; im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize((1024, 512), Image.LANCZOS).save(os.path.join(ROOT, 'art/banners', key + '.webp'), quality=90, method=6)
    keys.append(key); print('baked', key, 'from', src)
keys.sort()
open(os.path.join(ROOT, 'data/party-banners.js'), 'w').write(
    "'use strict';\n// Party banner paintings that are baked and live (tools/art-library/bake_partybanners.py writes this file; never edit by hand).\n"
    "// Each key is <kind>-<id> with the file art/banners/<key>.webp. Empty until Tom approves the Art Library group \"Party banners\".\n"
    f"const PARTY_BANNERS={json.dumps(keys)};\nconst PARTY_BANNERS_V='{tag}';\n")
print(len(keys), 'banners live')
