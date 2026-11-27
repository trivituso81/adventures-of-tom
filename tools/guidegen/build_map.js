#!/usr/bin/env node
// guidegen1a (2026-11-21): writes data/guide-anims.json, the one file the Battle Guide reads to know, for every animation of the guide
// (body, move, act, wind), its Wan job or Art Library entry, the prompt text, the start picture, the price and what is missing.
//
//   node tools/guidegen/build_map.js            writes data/guide-anims.json
//   node tools/guidegen/build_map.js --check    exits 1 when the file on disk is not what this would write
//
// Sources: data/b3-*.js (the animations, listed as battle-guide.html buildAnims does), tools/art-library/wangen-jobs.json and its
// prompt files (family, Wan 3.0 via fal), tools/art-library/clip-prompts.js (monsters, xAI), data/clips/*.js (which clip is baked and
// from what: the stamp), art/clips/start (start pictures), claude/battle-animation-list-ch1-v11.md (what each move's body does),
// data/guide-prompts.json (prompts written through the guide: used ones win, model drafts fill gaps). Docs: claude/guidegen-plan.md.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));
const jread = (f, d) => exists(f) ? JSON.parse(rd(f)) : d;

// ---------- the game's own data, loaded the way tools/b3-sim.js does ----------
function loadGame() {
  const html = rd('index.html');
  const files = [...html.matchAll(/<script[^>]+src="(data\/b3-[^"?]+\.js)/g)].map(m => m[1]);
  const ctx = vm.createContext({ Math, JSON, Object, Array, String, Number, Error, console: { log() {}, error() {} } });
  for (const f of files) vm.runInContext(rd(f), ctx, { filename: f });
  vm.runInContext(rd('data/move-specs.js'), ctx, { filename: 'data/move-specs.js' });   // movebench8: what a move's stage plays over comes from its spec
  const g = n => vm.runInContext('typeof ' + n + '!=="undefined"?' + n + ':null', ctx);
  return { CAST: g('B3_CAST'), SKILLS: g('B3_SKILLS'), VIBES: g('B3_VIBES'), FOES: g('B3_FOES'), BODY_CLIPS: g('B3_BODY_CLIPS') || {}, VIDEO_ONLY: g('B3_VIDEO_ONLY') || [], SPECS: g('MOVE_SPECS') || {} };
}

const cap = s => String(s).charAt(0).toUpperCase() + String(s).slice(1);
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');
const dash = s => String(s).replace(/_/g, '-');
const under = s => String(s).replace(/-/g, '_');
const slug = id => id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

// The words for target and hit ids (the same plain words as the tables at the top of battle-guide.html).
const TARGET = { foe: 'one monster', all_foes: 'every monster', foe_row: 'one row of monsters', random_foes: 'random monsters', self: 'themself', ally: 'one family member', adjacent_allies: 'the family next to them', family: 'the whole family', ko_ally: 'a knocked-out family member', family_or_ko: 'the family, knocked out or not', ally_pair: 'two family members', field: 'the field', either: 'a monster or a family member' };
const HITS = { one: 'one family member', all: 'the whole family', self: 'itself', marked: 'the one it marked', foes: 'its own side', attacker: 'whoever just hit it', two_random: 'two random family members', field: 'the field' };
const TAG = { melee: 'melee', projectile: 'thrown', charge_up: 'announced a turn ahead', buff: 'buff', ground_sweep: 'ground sweep', aoe: 'hits everyone', guard_stance: 'guard stance' };
const STATE = { idle: 'Idle (standing and breathing)', guard: 'Guard', hit: 'Getting hit', ko: 'Knocked out', victory: 'Victory', run: 'Running in', give: 'Giving (support moves)', dodge: 'Dodge', slip: 'Slipping', flustered: 'Flustered', die: 'Defeated', cast: 'Cast' };
const PRON = { tom: 'he', tnb: 'he', boppy: 'he', justin: 'he', nara: 'it' };   // everyone else of the family is she
const BODY_ALIAS = { die: 'defeated' };   // the game's state name -> the entry key
const JOB_ALIAS = { 'grace-guard': 'video' };   // the guard proof's job is named video (wanproof, before one job per clip)

