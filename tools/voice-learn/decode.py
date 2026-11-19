import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import json,glob,base64,subprocess,sys,os
from concurrent.futures import ThreadPoolExecutor
src=WORK+'/takes/'; out=WORK+'/wav/'
rows=[]
for f in sorted(glob.glob(src+'part-*.json')):
    for t in json.load(open(f))['takes']:
        rows.append(t)
def dec(t):
    b=t['mp3']
    if b.startswith('data:'): b=b.split(',',1)[1]
    raw=base64.b64decode(b)
    p=out+t['id']+'.wav'
    r=subprocess.run(['ffmpeg','-v','error','-y','-i','pipe:0','-ac','1','-ar','24000',p],input=raw,capture_output=True)
    return t['id'],len(raw),r.returncode,r.stderr.decode()[:100]
meta=[]
with ThreadPoolExecutor(6) as ex:
    for r in ex.map(dec,rows): meta.append(r)
bad=[m for m in meta if m[2]]
print(len(meta),'decoded; bad',len(bad),bad[:3])
slim=[{k:(t[k] if k!='kept' else (t[k] is True or t[k]=='True')) for k in ('id','line','t','label','script','kept')} for t in rows]
json.dump(slim,open(WORK+'/stage2/takes_meta.json','w'),ensure_ascii=False)
print(sum(s['kept'] for s in slim))
