# Jefferson Park v2: INSTALLED and pushed (CHANGES 398, `jpark2`, 177bb29, 2026-11-06 about 16:20)

Install details, layout, scene moves, tests and what to watch: claude/next.md section 0j and docs/CHANGES.md (398).
Rebuild the plate and cutouts any time with `python3 tools/make_jpark_fg.py` (writes art/jpark.webp, art/jpark-fg.webp, tools/shots/jpark-zones.js; paste the zones line over `PLATE_BEHIND.jpark` in engine/plate.js). Sources live in the repo now: `art/raw/areas/area-jpark-v2.png` and `art/raw/areas/jpark-v2-masks/` (1-bit, check fixes applied), so no re-attachment is needed.

## Mask check (Tom 14:14), kept for reference
| Mask | Verdict | Fix (applied) |
|---|---|---|
| 1 Trees and palms | USE | buildings subtract from trees (invented trunks over PUPUSAS, SKATE, ALVAREZ); invented palm trunk on the laundry dropped |
| 2 Lamps and arches | USE | lamp behind the DOWNTOWN post stays merged with the arch (harmless) |
| 3 Upper buildings | USE | shop pairs split at the gap; NOVAK cut at its door top |
| 4 Props | USE 14 of 17 | ALVAREZ bikes, clothesline and chairs dropped (redrawn); CREOLE column base box dropped |
| 5 Fences, hedges, bushes, flax | USE 23 of 24 | tiny off-fit bush dropped |