// ---------- animations, as battle-guide.html buildAnims lists them ----------
const WAN_JOBS = jread('tools/art-library/wangen-jobs.json', {});   // startpics2: a person with a start-<id> job lists every family state, like the video-only four, so their standard animations can be made
const COUNTERS = new Set(((jread('data/guide-manifest.json', {}).moves) || []).filter(m => m.counterClip && m.moveId).map(m => m.moveId));   // movebench11
const FAMILY_STATES = ['idle', 'guard', 'hit', 'dodge', 'ko', 'victory', 'run'];
function listAnims(G) {
  const A = [];
  const body = id => {
    const C = G.BODY_CLIPS[id] || {}, VO = G.VIDEO_ONLY.includes(id) || !!(WAN_JOBS['start-' + id] && G.CAST[id]);   // wanch2a: a video-only member lists every family state; one with no clip has no video yet
    const order = ['idle', 'guard', 'hit', 'dodge', 'ko', 'victory', 'run', 'give', 'slip', 'flustered', 'die'];
    order.concat(Object.keys(C).filter(k => !order.includes(k))).forEach(st => {
      if (C[st]) A.push({ id: 'body:' + id + ':' + st, owner: id, kind: 'state', state: st, name: STATE[st] || cap(st), clip: C[st], what: 'body state ' + st });
      else if (VO && FAMILY_STATES.includes(st)) A.push({ id: 'body:' + id + ':' + st, owner: id, kind: 'state', state: st, name: STATE[st] || cap(st), clip: null, what: 'body state ' + st });
    });
  };
  Object.keys(G.CAST).forEach(id => {
    body(id);
    Object.values(G.SKILLS).filter(s => s.vibe && G.VIBES[s.vibe] && G.VIBES[s.vibe].owner === id).forEach(s => {
      const a = s.anim || {};
      A.push({ id: 'move:' + s.id, owner: id, kind: 'move', name: s.name, clip: a.kind === 'clip' ? a.clip : null, shape: a.shape || '', what: 'move ' + s.id + ' in data/b3-kit-' + id + '.js', src: s });
      // movebench11: a move the manifests give a counter video (data/guide-manifest.json counterClip) has a row of its own, `answer:<skill id>`: the video the owner plays when the thing the move left answers a hit
      if (COUNTERS.has(s.id)) A.push({ id: 'answer:' + s.id, owner: id, kind: 'answer', name: s.name + ' counter', clip: (G.SPECS['move:' + s.id] && G.SPECS['move:' + s.id].answer && G.SPECS['move:' + s.id].answer.clip) || null, what: 'counter video of move ' + s.id + ' (the answer of its spec, data/moves/)', src: s });
    });
  });
  Object.values(G.FOES).forEach(f => {
    body(f.id);
    f.acts.forEach(act => {
      const a = act.anim || {};
      A.push({ id: 'act:' + f.id + ':' + act.id, owner: f.id, kind: 'act', name: act.name, clip: a.kind === 'clip' ? a.clip : null, what: 'act ' + act.id + ' of ' + f.id + ' in data/b3-foes-ch' + String(f.ch).padStart(2, '0') + '.js', src: act, foe: f });
      if (act.wind) A.push({ id: 'wind:' + f.id + ':' + act.id, owner: f.id, kind: 'wind', name: act.name + ' (wind-up)', clip: act.wind, what: 'wind-up of act ' + act.id + ' of ' + f.id, src: act, foe: f });
    });
  });
  return A;
}

