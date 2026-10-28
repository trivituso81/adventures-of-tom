import json,re,sys
sys.path.insert(0,'/home/claude/bk'); from fixtext import tr
SP=sys.argv[1]
man=json.load(open(SP+'/wav/manifest.json')); asr=json.load(open(SP+'/asr.json')); bad=json.load(open(SP+'/bad.json'))
def fix(t): return tr(t).replace("She won't let's open it.","She won't let us open it.").replace("She let's hold it.","She let us hold it.")
out={};
for b in bad: out[b['key']]=b
for m in man:
    if fix(m['text'])!=m['text'] and m['key'] not in out: out[m['key']]=dict(m,asr=asr.get(m['id'],''),miss=[])
L=[]
for k,b in out.items():
    nt=fix(b['text']); b=dict(b,old_text=b['text'],text=nt)
    if b['kind']=='dialog': b['newkey']=b['key'].split('|',1)[0]+'|'+nt
    L.append(b)
json.dump(L,open('final.json','w'),indent=1)
print(len(L),sum(1 for b in L if b['old_text']!=b['text']),'reworded')
for b in L:
    if b['old_text']!=b['text']: print(' ',b['key'][:50],'->',b['text'][:70])
