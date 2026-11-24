'use strict';
// data/bt-tables.js (b3s23b): the tables other systems read (menu stats, element colours, flying monsters), kept apart from Battle 2.
// Stats are [level 1, level 50] per stat, a straight line between.
const BT_STAT_KEYS=['hp','pow','grit','warmth','cool','pep'];
const BT_STAT_NAMES={hp:'HP',pow:'POW',grit:'GRIT',warmth:'WARMTH',cool:'COOL',pep:'PEP'};
const BT_STATS={
  tom:   {hp:[110,950],pow:[14,90],grit:[13,88],warmth:[12,80],cool:[13,86],pep:[11,70]},
  grace: {hp:[ 90,780],pow:[11,74],grit:[10,66],warmth:[14,92],cool:[11,72],pep:[14,90]},
  rose:  {hp:[ 84,740],pow:[10,72],grit:[ 9,62],warmth:[13,88],cool:[10,70],pep:[15,92]},
  amy:   {hp:[104,900],pow:[15,96],grit:[11,74],warmth:[11,76],cool:[11,74],pep:[15,94]},
  deedee:{hp:[ 96,860],pow:[10,68],grit:[13,86],warmth:[16,99],cool:[13,88],pep:[11,72]},
  boppy: {hp:[120,999],pow:[15,94],grit:[16,99],warmth:[10,70],cool:[11,76],pep:[ 9,60]},
  tnb:   {hp:[100,880],pow:[12,80],grit:[11,76],warmth:[15,94],cool:[16,99],pep:[12,78]},
  nara:  {hp:[ 92,800],pow:[15,94],grit:[10,68],warmth:[11,74],cool:[10,66],pep:[17,99]},
  justin:{hp:[112,960],pow:[15,96],grit:[12,78],warmth:[10,72],cool:[11,74],pep:[13,86]},
  olivia:{hp:[100,880],pow:[12,80],grit:[11,74],warmth:[14,90],cool:[13,86],pep:[16,96]}
};
function btStat(id,key,lvl) { const r=(BT_STATS[id]||BT_STATS.tom)[key]; return Math.round(r[0]+(r[1]-r[0])*(Math.max(1,Math.min(50,lvl))-1)/49); }


const BT_ELEMS={
  kinetic:{name:'Kinetic',color:'#f1e2c0',dark:'#8a7650',icon:'K'},
  cozy:   {name:'Cozy',   color:'#ff9a4a',dark:'#a8401c',icon:'C'},
  splash: {name:'Splash', color:'#6cc4f0',dark:'#1f6a9a',icon:'S'},
  sparkle:{name:'Sparkle',color:'#ffe27a',dark:'#b08a1c',icon:'*'},
  chatter:{name:'Chatter',color:'#d2b8f0',dark:'#6a4a9a',icon:'~'},
  amber:  {name:'Amber',  color:'#e8b048',dark:'#7a5010',icon:'A'}
};
// Enemies that fly or float (Tom, 2026-11-05): the only ones raised off the ground. Add an id to make another enemy hover.
const BT_FLYERS=new Set(['skeeter','tickets','boommoth','fogwisp','hushling','pausesprite','greynote','jetlag','redeye']);