// ---------- the rows of claude/battle-animation-list-ch1-v11.md section 3 (what a move's body does) ----------
function listRows() {
  const out = {}, f = 'claude/battle-animation-list-ch1-v11.md';
  if (!exists(f)) return out;
  let on = false;
  for (const line of rd(f).split('\n')) {
    if (/^## 3\./.test(line)) on = true; else if (/^## 4\./.test(line)) on = false;
    if (!on || !/^\|/.test(line)) continue;
    const c = line.split('|').slice(1, -1).map(x => x.trim());
    if (c.length < 5 || /^-+$/.test(c[0].replace(/\s/g, '')) || c[1] === 'Move') continue;
    const m = c[1].match(/^(?:Basic|Skill \d|\(extra\)):\s*(.*)$/);
    const name = m ? m[1] : c[1];
    out[norm(name)] = { clip: c[2], body: c[3], engine: c[4] };
  }
  return out;
}

// ---------- jobs, entries, stamps ----------
function loadSources() {
  const jobs = jread('tools/art-library/wangen-jobs.json', {});
  const entries = require(path.join(ROOT, 'tools/art-library/clip-prompts.js')).entries;
  const art = jread('data/art-prompts.json', { entries: [] });
  const artBy = {}; (art.entries || []).forEach(e => { artBy[e.id] = e; });
  const stamps = {};
  for (const f of fs.readdirSync(path.join(ROOT, 'data/clips'))) {
    if (!f.endsWith('.js')) continue;
    const s = rd('data/clips/' + f).slice(0, 1500);
    const m = s.match(/^\/\/ Baked from: (.*)$/m), id = s.match(/bclipDefine\("([^"]+)"/);
    stamps[f.replace(/\.js$/, '')] = { stamp: m ? m[1] : '', id: id ? id[1] : under(f.replace(/\.js$/, '')) };
  }
  const E = {};   // entry key (id minus "clip-") -> entry plus the parsed name
  for (const e of entries) {
    const key = e.id.replace(/^clip-/, '');
    const nm = e.title.replace(/^[^:]+:\s*/, '').replace(/\s+video clip$/, '');
    const wind = /wind-up/.test(nm), base = nm.replace(/\s*wind-up.*$/, '').replace(/\s*\([^)]*\)\s*$/, '');
    E[key] = { e, key, owner: e.clip.owner, nameNorm: norm(base), wind };
  }
  return { jobs, E, artBy, stamps };
}

function jobPromptFiles(job) {   // every version of a job's prompt file that is in the repo: [{v, file}], ascending
  const m = job.prompt_file.match(/^(.*\/wan-[a-z]+-[a-z0-9]+)-v(\d+)\.txt$/);
  if (!m) return [{ v: 1, file: job.prompt_file }];
  const out = [];
  for (let v = 1; v < 20; v++) { const f = m[1] + '-v' + v + '.txt'; if (exists(f)) out.push({ v, file: f }); }
  return out;
}

// What the game plays now was made by one of: a Wan job at a rev ("wan-gen tom-idle rev 1; ..."), or an Art Library entry ("clip-<id>-v1.mp4").
function madeBy(stampInfo) {
  if (!stampInfo) return null;
  const s = stampInfo.stamp;
  let m = s.match(/wan-gen ([a-z0-9-]+?) rev (\d+)/);
  if (m) return { route: 'wan', job: m[1], rev: +m[2] };
  m = s.match(/art\/raw\/clips\/clip-([a-z0-9-]+?)-v(\d+)\.(?:mp4|json)/);
  if (m) return { route: 'xai', entry: m[1], rev: +m[2] };
  return null;
}

