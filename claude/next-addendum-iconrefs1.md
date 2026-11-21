# App icon Art Library entry now uses the latest character art (2026-11-10 night; main at dff9f92, CHANGES "icon-refs1"; admin data only, no tag)

Read this with claude/next.md. Not edited into next.md because other sessions were rewriting it.

## Facts
- Art Library > Title > App icon (`title-app-icon`) attached the first versions `tom-hero-ref-v1.png`, `grace-hero-ref-v1.png`, `rose-hero-ref-v1.png`. It now attaches the latest approved hero paintings `art/raw/characters/tom-hero-v1.png`, `grace-hero-v1.png`, `rose-hero-v1.png`. First reference is still `icon-v9.png`; prompt text unchanged.
- Edited in `tools/art-library/title-prompts.js` and by hand in `data/art-prompts.json` (`make-prompts.js` not run). `validate.js` OK, 789 entries.
- The installed icon (`icon-v9.png`, `launch/apple-touch-icon.png`) is NOT changed. It changes only when Tom presses Generate on the entry and approves a new version, then `python3 tools/title-bake/bake_title.py` installs it (iOS needs the icon re-added or the welcome RELOAD button since the file name changes).

## Open point for Tom
- The icon prompt says Rose wears a "pink gingham dress", but both her old and new hero paintings show a yellow gingham dress (pink shoes and bow). The prompt also says to keep clothes faithful to the paintings, so the generator gets two instructions. Recommend changing the prompt to "yellow gingham dress" before the next Generate; not done because Tom wrote "pink" himself on 11-04.
