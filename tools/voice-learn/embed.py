# voicelearn3: embed every take with pre-trained speech models (CPU). Usage: python3 -I embed.py <model dir> <out.npz> [emo]
# Per take: mean over SPEECH frames (energy mask) of every transformer layer's hidden state -> array (layers, 768).
# With "emo" (a Wav2Vec2ForSequenceClassification emotion model) the 4 class logits are saved too.
import os, sys, json, glob
import numpy as np, soundfile as sf, torch
from scipy.signal import resample_poly
from transformers import AutoFeatureExtractor, AutoModel, AutoModelForAudioClassification
WORK = os.environ.get('VL_WORK', '/tmp/vl')
mdir, out = sys.argv[1], sys.argv[2]
emo = len(sys.argv) > 3 and sys.argv[3] == 'emo'
torch.set_num_threads(2)
fe = AutoFeatureExtractor.from_pretrained(mdir)
model = (AutoModelForAudioClassification if emo else AutoModel).from_pretrained(mdir).eval()
meta = json.load(open(WORK + '/stage2/takes_meta.json'))
ids, H, L = [], [], []
for i, m in enumerate(meta):
    x, sr = sf.read(f"{WORK}/wav/{m['id']}.wav", dtype='float32')
    x = resample_poly(x, 2, 3).astype('float32')           # 24 kHz -> 16 kHz
    inp = fe(x, sampling_rate=16000, return_tensors='pt')
    with torch.no_grad():
        o = model(**inp, output_hidden_states=True)
    hs = torch.stack(o.hidden_states)[:, 0]                # (layers, frames, 768)
    n = hs.shape[1]
    hop = 320
    e = np.array([np.sqrt(np.mean(x[k*hop:k*hop+400] ** 2) + 1e-12) for k in range(n)])
    mask = e > 0.05 * e.max()
    if mask.sum() < 3: mask[:] = True
    H.append(hs[:, torch.from_numpy(mask)].mean(1).numpy())
    if emo: L.append(o.logits[0].numpy())
    ids.append(m['id'])
    if i % 100 == 0: print(i, len(meta), flush=True)
np.savez(out, ids=np.array(ids), H=np.stack(H), **({'logits': np.stack(L)} if emo else {}))
print('done', np.stack(H).shape)