// ---------- the pattern and the starter draft ----------
const BACK = (S, h) => `${S} returns to ${h} starting relaxed stance and remains completely still in that pose for the rest of the clip.`;
function personWords(owner) {
  const p = PRON[owner] || 'she';
  return p === 'he' ? { s: 'he', S: 'He', h: 'his' } : p === 'it' ? { s: 'it', S: 'It', h: 'its' } : { s: 'she', S: 'She', h: 'her' };
}
function personGesture(shape, name, w) {
  if (shape === 'give') return `reaches one open hand out forward at chest height, palm up, once, as if handing something to a friend. Without repeating the gesture, ${w.s} pulls ${w.h} arm back.`;
  if (shape === 'cast') return `draws both open hands in to ${w.h} chest and then thrusts both palms forward once, as if casting a spell, holding them out for a moment. Without repeating the gesture, ${w.s} lowers ${w.h} arms.`;
  if (shape === 'throw') return `winds one arm back and throws it forward once, as if tossing something small. Without repeating the throw, ${w.s} lowers ${w.h} arm.`;
  return `lunges forward once with one arm in one quick, clear motion, as if making the move "${name}". Without repeating the motion, ${w.s} steps back onto the same spot.`;
}
// startpics2: the family states (idle, guard, hit, dodge, ko, victory, run) of a person who has no hand-written prompt yet. These are the proven wording of the Tom, Grace and
// Deedee state prompts (tools/art-library/prompts/wan-<who>-<state>-v1.txt) with the pronoun filled in; only the victory differs by person (a line each, from the cast's own
// canon), and Nara, a dog, has her own set. The first one that Tom keeps is saved as a job, so this is only the starting draft he reads and edits.
const STATE_NAME = { idle: 'BREATHING IDLE', guard: 'BRACED GUARD', hit: 'FLINCH', dodge: 'DODGE', ko: 'TOO TIRED TO GO ON', victory: 'VICTORY', run: 'RUNNING IN PLACE' };
const VICTORY = {
  amy: 'raises both fists overhead once with a big proud grin, like crossing a finish line first. She holds that pose and remains completely still in it for the rest of the clip.',
  boppy: 'raises both hands to chest height, each making the American Sign Language I love you sign (thumb, index finger and little finger extended, middle and ring fingers folded), and breaks into a wide, toothy grin. One gold tooth sparkles once with a brief glint of light as he grins. He holds both hands in the sign with the same grin and remains completely still in that pose for the rest of the clip.',
  justin: 'gives two big thumbs up once with a proud, warm grin. He holds that pose and remains completely still in it for the rest of the clip.',
  olivia: 'throws both arms up in a V once with a big proud smile. She holds that arms-up pose and remains completely still in it for the rest of the clip.',
  tnb: 'folds his arms across his chest, smiles, and winks once with one eye. He holds the folded arms and the smile with the eye open again and remains completely still in that pose for the rest of the clip.',
};
function stateText(a, w) {
  const S = w.S, s = w.s, h = w.h, st = a.state, o = a.owner;
  if (o === 'nara') return {
    idle: `The dog stands in its starting relaxed stance and breathes slowly and gently, its chest and flanks rising and falling softly, and blinks once. Its head, paws and tail stay where they are for the whole clip.`,
    guard: `From its starting stance, the dog crouches low once with its chest near the ground, ears pinned back and legs braced, holding that low braced stance, then stands back up into its starting stance.`,
    hit: `From its starting stance, the dog flinches once as if bumped from the front, ducking its head back with its ears flat while its paws stay planted. Without repeating the flinch, it straightens up and returns to its starting stance, holding it for the rest of the clip.`,
    dodge: `From its starting stance, the dog quickly ducks and leans its body back and away to the right once, as if something is flying past, while its paws stay planted. Without repeating the dodge, it straightens up and returns to its starting stance, holding it for the rest of the clip.`,
    ko: `From its starting stance, the dog gets dizzy, wobbles once, and slowly lies down flat on the ground with its eyes closed and its head resting on its paws, as if it has fallen fast asleep. It stays lying there, completely still, for the rest of the clip.`,
    victory: `From its starting stance, the dog jumps up onto its hind legs once, front paws lifted and tail wagging, mouth open in a happy pant. It stays standing upright on its hind legs in that pose, tail still wagging, for the rest of the clip.`,
    run: `The dog trots in place facing left, legs pumping in a steady rhythm, without moving forward or backward from its spot. It keeps the same steady pace for the whole clip, then slows and stops in its starting stance at the very end.`,
  }[st];
  return {
    idle: `${S} stands in ${h} starting relaxed stance and breathes slowly and gently, ${h} chest and shoulders rising and falling softly, and blinks once. ${h[0].toUpperCase() + h.slice(1)} arms, head and feet stay where they are for the whole clip.`,
    guard: `From ${h} starting relaxed stance, ${s} bends ${h} knees, tucks ${h} chin and raises both arms once, crossing ${h} forearms in an X in front of ${h} face with both fists closed. ${S} holds that braced guard, breathing gently, then lowers ${h} arms and stands back up into ${h} starting stance.`,
    hit: `From ${h} starting relaxed stance, ${s} flinches once as if bumped from the front, leaning ${h} upper body back with a wince and ${h} arms pulled in, while ${h} feet stay planted. Without repeating the flinch, ${s} straightens up and returns to ${h} starting relaxed stance, holding it for the rest of the clip.`,
    dodge: `From ${h} starting relaxed stance, ${s} quickly ducks and leans ${h} upper body back and away to the right once, as if something is flying past, while ${h} feet stay planted. Without repeating the dodge, ${s} straightens up and returns to ${h} starting relaxed stance, holding it for the rest of the clip.`,
    ko: `From ${h} starting relaxed stance, ${s} gets dizzy, wobbles once, and slowly sinks down to sit on the ground with ${h} eyes closed and ${h} head drooping, as if ${s} has fallen fast asleep. ${S} stays sitting there, completely still, for the rest of the clip.`,
    victory: `From ${h} starting relaxed stance, ${s} ` + (VICTORY[o] || 'throws both arms up in a V once with a big proud grin. ' + S + ' holds that arms-up pose and remains completely still in it for the rest of the clip.'),
    run: `${S} runs in place facing left, arms pumping and knees lifting in a steady jogging rhythm, without moving forward or backward from ${h} spot. ${S} keeps the same steady pace for the whole clip, then slows and stops in ${h} starting stance at the very end.`,
  }[st];
}
function stateDraft(a, head) { return head + 'MOTION: ' + STATE_NAME[a.state] + '\n' + stateText(a, personWords(a.owner)); }
function personDraft(a, head) {
  const w = personWords(a.owner);
  return head + 'MOTION: ' + a.name.toUpperCase() + `\nFrom ${w.h} starting relaxed stance, ${w.s} ` + personGesture(a.shape || 'strike', a.name, w) + ' ' + BACK(w.S, w.h);
}
function foeGesture(a) {
  const tags = (a.src && a.src.tags) || [];
  if (a.kind === 'wind') return `gathers itself into the tense, wound-up pose that comes just before "${a.src.name}" and holds that pose still, ready, for the rest of the clip.`;
  if (tags.includes('buff')) return `puffs itself up proudly once. Without repeating it, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.`;
  if (tags.includes('ground_sweep')) return `slams its body down along the ground once. Without repeating it, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.`;
  if (tags.includes('projectile')) return `flicks one part of itself forward once, as if throwing something small. Without repeating it, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.`;
  return `lunges forward once to strike whatever is in front of it. Without repeating it, it settles back into the pose of the attached picture and stays completely still for the rest of the clip.`;
}
function foeDraft(a, head, tail) {
  return head + 'MOTION: ' + a.name.toUpperCase().replace(/\s*\(WIND-UP\)$/, ' WIND-UP') + '\nThe creature ' + foeGesture(a) + tail;
}

