import json,re,glob
B=json.load(open('baked.json')); SPK=B['cast']['speakers']
src={f:open(f,encoding='utf8').read() for f in glob.glob('/home/claude/adventures-of-tom/data/*.js')+glob.glob('/home/claude/adventures-of-tom/engine/*.js') if '/voice' not in f and 'voice-clips' not in f}
def resolve(voice,text):
    forms={text,text.replace("'","\\'"),text.replace('"','\\"'),text.replace("'","\\'").replace('"','\\"')}
    best=None
    for f,s in src.items():
        for fm in forms:
            i=s.find(fm)
            while i>=0:
                win=s[max(0,i-3000):i]
                for m in reversed(list(re.finditer(r"['\"]?(?:talk|name|speaker|who|n)['\"]?\s*:\s*['\"]([^'\"]+)['\"]",win))):
                    nm=m.group(1).replace("\\'","'")
                    if SPK.get(nm)==voice: d=len(win)-m.end(); best=min(best,(d,nm)) if best else (d,nm); break
                i=s.find(fm,i+1)
    return best[1] if best else None
if __name__=='__main__':
    L=json.load(open('final.json')); miss=[]
    for b in L:
        if b['kind']!='dialog': continue
        v=b['newkey'].split('|')[0]; sp=resolve(v,b['text']); b['speaker']=sp
        if not sp: miss.append((v,b['text'][:60]))
    json.dump(L,open('final.json','w'),indent=1)
    print('unresolved',len(miss)); [print(' ',x) for x in miss]
    import collections; print(collections.Counter((b['newkey'].split('|')[0],b.get('speaker')) for b in L if b['kind']=='dialog' and b['newkey'].split('|')[0] in ('bigone','grump','log','toad','mudling','skeeter','la_woman','dot','carmen')))
