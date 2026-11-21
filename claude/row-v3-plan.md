# Rivituso Row v3: walk map and cutout proposal (updated 2026-11-02 07:20 PT)

Render: Row v3 (claude/row-spec-prompt.txt v3), 1310 x 1201, 24 x 22 tiles of 54.6 px (plate 1536 x 1408, 64 px). All 5 signs spelled right (GREGORI, RIVITUSO, AUNT ELLIE, LONG ISLAND / SQUARE, CATTAIL / PIER).

Tile IDs used with Tom: columns A to X (x 0 to 23), rows 1 to 22 (y 0 to 21). A1 = top left.

## Walk map, Tom-reviewed (. walk, # blocked, D door, E exit). Flood fill from exits: every walkable tile reachable.
```
########################
#############EEE########
#############...########
#############...########
#.##########...#########
#.#######D##..##########
#.#######..#.###########
#.....##.....###########
###..........#DD########
#.#..######..#..########
#...#######.....########
#...#######....#########
...########....#########
...########.......######
...##########...........
...###########..........
...#########............
...####DD#..............
#....................##.
##.............###...###
############...#########
############EEE#########
```
Tom's edits (07:15): red B9, B20, X14; green D9, D10, B11, C13, C16, C17, C20:G20, J20:L20, K18, M17, Q19, R19, S15, T15, N3; doors O9, P9 (Rivituso porch) and H18, I18 (Aunt Ellie steps); exits M22:O22 and N2:P2. Claude: old door tiles P8, H17, I17 and O1, P1 set blocked; B20 kept red (it was in both lists). 07:17: the path down the right side of the Rivituso house (X4 to X13) blocked, since X14 cut it off and nothing is there (Tom: "why would I need to go there").
Doors: Gregori J6 (via J7, K7). Rivituso O9, P9. Aunt Ellie H18, I18. Exits: north N2:P2, south M22:O22.

## Cutout pieces (approx boxes in render px; the real edge comes from the stencils)
Trees and tall bushes (10): top-left tree (0,0,270,240); top-center canopy (470,0,720,95); top-right trees (880,0,1310,175); left edge trees (0,250,70,720); bottom-left bushes (0,990,340,1201); bottom-right big tree (990,760,1310,1201); lilac right of Ellie (585,600,700,800); cypress and shrub left of Ellie (90,560,205,790); two door cypresses (350,820,405,930), (470,820,520,930).
Lamps, posts, boards, signs (7): lamp left (50,330,95,565); lamp center (700,665,745,860); north board with posts (655,0,900,215); south board with posts (600,920,850,1130); GREGORI (455,165,600,220); RIVITUSO (960,305,1090,360); AUNT ELLIE (440,770,560,820).
Roofs (7): Gregori roof (195,0,645,195) and bay roof (320,180,455,220); Rivituso roof (700,125,1255,330) and porch roof (700,280,945,345); Ellie roof (185,425,605,615), balcony (205,665,450,760), awning (185,765,360,835).
Tall props (14): bench left (75,440,190,540); bench right (950,690,1090,815); bikes and scooter (575,305,690,375); net (615,245,680,325); shoe rack (540,260,615,330); beam (300,360,405,425); rocking chairs (770,395,920,480); scarecrow (1095,500,1175,645); trellis (935,480,1015,665); sunflowers (1045,465,1155,565); fishing rods (1125,365,1200,505); cafe table and chair (215,880,330,1005); urns (355,900,410,975), (475,900,535,975).
Review images were drawn from this mask on a 24 x 22 grid with tile labels (A1 style); rebuild the same way for any future review.
