#!/usr/bin/env python3
"""voiceauto1 (Tom 2026-11-20: "the new lines in the game are not in the voice library for recording - can this be automated").
Rebuilds the Voice Library list the way docs/VOICE_LIBRARY.md says (battle-scripts.py, harvest.py, make-index.js) and reports
whether the list of lines really changed. The `voice-index` Action (.github/workflows/voice-index.yml) runs it on every push to
main that touches the game's words and commits the result, so a new or changed line shows under "No clip yet" by itself.

Prints CHANGED (and the added and removed lines) or UNCHANGED. On UNCHANGED it puts the three output files back as they were,
so the date stamp alone never makes a commit.
Run from the repo root:  python3 tools/voice-library/rebuild.py
Test:                    python3 tools/voice-library/rebuild_test.py"""
import json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUTS = ['data/voice-index.json', 'tools/voice-library/harvest.json', 'tools/voice-library/battle-scripts.json']


def lines_of(index):
    """The part of the index that matters to Tom: each line (voice, words, script, where it plays)."""
    out = set()
    for i in (index or {}).get('items', []):
        out.add(json.dumps([i.get('t'), i.get('v'), i.get('x'), i.get('s'), i.get('c'), i.get('w'), i.get('f')], ensure_ascii=False, sort_keys=True))
    return out


def compare(old, new):
    """Returns (added, removed) as lists of 'voice: words' strings, ignoring the date stamp and key order."""
    a, b = lines_of(old), lines_of(new)
    show = lambda s: sorted({(json.loads(x)[1] or '?') + ': ' + (json.loads(x)[2] or '') for x in s})
    return show(b - a), show(a - b)


def committed(path):
    try:
        return json.loads(subprocess.check_output(['git', 'show', 'HEAD:' + path], cwd=ROOT, stderr=subprocess.DEVNULL))
    except Exception:
        return None


def run(cmd):
    print('$', ' '.join(cmd), flush=True)
    subprocess.check_call(cmd, cwd=ROOT)


def main():
    old = committed('data/voice-index.json')
    run([sys.executable, 'tools/voice-library/battle-scripts.py'])
    run([sys.executable, 'tools/voice-library/harvest.py'])
    run(['node', 'tools/voice-library/make-index.js'])
    new = json.load(open(os.path.join(ROOT, 'data/voice-index.json'), encoding='utf8'))
    added, removed = compare(old, new)
    if not added and not removed:
        subprocess.call(['git', 'checkout', '--'] + OUTS, cwd=ROOT)
        print('UNCHANGED')
        return
    print('CHANGED: %d added, %d removed' % (len(added), len(removed)))
    for x in added[:30]: print('  + ' + x)
    for x in removed[:30]: print('  - ' + x)


if __name__ == '__main__':
    main()
