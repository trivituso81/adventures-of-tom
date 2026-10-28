import sherpa_onnx,json,subprocess,numpy as np,sys,os
SP=sys.argv[1];M=SP+'/sherpa-onnx-whisper-base.en/base.en-'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+'encoder.int8.onnx',decoder=M+'decoder.int8.onnx',tokens=M+'tokens.txt',num_threads=2,language='en',task='transcribe')
man=json.load(open(SP+'/wav/manifest.json'));out={}
op=SP+'/asr.json'
if os.path.exists(op): out=json.load(open(op))
for i,m in enumerate(man):
    if m['id'] in out: continue
    pcm=subprocess.run(['ffmpeg','-loglevel','error','-i',SP+'/wav/'+m['id']+'.mp3','-f','s16le','-ac','1','-ar','16000','-'],capture_output=True).stdout
    a=np.frombuffer(pcm,np.int16).astype(np.float32)/32768
    s=rec.create_stream();s.accept_waveform(16000,a);rec.decode_stream(s);out[m['id']]=s.result.text.strip()
    if i%50==0: json.dump(out,open(op,'w'));print(i,flush=True)
json.dump(out,open(op,'w'));print('done')
