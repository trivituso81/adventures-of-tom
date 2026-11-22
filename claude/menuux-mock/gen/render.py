# Test pages of the menu mockups: python3 render.py [names]  writes ../test/<name>.html; python3 shot.py <names> screenshots them into ../test/.
import sys, os, json, re
HERE = os.path.dirname(os.path.abspath(__file__)); MOCK = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import importlib, boards
FONT = """
@font-face{font-family:'Bricolage Grotesque';src:url('../fonts/bricolage.woff2') format('woff2');font-weight:200 800;font-stretch:75% 100%}
@font-face{font-family:'Figtree';src:url('../fonts/figtree.woff2') format('woff2');font-weight:300 900}
"""
def local(html):
    def r(m):
        k = m.group(1)
        for ext in ('webp', 'jpg', 'png'):
            if os.path.exists(f'{MOCK}/img/{k}.{ext}'): return f'../img/{k}.{ext}'
        raise SystemExit('missing image '+k)
    return re.sub(r'@@([\w-]+)@@', r, html)
def test_page(body):
    return f'<!doctype html><html lang="en"><head><meta charset="utf-8"><style>{FONT}body{{margin:0}}button{{font:inherit}}</style></head><body>{local(body)}</body></html>'
if __name__ == '__main__':
    os.makedirs(f'{MOCK}/test', exist_ok=True)
    names = sys.argv[1:] or ['family_duo','vibes_duo','vibes_late_duo','gear_duo','bag_duo','system_duo','family_phone','vibes_phone','gear_phone','bag_phone','system_phone','family_land']
    for n in names:
        open(f'{MOCK}/test/{n}.html', 'w').write(test_page(getattr(boards, n)()))
    print(names)
