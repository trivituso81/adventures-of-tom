# Title art: approved and installed (Tom 2026-11-09 15:19; main at ce96c57, CHANGES "title2" twice: Library entries, then install; build tag title2)

Read this with claude/next.md. Not in next.md because other sessions were rewriting it.

## Facts
- Tom approved all four Title entries. Installed with `python3 tools/title-bake/bake_title.py`: `art/welcome.webp` (portrait v2), `art/welcome-land.webp` (landscape v2, CUT to rows 126 to 594, 1280 x 468, because the approved picture is a painted band with flat cream bars above and below), `art/title-logo.webp` (logo v3, magenta keyed), `icon-v9.png` (icon v3) plus `launch/apple-touch-icon.png`.
- Purged `icon-v2` to `icon-v8.png`. Library icon entry ref is now `icon-v9.png`. Tags: `?v=title2` on logo and landscape in index.html and engine/main.js.
- Checked: title screen screenshots portrait, 844 x 390 and 1054 x 594; smoke FAILS []; tag_check ok; validate OK.
- Style note: welcome entries use style block `FF9ST` (Final Fantasy IX background art) in tools/art-library/title-prompts.js; the logo entry still uses the old `ST` block (approved as is).

## Waiting on Tom
- Phone check of the title screen (portrait and landscape) and the new home-screen icon (iOS needs the icon re-added or the welcome RELOAD button, since the file name changed).
- If he wants the full sky above the landscape band: regenerate `title-welcome-landscape` as one full 16:9 painting (the landscape prompt asked for calm bands top and bottom, and the generator drew flat cream bars instead), then drop the crop in bake_title.py.
