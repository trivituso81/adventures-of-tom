#!/bin/sh
# voicelearn2: rebuild the stage 2 results from branch `takes`. Needs ffmpeg, pip: numpy pandas scipy scikit-learn librosa soundfile pyloudnorm praat-parselmouth sherpa-onnx,
# and the sherpa-onnx whisper tiny.en model (GitHub release asr-models, sherpa-onnx-whisper-tiny.en.tar.bz2) extracted into $VL_WORK/asr/tiny.
set -e
export VL_WORK=${VL_WORK:-/tmp/vl}; mkdir -p $VL_WORK/takes $VL_WORK/wav $VL_WORK/stage2
git fetch --depth 1 origin +refs/heads/takes:refs/remotes/origin/takes
for f in $(git ls-tree -r --name-only origin/takes | grep '^takes/'); do git show origin/takes:$f > $VL_WORK/takes/$(basename $f); done
HERE=$(cd "$(dirname "$0")" && pwd); cd $VL_WORK/stage2
python3 -I $HERE/decode.py            # mp3 -> wav, takes_meta.json
python3 -I $HERE/features.py          # 38 sound measures per take -> features.json
python3 -I $HERE/asr.py $VL_WORK/asr/tiny/sherpa-onnx-whisper-tiny.en $VL_WORK/stage2/asr_tiny.json
# analysis scripts read df.pkl / df2.pkl built in order:
python3 -I $HERE/analyze.py           # single-measure held-out test, all takes; writes df.pkl
python3 -I $HERE/asrfeat.py           # transcript vs script errors; writes df2.pkl
python3 -I $HERE/analyze_clean.py     # same test with looped takes removed
python3 -I $HERE/model.py             # 10-fold multi-measure model (all takes)
python3 -I $HERE/final.py             # failure detector, per-voice pace and loudness; writes final.json
