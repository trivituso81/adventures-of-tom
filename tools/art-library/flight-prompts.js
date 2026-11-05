// Flight tab: the 12 painted flight scene files (art/flight/*.webp, see data/flight-art.js). Strips are tiled mirrored, so left and right ends must match.
const ST = 'Hand-painted storybook style grown up into rich painted detail: dense jewel-toned painted texture, fine brushwork, deep saturated colors, warm golden light from the upper left, soft warm rim light, no thick outlines. NOT pixel art, NOT retro game art.';
const head = 'IMAGE REQUEST: ONE SINGLE ILLUSTRATION. Return exactly one image, nothing else.\n\n';
const REFS = ['docs/reference/style_key_v1.png'];
const tail = '\n\nSTYLE\n' + ST + ' No people, no text, no letters, no logo, no watermark, no border.';
const STRIP = 'It is a horizontal strip that the game repeats side by side with every second copy mirrored, so the left edge and the right edge must show the same content at the same height. ';

// 2026-11-04 Flight art redo (LA ground, skyline, foreground): full custom prompts, no pixel sizes, no edge-match sentence (the engine blends seams),
// camera written as parallel projection (as claude/battle-background-prompts.txt CAMERA), reference = the approved people-free ground-le-v4 instead of the style key (four people).
const REF_LE_GROUND = 'art/raw/flight/flight-ground-le-v4.png';
const CAM = 'CAMERA (the most important rule): one fixed camera, flat and straight-on, like one layer of a side-scrolling game. PARALLEL projection: every horizontal edge perfectly horizontal, no vanishing point, no perspective, no wide-angle, no tilt, no rotation, no diagonal composition.';
const tail2 = '\n\nSTYLE\n' + ST + ' No people, no text, no letters, no signs, no logo, no watermark, no border.';
const STYLE_ONLY = 'The attached picture shows only the painting style and the warm light of this game. Copy nothing from its content: no grass, no runway, no hangars, no trees, no buildings.\n\n';
const CUSTOM = {
 'ground-la': { refs: [REF_LE_GROUND], prompt: head
  + 'The attached picture is an approved ground layer from the same game. Copy its camera and layout exactly: flat, straight-on, one runway band across the middle, open ground above and below it. Paint the Los Angeles version.\n\n'
  + 'Paint one picture: the Los Angeles ground layer for the flight scene of the family adventure game "The Adventures of Tom". 16:9, painted full to all four edges.\n\n'
  + CAM + ' The runway is ONE flat horizontal band running straight from the left edge to the right edge, the same thickness everywhere, nothing converging.\n\n'
  + 'GROUND ONLY: no sky, no skyline, no palm trees, no buildings, no hangars, no poles, no vehicles, no signs, no lettering. Nothing rises above the ground.\n\n'
  + 'LAYOUT FROM TOP TO BOTTOM: dry sandy-gold grass from the top edge down to the runway; then the runway band, about one fifth of the picture height, in neutral grey asphalt with very little color (not orange, not brown), a faint dashed white center line and thin white edge lines; then a strip of pale concrete apron with faint expansion joints; then dry sandy-gold grass down to the bottom edge.\n\n'
  + 'LIGHT: warm golden sunset light from the upper left with soft shadows. The grass glows gold while the asphalt stays grey.' + tail2 },
 'skyline-la': { refs: [REF_LE_GROUND], prompt: head + STYLE_ONLY
  + 'Paint one picture: the Los Angeles skyline layer for the flight scene of the family adventure game "The Adventures of Tom". 16:9, painted full to all four edges.\n\n'
  + CAM + '\n\n'
  + 'LAYOUT: ONE horizon band only, in the bottom quarter of the picture, sitting on a perfectly flat straight bottom edge. In the band: the downtown towers in the middle, a few palm trees, the Griffith Observatory domes on a low hill at one side, soft foothill silhouettes behind, a few lit windows just beginning to glow. Do not paint a full panorama: the city is a thin band and the rest of the picture is plain sky.\n\n'
  + 'THE SKY: everything above the band is ONE smooth empty sunset gradient, deep violet at the top through rose to gold just above the city, with nothing in it: no clouds, no sun, no stars, no birds, no second skyline, no mountains in the sky.' + tail2 },
 'fore-la': { refs: [REF_LE_GROUND], prompt: head + STYLE_ONLY
  + 'Paint one picture: the Los Angeles foreground layer for the flight scene of the family adventure game "The Adventures of Tom". 16:9, painted full to all four edges.\n\n'
  + CAM + '\n\n'
  + 'LAYOUT: ONE thin band across the middle of the picture, about one quarter of the picture height. In the band: palm tree tops, low rooftops and the edge of a freeway overpass, seen close to the camera, bold simple shapes, dark and rich in warm sunset shadow with a thin gold rim light on their upper edges. Above and below the band the picture is perfectly plain flat very dark plum (#1A1424), completely empty, with no gradient, no texture and nothing in it. Do not paint a skyline, a sky, a sun or any ground.' + tail2 },
 'skyline-le': { refs: [REF_LE_GROUND], prompt: head + STYLE_ONLY
  + 'Paint one picture: the Long Island skyline layer for the flight scene of the family adventure game "The Adventures of Tom". 16:9, painted full to all four edges.\n\n'
  + CAM + ' Everything is seen from the side at ground level, never from above: no aerial view, no rooftops seen from the top, no hazy distance.\n\n'
  + 'LAYOUT: ONE horizon band only, in the bottom quarter of the picture, sitting on a perfectly flat straight bottom edge. In the band, as clear separate silhouettes with sky showing between them: a row of tall green oak trees, a few clapboard houses with pitched roofs, a white church steeple, a rust-brown water tower on legs, and a low line of marsh grass and a sliver of calm blue bay at one side. Do not paint a full panorama: the town is a thin band and the rest of the picture is plain sky.\n\n'
  + 'THE SKY: everything above the band is ONE smooth empty midday gradient, soft blue at the top easing to pale warm cream just above the trees, with nothing in it: no clouds, no sun, no birds, no haze bank, no second horizon, no distant hills.' + tail2 },
 'cabin': { refs: [], prompt: head
  + 'Paint one picture: the inside of a premium first-class airplane suite, seen from the seat, for the flight scene of the family adventure game "The Adventures of Tom". Square, painted full to all four edges. The game pans slowly over it on a tall phone, so fill the whole square with calm detail.\n\n'
  + 'THE SUITE (the most important part): a modern long-haul business-class private suite in the style of Delta One. A wide lie-flat seat in soft charcoal-grey leather with a quilted stitched pattern, a cushion and a folded cream-colored duvet with a small pillow on it. Behind and around the seat a clean white and pale warm-grey shell with smooth rounded surfaces. A tall sliding suite door in matte white standing partly open. A large flat entertainment screen on a swing arm, switched off, with a dark glass face. A wide side table in dark walnut wood with a slim reading lamp glowing warm, a small bottle of water and a folded linen napkin on it, and a narrow shelf with a tiny potted orchid. Soft indirect cove lighting glowing warm gold along the ceiling edges.\n\n'
  + 'THE WINDOW: one large oval window beside the seat showing a bright morning sky and soft clouds, with the sun low and golden.\n\n'
  + 'LOOK: calm, spacious and luxurious, like a quiet private room. Eye level of a person sitting in the seat, a little looking toward the window. Nothing that looks like an old economy seat: no cloth seat backs, no blue patterned fabric, no fold-down tray table, no narrow armrests, no rows of seats, no crowded cabin.' + tail2 },
};// [id, file, title, ar, size text, body, refs?]
const F = [
 ['cabin', 'cabin', 'Cabin: seat 1A before takeoff (1024 x 1024)', '1:1', 'SQUARE, 1024 x 1024 px',
  'The inside of a passenger airplane cabin seen from seat 1A: a window seat by an oval window with bright morning sky and clouds, a blue-grey seat back in front, a small tray table, the overhead bin above, a cozy and calm mood. Eye level of a seated passenger, a little looking toward the window. The game slowly pans over it on a tall phone, so fill the whole square with interesting but calm detail.'],
 ['sky-le', 'sky-le', 'Sky over Long Island (1024 x 1024)', '1:1', 'SQUARE, 1024 x 1024 px',
  'A pure sky painting for a Long Island departure at midday: soft blue at the top fading to pale warm haze at the bottom, a few big soft cumulus clouds, no ground, no horizon objects, no sun disk (the game draws the sun). The bottom 10 percent is the lightest haze.'],
 ['sky-la', 'sky-la', 'Sky over Los Angeles (1024 x 1024)', '1:1', 'SQUARE, 1024 x 1024 px',
  'A pure sky painting for a Los Angeles sunset arrival: deep violet at the top through rose and peach to glowing gold at the bottom, a few long thin cloud streaks, no ground, no sun disk (the game draws the sun). The bottom 15 percent is the brightest gold.'],
 ['skyline-le', 'skyline-le', 'Long Island skyline strip (2172 x 288)', '16:9', 'WIDE STRIP, about 2172 x 288 px (aspect about 7.5:1; paint the widest 16:9 picture you can and leave the top and bottom as plain sky and plain treeline, they will be cropped)',
  'A low horizon strip of Long Island seen from the air: rows of small houses, green oak trees, a white church steeple, a water tower, a bit of shoreline, all in soft hazy afternoon light, sitting on a flat bottom edge. Transparent-looking sky above is plain pale haze. ' + STRIP],
 ['skyline-la', 'skyline-la', 'Los Angeles skyline strip (2172 x 391)', '16:9', 'WIDE STRIP, about 2172 x 391 px (aspect about 5.5:1; paint the widest 16:9 picture you can, the top and bottom are plain and will be cropped)',
  'A horizon strip of Los Angeles at sunset: the downtown towers, palm trees, the Griffith Observatory domes on a hill, foothills behind, lit windows beginning to glow, rose and gold haze behind. Flat bottom edge. ' + STRIP],
 ['fore-le', 'fore-le', 'Long Island foreground strip (2172 x 156)', '16:9', 'WIDE STRIP, about 2172 x 156 px (aspect about 14:1; paint a 16:9 picture whose middle band holds the strip and the rest is plain)',
  'A thin foreground band of treetops and rooftops of Long Island, close to the camera, slightly darker and richer than the skyline, bold simple shapes. ' + STRIP],
 ['fore-la', 'fore-la', 'Los Angeles foreground strip (2172 x 223)', '16:9', 'WIDE STRIP, about 2172 x 223 px (aspect about 10:1; paint a 16:9 picture whose middle band holds the strip and the rest is plain)',
  'A thin foreground band of palm tops, low rooftops and a freeway overpass of Los Angeles, close to the camera, in warm sunset shadow, bold simple shapes. ' + STRIP],
 ['ground-le', 'ground-le', 'Long Island ground and runway (2188 x 549)', '16:9', 'WIDE, about 2188 x 549 px (aspect about 4:1; paint the widest 16:9 picture you can, it will be cropped)',
  'The ground seen from a plane at takeoff: a small regional airport with a long grey runway running left to right along the middle with a faint dashed center line, green grass fields above and below, a few small hangars far back. Seen from the side and above at an angle. ' + STRIP],
 ['ground-la', 'ground-la', 'Los Angeles ground and runway (2172 x 724)', '16:9', 'WIDE, about 2172 x 724 px (aspect 3:1; paint the widest 16:9 picture you can, it will be cropped)',
  'The ground at an Los Angeles landing: a wide grey runway running left to right with a faint dashed center line, warm sandy ground, palm trees and low buildings beyond, golden sunset light. Seen from the side and above at an angle. ' + STRIP],
 ['plane', 'plane', 'Plane in nine poses, 3 x 3 sheet (1491 x 534 of the baked sheet)', '3:2', 'one landscape picture, 3:2, 1536 x 1024 px',
  'A 3 x 3 grid of nine side views of the same small white passenger jet with a blue tail stripe and a gold nose stripe, nose pointing to the right, each in its own equal cell on a plain flat magenta background (#FF00FF), nothing touching the cell edges. Row 1: sitting level on the runway; wheels lifting, nose up a little; climbing, nose up more. Row 2: climbing steeper and gear retracting; climbing and banking a touch; flying level high. Row 3: descending gently; nose up for the flare; touching down with the nose wheel just up. Same plane, same size, same lighting, in every cell. No text.'],
 ['mapprops', 'mapprops', 'Map props sheet: clouds, pins, plane, star, smoke (1100 x 893)', '4:3', 'one landscape picture, 4:3, 1536 x 1152 px',
  'A sheet of separate painted map decorations on a plain flat magenta background (#FF00FF), each well apart: a small white jet seen level from above, two banking versions, a puff of smoke, six fluffy white clouds of different sizes and shapes, a red HOME map pin, a blue AWAY map pin (both with a small shine), a small round dot, a gold five-point star, and a grey smoke trail. Each item is clean and crisp and centered in its own space with plenty of margin. No text.'],
 ['usmap', 'usmap', 'United States map, painted (1586 x 992)', '3:2', 'one landscape picture, 3:2, 1536 x 1024 px',
  'A painted map of the contiguous United States as an old storybook map, soft parchment-green land with gentle shaded states and tiny trees and mountains, surrounded by plain deep blue ocean (#0152b2) with small lighter wave marks. No state names, no labels, no pins, no text, no compass, no border.']
];
const entries = F.map(([id, file, title, ar, size, body]) => ({
  id: 'flight-' + id, tab: 'Flight', ar, title: title + ' (replaces art/flight/' + file + '.webp)', refs: CUSTOM[id] ? CUSTOM[id].refs : REFS,
  prompt: CUSTOM[id] ? CUSTOM[id].prompt : head + 'The attached picture is the style key: paint in exactly its painting style.\n\nPaint one picture for the flight scene of the family adventure game "The Adventures of Tom". Shape: ' + size + '. Every coordinate scales with the size.\n\n' + body + tail
}));
module.exports = { entries };
