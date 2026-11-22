# Writes the Design canvas files (project/*.dc.html and project/canvas.json) from the same builders as the test pages.
# Usage: python3 export_canvas.py <out root>     Blob urls are the pictures uploaded to the canvas on 2026-11-21.
import sys, os, re, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import boards
BLOB = {
 'tom': 'e36f44700a5684cb605c3852158c8a32', 'grace': 'c4ccd9a3a6adb16884110b7d0c2fecf9', 'rose': 'deeb73f841f9ba190045b2029d7e3696', 'deedee': '5dd7a2c3422f41366f6b9015015e90c1',
 'tom-head': '5b372ef2c2dc1a324873301d45af278d', 'grace-head': '5857c6f16bc11465870453fbc1397529', 'rose-head': '08ad9694fd83b250cda101e33b77005f', 'deedee-head': '6daf7b0b3c3651bf727d4a6d1d43c0e1',
 'nara-head': '59c55bf08d96d8aeae5a8000dec7d86b', 'justin-head': 'd427c514c069afaf37fee075907f5322', 'olivia-head': 'd90bb8a6f9d0d9cd9b2b27e9a4992fb9',
 'boppy-head': 'edc3f7fcd705de132a7024c6ad433b5f', 'amy-head': 'be47850c8505123bff7251f8d67ee732', 'tnb-head': 'a46763b15d95fdd4ebb43951626d0afe',
 'item-k_keyboard': '83c8a5a1e52bb650e5258b78140286d0', 'item-shirt': '53da3c358d5c194ec50b896567e0f0ab', 'item-sweater': 'c6dbec7629f847618d5bd60bbe4de77d', 'item-cookie': '02163afc17aa6a81c0dafb086e476a09',
 'item-bandage': 'e8b034ed51e87db9b8f663dfed91b452', 'item-notebook': '79dc62203bbffd7f4a212e0bca6224ce', 'item-beanie': 'd31d5410f8e91714f9d350399d7046bf', 'item-pebble': '7ff22dcc5f06ce927f0b5287831c4e35',
 'item-sunhat': '34e080d21e4e9e2594a4895197e7b3cb', 'item-button': 'b1cfce08d2ab92d738fd43a09f6e6987',
 'world-duo': '4578a8da137409ec36c9d0af95a3bc1f', 'world-p': 'ca804cd0bcc0df6228d2e72ca57729c1', 'world-desk': 'c2fae5efe8cd7a496af04dc8190f042c',
 'today-duo': '9e51c3a71243242072dddfdd48ac3d35', 'today-p': '4502be5ba3ba1be335a9e800950442f3',
}
FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Figtree:wght@300..900&display=swap">'
def blob(html):
    return re.sub(r'@@([\w-]+)@@', lambda m: '/_blob/' + BLOB[m.group(1)], html)
def dc(title, w, h, body):
    assert '{{' not in body
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONTS}
<style>
body{{margin:0}}
a{{color:#2B1A33}}a:hover{{color:#2B1A33}}
</style>
</helmet>
{blob(body)}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''
def today(img, w, h):
    return f'<div style="width:{w}px;height:{h}px;background:#0E1220;overflow:hidden"><img src="@@{img}@@" alt="The menu as it is in the game today" style="width:{w}px;height:{h}px;display:block"></div>'
DUO, PH = (951, 648), (393, 852)
BOARDS = [  # file, title, size, builder, interactive
 ('Main.dc.html', 'Family, Duo unfolded', DUO, boards.family_duo, True),
 ('Vibes-Duo.dc.html', 'Vibes, Duo unfolded', DUO, boards.vibes_duo, True),
 ('Vibes-Later-Duo.dc.html', 'Vibes later in the game: three Vibes, choosing Quirks', DUO, boards.vibes_late_duo, False),
 ('Gear-Duo.dc.html', 'Gear, Duo unfolded', DUO, boards.gear_duo, True),
 ('Bag-Duo.dc.html', 'Bag, Duo unfolded', DUO, boards.bag_duo, True),
 ('System-Duo.dc.html', 'System, Duo unfolded', DUO, boards.system_duo, True),
 ('Today-Duo.dc.html', 'Today, Duo unfolded', DUO, lambda: today('today-duo', *DUO), False),
 ('Family-Phone.dc.html', 'Family, phone', PH, boards.family_phone, True),
 ('Vibes-Phone.dc.html', 'Vibes, phone', PH, boards.vibes_phone, True),
 ('Gear-Phone.dc.html', 'Gear, phone', PH, boards.gear_phone, True),
 ('Bag-Phone.dc.html', 'Bag, phone', PH, boards.bag_phone, True),
 ('System-Phone.dc.html', 'System, phone', PH, boards.system_phone, True),
 ('Today-Phone.dc.html', 'Today, phone', PH, lambda: today('today-p', *PH), False),
 ('Family-Sideways.dc.html', 'Family, phone sideways', (852, 393), boards.family_land, False),
]
POS = {'Today-Duo.dc.html': (0, 0), 'Main.dc.html': (1031, 0), 'Vibes-Duo.dc.html': (2062, 0), 'Gear-Duo.dc.html': (3093, 0), 'Bag-Duo.dc.html': (4124, 0), 'System-Duo.dc.html': (5155, 0), 'Vibes-Later-Duo.dc.html': (6186, 0),
       'Today-Phone.dc.html': (0, 1068), 'Family-Phone.dc.html': (473, 1068), 'Vibes-Phone.dc.html': (946, 1068), 'Gear-Phone.dc.html': (1419, 1068), 'Bag-Phone.dc.html': (1892, 1068),
       'System-Phone.dc.html': (2365, 1068), 'Family-Sideways.dc.html': (2838, 1068)}
if __name__ == '__main__':
    root = sys.argv[1]; os.makedirs(os.path.join(root, 'project'), exist_ok=True)
    bd = {}
    for f, title, (w, h), fn, inter in BOARDS:
        open(os.path.join(root, 'project', f), 'w').write(dc(title, w, h, fn()))
        x, y = POS[f]; e = {'x': x, 'y': y, 'w': w, 'h': h, 'title': title}
        if inter: e['is_interactive'] = True
        bd[f] = e
    canvas = {'v': 3, 'createdOnFiles': {'v': 1, 'at': '2026-11-22T02:10:00Z'}, 'title': 'The Adventures of Tom: main menu redesign proposal', 'launch': {'view': 'canvas'}, 'pages': [],
              'boards': bd, 'order': [b[0] for b in BOARDS],
              'notes': {'row-duo': {'x': 0, 'y': -300, 'text': 'Duo unfolded: today, then the proposal. Last one is Vibes later in the game.', 'kind': 'title1', 'maxW': 7137},
                        'row-phone': {'x': 0, 'y': 768, 'text': 'Phone upright: today, then the proposal. Last one is the phone held sideways.', 'kind': 'title1', 'maxW': 3690}},
              'designSystems': []}
    canvas['attachments'] = {}
    for n in canvas['notes'].values(): n['w'] = 240
    json.dump(canvas, open(os.path.join(root, 'project', 'canvas.json'), 'w'), indent=2, sort_keys=True)
    print(len(BOARDS), 'artboards written')
