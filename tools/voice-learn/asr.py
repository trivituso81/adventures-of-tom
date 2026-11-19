import os; WORK=os.environ.get('VL_WORK','/tmp/vl')
import sys,json,glob,numpy as np,soundfile as sf,sherpa_onnx,time
mdir=sys.argv[1]; out=sys.argv[2]
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f'{mdir}/tiny.en-encoder.int8.onnx',decoder=f'{mdir}/tiny.en-decoder.int8.onnx',tokens=f'{mdir}/tiny.en-tokens.txt',language='en',task='transcribe',num_threads=6)
meta=json.load(open(WORK+'/stage2/takes_meta.json'))
R={};t0=time.time()
for i,t in enumerate(meta):
    x,sr=sf.read(WORK+'/wav/'+t['id']+'.wav',dtype='float32')
    s=rec.create_stream(); s.accept_waveform(sr,x); rec.decode_stream(s)
    R[t['id']]=s.result.text.strip()
    if i%100==0: print(i,round(time.time()-t0),R[t['id']][:60],flush=True)
json.dump(R,open(out,'w'),ensure_ascii=False)
