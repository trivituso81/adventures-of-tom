# bounce1 (2026-11-11 23:09, main dfdbf2b): welcome screen bounces less

- Tom: "On the welcome screen make the characters bounce less."
- Fact: the welcome screen wave hop is `hopY` in `engine/splash.js`. Height was `S*12`; it is now `S*SPLASH_HOP_H` with `SPLASH_HOP_H=5` (next to `SPLASH_HOP` and `SPLASH_STEP`). Timing and order unchanged. Tom's hop still carries Rose's, so the pair moves a bit more than the others. Idle breathing (`SPLASH_BREATH`) unchanged.
- Tested: smoke FAILS [], tag_check ok, portrait screenshot of the title loads with no console errors. NOT looked at: the hop frame in landscape, or on his phone.
- If Tom says still too much or now too flat: change only `SPLASH_HOP_H` (was 12, now 5), bump tags.
- Not in next.md's header list; next.md itself was not rewritten (it is unchanged from the 18:10 version).
