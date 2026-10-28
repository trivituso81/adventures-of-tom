# python3 silence.py bad.json REPO  -> removes the mismatched clips so those lines go silent until re-baked
import json,re,sys,os,collections
BAD=json.load(open(sys.argv[1])); R=sys.argv[2]+'/data/voice/'
byfile=collections.defaultdict(list)
for b in BAD: byfile[b['file'] if b['kind']=='dialog' else b['file']+'.js'].append(b)
for f,items in byfile.items():
    p=R+f; L=open(p,encoding='utf8').read().split('\n'); n=0
    if f.startswith('dialog'):
        i=next(k for k,l in enumerate(L) if l.startswith('Object.assign(DIALOG_CLIPS.clips,'))
        pre='Object.assign(DIALOG_CLIPS.clips,'; body=L[i][len(pre):-2]; assert L[i].endswith(');')
        d=json.loads(body)
        for b in items:
            if b['key'] in d: del d[b['key']]; n+=1
        L[i]=pre+json.dumps(d,ensure_ascii=False,separators=(',',':'))+');'
    else:
        ch=f[:-3]; pre='VOICE_CLIPS.clips.'+ch+'='
        i=next(k for k,l in enumerate(L) if l.startswith(pre)); body=L[i][len(pre):]; semi=body.endswith(';'); body=body[:-1] if semi else body
        d=json.loads(body)
        for b in items:
            kind=re.match(r'\w+\.(\w+)\[',b['key']).group(1)
            before=len(d.get(kind,[])); d[kind]=[c for c in d.get(kind,[]) if not (c and c.get('text')==b.get('old_text',b['text']))]; n+=before-len(d[kind])
            if not d[kind]: del d[kind]
        L[i]=pre+json.dumps(d,ensure_ascii=False,separators=(',',':'))+(';' if semi else '')
    open(p,'w',encoding='utf8').write('\n'.join(L)); print(f,'removed',n,'of',len(items))
