'use strict';
// data/b3-status.js — Battle 3: one row per status, buff, stance, mark and Prime (architecture section 2.3).
// Stage 1 holds the rows the core loop uses; stage 2 adds the rest of the spec's table.
//   kind    buff, debuff, prime, stance or mark
//   dur     {n, unit}: unit 'turn' counts the carrier's own turns (at the end of each), 'round' counts round dividers
//   mods    [{stat, kind, v}]: `kind` is the stacking bucket. Same kind adds, different kinds multiply (spec 2.4).
//           stats: spd, atk, def (the stat itself), out (damage dealt), taken (damage taken), reduce (damage reduction),
//           crit (own Crit Rate), critTaken (Crit Rate of attacks against it), eva (Evasion), acc (chance its attacks miss,
//           written as a negative accuracy), aggro (target weight), recovery (Recovery Ticks)
//   flags   blind (its next single-target attack misses, then the status is used up)
//   tick    damage at the start of each of the carrier's turns
//   on      {hook:{...}}: a reaction (engine/b3-hooks.js)
//   weight  which icons show when there are more than 3 (higher first)
const B3_STATUS={
  // ---- The 3 Primes (spec 2.5): 2 of the foe's turns ----
  toasty:{id:'toasty',name:'Toasty',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    tick:{flavor:'sizzle',power:'light'},short:'TOASTY',color:'#ff8c5a',weight:9},
  drenched:{id:'drenched',name:'Drenched',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'drenched',v:-.15}],flags:[],
    short:'DRENCHED',color:'#7cc4f2',weight:9},
  dazzled:{id:'dazzled',name:'Dazzled',kind:'prime',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'critTaken',kind:'dazzled',v:.15}],flags:[],
    short:'DAZZLED',color:'#ffe27a',weight:9},
  // ---- Common statuses (spec 2.8) ----
  slow:{id:'slow',name:'Slow',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'slow',v:-.20}],flags:[],
    short:'SLOW',color:'#9db4d6',weight:3},
  fatigue:{id:'fatigue',name:'Fatigue',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'recovery',kind:'fatigue',v:.20}],flags:[],
    short:'TIRED',color:'#b9a58f',weight:3},
  blind:{id:'blind',name:'Blind',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[],flags:['blind'],
    short:'BLIND',color:'#c9c9d6',weight:6},
  guard_stance:{id:'guard_stance',name:'Guard Stance',kind:'stance',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'reduce',kind:'guard',v:.25}],flags:[],
    short:'GUARD',color:'#e6c988',weight:5},
  // ---- From the Detonations (spec 2.6) ----
  overloaded:{id:'overloaded',name:'Sensory Overload',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'out',kind:'overload',v:-.25}],flags:[],
    short:'OVERLOAD',color:'#d7a4f5',weight:4},
  // ---- Kit statuses: Tom, Grace, Rose, Deedee (first Sig Vibes) ----
  eyes_on_me:{id:'eyes_on_me',name:'Eyes On Me',kind:'buff',group:null,dur:{n:1,unit:'turn'},mods:[{stat:'aggro',kind:'eyesOnMe',v:.50}],flags:[],
    short:'EYES ON ME',color:'#ffd27a',weight:4},
  squished:{id:'squished',name:'Squished',kind:'mark',group:null,dur:{n:2,unit:'turn'},mods:[],flags:[],
    on:{afterHit:{carrier:'target',by:'otherAlly',effects:[{op:'pep',n:1,to:'attacker'}],consume:true}},
    short:'SQUISHED',color:'#f5b8d0',weight:2},
  stress_melted:{id:'stress_melted',name:'Stress Melted',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'spd',kind:'needoh',v:.20}],flags:[],
    short:'SPEED UP',color:'#9be39a',weight:4},
  windexed:{id:'windexed',name:'Windex In The Eyes',kind:'debuff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'acc',kind:'windex',v:-.15}],flags:[],
    short:'WINDEX',color:'#8fd0ff',weight:4},
  // ---- Enemy statuses: chapter 1 ----
  jitterflight:{id:'jitterflight',name:'Jitterflight',kind:'buff',group:null,dur:{n:2,unit:'turn'},mods:[{stat:'eva',kind:'jitter',v:.20}],flags:[],
    short:'JITTER',color:'#d8e68a',weight:4}
};
