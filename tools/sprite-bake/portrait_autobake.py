#!/usr/bin/env python3
"""portrait1: bake the portraits from the saved crops and log it. Run by .github/workflows/portrait-bake.yml after every push that
touches data/portrait-crops.json, a hero painting or the baker (Tom saves a crop in ADMIN > PORTRAIT CROPS, or approves a new hero
painting in the Art Library). Also runnable by hand: python3 tools/sprite-bake/portrait_autobake.py [TAG]

  1. bake_portraits.py (every portrait; a picture whose pixels did not change is not rewritten);
  2. if anything changed: moves every cache tag (tools/art-library/bump_tags.py, which also stamps the build and its history) and
     puts an entry at the top of docs/CHANGES.md naming the faces that changed.
Prints 'UNCHANGED' when the pictures already match the crops (nothing to commit)."""
import datetime, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def sh(*c):
    return subprocess.run(list(c), cwd=ROOT, capture_output=True, text=True)

def main():
    r = sh(sys.executable, 'tools/sprite-bake/bake_portraits.py')
    if r.returncode:
        print(r.stdout[-800:], r.stderr[-800:]); return 1
    changed = [l.split()[-1] for l in sh('git', 'status', '--porcelain', '--', 'portraits/*.png', 'data/portrait-ver.js').stdout.splitlines()]
    faces = sorted(os.path.basename(p)[:-4] for p in changed if re.fullmatch(r'portraits/[a-z0-9_]+\.png', p))
    if not changed:
        print('UNCHANGED'); return 0
    tag = sys.argv[1] if len(sys.argv) > 1 else 'portraits' + os.environ.get('GITHUB_RUN_NUMBER', datetime.datetime.now().strftime('%m%d%H%M'))
    r = sh(sys.executable, 'tools/art-library/bump_tags.py', tag)
    print(r.stdout[-1200:], r.stderr[-600:])
    if r.returncode:
        print('portrait_autobake: tag bump failed, not committing'); return 1
    f = os.path.join(ROOT, 'docs', 'CHANGES.md')
    txt = open(f, encoding='utf-8').read()
    body = (f'## {tag} ({datetime.date.today().isoformat()}): Portraits baked from your saved crops: {", ".join(faces) if faces else "stamp only"} (made by the portrait-bake Action)\n\n'
            '- Tom saved crops in ADMIN > PORTRAIT CROPS (or approved a new hero painting); the Action baked `portraits/<id>.png` and moved `PORTRAIT_V` in `data/portrait-ver.js`, '
            'the one stamp every status screen, turn order, battle panel and the Battle Guide use for those pictures (tools/sprite-bake/portrait_autobake.py).\n\n')
    open(f, 'w', encoding='utf-8').write(body + txt)
    print('CHANGED', ', '.join(faces) or 'stamp only', tag)
    return 0

if __name__ == '__main__':
    sys.exit(main())
