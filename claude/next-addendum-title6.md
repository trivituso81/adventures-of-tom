# Title art installed (2026-11-11 morning; main e5623dc, CHANGES "title6")

Read with claude/next.md and claude/next-addendum-title3.md (title3 is now DONE for art; its music half is still open).

## Facts
- Tom approved the four Title entries (v4 each). `python3 tools/title-bake/bake_title.py` installed `art/welcome.webp`, `art/welcome-land.webp` (full bleed, no crop), `art/title-logo.webp`, `icon-v10.png` (+ `launch/apple-touch-icon.png`). `icon-v9.png` purged (grep 0).
- Baker fix: enclosed key-colour pixels (counters of the A and O) are now cleared; the heart stays. A faint magenta fringe may remain inside the O; if Tom notices, widen `near`/ramp in `logo()` a little more.
- Tags: logo and landscape `?v=title6`, stamp `build title6`. Portrait welcome is untagged.
- Tests: smoke FAILS [], tag_check ok, validate OK, title looked at in portrait and landscape.

## Still open
- Title music: Tom makes a new Title Theme take in the Music Library; on export run `python3 -I tools/music-library/merge-local.py <export.json> music`, `node tools/music-library/make-index.js`, `seam.py title`, bump music-clips.js tag.
- `prop-bubble-a` was approved in the Library (commit "prop-bubble-a approved (v0)") just before this push: the SPEECH BUBBLE install in next.md is now the first build task if Tom reports nothing.
