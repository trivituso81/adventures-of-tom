# Title tab and title music prompts rewritten (2026-11-11 morning; CHANGES "title3" and "title3b"; admin data only, no tag)

Read this with claude/next.md. Not edited into next.md because other sessions rewrite it.

## Facts
- Tom's order: the welcome screen's Art Library entries reference only the latest character designs and no old art; background prompts use the Final Fantasy IX style and show the game's travel between Long Island and Los Angeles; the logo, icon and sound follow the same rules.
- `title-welcome-portrait`, `title-welcome-landscape`: refs now empty (old `art/town.webp` dropped). Scene: Long Island seaside village on one side, Los Angeles (palms, craftsman bungalow, jacarandas, downtown towers, observatory hill) on the other, one blended sunset sky, airplane contrail from Long Island to Los Angeles, cobblestone flowing into pavement under the cast. Stage and calm bands unchanged. No people (the game draws the cast from the newest walks; confirmed on the title screen).
- `title-logo`: old style key and `ST` block removed; attaches `art/raw/characters/tom-hero-v1.png` for drawing style only; FF9 storybook serif letters; lighthouse and palm emblems joined by a contrail; magenta key background. title3b (Tom 08:12): the controller is NOT the O of TOM (not O shaped, hurt readability); the O is a plain round O and a modern controller (any controller, not the NES one) sits tilted just after TOM.
- `title-app-icon`: `icon-v9.png` dropped; refs are only the newest Tom, Grace, Rose heroes; clothing words removed (fixes the old "pink gingham" conflict); Long Island lighthouse and LA palms behind.
- Title music (`tools/music-library/tracks.json`, `title`): new prompt (fairy tale fantasy RPG score instruments, Long Island melody, take-off swell, Los Angeles groove, both joined), length 60 s. No franchise name because ElevenLabs refuses them. `data/music-index.json` rebuilt.
- Source: `tools/art-library/title-prompts.js`; `data/art-prompts.json` edited by script for the four ids (make-prompts.js NOT run). validate OK, 790 entries.

## Waiting on Tom
- Generate and Approve or Reject the four Title entries; make a new Title Theme take in the Music Library and export it.
- If the phone Music Library still shows the old title prompt, his phone holds a local edit (localStorage `aot-ml-prompts`) that overrides the repo text.

## On approval (no questions)
- Art: `python3 tools/title-bake/bake_title.py` installs welcome, logo, icon. Drop the landscape crop in bake_title.py if the new landscape fills the canvas; bump `?v=` tags on the logo and welcome files in index.html and engine/main.js (bootReady list); a new icon gets the next `icon-vN.png` file name, purge the old one. Screenshot portrait and landscape; smoke FAILS [].
- Music: `python3 -I tools/music-library/merge-local.py <export.json> music`, `node tools/music-library/make-index.js` (MC_TRACKS length changes to about 60), `seam.py title`, bump music-clips.js tag.
