#!/usr/bin/env node
'use strict';
// Builds data/music-index.json (what music.html lists) from tools/music-library/tracks.json and music/manifest.json,
// and keeps MC_TRACKS in engine/music-clips.js in step with the real mp3 files.
//   node tools/music-library/make-index.js          (run from the repo root; no arguments)
// MC_TRACKS (id -> [kind, seconds]) is only rewritten when a track is new or its kind or length really changed (more than 0.05 s),
// so an ordinary run changes nothing in the game. If it is rewritten, bump the ?v= of engine/music-clips.js in index.html.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const T=JSON.parse(fs.readFileSync(path.join(__dirname,'tracks.json'),'utf8'));
const MAN=JSON.parse(fs.readFileSync(path.join(ROOT,'music','manifest.json'),'utf8'));
const jsPath=path.join(ROOT,'engine','music-clips.js');
let js=fs.readFileSync(jsPath,'utf8');
const m=js.match(/const MC_TRACKS=(\{.*?\});/);
if(!m){ console.error('MC_TRACKS not found in engine/music-clips.js'); process.exit(1); }
const MC=JSON.parse(m[1]);

const errs=[];
const ids=new Set();
for(const t of T.tracks) {
  if(ids.has(t.id)) errs.push('duplicate id '+t.id); ids.add(t.id);
  if(!['loop','jingle'].includes(t.kind)) errs.push(t.id+': kind must be loop or jingle');
  if(!['Area','Boss room','Battle','Title','Jingle'].includes(t.use)) errs.push(t.id+': bad use '+t.use);
  if(!['Core','Long Island','Los Angeles','Nine Scoops'].includes(t.group)) errs.push(t.id+': bad group '+t.group);
  if(!t.prompt||/—|–/.test(t.prompt)) errs.push(t.id+': prompt empty or has a dash');
  if(!MAN[t.id]) errs.push(t.id+': no mp3 in music/manifest.json');
}
for(const id of Object.keys(MAN)) if(!ids.has(id)) errs.push(id+': in the manifest but not in tracks.json');
if(errs.length) { console.error(errs.join('\n')); process.exit(1); }

// MC_TRACKS follows the manifest.
let changed=[];
const next={};
for(const t of T.tracks) {
  const k=t.kind==='loop'?'l':'j',sec=Math.round(MAN[t.id].dur*10)/10,old=MC[t.id];
  if(old&&old[0]===k&&Math.abs(old[1]-sec)<=0.05+0.1) next[t.id]=old;       // 0.1 s of slack: the table holds tenths with a little padding
  else { next[t.id]=[k,sec]; changed.push(t.id); }
}
if(changed.length) {
  js=js.replace(m[0],'const MC_TRACKS='+JSON.stringify(next)+';');
  fs.writeFileSync(jsPath,js);
  console.log('MC_TRACKS rewritten for: '+changed.join(', ')+'  (bump the ?v= of engine/music-clips.js)');
} else console.log('MC_TRACKS already matches the files.');

const out={made:new Date().toISOString().slice(0,10),suffix:T.suffix,
  tracks:T.tracks.map(t=>({id:t.id,group:t.group,name:t.name,kind:t.kind,use:t.use,len:t.len,where:t.where,prompt:t.prompt,auto:!!t.auto,sec:MAN[t.id].dur,bytes:MAN[t.id].bytes}))};
fs.writeFileSync(path.join(ROOT,'data','music-index.json'),JSON.stringify(out,null,1)+'\n');
console.log('data/music-index.json: '+out.tracks.length+' tracks');
