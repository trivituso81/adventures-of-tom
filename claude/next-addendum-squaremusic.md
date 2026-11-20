# The Square music remake: stopped by the stop-loss rule (Tom 2026-11-19 19:07 to 19:12)

Merge into claude/next.md at the next rewrite.

## RESULT (music3, pushed 2026-11-19 evening, card c-music3)

- ElevenLabs docs: model ids are music_v1, music_v2, music_v2_5. music_v1 is deprecated and removed 2027-01-31.
- music.html now has a Model dropdown per card (default music_v2_5, v2, v1 still selectable); v2 models send output_format=auto. Stub and test updated (44 checks pass), smoke passes.
- tracks.json `town` prompt rewritten for v2.5 (96 BPM, G major, nylon guitar and clarinet on the same melody, walking upright bass, brushed snare, four instruments, live room sound, exclusions named). Old prompt is in git history.
- Not verified: a live v2.5 call on Tom's key, v2 credit prices, the sound of the Square take. Tom's card t-music3town is the listening test. If that take also misses, it is a first miss on v2.5; look at v2 and the exclusions before changing the band.

## What Tom asked
"write a new elevenlabs music prompt for the square, the one i have now is too busy". Track id `town`, 60 s loop, made by Tom in ADMIN > MUSIC LIBRARY.

## What was tried and how it failed

| Take | Prompt in short | Tom's verdict |
|---|---|---|
| Built in (tracks.json) | 104 bpm, guitar, flute, bass, brushed shuffle drums, glockenspiel, accordion, "develops across sections" | "too busy" |
| Try 1 | 84 bpm, nylon guitar, upright bass long notes, felt piano, no drums, "sparse", "space between phrases", "same soft level" | "mainly piano, a few notes repeated over and over, it's sleepy and has no melody. hate it" |
| Try 2 | 96 bpm, solo flute melody "like a folk song", strummed guitar, walking bass, light brushes, four instruments only, tune comes back | "the flute sounds out of sync with the guitar which is just strumming a few different chords over and over and the flute sounds like bad quality like an old video game" |

## Analysis (original)
- Try 1 was a wording miss (ambient words, and naming a piano).
- Try 2 was a generation quality problem: bad timing between parts and a cheap solo instrument. The Music Library sent `music_v1`, the oldest model, now deprecated.

## What the next session should do differently (done in music3)
1. Check the current ElevenLabs Music API docs for model ids. Done.
2. Let the Music Library use a newer model, keep music_v1 selectable, update the stub. Done.
3. Give Tom ONE prompt for `town` on the newer model (shared melody, fuller warm live band, no glockenspiel, accordion or "develops across sections"). Done.
4. If no newer model existed: ask Tom which track has the feel he wants. Not needed.
5. Tom can switch the Square back to the built in track meanwhile (Takes, Use on Built into the game).
