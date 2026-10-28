import json,re,collections,glob
R='/home/claude/adventures-of-tom/'
H=json.load(open('harvest.json')); dk=set(H['clipkeys']); sp=H['speakers']
SRC={f[len(R):]:open(f,encoding='utf8').read() for f in glob.glob(R+'data/*.js')+glob.glob(R+'engine/*.js') if '/voice' not in f and 'voice-clips' not in f}
sc=SRC['data/scenes.js']; L=sc.split('\n')
def line_of(f,i): return SRC[f].count('\n',0,i)+1
ch_starts=sorted((int(m.group(1)),sc.count('\n',0,m.start())+1) for m in re.finditer(r"^const CH(\d+)=\{",sc,re.M))
def locate(t):
    hits=[]
    for f,s in SRC.items():
        for form in {t,t.replace("'","\\'"),t.replace('"','\\"'),t.replace("'","\\'").replace('"','\\"')}:
            i=s.find(form)
            while i>=0: hits.append((f,line_of(f,i))); i=s.find(form,i+1)
    return sorted(set(hits))
def scene_ch(ln):
    c=None
    for n,l in ch_starts:
        if l<=ln: c=n
    return c
miss=[];seen=set()
for o in H['out']:
    v=sp.get(o['speaker'].strip())
    if not v or o['inLines'] or '{' in o['text']: continue
    k=v+'|'+o['text']
    if k in dk or k in seen: continue
    seen.add(k)
    loc=locate(o['text'])
    chs=set()
    for f,ln in loc:
        if f=='data/scenes.js': chs.add(scene_ch(ln))
        if f=='data/barn-monsters.js': chs.add(8)
        if f=='data/maps-la.js' and re.search(r"ch8|chapter:8|chapter===8",SRC[f].split('\n')[ln-1]): chs.add(8)
    if re.search(r"ch8|chapter[:=]+8\b",o.get('cond','')+o['src']) or re.match(r"(dep|arr|decline|noflight):8\b",o['src']): chs.add(8)
    miss.append(dict(voice=v,speaker=o['speaker'],text=o['text'],src=o['src'],map=o.get('map'),cond=o.get('cond',''),loc=loc,ch=sorted(c for c in chs if c)))
json.dump(miss,open('miss.json','w'),indent=1,ensure_ascii=False)
print('missing dialogue total',len(miss))
print('by chapter',collections.Counter(tuple(m['ch']) for m in miss).most_common(30))
# battle lines missing
bt={(ch,t) for ch,ts in H['btexts'].items() for t in ts}; bm=[]
for ch,d in H['lines'].items():
    for k,v in d.items():
        for t in (v if isinstance(v,list) else [v]):
            if isinstance(t,str) and (ch,t) not in bt and ch+'|'+t not in dk: bm.append((ch,k,t))
json.dump(bm,open('bmiss.json','w'),indent=1,ensure_ascii=False); print('battle missing',len(bm))
