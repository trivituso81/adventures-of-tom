/* The Adventures of Tom: service worker (Load time standing rule in CLAUDE.md, added 2026-11-02, build sw1).
   Why: the game is about 230 MB of scripts, art and baked voice. iOS drops Safari's own cache for a home-screen app whenever
   it likes, so everything came down again. Cache Storage (this file) is kept, so a file is downloaded once per version.
   How each request is answered:
   - A page (index.html, voices.html): always the network, so a new push shows at once. The last good copy is kept
     only so the game can still start with no signal.
   - A file whose address carries ?v= (nearly all art, plus 120 scripts including the 37 MB of baked voice): cache first. A bumped
     tag is a new address, so it downloads fresh; the old copy of the same file is deleted. This is why every change must bump
     its tag (docs/WORKFLOW.md; tools/tag_check.py fails smoke when one is forgotten).
   - A file with no ?v= (184 scripts, the chapter voice files, music, art/welcome.webp): the saved copy is used only after the
     server confirms it is unchanged (If-None-Match or If-Modified-Since, a tiny 304 answer). A changed file downloads.
   - A request made with cache:'reload' (the welcome-page RELOAD button) or 'no-store': straight to the network. 'reload' also
     refreshes the saved copy, so RELOAD still fixes a stale script.
   Last resort: change SW_VER to throw away every saved file on every device, then every file downloads again. */
const SW_VER='sw1';
const CACHE='aot-'+SW_VER;
const SCOPE=self.registration.scope;   // e.g. https://trivituso81.github.io/adventures-of-tom/

self.addEventListener('install',()=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k.startsWith('aot-')&&k!==CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

const storable=r=>r.status===200&&r.type==='basic'&&!r.redirected;
const MATCH={ignoreVary:true};

// Delete the old copy of any versioned file once a newer address of the same file is saved (keeps storage to one version each).
let pruneAt=0, pruning=null;
function prune() {
  const now=Date.now();
  if(pruning||now-pruneAt<15000) return pruning||Promise.resolve();
  pruneAt=now;
  pruning=(async()=>{
    const c=await caches.open(CACHE), keys=await c.keys(), last=new Map(), drop=[];
    for(const k of keys) {
      const u=new URL(k.url); if(!u.searchParams.has('v')) continue;
      if(last.has(u.pathname)) drop.push(last.get(u.pathname));
      last.set(u.pathname,k);
    }
    for(const k of drop) await c.delete(k);
  })().catch(()=>{}).then(()=>{ pruning=null; });
  return pruning;
}
const keep=(key,r)=>caches.open(CACHE).then(c=>c.put(key,r)).then(prune).catch(()=>{});

async function page(e,req,url) {
  const key=url.origin+url.pathname;   // no ?r=... so one saved copy serves every RELOAD address
  try {
    const r=await fetch(req,{cache:'no-cache'});
    if(r.ok&&r.type==='basic'&&!r.redirected) e.waitUntil(keep(key,r.clone()));
    return r;
  } catch(err) {
    const hit=await (await caches.open(CACHE)).match(key,MATCH);
    if(hit) return hit;
    throw err;
  }
}

async function network(e,req,url) {   // download, answer, and keep a copy
  const r=await fetch(req);
  if(storable(r)) e.waitUntil(keep(url.href,r.clone()));
  return r;
}

async function versioned(e,req,url) {
  const hit=await (await caches.open(CACHE)).match(url.href,MATCH);
  return hit||network(e,req,url);
}

async function revalidate(e,req,url) {
  const hit=await (await caches.open(CACHE)).match(url.href,MATCH);
  if(!hit) return network(e,req,url);
  const et=hit.headers.get('etag'), lm=hit.headers.get('last-modified');
  if(!et&&!lm) return network(e,req,url);   // nothing to ask "unchanged?" with, so always take a fresh copy
  const h=new Headers(); if(et) h.set('If-None-Match',et); else h.set('If-Modified-Since',lm);
  try {
    const r=await fetch(url.href,{headers:h});
    if(r.status===304) return hit;
    if(storable(r)) e.waitUntil(keep(url.href,r.clone()));
    return r;
  } catch(err) { return hit; }   // no signal: the saved copy
}

self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin||!url.href.startsWith(SCOPE)||req.headers.has('range')) return;
  if(req.mode==='navigate'||req.destination==='document') { e.respondWith(page(e,req,url)); return; }
  if(req.cache==='no-store') return;
  if(req.cache==='reload') { e.respondWith(network(e,req,url)); return; }
  e.respondWith(url.searchParams.has('v')?versioned(e,req,url):revalidate(e,req,url));
});

// The page lists what it loaded; whatever is not saved yet is fetched (normally from the browser's own cache) so the next
// load is served from here. Four at a time, and the page tells us when done.
self.addEventListener('message',e=>{
  const d=e.data||{};
  if(d.type==='precache'&&Array.isArray(d.urls)) e.waitUntil(precache(d.urls));
});
async function precache(list) {
  const c=await caches.open(CACHE), todo=[], seen=new Set();
  for(const u of list) {
    let url; try { url=new URL(u,SCOPE); } catch(err) { continue; }
    if(url.origin!==location.origin||!url.href.startsWith(SCOPE)||/(\/|\.html)$/.test(url.pathname)||seen.has(url.href)) continue;
    seen.add(url.href);
    if(!(await c.match(url.href,MATCH))) todo.push(url.href);
  }
  let i=0;
  const worker=async()=>{
    while(i<todo.length) {
      const u=todo[i++];
      try { const r=await fetch(u); if(storable(r)) await c.put(u,r); } catch(err) {}
    }
  };
  await Promise.all([worker(),worker(),worker(),worker()]);
  await prune();
  for(const cl of await self.clients.matchAll()) cl.postMessage({type:'precache-done',added:todo.length,asked:list.length});
}
