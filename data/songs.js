'use strict';
// data/songs.js — Music. Each song: tempo, bars (16 steps each), and channels of notes (see parseNotes in engine/music.js).
// Accompaniment is generated from a chord per bar; melodies are written out by hand.

// Chord shapes: bass root, bass fifth, bass octave, and five voiced tones (low to high) for arpeggios and pads.
const CHORD={
  F:{r:'F2',f:'C3',o:'F3',t:['F3','A3','C4','F4','A4']},
  'C/E':{r:'E2',f:'C3',o:'E3',t:['E3','G3','C4','E4','G4']},
  C:{r:'C2',f:'G2',o:'C3',t:['E3','G3','C4','E4','G4']},
  Dm:{r:'D2',f:'A2',o:'D3',t:['D3','F3','A3','D4','F4']},
  Bb:{r:'Bb1',f:'F2',o:'Bb2',t:['D3','F3','Bb3','D4','F4']},
  Gm:{r:'G2',f:'D3',o:'G3',t:['D3','G3','Bb3','D4','G4']},
  Am:{r:'A1',f:'E2',o:'A2',t:['E3','A3','C4','E4','A4']}
};
const songParts={
  bass(chords,from,style) {
    return chords.map((c,i)=>{ const C=CHORD[c];
      return style==='simple'?`${C.r}/8 ${C.f}/8`:`${C.r}/6 ${C.f}/2 ${C.o}/4 ${C.f}/4`; }).join(' ');
  },
  arp(chords,order=[0,1,2,3,4,3,2,1]) {
    return chords.map(c=>order.map(k=>CHORD[c].t[k]+'/2').join(' ')).join(' ');
  },
  pad(chords) { return chords.map(c=>{ const t=CHORD[c].t; return `${t[1]}+${t[2]}+${t[3]}/16`; }).join(' '); },
  bells(chords) { return chords.map((c,i)=>{ const t=CHORD[c].t.map(n=>n.replace(/\d$/,d=>+d+2));
      return i%2?`-/8 ${t[2]}/4 ${t[1]}/4`:`-/4 ${t[3]}/4 -/4 ${t[2]}/4`; }).join(' '); }
};
// Join sections into one channel's event list.
function songTrack(...sections) {
  const out=[]; let step=0;
  for(const s of sections) { const ev=typeof s==='number'?(step+=s*16,null):parseNotes(s,step); if(ev) { out.push(...ev); step=ev.end; } }
  return out;
}
const rest=bars=>`-/${bars*16}`;
const drumBar={
  shaker:'x/2 v.6 x/2 v1 x/2 v.6 x/2 v1 x/2 v.6 x/2 v1 x/2 v.6 x/2 v1',
  kick:'x/8 x/8',
  brush:'-/4 x/8 x/4',
  fill:'-/4 x/8 v.5 x/1 v.7 x/1 v.9 x/1 v1.1 x/1'
};
const bars=(s,n)=>Array(n).fill(s).join(' ');

// ---------- The Little Elsewhere town theme ----------
// F major, 104 BPM, light shuffle. A (flute, sparse) / A' (full band) / B (reed, strings, bells) / A'' (flute and bells).
{
  const A=['F','C/E','Dm','Bb','F','C','Bb','C'];
  const A2=['F','C/E','Dm','Bb','Gm','C','F','F'];
  const B=['Bb','C','Am','Dm','Gm','Am','Bb','C'];
  const melA='A4/6 G4/2 F4/4 C5/4 | Bb4/6 A4/2 G4/8 | F4/4 A4/4 D5/6 C5/2 | Bb4/4 A4/4 G4/4 F4/4 | A4/6 Bb4/2 C5/4 F5/4 | E5/6 D5/2 C5/8 | D5/4 C5/4 Bb4/4 G4/4 | C5/12 -/4';
  const melA2head='A4/6 G4/2 F4/4 C5/4 | Bb4/6 A4/2 G4/8 | F4/4 A4/4 D5/6 E5/2 | F5/6 E5/2 D5/8 | D5/4 Bb4/4 G4/4 Bb4/4 | C5/4 E5/4 G5/4 E5/4 | F5/12 -/4';
  const melB='F5/6 D5/2 Bb4/8 | E5/6 C5/2 G4/8 | A4/4 C5/4 E5/4 A5/4 | F5/6 E5/2 D5/8 | D5/4 G5/4 F5/4 D5/4 | E5/4 C5/4 A4/8 | Bb4/4 D5/4 F5/6 E5/2 | D5/6 E5/2 C5/8';
  const m=s=>s.replace(/\|/g,' ');
  const all=[...A,...A2,...B,...A2];
  defineSong('town',{name:'Little Elsewhere',bpm:104,bars:32,swing:.28,echo:{time:.26,fb:.34,wet:.3},channels:{
    flute:{inst:'flute',pan:0,send:.35,notes:songTrack(m(melA),m(melA2head)+' -/8 C5/2 D5/2 E5/4',rest(8),m(melA2head)+' -/12 C5/4')},
    reed:{inst:'reed',pan:.05,send:.3,notes:songTrack(rest(16),m(melB),rest(8))},
    harp:{inst:'harp',pan:-.3,send:.28,vel:.8,legato:2,notes:songTrack('v.75 '+songParts.arp(A),'v.85 '+songParts.arp(A2),'v.8 '+songParts.arp(B,[0,2,4,2,1,3,2,1]),'v.85 '+songParts.arp(A2))},
    bass:{inst:'bass',pan:0,send:0,notes:songTrack(songParts.bass(A,0,'simple'),songParts.bass(A2),songParts.bass(B),songParts.bass(A2))},
    strings:{inst:'strings',pan:.25,send:.2,legato:1,notes:songTrack(rest(8),'v.7 '+songParts.pad(A2),'v1 '+songParts.pad(B),'v.8 '+songParts.pad(A2))},
    bells:{inst:'bell',pan:.35,send:.5,notes:songTrack(rest(16),songParts.bells(B),'v.7 '+songParts.bells(A2))},
    kick:{inst:'kick',send:0,notes:songTrack(rest(8),bars(drumBar.kick,24))},
    brush:{inst:'brush',pan:.1,send:.15,notes:songTrack(rest(8),bars(drumBar.brush,7),drumBar.fill,bars(drumBar.brush,7),drumBar.fill,bars(drumBar.brush,7),drumBar.brush)},
    shaker:{inst:'shaker',pan:-.25,send:.1,notes:songTrack(bars(drumBar.shaker,32))}
  }});
}
