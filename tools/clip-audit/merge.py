# Merge a Contraction Fix Baker dialogue-pending.json into data/voice/dialog-ch*.js.
# Each clip goes to the file that holds its key; a removed contraction clip goes back to the file it came from;
# anything else goes to dialog-ch28.js (loaded last; also carries the updated voice settings).
# Audio: silence trim, voice/speaker fx (as voice-merge-dialog.js), Grace shrink (formant 1.18, pitch 1.06), mono 32 kHz 48 kbps.
import json,re,sys,os,subprocess,tempfile,base64,collections,concurrent.futures as cf
R='/home/claude/adventures-of-tom/'; V=R+'data/voice/'
J=json.load(open(sys.argv[1])); FINAL=json.load(open('/home/claude/bk/final.json')); B=json.load(open('/home/claude/bk/baked.json'))
js=open('/home/claude/merge/voice-merge-dialog.js').read()
FX=dict(re.findall(r"(\w+):'([^']*)'",js))
CAST=B['cast']; SFX=CAST.get('speakerFx',{})
TRIM='silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12,areverse'
GRACE='asetrate=32000*1.18,aresample=32000,rubberband=pitch=%s:tempo=%s:formant=preserved,rubberband=pitch=1.06'%(1/1.18,1/1.18)
def fx_for(v,sp):
    sf=SFX.get(sp)
    if sf: return FX.get(sf)
    if v=='boppy': return FX['boppy']
    f=(CAST['voices'].get(v) or {}).get('fx'); return FX.get(f) if f else None
def proc(c):
    d=tempfile.mkdtemp(); i=d+'/i.mp3'; o=d+'/o.mp3'; open(i,'wb').write(base64.b64decode(c['mp3']))
    chain=[TRIM]; f=fx_for(c['voice'],c.get('speaker'))
    if f: chain.append(f)
    if c['voice']=='grace': chain.append(GRACE)
    def run(af): subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',i,'-af',af,'-ac','1','-ar','32000','-c:a','libmp3lame','-b:a','48k',o],check=True)
    try: run(','.join(chain))
    except Exception: print('WARNING fx failed',c['voice'],c['text'][:40]); run(TRIM)
    return base64.b64encode(open(o,'rb').read()).decode()
def load(f):
    L=open(V+f,encoding='utf8').read().split('\n')
    ci=next(k for k,l in enumerate(L) if l.startswith('Object.assign(DIALOG_CLIPS.clips,'))
    vi=next((k for k,l in enumerate(L) if l.startswith('Object.assign(DIALOG_CLIPS.voices,')),None)
    clips=json.loads(L[ci][len('Object.assign(DIALOG_CLIPS.clips,'):-2]); voices=json.loads(L[vi][len('Object.assign(DIALOG_CLIPS.voices,'):-2]) if vi is not None else {}
    return L,ci,vi,clips,voices
files=sorted(f for f in os.listdir(V) if re.match(r'dialog-ch\d+\.js$',f))
D={f:load(f) for f in files}
home={k:f for f in files for k in D[f][3]}
orig={b['newkey']:b['file'] for b in FINAL if b['kind']=='dialog'}
NEW='dialog-ch28.js'
if NEW not in D: D[NEW]=(["'use strict';","// data/voice/dialog-ch28.js — re-bakes from the Contraction Fix Baker (2026-10-28): lines whose old clip was removed or never existed.","// Built with tools/clip-audit/merge.py; do not hand-edit.","Object.assign(DIALOG_CLIPS.clips,{});","Object.assign(DIALOG_CLIPS.voices,{});",""],3,4,{},{})
with cf.ThreadPoolExecutor(2) as ex: outs=list(ex.map(proc,J['clips']))
cnt=collections.Counter()
for c,mp3 in zip(J['clips'],outs):
    k=c['voice']+'|'+c['text']; f=home.get(k) or orig.get(k) or NEW
    if f not in D: f=NEW
    cnt[(f,'replaced' if k in D[f][3] else 'added')]+=1; D[f][3][k]=mp3
L,ci,vi,cl,vo=D[NEW]
for vid,v in J['voices'].items():
    if v and v.get('voice_id'): vo[vid]=dict(vo.get(vid,{}),**v)
for f,(L,ci,vi,cl,vo) in D.items():
    if not any(ff==f for ff,_ in cnt) and f!=NEW: continue
    L[ci]='Object.assign(DIALOG_CLIPS.clips,'+json.dumps(cl,ensure_ascii=False,separators=(',',':'))+');'
    if vi is not None: L[vi]='Object.assign(DIALOG_CLIPS.voices,'+json.dumps(vo,ensure_ascii=False,separators=(',',':'))+');'
    open(V+f,'w',encoding='utf8').write('\n'.join(L)); print(f,round(os.path.getsize(V+f)/1e6,2),'MB')
for k,n in sorted(cnt.items()): print(k,n)