// Plain words on what the animation does, from the move's own data.
function briefOf(a, listRow) {
  const b = { name: a.name, kind: a.kind, owner: a.owner };
  if (a.kind === 'move') {
    const s = a.src;
    b.desc = s.desc || ''; b.flavor = s.flavor || []; b.shape = a.shape || ''; b.target = TARGET[s.target] || s.target;
    b.does = (s.desc || '') + (s.hits ? ' (' + s.hits + ' hit' + (s.hits > 1 ? 's' : '') + ')' : '');
    if (listRow) b.listRow = listRow;
  } else if (a.kind === 'answer') {
    const s = a.src;
    b.desc = s.desc || ''; b.flavor = s.flavor || []; b.target = TARGET[s.target] || s.target;
    b.does = 'The video the owner plays when what ' + s.name + ' left behind answers a hit. ' + (s.desc || '');
  } else if (a.kind === 'act' || a.kind === 'wind') {
    const s = a.src;
    b.flavor = s.flavor || []; b.target = HITS[s.hits] || s.hits; b.tags = (s.tags || []).map(t => TAG[t] || t);
    b.effects = (s.effects || []).filter(e => e && e.op && e.op !== 'damage').map(e => e.op + (e.id ? ' ' + e.id : ''));
    b.does = s.name + ': ' + (s.power ? 'a ' + (b.tags.join(', ') || 'plain') + ' attack' : 'a ' + (b.tags.join(', ') || 'move')) + ' that hits ' + b.target + (b.effects.length ? ' and causes ' + b.effects.join(', ') : '') + '.';
    if (a.kind === 'wind') b.does = 'The held, wound-up pose before ' + s.name + ' lands. ' + b.does;
  } else {
    b.does = 'The ' + (STATE[a.state] || a.state).toLowerCase() + ' body state.';
  }
  return b;
}

