# clipfix1 (2026-11-12, main 75fe9cd): dialogue text reworded to match what the baked clips say

Tom 18:02: "find where voice clips differ from the written text and update the written text to reflect the changes".

## Method (fact)
1. Dump every baked dialogue clip (3,791 keys `voice|text` from data/voice/dialog-ch*.js) to mp3 (scratch script, node vm over the voice files; skip non-dialog voice files, they use VOICE_CLIPS and error).
2. Transcribe with sherpa-onnx whisper base.en (`tools/clip-audit/asr.py` pattern; about 90 clips a minute on 2 cores, 42 minutes in all). `pip install sherpa-onnx`, models from the k2-fsa/sherpa-onnx `asr-models` release (GitHub is reachable; the big small.en tarball is 636 MB).
3. Compare to the key text after normalising contractions, digits to words, stretched letters, tags and parentheses, and repeated words. base.en is noisy (loops, name errors), so only multi-word differences were kept: 124 candidates. Re-check those with whisper small.en; both models agreeing = real.
4. Replace the old text with the new text everywhere (sources, voice file keys, voice-index, harvest, directions scripts, emotion and reaction tables), fix the direction scripts' words by hand (tags kept), `python3 tools/voice-library/battle-scripts.py && node tools/voice-library/make-index.js`, tags `clipfix1`, smoke FAILS [], `unused_voice.py` 0.
5. Gotcha (fact): data files use single-quoted JS strings, so a new line with a straight apostrophe must be written `\'` in data/scenes*.js and maps-le.js (generated emotion js files use double quotes). Run `node --check` on every edited data file.

## The 13 lines changed
deedee ch1 "Sunday dinner is at six thirty. Don't make me call twice."; deedee "Wait until Boppy hears about this."; ellie "I've been to Paris eleven times, darling. Long Island is charming. But one must explore the world."; amy ch5 "Save me some casserole", "Did we save some casserole for Daddy?", "You were a good uncle tonight.", "The sign-up sheet must be in there."; tnb "Los Angeles blue."; tom ch11 "Trust me, I was not going to argue.", "you're breathing very loudly."; deedee ch11 "Actually, take two. And take the crisp.", "Yes, I know it's nine in the morning."; rose ch11 "Tata, can I touch it?".

## Not changed, for Tom
- amy's text message line still ends "With a little heart." (the audio stops at "casserole").
- amy ch11 "It's fine. Nobody's mad at a drill..." is heard with "Easy. Kind." before it; gus "Larry is amber" is heard as "There he is, Amber". These look like the clip reading a direction or misreading a name: need a re-take, not a text change.
- "Round N" lines (rounds 2 to 5) share one clip that says "Round two"; left alone.
- One-word differences were not checked (the recognizer cannot tell them from its own errors). Battle clips (data/voice/<id>.js) were not checked at all.
- Historical files not edited on purpose: tools/clip-audit/*, docs/dialogue-scripts-*.json, docs/CHANGES.md older entries.
