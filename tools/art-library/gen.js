#!/usr/bin/env node
// Art Library step B1: one image request to the xAI image API.
// Usage: XAI_KEY=<key> node tools/art-library/gen.js "<prompt>" [ref1.png ref2.png ...] [--out out.png] [--ar 3:4] [--res 1k] [--base URL]
// The key is read from the environment only. It is never printed or written anywhere.
// Request shape (docs.x.ai, checked 2026-11-02):
//   no refs : POST /v1/images/generations {model,prompt,n,aspect_ratio,resolution,response_format}
//   refs    : POST /v1/images/edits {model,prompt,images:[{type:'image_url',url:<data URI>}] (max 5, in order),aspect_ratio,resolution,response_format}
// Response: data[0].b64_json or data[0].url (both handled; the edit response shape is not shown in the docs).
const fs = require('fs');
const MODEL = 'grok-imagine-image-2.0';
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); if (i < 0) return def; const v = args[i + 1]; args.splice(i, 2); return v; };
const out = opt('--out', 'art-out.png'), ar = opt('--ar', '3:4'), res = opt('--res', '1k');
const base = opt('--base', 'https://api.x.ai');
const prompt = args.shift();
const refs = args;
if (!prompt) { console.error('usage: gen.js "<prompt>" [refs...] [--out f] [--ar r] [--res 1k|2k] [--base url]'); process.exit(2); }
if (refs.length > 5) { console.error('at most 5 reference images'); process.exit(2); }
const key = process.env.XAI_KEY || '';
const mime = f => /\.jpe?g$/i.test(f) ? 'image/jpeg' : /\.webp$/i.test(f) ? 'image/webp' : 'image/png';
function buildRequest(prompt, refs, ar, res) {
  const body = { model: MODEL, prompt, n: 1, aspect_ratio: ar, resolution: res, response_format: 'b64_json' };
  if (!refs.length) return { path: '/v1/images/generations', body };
  body.images = refs.map(f => ({ type: 'image_url', url: 'data:' + mime(f) + ';base64,' + fs.readFileSync(f).toString('base64') }));
  return { path: '/v1/images/edits', body };
}
module.exports = { buildRequest, MODEL };
if (require.main === module) (async () => {
  const { path, body } = buildRequest(prompt, refs, ar, res);
  const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify(body) });
  const txt = await r.text();
  let j = null; try { j = JSON.parse(txt); } catch (e) {}
  console.log('POST', path, 'refs', refs.length, '->', r.status);
  if (!r.ok) { console.log((txt || '').slice(0, 400).replace(key || '\u0000', '[key]')); process.exit(r.status === 401 ? 3 : 1); }
  const d = j && j.data && j.data[0];
  if (!d) { console.log('no data in response', txt.slice(0, 300)); process.exit(1); }
  const buf = d.b64_json ? Buffer.from(d.b64_json, 'base64') : Buffer.from(await (await fetch(d.url)).arrayBuffer());
  fs.writeFileSync(out, buf); console.log('wrote', out, buf.length, 'bytes');
})().catch(e => { console.error('error', e.message); process.exit(1); });
