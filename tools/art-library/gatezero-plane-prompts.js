// Gate Zero window without Flight Zero, for the end of chapter 10 (ch10vance1, Tom 2026-11-12). Required by make-prompts.js.
// The plane is painted into art/gatezero.webp, so it could never leave. Two edits of that painting, the same method as the approved
// room-gatezero-cut1..3 stencils (copy out parts at the same place and size, on magenta):
//   room-gatezero-noplane  the same painting with the airplane removed and the airfield painted where it was (the plate after Flight Zero leaves)
//   room-gatezero-plane    only the airplane, on magenta, same place and size (the game slides it out of the window over the empty plate)
// Installed by the next session: the empty plate replaces art/gatezero.webp after `ch10-gone`, the plane is cut and slid in data/scenes.js (CH10_PLANE).
const PLATE = 'art/gatezero.webp';

const noPlane = `IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else. Use the attached Gate Zero painting.

Return the same painting, unchanged in every way, except: remove the white airplane outside the big windows (its body, wings, tail, engines and windows). Where the airplane was, paint what is behind it: the same wet airfield at dusk, the same distant runway lights, hills and evening sky, continuing naturally. Keep the gray jet bridge tunnel attached to the building where it is, simply ending in the open air.

Everything else stays exactly where it is, at exactly the same size: the window frames, pillars, lamps, the departures board, the podium, the jet bridge door, every seat, the carpet, the plants, the posts and the railings. Same canvas size and framing, same colors and light, same painted brushwork. Do not add anything. No people, no words. Deliver the image itself.`;

const planeOnly = `IMAGE REQUEST: ONE SINGLE IMAGE. Return exactly one image, nothing else. Use the attached Gate Zero painting.

Copy out only the white airplane seen through the big windows, whole: its body, nose, windows, wings, engines and tail, including the parts behind the window frames, painted complete as if the window frames were not in front of it. It stays exactly where it is in the painting, at exactly the same size, on the same canvas size and framing. Do not copy the jet bridge, the windows, the window frames or anything inside the room. Put it on a plain, flat, pure magenta #FF00FF background with crisp, clean edges. Deliver the image itself.`;

module.exports = { entries: [
  { id: 'room-gatezero-noplane', tab: 'Rooms', group: 'Airport', title: 'Gate Zero after Flight Zero leaves: the same painting with the airplane removed (chapter 10 ending)', ar: '3:2', refs: [PLATE], prompt: noPlane },
  { id: 'room-gatezero-plane', tab: 'Rooms', group: 'Airport', title: 'Gate Zero: the airplane alone on magenta, same place and size (it rolls away at the end of chapter 10)', ar: '3:2', refs: [PLATE], prompt: planeOnly },
] };