// ---------- the build ----------
function build() {
  const G = loadGame(), A = listAnims(G), S = loadSources(), rows = listRows();
  const recipe = JSON.parse(rd('tools/guidegen/recipe.json'));
  const over = (process.env.GUIDEGEN_PROMPTS ? JSON.parse(fs.readFileSync(process.env.GUIDEGEN_PROMPTS, 'utf8')) : jread('data/guide-prompts.json', { anims: {} })).anims || {};   // the env path is for tests
  const wanJobs = Object.keys(S.jobs).filter(k => !k.startsWith('_') && !k.startsWith('start-') && k !== 'start' && !S.jobs[k].stage);   // movestage2: a stage asset (picture or object video) is not an animation of the guide
  const used = { jobs: new Set(), entries: new Set() };
  const startOf = o => G.CAST[o] ? 'art/clips/start/' + o + '-hero.png' : 'art/clips/start/' + o + '.png';
  const figOf = {}; Object.values(S.E).forEach(x => { if (figOf[x.owner] == null && x.e.clip.figRows) figOf[x.owner] = x.e.clip.figRows; });
  const FIGROWS = jread('tools/guidegen/figrows.json', {});   // startpics1: sprite heights of the people who have no Art Library clip entry (tools/guidegen/figrows.py)
  const nameOf = o => (G.CAST[o] || G.FOES[o] || {}).name || cap(o);

  // owners: route, start picture, pattern
  const owners = {};
  for (const o of Object.keys(G.CAST).concat(Object.keys(G.FOES))) {
    const fam = !!G.CAST[o], st = startOf(o), has = exists(st);
    let head = '', tail = '';
    if (fam) {
      const idle = S.jobs[o + '-idle'];
      let src = idle && jobPromptFiles(idle)[0] && rd(jobPromptFiles(idle)[0].file);
      if (!src) src = S.E['rose-boop'].e.prompt;   // the approved Boop prompt: the generic pattern (her/she)
      head = src.slice(0, src.indexOf('MOTION:'));
      if (!idle) { const w = personWords(o); if (w.s !== 'she') head = head.replace(/\bher\b/g, w.h).replace(/\bhers\b/g, w.h); }
      if (!idle && o === 'nara') head = head.replace('hair, outfit, accessories', 'fur, collar, markings');   // a dog has no outfit
    } else {
      const idle = S.E[o + '-idle'] || S.E['mudling-idle'];
      const p = idle.e.prompt; head = p.slice(0, p.indexOf('MOTION:')).replace('A short looping animation', 'A short animation');
      tail = (p.match(/\n\nLength about[\s\S]*$/) || ['\n\nLength about 3 seconds. Family friendly for ages 6 and up.\n'])[0];
    }
    owners[o] = { name: nameOf(o), route: fam ? 'wan' : 'xai', start: has ? st : null, patternHead: head, patternTail: tail, figRows: figOf[o] != null ? figOf[o] : FIGROWS[o] != null ? FIGROWS[o] : null,
      canStart: fam && !has && !!S.jobs['start-' + o], startCost: S.jobs['start-' + o] ? S.jobs['start-' + o].est : undefined,
      missing: has ? '' : fam
        ? S.jobs['start-' + o] ? `No start picture for ${nameOf(o)} yet. Press Make the start picture below: it redraws ${nameOf(o)}'s hero picture facing left on flat magenta (about $${S.jobs['start-' + o].est.toFixed(2)}), checks it, and puts it in the game.`
        : `No start picture for ${nameOf(o)} yet. It needs ${st}: a large picture of ${nameOf(o)} facing left on a flat magenta background, made from the hero picture the way the start pictures of Tom, Grace, Rose and Deedee were (a start-<who> job in tools/art-library/wangen-jobs.json).`
        : `No start picture for ${nameOf(o)} yet. It needs ${st}, made from the monster's battle idle frame with tools/clip-bake/make_start.py ${o}.` };
  }

  const vid = Object.values(S.jobs).find(x => x && x.kind === 'video');
  const ROUTES = {
    wan: { name: 'Wan 3.0 through fal (the wan-gen Action, secret FAL_KEY)', endpoint: vid.endpoint, fit: vid.fit, frame_fields: vid.frame_fields, input: vid.input, est_per_s: vid.est_per_s },
    xai: { name: 'xAI Grok lite (the clip-gen Action, secret XAI_API_KEY)', model: 'grok-imagine-video-1.5-lite', res: '480p', dur: 3, rate: { '480p': .02, '720p': .03, '1080p': .14 } },
  };
  const anims = {};
  for (const a of A) {
    const ow = owners[a.owner], fam = ow.route === 'wan';
    // 1 the key the job and entry share: the clip the game plays now, else the body state, else the name
    let key = null;
    if (a.clip) key = dash(a.clip);
    else if (a.kind === 'state') key = a.owner + '-' + (BODY_ALIAS[a.state] || a.state);
    let ent = key ? S.E[key] : null;
    if (!ent && key && a.kind === 'state' && BODY_ALIAS[a.state]) ent = S.E[a.owner + '-' + a.state] || null;
    if (!ent && a.kind !== 'state') {
      const nm = norm(a.name.replace(/\s*\(wind-up\)$/, ''));
      ent = Object.values(S.E).find(x => x.owner === a.owner && x.nameNorm === nm && x.wind === (a.kind === 'wind')) || null;
    }
    const entKey = ent ? ent.key : key;
    let job = entKey ? (S.jobs[entKey] ? entKey : JOB_ALIAS[entKey] && S.jobs[JOB_ALIAS[entKey]] ? JOB_ALIAS[entKey] : null) : null;
    if (ent) used.entries.add(ent.key);
    const clipFile = a.clip && exists('data/clips/' + dash(a.clip) + '.js');
    const stampInfo = clipFile ? S.stamps[dash(a.clip)] : null;
    let made = madeBy(stampInfo);
    if (!fam && !(made && made.route === 'wan' && made.job === job)) job = null;   // wanch3: a monster has a Wan job only when that job made its clip (skeeter-bite)
    if (job) used.jobs.add(job);
    if (clipFile && !made && ent && ((S.artBy[ent.e.id] || {}).status === 'approved')) made = { route: 'xai', entry: ent.key, rev: 1 };   // baked before the stamps existed: the approved entry made it
    if (fam && made && made.route === 'wan' && made.job !== job && S.jobs[made.job]) { job = made.job; used.jobs.add(job); }   // rose-lava-xftr: the job that made the clip the game plays now (rose-cushion-kling for rose_lava) wins over the job named like the clip
    // movebench8: a staged family move's spec (data/moves/<slug>.json) names the video the stage plays over (body.clip); its job is that clip with dashes. The clip is kept
    // (the approved video stays) when the kit row names the same clip; nothing waits for a stage any more.
    const sp = fam && a.kind === 'move' ? G.SPECS['move:' + a.src.id] || null : null, stg = sp && sp.stage && sp.body && sp.body.clip ? { clip: sp.body.clip, job: dash(sp.body.clip), keep: a.clip === sp.body.clip } : null;
    if (stg && S.jobs[stg.job] && (!job || (!stg.keep && job !== stg.job))) { job = stg.job; used.jobs.add(job); }   // movestage3: a move whose row makes a NEW body (keep false) uses the row's job even when an older clip of the move was made by another job (rose_lava)
    // 2 the prompt
    let prompt = '', source = '', rev = 0, promptFile = null, laterTries = 0, madeNote = '';
    const ov = over[a.id];
    if (ov && ov.source === 'used' && ov.prompt) { prompt = ov.prompt; source = 'used'; rev = ov.rev || 1; }
    else if (job && !(made && made.route === 'xai' && ent)) {
      const files = jobPromptFiles(S.jobs[job]);
      let pick = files[files.length - 1];
      if (made && made.route === 'wan' && made.job === job) { const ok = files.filter(f => f.v <= made.rev); pick = ok.length ? ok[ok.length - 1] : files[0]; laterTries = files.filter(f => f.v > pick.v).length; madeNote = 'made by rev ' + made.rev; }
      prompt = rd(pick.file).trim(); source = 'job'; rev = clipFile && made && made.route === 'wan' ? made.rev : S.jobs[job].rev; promptFile = pick.file;
    } else if (ent) {
      prompt = ent.e.prompt.trim(); source = 'entry'; rev = (S.artBy[ent.e.id] || {}).promptRev || 0; promptFile = 'tools/art-library/clip-prompts.js (' + ent.e.id + ')';
    } else if (ov && ov.source === 'model-draft' && ov.prompt && !ov.notForUse) { prompt = ov.prompt; source = 'model-draft'; rev = ov.rev || 0; }
    else {
      const lr = a.kind === 'move' ? rows[norm(a.name)] : null;
      prompt = (fam && a.kind === 'state' && STATE_NAME[a.state] ? stateDraft(a, ow.patternHead) : fam ? personDraft(a, ow.patternHead) : foeDraft(a, ow.patternHead, ow.patternTail)).trim(); source = 'rule-draft'; rev = 0;
      void lr;
    }
    // 3 price (settings are the same for every animation of a route: see routes)
    let price, priceNote, pad = null;
    if (fam) {
      const j = ROUTES.wan; price = Math.round(j.est_per_s[j.input.resolution] * j.input.duration * 100) / 100; priceNote = 'Wan 3.0, ' + j.input.duration + ' seconds at ' + j.input.resolution;
      pad = (job && S.jobs[job].pad) || null;
    } else { const j = ROUTES.xai; price = Math.round((j.rate[j.res] * j.dur + .01) * 100) / 100; priceNote = 'xAI Grok lite, ' + j.dur + ' seconds at ' + j.res; }
    // 4 the recipe
    let rname;
    if (a.kind === 'state') rname = recipe.byBodyState[a.state] || 'pose';
    else if (a.kind === 'wind') rname = 'windup';
    else rname = recipe.at1x.some(k => entKey && entKey.endsWith('-' + k)) ? 'strike1x' : 'strike';
    const newClip = stg && !stg.keep ? stg.clip : a.clip ? a.clip : stg ? stg.clip : ent ? under(ent.key) : a.kind === 'state' ? a.owner + '_' + a.state : a.kind === 'wind' ? a.owner + '_' + a.id.split(':')[2] + '_wind' : a.kind === 'answer' ? a.owner + '_' + a.src.id + '_counter' : a.owner + '_' + (a.kind === 'move' ? a.src.id : a.id.split(':')[2]);
    const lr = a.kind === 'move' ? rows[norm(a.name)] : null;
    const start = ow.start;
    anims[a.id] = {
      owner: a.owner, kind: a.kind, name: a.name, state: a.state || undefined, clip: a.clip || null, video: !!clipFile,
      newClip, route: ow.route, job, entry: ent ? ent.e.id : null, prompt, promptSource: source, promptRev: rev, promptFile,
      madeBy: made ? (made.route === 'wan' ? 'wan job ' + made.job + ' rev ' + made.rev : 'entry clip-' + made.entry + ' v' + made.rev) : null, laterTries: laterTries || undefined, madeNote: madeNote || undefined,
      start, canStart: !start && !!ow.canStart, startWho: !start && ow.canStart ? a.owner : undefined, startCost: !start && ow.canStart ? ow.startCost : undefined, canMake: !!start && ow.figRows != null, missing: !start ? ow.missing : ow.figRows == null ? 'The sprite height (figRows) of ' + ow.name + ' is not known yet, so a take cannot be cut into a clip.' : '',
      price, priceNote, pad: pad || undefined, recipe: rname, figRows: ow.figRows, brief: briefOf(a, lr), what: a.what, slug: slug(a.id),
    };
  }
  // jobs and entries that match no animation of the guide (listed, so a drift is seen in the test and the plan)
  const unmapped = {
    jobs: wanJobs.filter(j => !used.jobs.has(j)).sort(),
    entries: Object.keys(S.E).filter(k => !used.entries.has(k)).sort(),
  };
  const counts = { total: A.length, video: Object.values(anims).filter(x => x.video).length };
  counts.none = counts.total - counts.video;
  counts.withPrompt = Object.values(anims).filter(x => x.promptSource !== 'rule-draft').length;
  counts.canMake = Object.values(anims).filter(x => x.canMake).length;
  return { about: 'GENERATED by tools/guidegen/build_map.js (claude/guidegen-plan.md); do not hand-edit. One row per animation id of battle-guide.html.', counts, unmapped, routes: ROUTES, recipes: recipe.recipes, owners, anims };
}

module.exports = { build, listAnims, loadGame };
if (require.main === module) {
  const out = path.join(ROOT, 'data/guide-anims.json'), txt = JSON.stringify(build(), null, 1) + '\n';
  if (process.argv.includes('--stdout')) { fs.writeSync(1, txt); process.exit(0); }
  if (process.argv.includes('--check')) { const same = exists('data/guide-anims.json') && rd('data/guide-anims.json') === txt; console.log(same ? 'data/guide-anims.json is current' : 'data/guide-anims.json is OLD: run node tools/guidegen/build_map.js'); process.exit(same ? 0 : 1); }
  fs.writeFileSync(out, txt);
  const d = JSON.parse(txt);
  console.log('wrote data/guide-anims.json:', JSON.stringify(d.counts), 'unmapped jobs', d.unmapped.jobs.length, 'entries', d.unmapped.entries.length);
}
