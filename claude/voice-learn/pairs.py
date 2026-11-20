import json,re,sys,collections
H=json.load(open(sys.argv[1]))['trail']
AUTO={'mellow','laid-back','low-key'}
def brackets(s):
    out=[]
    for b in re.findall(r'\[([^\]]*)\]',s):
        ws=[w.strip().lower() for w in b.split(',')]
        ws=[w for w in ws if w and 'accent' not in w and not w.startswith('grounded and natural') and 'when the line calls' not in w and 'when it calls' not in w and w not in AUTO and 'drawl' not in w and 'voice' not in w]
        out.append(ws)
    return out
def words(s): return [w for b in brackets(s) for w in b]
g=collections.OrderedDict()
for r in H: g.setdefault(r['line'],[]).append(r)
pairs=[]
for line,rs in g.items():
    rs=sorted(rs,key=lambda r:r['t'])
    kept=[r for r in rs if r.get('kept')]
    if not kept: continue
    first,k=rs[0]['script'],kept[-1]['script']
    kind,voice,text=line.split('|',2)
    pairs.append({'line':line,'voice':voice,'text':text,'first':first,'kept':k,'n':len(rs),'changed':words(first)!=words(k) or re.sub(r'\[[^\]]*\]','',first).strip()!=re.sub(r'\[[^\]]*\]','',k).strip(),'t':rs[0]['t']})
json.dump(pairs,open('pairs.json','w'),ensure_ascii=False)
ch=[p for p in pairs if words(p['first'])!=words(p['kept'])]
print('lines with a kept take',len(pairs),'| tag words changed',len(ch))
print(collections.Counter(p['voice'] for p in ch).most_common())
