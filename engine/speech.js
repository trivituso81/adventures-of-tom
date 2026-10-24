'use strict';
// engine/speech.js — Playing clips, speech synthesis fallback.
const clipCache=new Map();
function playClip(cl,part) {
  const c=audio();
  if(!c) return false;
  const go=buf=>{
    const src=c.createBufferSource(); src.buffer=buf;
    if(part) { const g=c.createGain(); g.gain.value=part.gain||1; src.connect(g); g.connect(sound.master); src.start(0,part.from,part.to-part.from); }
    else { src.connect(sound.master); src.start(); }
  };
  if(clipCache.has(cl.mp3)) { go(clipCache.get(cl.mp3)); return true; }
  const bin=atob(cl.mp3),u=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i);
  c.decodeAudioData(u.buffer).then(buf=>{ clipCache.set(cl.mp3,buf); go(buf); }).catch(()=>{});
  return true;
}

function pickVoice(id) {
  const list=sound.voices.length?sound.voices:(('speechSynthesis'in window)?speechSynthesis.getVoices():[]);
  const en=list.filter(v=>/^en/i.test(v.lang));
  for(const name of VOICE[id].prefer) {
    const v=en.find(v=>v.name.includes(name));
    if(v) return v;
  }
  return en[0]||list[0]||null;
}

function say(id,kind,delay=0,only=null) {
  if(!sound.enabled) return;
  const v=VOICE[id];
  if(!LINES[id]||!(LINES[id][kind]||LINES[id].attack||LINES[id].basic||LINES[id].hurt)) return;
  const fkind=LINES[id][kind]?kind:(LINES[id].attack?'attack':(LINES[id].basic?'basic':'hurt'));
  const baked=VOICE_CLIPS&&VOICE_CLIPS.clips&&VOICE_CLIPS.clips[id]&&VOICE_CLIPS.clips[id][fkind];
  // Pick the line first, then play its own clip if baked; an unbaked line is synthesized so every line gets heard.
  const line=only&&LINES[id][fkind].includes(only)?only:pick(LINES[id][fkind]);
  const allowed=new Set([line]);
  let bakedClips=baked?baked.filter(c=>c&&allowed.has(c.text)):[];
  // Same words already baked under another kind (a shout reused from a hurt line, say) count too.
  if(!bakedClips.length&&VOICE_CLIPS&&VOICE_CLIPS.clips&&VOICE_CLIPS.clips[id])
    for(const k in VOICE_CLIPS.clips[id]) for(const c of VOICE_CLIPS.clips[id][k]) if(c&&allowed.has(c.text)) bakedClips.push(c);
  const go=()=>{
    if(bakedClips.length) { if(playClip(pick(bakedClips))) return; }
    const part=typeof CLIP_PARTS!=='undefined'&&CLIP_PARTS[id]&&CLIP_PARTS[id][line];
    if(part) { const all=VOICE_CLIPS.clips[id]||{}; for(const k in all) { const src=all[k].find(c=>c&&c.text===part.text); if(src&&playClip(src,part)) return; } }
    if('speechSynthesis'in window) {
      try {
        const u=new SpeechSynthesisUtterance(line);
        u.pitch=v.pitch; u.rate=v.rate; u.volume=1;
        const voice=pickVoice(id);
        if(voice) u.voice=voice;
        speechSynthesis.speak(u);
        return;
      } catch(e) {}
    }
    // Fallback: a little voice blip in the character's register.
    tone({type:'square',f0:v.blip[0],f1:v.blip[1],dur:.12,vol:.15});
    tone({type:'square',f0:v.blip[1],f1:v.blip[1]*.8,dur:.1,vol:.12,delay:.1});
  };
  if(delay) setTimeout(go,delay*1000); else go();
}

function setSound(on) {
  sound.enabled=on;
  try { localStorage.setItem('le-sound',on?'on':'off'); } catch(e) {}
  if(!on&&'speechSynthesis'in window) { try { speechSynthesis.cancel(); } catch(e) {} }
  $('sound-toggle').textContent=on?'\u{1F50A}':'\u{1F507}';
  $('sound-toggle').setAttribute('aria-label',on?'Sound on. Tap to mute':'Sound off. Tap to unmute');
}

