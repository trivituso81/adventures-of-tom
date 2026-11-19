import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import json,re,numpy as np,librosa,soundfile as sf,pyloudnorm as pyln,parselmouth
from multiprocessing import Pool
W=WORK+'/wav/'
meta=json.load(open(WORK+'/stage2/takes_meta.json'))
def words(script):
    s=re.sub(r'\[[^\]]*\]','',script); return re.findall(r"[A-Za-z0-9']+",s)
def feat(t):
    x,sr=sf.read(W+t['id']+'.wav'); x=x.astype(np.float64)
    f={'id':t['id']}
    n=len(x); f['dur']=n/sr
    hop=int(sr*0.01); fr=int(sr*0.025)
    rms=librosa.feature.rms(y=x,frame_length=fr,hop_length=hop,center=True)[0]
    db=20*np.log10(rms+1e-9)
    ref=np.percentile(db,95)
    sp=db>ref-35                      # speech frames
    idx=np.where(sp)[0]
    a,b=idx[0],idx[-1]
    f['lead']=a*0.01; f['trail']=(len(db)-1-b)*0.01
    sdur=(b-a+1)*0.01; f['sdur']=sdur
    nw=len(words(t['script'])); f['nwords']=nw
    f['wps']=nw/sdur; f['chars_ps']=len(''.join(words(t['script'])))/sdur
    # pauses inside speech span
    inner=sp[a:b+1]; pauses=[];run=0
    for v in inner:
        if not v: run+=1
        else:
            if run>=12: pauses.append(run*0.01)
            run=0
    f['npause']=len(pauses); f['pause_tot']=sum(pauses); f['pause_max']=max(pauses) if pauses else 0.0
    f['pause_frac']=sum(pauses)/sdur
    # loudness
    try:
        m=pyln.Meter(sr); f['lufs']=m.integrated_loudness(x)
    except Exception: f['lufs']=np.nan
    f['peak_db']=20*np.log10(np.max(np.abs(x))+1e-9)
    f['clip_frac']=float(np.mean(np.abs(x)>=0.985))
    sd=db[a:b+1][inner]
    f['rms_db']=float(np.mean(sd)); f['rms_std']=float(np.std(sd)); f['dyn_range']=float(np.percentile(sd,95)-np.percentile(sd,10))
    # env peaks rate (syllable-ish)
    env=librosa.util.normalize(rms[a:b+1]); 
    pk=librosa.util.peak_pick(env,pre_max=4,post_max=4,pre_avg=6,post_avg=6,delta=0.08,wait=8)
    f['syl_rate']=len(pk)/sdur
    # pitch
    snd=parselmouth.Sound(x,sampling_frequency=sr)
    pit=snd.to_pitch_ac(time_step=0.01,pitch_floor=65,pitch_ceiling=500)
    p=pit.selected_array['frequency']; v=p>0
    f['voiced_frac']=float(v.mean())
    if v.sum()>10:
        st=12*np.log2(p[v]/100.0)
        f['f0_med']=float(np.median(st)); f['f0_std']=float(np.std(st))
        f['f0_range']=float(np.percentile(st,95)-np.percentile(st,5))
        vi=np.where(v)[0]; k=len(vi)
        f['f0_start']=float(np.median(st[:max(3,k//4)])); f['f0_end']=float(np.median(st[-max(3,k//4):]))
        f['f0_slope']=f['f0_end']-f['f0_start']
        d=np.abs(np.diff(st)); f['f0_jitter']=float(np.mean(d))
    else:
        for k in ('f0_med','f0_std','f0_range','f0_start','f0_end','f0_slope','f0_jitter'): f[k]=np.nan
    # spectral
    xs=x[a*hop:(b+1)*hop+fr]
    S=np.abs(librosa.stft(xs,n_fft=1024,hop_length=hop))
    f['centroid']=float(np.mean(librosa.feature.spectral_centroid(S=S,sr=sr)))
    f['rolloff']=float(np.mean(librosa.feature.spectral_rolloff(S=S,sr=sr,roll_percent=0.85)))
    f['flatness']=float(np.mean(librosa.feature.spectral_flatness(S=S)))
    fq=librosa.fft_frequencies(sr=sr,n_fft=1024); e=(S**2).sum(1)
    f['hf_ratio']=float(e[fq>4000].sum()/(e.sum()+1e-12))
    mf=librosa.feature.mfcc(S=librosa.power_to_db(librosa.feature.melspectrogram(S=S**2,sr=sr)),n_mfcc=13)
    for i in range(1,13): f[f'mfcc{i}']=float(mf[i].mean())
    return f
if __name__=='__main__':
    with Pool(6) as p: R=p.map(feat,meta,chunksize=8)
    json.dump(R,open(WORK+'/stage2/features.json','w'))
    import pandas as pd
    df=pd.DataFrame(R); print(df.shape); print(df.describe().T[['mean','std','min','max']].round(3).to_string())
    print(df.isna().sum()[df.isna().sum()>0])
