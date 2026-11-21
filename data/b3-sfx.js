'use strict';
// Sound effects of the new battle that a move fires at a given clip picture (anim.sound = {at: picture index, sfx: key}).
// Notes only; engine/audio.js plays them as sfx.<key> and battle-guide.html plays the same notes in its player.
// ding: a short bright cartoon ding for the Lounge Pass Flex sparkle (anim-tom-loungepass-ding).
const B3_SFX_NOTES={
  ding:[{type:'sine',f0:1568,dur:.45,vol:.2},{type:'sine',f0:2349,dur:.6,vol:.12,delay:.06},{type:'triangle',f0:3136,dur:.2,vol:.05,delay:.03}]
};
