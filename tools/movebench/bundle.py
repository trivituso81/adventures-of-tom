#!/usr/bin/env python3
# tools/movebench/bundle.py (movebench3): writes data/move-specs.js, the one script the game loads, from the `live` part of every file in data/moves/ (claude/movebench-plan.md b.1).
# A draft never reaches this file. Files are read in id order and written one animation to a line, so the same files always give the same bytes.
#   python3 -I tools/movebench/bundle.py            writes data/move-specs.js
#   python3 -I tools/movebench/bundle.py --check    exits 1 when the script on disk is not what the files give (tools/smoke.py runs it)
import json, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DIR=os.path.join(ROOT,'data','moves'); OUT=os.path.join(ROOT,'data','move-specs.js')
HEAD="""'use strict';
// Written by tools/movebench/bundle.py from the `live` part of every file in data/moves/. Do not edit: a change to a move is a change to its file.
// MOVE_SPECS[<Guide animation id>] is what the game plays for that animation; an animation with no entry plays the defaults (engine/b3-spec.js msLive).
const MOVE_SPECS={
"""
def files(root=ROOT):
    out={}; d0=os.path.join(root,'data','moves')
    for f in sorted(os.listdir(d0)):
        if f.endswith('.json') and f!='index.json':
            d=json.load(open(os.path.join(d0,f),encoding='utf8')); out[f]=d
    return out
def row_text(d): return ' %s:%s'%(json.dumps(d['id']),json.dumps(d['live'],ensure_ascii=False,separators=(',',':')))
def build_rows(root=ROOT):
    """{animation id: the script line of its live part}, for every file that has a live part (movebench6: move-apply compares this with the script on disk)."""
    return {d['id']:row_text(d) for f,d in sorted(files(root).items(),key=lambda x:x[1]['id']) if d.get('live')}
def read_rows(root=ROOT):
    """The same table read back from data/move-specs.js as it is on disk."""
    p=os.path.join(root,'data','move-specs.js'); out={}
    if not os.path.exists(p): return out
    for line in open(p,encoding='utf8').read().split('\n'):
        if line.startswith(' "'):
            t=line.rstrip(',')
            out[json.loads(t[1:t.index('":')+1])]=t
    return out
def build(root=ROOT):
    rows=build_rows(root)
    return HEAD+',\n'.join(rows.values())+'\n};\n', len(rows)
def main():
    txt,n=build()
    if '--check' in sys.argv:
        cur=open(OUT,encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur!=txt: print('data/move-specs.js is not what data/moves/ gives: run python3 tools/movebench/bundle.py'); return 1
        print('data/move-specs.js is fresh (%d animations)'%n); return 0
    open(OUT,'w',encoding='utf8').write(txt); print('wrote data/move-specs.js: %d animations, %d bytes'%(n,len(txt.encode('utf8')))); return 0
if __name__=='__main__': sys.exit(main())
