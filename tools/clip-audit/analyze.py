import json,re,sys,collections
SP=sys.argv[1]
man=json.load(open(SP+'/wav/manifest.json'));asr=json.load(open(SP+'/asr.json'))
def toks(s): return re.findall(r"[a-z]+(?:'[a-z]+)?",s.lower().replace('’',"'"))
IRR={"won't":["will not"],"can't":["can not","cannot"],"shan't":["shall not"],"ain't":["am not","is not","are not"],"let's":["let us"]}
def expansions(c):
    if c in IRR: return IRR[c]
    b,suf=c.split("'",1)
    if suf=='t' and b.endswith('n'): return [b[:-1]+' not']
    m={'s':['is','has','does'],'re':['are'],'ll':['will'],'ve':['have'],'d':['would','had','did'],'m':['am']}.get(suf,[])
    return [b+' '+x for x in m]
bad=[];checked=0
for m in man:
    tr=asr.get(m['id'])
    if tr is None: continue
    checked+=1
    T=toks(m['text']); A=' '+' '.join(toks(tr))+' '
    Ac=collections.Counter(toks(tr))
    conts=[t for t in T if "'" in t and not re.fullmatch(r"[a-z]+'s",t) or t in ("it's","he's","she's","that's","there's","what's","who's","where's","here's","how's","let's","everyone's","nobody's","everybody's","somebody's","someone's","something's","everything's","nothing's","dad's","mom's","why's","when's")]
    miss=[]
    for c in dict.fromkeys(conts):
        need=T.count(c); have=Ac.get(c,0)
        if have>=need: continue
        exp=[e for e in expansions(c) if ' '+e+' ' in A]
        if exp: miss.append((c,exp[0]))
    if miss: bad.append({**m,'asr':tr,'miss':miss})
json.dump(bad,open(SP+'/bad.json','w'),indent=1)
print('checked',checked,'flagged',len(bad),collections.Counter(b['kind'] for b in bad))
for b in bad[:int(sys.argv[2]) if len(sys.argv)>2 else 0]: print(b['key'][:60],'|',b['miss'],'|',b['asr'][:100])
