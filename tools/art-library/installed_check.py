"""Per-group install check for approved Art Library entries (ab, fx, tombo, area, other).
For each approved entry: does its approved raw source exist, and is that source (file name or entry id)
named anywhere in engine/, tools/ (bake scripts, maps) or index.html?  Named = "wired"; not named = "not installed (suspect)".
    python3 -I tools/art-library/installed_check.py [--list GROUP]
Group = ab, fx, tombo, area, other. Reads only engine/, tools/ (text files < 2 MB), index.html, docs/AREA_PAINTINGS.md.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def group(i):
    if i.startswith('area-'): return 'area'
    if i.startswith('tombo-'): return 'tombo'
    for g in ('ab','fx','tombo'):
        if re.search(r'-%s-'%g, i): return g
    return 'other'
def corpus():
    parts=[]
    for d in ('engine','tools'):
        for dp,dn,fn in os.walk(os.path.join(ROOT,d)):
            if any(x in dp for x in ('/shots','/__pycache__','/node_modules')): continue
            for n in fn:
                if n.endswith(('.js','.py','.json','.md','.html','.txt')) and n!='installed_check.py':
                    p=os.path.join(dp,n)
                    if os.path.getsize(p)<2_000_000:
                        parts.append(open(p,encoding='utf-8',errors='ignore').read())
    parts.append(open(os.path.join(ROOT,'index.html'),encoding='utf-8',errors='ignore').read())
    return '\n'.join(parts)
def main():
    ents=json.load(open(os.path.join(ROOT,'data','art-prompts.json')))['entries']
    code=corpus(); res={}
    for e in ents:
        if e.get('status')!='approved': continue
        vs=e.get('versions') or []
        f=vs[-1]['file'] if vs else None
        have=bool(f) and os.path.isfile(os.path.join(ROOT,f))
        base=os.path.basename(f) if f else ''
        stem=re.sub(r'-v\d+\.\w+$','',base)
        named = bool(f) and (base in code or stem in code or e['id'] in code)
        st='wired' if (have and named) else ('no source file' if not have else 'not named in code')
        res.setdefault(group(e['id']),{}).setdefault(st,[]).append(e['id'])
    lg=None
    if '--list' in sys.argv: lg=sys.argv[sys.argv.index('--list')+1]
    for g in ('ab','fx','tombo','area','other'):
        r=res.get(g,{}); print(g, {k:len(v) for k,v in r.items()})
        if lg==g:
            for k,v in r.items():
                if k!='wired': print(' ',k,v)
main()
