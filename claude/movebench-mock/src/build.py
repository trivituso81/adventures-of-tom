#!/usr/bin/env python3
"""Builds the Move Workbench mock (claude/movebench-plan.md section d): four static pages, one per example animation.
Usage, from the repo root:  python3 claude/movebench-mock/src/build.py          writes claude/movebench-mock/<name>.html and dash-<name>.html
The pictures are made by src/shoot.py (Chromium). Nothing here is loaded by the game or by any admin page.
The preview pictures in img/ are real frames of the game's own engine (Battle Lab, the "In a fight" address), not drawings."""
import os, html
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = html.escape

CSS = r"""
:root{--bg:#0f1f24;--surface:#16303a;--card:#1a3742;--line:#28505c;--text:#f1fbfa;--muted:#9cc3c4;--accent:#ffd34d;--on-accent:#241b00;--good:#2fb06a;--prob:#b4414f;--prob-text:#ff9aa5;--btn:#2c5b68;--well:#0a161a;
 --body:#7cc4f2;--stage:#d7a4f5;--fx:#ff8c5a;--snd:#8fe3a6;--hit:#ffd34d}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--text);font:15px/1.4 -apple-system,system-ui,"Segoe UI",Roboto,sans-serif}
body{display:flex;flex-direction:column;overflow:hidden}
button{font:inherit;border:0;border-radius:12px;padding:8px 12px;min-height:44px;background:var(--btn);color:#fff;font-weight:600}
button.gold{background:var(--accent);color:var(--on-accent)}
button.ghost{background:none;border:1px solid var(--line)}
button.sm{min-height:36px;padding:5px 10px;font-size:13px;border-radius:10px}
.gh{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 10px 0 14px;border-bottom:1px solid var(--line)}
.gh h1{font-size:18px;margin:0;white-space:nowrap}
.pill{padding:2px 10px;border:1px solid #4fae7a;border-radius:13px;background:#143324;color:#9be3bb;font:700 12px/1.5 ui-monospace,Menlo,monospace;white-space:nowrap}
.gh .sp{flex:1}
.gh .hb{display:flex;align-items:center;justify-content:center;min-width:44px;height:38px;padding:0 10px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font-weight:700;font-size:13px}
.tabs{display:none;flex:none;gap:4px;padding:5px 8px;background:var(--well);border-bottom:1px solid var(--line)}
.tabs span{flex:0 0 auto;padding:7px 16px;border-radius:10px;color:var(--muted);font-size:13px;font-weight:700}
.tabs span.on{background:var(--accent);color:var(--on-accent)}
/* ---------- the workbench: stacked when the page is upright, side by side when it is sideways ---------- */
.wb{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:1fr;grid-template-rows:auto auto 1fr auto;grid-template-areas:"top" "prev" "set" "fin"}
.wl{display:none}
.wtop{grid-area:top;display:flex;align-items:center;gap:8px;padding:5px 10px;border-bottom:1px solid var(--line);min-width:0}
.wtop .back{color:var(--accent);font-weight:700;font-size:14px;white-space:nowrap}
.wtop .ttl{flex:1 1 auto;min-width:0}
.wtop .ttl b{display:block;font-size:16px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wtop .ttl small{display:block;color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{flex:none;font-size:12px;font-weight:800;padding:4px 9px;border-radius:999px;border:1px solid var(--line);background:var(--well);white-space:nowrap}
.st i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:var(--muted)}
.st.prog{border-color:#8a6d10;color:#ffe08a}.st.prog i{background:var(--accent)}
.st.fin{border-color:#2a7a52;color:#9be3bb}.st.fin i{background:var(--good)}
.st.wait{border-color:#7a3a44;color:var(--prob-text)}.st.wait i{background:var(--prob-text)}
.wprev{grid-area:prev;background:var(--well);border-bottom:1px solid var(--line);min-width:0}
.cv{position:relative;aspect-ratio:16/9;background:#000 center/cover no-repeat;max-height:44vh;margin:0 auto}
.cv .tag{position:absolute;left:6px;top:6px;font-size:10px;font-weight:800;letter-spacing:.06em;padding:3px 7px;border-radius:6px;background:rgba(10,22,26,.82);color:var(--muted)}
.cv .warn{position:absolute;right:6px;top:6px;font-size:10px;font-weight:800;letter-spacing:.04em;padding:3px 7px;border-radius:6px;background:#ff5bd2;color:#2a0020}
.cv .ph{position:absolute;border:2px dashed #ff5bd2;background:rgba(255,91,210,.16);color:#ffd0f3;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.15;padding:2px;border-radius:6px}
.ctl{display:flex;align-items:center;gap:6px;padding:6px 8px}
.ctl .play{min-width:74px}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--well)}
.seg span{padding:8px 11px;font-size:13px;font-weight:700;color:var(--muted);white-space:nowrap}
.seg span.on{background:var(--accent);color:var(--on-accent)}
.ctl .tm{margin-left:auto;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.tog{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:var(--text);white-space:nowrap}
.tog i{width:34px;height:20px;border-radius:10px;background:var(--good);position:relative;display:inline-block}
.tog i::after{content:"";position:absolute;right:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff}
.tog.off i{background:var(--line)}.tog.off i::after{right:auto;left:2px}
/* the timeline: one lane per layer, the same clock for all of them */
.tl{position:relative;padding:2px 8px 8px}
.ln{display:flex;align-items:center;height:18px;margin-top:3px}
.ln .lb{flex:none;width:54px;white-space:nowrap;overflow:hidden;font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)}
.ln .tr{position:relative;flex:1 1 auto;height:100%;background:#12272e;border-radius:5px}
.ln .it{position:absolute;top:2px;bottom:2px;border-radius:4px;font-size:10px;font-weight:700;line-height:14px;padding:0 4px;color:#08161a;white-space:nowrap;overflow:hidden}
.ln.body .it{background:var(--body)}.ln.stage .it{background:var(--stage)}.ln.fx .it{background:var(--fx)}.ln.snd .it{background:var(--snd);border-radius:7px;width:auto!important;padding:0 6px}
.ln .it.need{background:repeating-linear-gradient(45deg,#ff5bd2,#ff5bd2 5px,#c23a9c 5px,#c23a9c 10px);color:#fff}
.ln .it.hold{background:repeating-linear-gradient(90deg,#3d6f8a,#3d6f8a 4px,#2c5468 4px,#2c5468 8px);color:#d6efff}
.tl .hit,.tl .head{position:absolute;top:0;bottom:6px;width:0;margin-left:62px}
.tl .hw{position:absolute;left:62px;right:8px;top:0;bottom:6px;pointer-events:none}
.tl .hw b{position:absolute;top:0;bottom:0;width:2px;background:var(--hit)}
.tl .hw b::after{content:"HIT";position:absolute;top:-1px;right:5px;font-size:9px;font-weight:900;color:var(--hit)}
.tl .hw u{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.5)}
.tl .hw u::after{content:"";position:absolute;top:-2px;left:-5px;border:6px solid transparent;border-top-color:#fff}
.sc{display:flex;justify-content:space-between;margin:1px 0 0 62px;font-size:9px;color:var(--muted);font-variant-numeric:tabular-nums}
.wset{grid-area:set;overflow-y:auto;padding:8px 10px 14px;min-width:0}
.jump{display:flex;gap:6px;overflow:hidden;margin:0 0 8px}
.jump span{flex:none;font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;background:var(--well);border:1px solid var(--line);white-space:nowrap}
.jump span b{color:var(--accent)}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:0 0 10px;break-inside:avoid}
.card h3{display:flex;align-items:center;gap:8px;margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.card h3 i{width:10px;height:10px;border-radius:3px}
.card h3 em{margin-left:auto;font-style:normal;letter-spacing:0;text-transform:none;font-size:12px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;padding:7px 0;border-top:1px solid rgba(40,80,92,.6)}
.row:first-of-type{border-top:0;padding-top:0}
.row .q{flex:1 1 130px;min-width:0;font-weight:700}
.row .q small{display:block;font-weight:400;color:var(--muted);font-size:12px}
.row .a{flex:0 1 auto;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.val{font-weight:800;color:var(--accent);font-variant-numeric:tabular-nums}
.step{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid rgba(40,80,92,.6)}
.step:first-of-type{border-top:0;padding-top:0}
.step .t{flex:none;width:58px;text-align:center;font-size:12px;font-weight:800;padding:5px 2px;border-radius:8px;background:var(--well);border:1px solid var(--line);font-variant-numeric:tabular-nums}
.step .t small{display:block;font-weight:600;color:var(--muted);font-size:10px}
.step .d{flex:1 1 auto;min-width:0}
.step .d b{display:block}
.step .d span{display:block;font-size:13px;color:var(--muted)}
.step .sw{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.25)}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
.chips u{text-decoration:none;font-size:12px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--well);border:1px solid var(--line);white-space:nowrap}
.add{display:block;width:100%;margin-top:8px;background:none;border:1px dashed var(--line);color:var(--accent)}
.objs{display:grid;grid-template-columns:repeat(auto-fill,minmax(124px,1fr));gap:8px}
.obj{border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--well);font-size:13px}
.obj .pic{height:54px;border-radius:8px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;font-size:22px;background:#1d3d49}
.obj.need{border:2px dashed #ff5bd2}.obj.need .pic{background:rgba(255,91,210,.16);color:#ffd0f3;font-size:11px;font-weight:800;text-align:center;line-height:1.2}
.obj b{display:block}.obj small{color:var(--muted)}.obj .lnk{display:block;margin-top:4px;color:var(--accent);font-weight:700;font-size:12px}
.startp{display:flex;gap:10px;align-items:flex-start}
.startp img,.startp .nop{flex:none;width:62px;height:84px;border-radius:10px;object-fit:cover;object-position:top;background:#1d3d49}
.startp .nop{border:2px dashed #ff5bd2;background:rgba(255,91,210,.16);color:#ffd0f3;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;text-align:center;padding:3px}
.startp .tx{flex:1 1 auto;min-width:0;font-size:13px}
.startp .tx b{font-size:15px}
.prompt{margin:8px 0 0;padding:8px 10px;border-radius:10px;background:var(--well);border:1px solid var(--line);font-size:12px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;padding-bottom:0;border-bottom-width:8px;border-bottom-color:var(--well)}
.btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.note{font-size:12px;color:var(--muted);margin:6px 0 0}
.wfin{grid-area:fin;display:flex;align-items:center;gap:8px;padding:8px 10px;border-top:1px solid var(--line);background:var(--surface)}
.wfin .say{flex:1 1 auto;min-width:0;font-size:12px;color:var(--muted);line-height:1.25}
.wfin .say b{display:block;color:var(--text);font-size:13px}
.wfin button{flex:none}
.cols{columns:1}
/* a phone held upright while a setting is changed: the preview shrinks to a small player that stays on screen */
body.mini .cv{width:46%;margin:0;float:left}
body.mini .cv .tag,body.mini .cv .warn{display:none}
body.mini .ctl{flex-wrap:wrap;padding-left:10px}
body.mini .ctl .tm{margin-left:0}
body.mini .tl{clear:both}
body.mini .ln:not(.pick){display:none}
body.mini .jump{display:none}
/* the whole page at once (for the long picture): nothing scrolls, nothing is cut */
body.long{overflow:visible;height:auto}
body.long .wb{display:block}
body.long .wset{overflow:visible}
body.long .cv{max-height:none}
/* sideways (any size): preview on the left, settings on the right */
@media (min-aspect-ratio:1/1){
 .wb{grid-template-columns:minmax(0,54fr) minmax(0,46fr);grid-template-rows:auto 1fr auto;grid-template-areas:"top top" "prev set" "prev fin"}
 .wprev{border-bottom:0;border-right:1px solid var(--line);overflow:hidden}
 .cv{max-height:none}
}
@media (min-aspect-ratio:1/1) and (max-height:500px){
 .wb{grid-template-areas:"top top" "prev set" "fin fin"}
 .gh{height:40px}.gh h1{font-size:16px}.gh .hb{height:32px}
 .wtop{padding:3px 10px}.wtop .ttl small{display:none}
 .ctl{padding:4px 6px;gap:4px}.ctl button{min-height:36px;padding:4px 10px}.seg span{padding:6px 9px}
 .cv{max-height:190px}
 .ln{height:13px;margin-top:2px}.ln .it{line-height:10px;font-size:9px}.sc{display:none}.tl{padding-bottom:4px}
 .wfin{padding:5px 8px}.wfin button{min-height:38px;padding:4px 10px}.wfin .say{font-size:11px}.wfin .say b{display:inline;font-size:12px;margin-right:6px}
 .card{padding:8px 10px;margin-bottom:8px}
}
/* the wide monitor (a pane of the Admin Dashboard): the list stays on the left, settings in two columns */
@media (min-width:1300px){
 .tabs{display:flex}
 .wb{grid-template-columns:300px minmax(0,46fr) minmax(0,54fr);grid-template-areas:"list top top" "list prev set" "list prev fin"}
 .wl{display:block;grid-area:list;border-right:1px solid var(--line);overflow:hidden;padding:10px}
 .cols{columns:2;column-gap:10px}
 .ln{height:24px;margin-top:4px}.ln .it{line-height:20px;font-size:12px}.ln .lb{width:70px;font-size:11px}
 .tl .hw{left:78px}.sc{margin-left:78px;font-size:11px}
 .wprev{padding:10px;overflow:auto}.cv{border-radius:10px}
 .wtop{padding:8px 14px}.wtop .ttl b{font-size:19px}
}
.wl .prog{font-size:13px;color:var(--muted);margin:0 0 4px}.wl .prog b{color:var(--text);font-size:16px}
.bar{height:8px;border-radius:4px;background:var(--well);overflow:hidden;margin:0 0 10px;display:flex}
.bar i{background:var(--good)}.bar u{background:var(--accent)}
.flt{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 10px}
.flt span{font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;border:1px solid var(--line);background:var(--well)}
.flt span.on{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.grp{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:10px 2px 6px}
.li{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:var(--card);margin:0 0 6px;font-size:14px}
.li.on{outline:2px solid var(--accent)}
.li b{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.li small{flex:none;color:var(--muted);font-size:11px}
.li i{flex:none;width:9px;height:9px;border-radius:50%;background:var(--line)}
.li i.p{background:var(--accent)}.li i.f{background:var(--good)}.li i.w{background:var(--prob-text)}
.ver{font-size:13px}.ver div{display:flex;gap:8px;padding:5px 0;border-top:1px solid rgba(40,80,92,.6)}.ver div:first-child{border-top:0}
.ver b{flex:1}.ver span{color:var(--muted)}.ver u{color:var(--accent);text-decoration:none;font-weight:700}
.onlywide{display:none}
@media (min-width:1300px){.onlywide{display:block}}
"""

def seg(opts, on):
    return '<span class="seg">' + ''.join('<span%s>%s</span>' % (' class="on"' if o == on else '', E(o)) for o in opts) + '</span>'

def lane(kind, label, items, pick=False):
    its = ''.join('<span class="it%s" style="left:%.1f%%;width:%.1f%%">%s</span>' % ((' ' + c) if c else '', a, w, E(t)) for (a, w, t, c) in items)
    return '<div class="ln %s%s"><span class="lb">%s</span><span class="tr">%s</span></div>' % (kind, ' pick' if pick else '', E(label), its)

def timeline(A):
    L = A['len']
    out = ['<div class="tl">']
    for kind, label, items in A['lanes']:
        out.append(lane(kind, label, [(100 * a / L, max(1.6, 100 * w / L), t, c) for (a, w, t, c) in items], pick=(kind == 'body')))
    marks = ''.join('<b style="left:%.1f%%"></b>' % (100 * h / L) for h in A['hits']) + '<u style="left:%.1f%%"></u>' % (100 * A['head'] / L)
    out.append('<div class="hw">%s</div>' % marks)
    ticks = [0, L / 4, L / 2, 3 * L / 4, L]
    out.append('<div class="sc">' + ''.join('<span>%.1f s</span>' % t for t in ticks) + '</div></div>')
    return ''.join(out)

def card(color, title, right, body):
    return '<div class="card"><h3><i style="background:%s"></i>%s%s</h3>%s</div>' % (color, E(title), ('<em>%s</em>' % E(right)) if right else '', body)

def row(q, small, a):
    return '<div class="row"><div class="q">%s%s</div><div class="a">%s</div></div>' % (E(q), ('<small>%s</small>' % E(small)) if small else '', a)

def step(t, tsmall, title, text, sw=None, chips=()):
    return ('<div class="step"><div class="t">%s<small>%s</small></div><div class="d"><b>%s</b><span>%s</span>%s</div>%s<button class="ghost sm">Change</button></div>'
            % (E(t), E(tsmall), E(title), E(text), ('<div class="chips">' + ''.join('<u>%s</u>' % E(c) for c in chips) + '</div>') if chips else '',
               ('<span class="sw" style="background:%s"></span>' % sw) if sw else ''))

def obj(icon, name, small, need=None):
    if need:
        return '<div class="obj need"><div class="pic">NO PICTURE YET<br>shown as a pink box</div><b>%s</b><small>%s</small><span class="lnk">%s</span></div>' % (E(name), E(small), E(need))
    return '<div class="obj"><div class="pic">%s</div><b>%s</b><small>%s</small></div>' % (icon, E(name), E(small))

def listpane(A):
    rows = ''
    for g, items in A['list']:
        rows += '<div class="grp">%s</div>' % E(g)
        for name, cls, word in items:
            rows += '<div class="li%s"><i class="%s"></i><b>%s</b><small>%s</small></div>' % (' on' if name == A['name'] else '', cls, E(name), E(word))
    return ('<aside class="wl"><p class="prog"><b>Finished 14 of 679</b><br>9 in progress, 3 waiting, 653 to do</p><div class="bar"><i style="width:2.1%"></i><u style="width:1.3%"></u></div>'
            '<div class="flt"><span class="on">All</span><span>To do</span><span>In progress</span><span>Waiting</span><span>Finished</span></div>' + rows + '</aside>')

def page(A, cls=''):
    st = {'prog': 'In progress', 'fin': 'Finished', 'wait': 'Waiting', '': 'Not looked at'}
    cv_extra = ''.join('<span class="ph" style="left:%s;top:%s;width:%s;height:%s">%s</span>' % p for p in A.get('ph', []))
    if A.get('warn'): cv_extra += '<span class="warn">%s</span>' % E(A['warn'])
    jump = ''.join('<span>%s%s</span>' % (E(n), (' <b>%s</b>' % E(c)) if c else '') for n, c in A['jump'])
    h = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Move Workbench mock: %s</title><style>%s</style></head>' % (E(A['name']), CSS),
         '<body class="%s">' % cls,
         '<header class="gh"><h1>Battle Guide</h1><span class="pill">build movebench8</span><span class="sp"></span><span class="hb">Search</span><span class="hb">Admin</span></header>',
         '<nav class="tabs"><span>Rules</span><span>Family</span><span>Monsters</span><span>Statuses</span><span class="on">Animations</span></nav>',
         '<main class="wb">', listpane(A),
         '<div class="wtop"><span class="back">&lsaquo; %s</span><div class="ttl"><b>%s</b><small>%s</small></div><span class="st %s"><i></i>%s</span></div>' % (E(A['owner']), E(A['name']), E(A['sub']), A['state'], E(A.get('stword') or st[A['state']])),
         '<section class="wprev"><div class="cv" style="background-image:url(img/%s)"><span class="tag">PREVIEW: THE WHOLE MOVE, PLAYED BY THE GAME</span>%s</div>' % (A['img'], cv_extra),
         '<div class="ctl"><button class="gold play">&#9654; Play</button>%s<span class="tog%s"><i></i>Loop</span><span class="tm">%s</span></div>' % (seg(['1x', '½', '¼'], A.get('speed', '1x')), '' if A.get('loop', True) else ' off', E(A['clock'])),
         timeline(A),
         '<div class="onlywide" style="padding:6px 0 0">%s</div>' % A.get('wide', ''),
         '</section>',
         '<section class="wset"><div class="jump">%s</div><div class="cols">%s</div></section>' % (jump, ''.join(A['cards'])),
         '<footer class="wfin">%s</footer>' % A['fin'],
         '</main></body></html>']
    return ''.join(h)

VERS = ('<div class="card" style="margin:0"><h3><i style="background:var(--muted)"></i>Earlier versions</h3><div class="ver">'
        '<div><b>Today 5:12 pm, you</b><span>freeze on the hit: Short</span><u>Bring back</u></div>'
        '<div><b>Today 4:40 pm, you</b><span>added Brass rings</span><u>Bring back</u></div>'
        '<div><b>Nov 26, Claude</b><span>copied from the old files</span><u>Bring back</u></div></div></div>')

FAM = [('Tom: Frequent Flier', [('Lounge Pass Flex', 'p', 'In progress'), ('Zone One Blockade', 'f', 'Finished'), ('Suite Door Slide', '', 'To do'), ('Tarmac Porsche Transfer', 'w', 'Waiting on 2 pictures')]),
       ('Tom: Gamer', [('Cartridge Blow', 'f', 'Finished'), ('Controller Toss', 'p', 'In progress'), ('Winged Shell Lock-On', '', 'To do'), ('Konami Code', '', 'No video yet')]),
       ('Tom: standing poses', [('Idle (standing and breathing)', 'f', 'Finished'), ('Guard', 'f', 'Finished'), ('Getting hit', '', 'To do'), ('Dodge', '', 'To do'), ('Knocked out', '', 'To do'), ('Victory', '', 'To do'), ('Running in', '', 'To do')])]
DEE = [('Deedee: Neat Freak', [('Windex Spritz', 'f', 'Finished'), ('Wet-Floor Hazard', '', 'To do'), ('"Hand Me My Glasses" Scrub', '', 'No video yet'), ('50-Year Dust Tsunami', '', 'To do')]),
       ('Deedee: standing poses', [('Idle (standing and breathing)', 'f', 'Finished'), ('Guard', '', 'To do'), ('Getting hit', '', 'To do'), ('Dodge', '', 'To do'), ('Knocked out', 'p', 'In progress'), ('Victory', '', 'To do'), ('Running in', '', 'To do')])]
MUD = [('Mudling: attacks', [('Wobble', 'f', 'Finished'), ('Mud Pie (wind-up)', 'f', 'Finished'), ('Mud Pie', 'f', 'Finished')]),
       ('Mudling: standing poses', [('Idle', 'f', 'Finished'), ('Getting hit', '', 'To do'), ('Slipping', '', 'To do'), ('Defeated', '', 'To do')]),
       ('Skeeter Swarm: attacks', [('Needle Dive', '', 'No video yet'), ('Buzz Off', '', 'No video yet')])]

BODY_C, TIME_C, STAGE_C, FX_C, SND_C = 'var(--body)', 'var(--hit)', 'var(--stage)', 'var(--fx)', 'var(--snd)'

def anims():
    A = {}
    # ---------- 1. a Basic: Tom, Lounge Pass Flex ----------
    A['basic'] = dict(owner='Tom', name='Lounge Pass Flex', sub='Basic. Runs 3.1 s (target 2 to 3 s). Used on one monster.', state='prog', img='preview-basic.jpg',
        len=3.1, head=1.95, hits=[1.87], clock='1.9 of 3.1 s', list=FAM, wide=VERS,
        lanes=[('body', 'Video', [(0, 2.81, "Tom's video, take 6", '')]), ('stage', 'Stage', [(1.87, 1.1, 'Words: NOT ON THE LIST', '')]),
               ('fx', 'Effects', [(1.87, .6, 'Brass rings', ''), (2.5, .5, 'Eyes On Me', '')]), ('snd', 'Sound', [(.9, .16, 'ding', '')])],
        jump=[('Video', ''), ('Timing', ''), ('Stage', '1'), ('Effects', '2'), ('Sound', '1')],
        cards=[
          card(BODY_C, 'Body video', 'take 6 is in the game',
               '<div class="startp"><img src="img/start-tom.jpg" alt=""><div class="tx"><b>Starts from Tom\'s standard picture</b><br>Holds: the Sky Club pass (the one thing in his hand)<br>Wears: the metal brag tag, clipped to his jacket</div></div>'
               '<div class="prompt">MOTION: He takes two brisk steps in place, tilts his chin up, flicks the pass forward once with a snooty wrist, then settles back to his starting stance and holds it.</div>'
               '<div class="btns"><button class="sm">Make another ($0.50)</button><button class="ghost sm">Edit this prompt</button><button class="ghost sm">Compare the 6 takes</button><button class="ghost sm">Change what he holds</button></div>'),
          card(TIME_C, 'Timing', '',
               row('The hit lands', 'the moment the swat connects', '<span class="val">1.9 s</span><button class="sm">Set to where the preview is</button>') +
               row('Freeze on the hit', 'everyone holds still for a beat', seg(['None', 'Short', 'Medium', 'Long'], 'Short')) +
               row('Screen shake', '', seg(['None', 'Light', 'Medium', 'Heavy'], 'None')) +
               row('How he gets there', '', seg(['Stays in place', 'Runs to the monster'], 'Stays in place'))),
          card(STAGE_C, 'Stage and objects', '1 step',
               step('1.9 s', 'at the hit', 'Words on screen: NOT ON THE LIST', 'Over the monster, gold, stays 1.1 s', '#f1d58c') +
               '<button class="add">+ Add a step (words, an object, a shake, a flash...)</button>'),
          card(FX_C, 'Effects', '2 of the 37',
               step('1.9 s', 'at the hit', 'Brass rings', 'On the monster', '#d7a4f5', ('Shape: rings', 'How many: 3', 'Hits: one monster')) +
               step('2.5 s', '0.6 s after', 'Status badge: Eyes On Me', 'On the monster', '#ffd34d', ('Kind: taunt tether',)) +
               '<button class="add">+ Add an effect</button>'),
          card(SND_C, 'Sound', '1 cue', step('0.9 s', 'at the flash', 'Ding', 'A short bright cartoon ding') + '<button class="add">+ Add a sound</button>')],
        fin='<div class="say"><b>2 changes not saved</b>Last saved today 5:12 pm. The game still plays the version you finished on Nov 26.</div><button class="ghost">Undo</button><button>Save draft</button><button class="gold">Finished</button>')
    # ---------- 2. a Skill with a held prop: Deedee, Wet-Floor Hazard ----------
    A['skill'] = dict(owner='Deedee', name='Wet-Floor Hazard', sub='Skill 1. Runs 4.0 s (target 3 to 4 s). Wets the monsters\' floor.', state='', img='preview-skill.jpg',
        len=4.0, head=2.2, hits=[2.0], clock='2.2 of 4.0 s', list=DEE, wide=VERS.replace('freeze on the hit: Short', 'nothing changed yet').replace('added Brass rings', 'copied from the old files').replace('Today 4:40 pm, you', 'Nov 26, Claude').split('<div><b>Nov 26, Claude</b><span>copied from the old files</span><u>Bring back</u></div></div></div>')[0] + '</div></div>',
        lanes=[('body', 'Video', [(0, 4.0, "Deedee's video, take 2", '')]), ('stage', 'Stage', []),
               ('fx', 'Effects', [(1.6, .9, 'Soapy splash', ''), (2.0, 2.0, 'Wet floor (stays 2 rounds)', '')]), ('snd', 'Sound', [])],
        jump=[('Video', ''), ('Timing', ''), ('Stage', '0'), ('Effects', '2'), ('Answer', '1'), ('Sound', '0')],
        cards=[
          card(BODY_C, 'Body video', 'take 2 is in the game',
               '<div class="startp"><div class="nop">NEEDS A PICTURE</div><div class="tx"><b>Starts from a picture made for this move</b><br>Holds: the mop (the one thing in her hand)<br>Wears: the folded WET FLOOR sign, clipped on her apron. The game draws the open sign on the floor.</div></div>'
               '<div class="note">A video can hold one thing only. Anything else is worn, and the game draws what it does.</div>'
               '<div class="btns"><button class="gold sm">Open in the Art Library</button><button class="ghost sm">Change what she holds</button><button class="ghost sm">Edit this prompt</button><button class="sm" disabled style="opacity:.5">Make another ($0.50)</button></div>'),
          card(TIME_C, 'Timing', '',
               row('The floor gets wet', 'the moment the mop slaps down', '<span class="val">2.0 s</span><button class="sm">Set to where the preview is</button>') +
               row('Freeze on that moment', '', seg(['None', 'Short', 'Medium', 'Long'], 'None')) +
               row('Screen shake', '', seg(['None', 'Light', 'Medium', 'Heavy'], 'None')) +
               row('How she gets there', '', seg(['Stays in place', 'Runs to the monster'], 'Stays in place'))),
          card(STAGE_C, 'Stage and objects', 'nothing yet', '<div class="note" style="margin:0">Nothing on the stage yet. The move plays with its video and effects only.</div><button class="add">+ Add a step (words, an object, a shake, a flash...)</button>'),
          card(FX_C, 'Effects', '2 of the 37',
               step('1.6 s', '0.4 s before', 'Soapy splash', 'On the monsters\' side', '#7cc4f2', ('Kind: spray', 'Colour: blue')) +
               step('2.0 s', 'at that moment', 'Wet floor', 'Under the monsters, with the yellow sign', '#f0c27b', ('Kind: wet floor', 'Stays: 2 rounds')) +
               '<button class="add">+ Add an effect</button>'),
          card('var(--prob-text)', 'When a monster slips on it', 'her answer',
               step('then', 'each slip', 'Deedee\'s "told you so" video', 'NO VIDEO YET. Until it is made she keeps her standing video.', None) +
               step('+0.3 s', 'after it starts', 'Impact burst', 'On the monster that slipped', '#d97706', ('Hits: 1', 'Size: normal')) +
               '<div class="btns"><button class="sm">Make this video ($0.50)</button></div>'),
          card(SND_C, 'Sound', 'none', '<button class="add" style="margin-top:0">+ Add a sound</button>')],
        fin='<div class="say"><b>Not looked at yet</b>The game plays what the old files said. Nothing is changed until you save.</div><button class="ghost" disabled style="opacity:.5">Undo</button><button disabled style="opacity:.5">Save draft</button><button class="gold">Finished</button>')
    # ---------- 3. a Capstone with a set piece: Tom, Tarmac Porsche Transfer ----------
    A['capstone'] = dict(owner='Tom', name='Tarmac Porsche Transfer', sub='Capstone. Runs 7.5 s (target 6 to 8 s). Used on every monster.', state='wait', stword='Waiting on 2 pictures', img='preview-capstone.jpg',
        len=7.5, head=3.35, hits=[3.3], clock='3.4 of 7.5 s', list=FAM, warn='2 PINK BOXES ARE NOT FINAL', wide=VERS,
        ph=[('30%', '34%', '15%', '30%', 'HIGH-BEAM GLARE'), ('2%', '52%', '60%', '16%', 'JET WASH')],
        lanes=[('body', 'Video', [(0, 2.25, "Tom's video, take 1", ''), (2.25, 5.25, 'holds his last pose', 'hold')]),
               ('stage', 'Scene', [(0, 7.5, 'Night falls (80% dark)', ''),]),
               ('stage', 'Objects', [(.4, 1.3, 'Runway lights', ''), (1.8, 1.5, 'Porsche arrives', ''), (3.3, .8, 'Glare', 'need'), (4.3, .8, 'Jet wash', 'need'), (6.0, .7, 'Drives off', '')]),
               ('fx', 'Effects', [(3.3, .9, 'Black Porsche high beams', ''), (5.5, 1.4, 'Words', '')]), ('snd', 'Sound', [(0, .2, 'charge', ''), (3.0, .2, 'thud', '')])],
        jump=[('Video', ''), ('Timing', ''), ('Set piece', '11'), ('Objects', '4'), ('Effects', '2'), ('Sound', '2')],
        cards=[
          card(STAGE_C, 'Set piece: the whole screen', '7.5 s',
               row('How long it lasts', 'a Capstone runs 6 to 8 s', '<span class="val">7.5 s</span><button class="ghost sm">&minus;</button><button class="ghost sm">+</button>') +
               row('How dark the field goes', '', seg(['Off', 'Dusk', 'Night'], 'Night')) +
               step('0.0 s', 'start', 'Night falls', 'The field dims over 0.4 s') +
               step('0.4 s', '', 'Runway lights switch on', 'Along the floor, glowing, for 6.2 s') +
               step('1.8 s', 'after his wave', 'The Porsche drives in', 'From the right edge, stops in front of the monsters, 0.9 s, skids') +
               step('3.3 s', 'the hit', 'High beams flash', 'White flash, glare on every monster, they are knocked back') +
               '<div class="note">7 more steps: jet wash, shake, PLEASE ENJOY YOUR TRANSFER, drives off, day returns.</div><button class="add">+ Add a step</button>'),
          card(STAGE_C, 'Objects on the stage', '2 of 4 have a picture',
               '<div class="objs">' + obj('&#128663;', 'Black Porsche', 'Half the screen wide') + obj('&#10024;', 'Runway lights', 'Loops, glows') +
               obj('', 'High-beam glare', 'A burst of light', 'Open in the Art Library') + obj('', 'Jet wash', 'A gust crossing the field', 'Open in the Art Library') + '</div>'
               '<div class="note">An object with no picture shows in the preview as a pink box with its name. It is never put in the game that way.</div>'),
          card(BODY_C, 'Body video', 'take 1 is in the game',
               '<div class="startp"><img src="img/start-tom.jpg" alt=""><div class="tx"><b>Starts from Tom\'s standard picture</b><br>Holds: the 360 medallion (the one thing in his hand)<br>Wears: nothing else</div></div>'
               '<div class="note">His video is 2.3 s. He holds his last pose while the set piece plays out.</div>'
               '<div class="btns"><button class="sm">Make another ($0.50)</button><button class="ghost sm">Edit this prompt</button></div>'),
          card(TIME_C, 'Timing', '',
               row('The hit lands', 'when the high beams flash', '<span class="val">3.3 s</span><button class="sm">Set to where the preview is</button>') +
               row('Freeze on the hit', '', seg(['None', 'Short', 'Medium', 'Long'], 'Long')) +
               row('Screen shake', '', seg(['None', 'Light', 'Medium', 'Heavy'], 'Medium'))),
          card(FX_C, 'Effects', '2 of the 37',
               step('3.3 s', 'at the hit', 'Black Porsche high beams', 'Across the whole field', '#e5e7eb', ('Speed: fast', 'High beams: 85%', 'Dust trail: on')) +
               step('3.6 s', '0.3 s after', 'Status badge: Dazzled', 'On every monster', '#ffd34d', ('Kind: weakened',)) + '<button class="add">+ Add an effect</button>'),
          card(SND_C, 'Sound', '2 cues', step('0.0 s', 'start', 'Charge', 'A rising hum') + step('3.0 s', '', 'Thud', 'The car stops') + '<button class="add">+ Add a sound</button>')],
        fin='<div class="say"><b>Waiting on 2 pictures</b>Glare and Jet wash are made in the Art Library. You can finish it without them: they are left out of the game.</div><button class="ghost">Undo</button><button>Save draft</button><button class="gold">Finished</button>')
    # ---------- 4. a monster act: Mudling, Mud Pie ----------
    A['monster'] = dict(owner='Mudling', name='Mud Pie', sub='Attack. Wound up one turn ahead. Thrown at one family member.', state='fin', stword='Finished Nov 26', img='preview-monster.jpg',
        len=3.8, head=1.2, hits=[2.89], clock='1.2 of 3.8 s', list=MUD, loop=True, speed='½', wide=VERS.replace('freeze on the hit: Short', 'finished').replace('added Brass rings', 'added Soapy splash'),
        lanes=[('body', 'Wind-up', [(0, 1.72, 'Wind-up video, held', '')]), ('body', 'Attack', [(1.72, 2.06, 'Throw video', '')]),
               ('fx', 'Effects', [(2.89, .7, 'Soapy splash', '')]), ('snd', 'Sound', [(2.89, .16, 'splat', '')])],
        jump=[('Wind-up', ''), ('Attack', ''), ('Timing', ''), ('Effects', '1'), ('Sound', '1')],
        cards=[
          card(BODY_C, 'Wind-up video', 'in the game',
               '<div class="startp"><img src="img/start-mudling.jpg" alt=""><div class="tx"><b>Mud Pie (wind-up)</b><br>Plays once, then holds its last picture until the Mudling\'s next turn.</div></div>'
               '<div class="btns"><button class="sm">Make another ($0.07)</button><button class="ghost sm">Edit this prompt</button></div>'),
          card(BODY_C, 'Attack video', 'in the game',
               '<div class="startp"><img src="img/start-mudling.jpg" alt=""><div class="tx"><b>Mud Pie</b><br>Starts from the Mudling\'s standard picture. Runs 2.1 s.</div></div>'
               '<div class="btns"><button class="sm">Make another ($0.07)</button><button class="ghost sm">Edit this prompt</button><button class="ghost sm">Compare the 2 takes</button></div>'),
          card(TIME_C, 'Timing', '',
               row('The mud lands', '1.2 s into the throw', '<span class="val">2.9 s</span><button class="sm">Set to where the preview is</button>') +
               row('Freeze on the hit', '', seg(['None', 'Short', 'Medium', 'Long'], 'None')) +
               row('Screen shake', '', seg(['None', 'Light', 'Medium', 'Heavy'], 'Light')) +
               row('Who it is shown on', 'only for this preview', seg(['Tom', 'Grace', 'Rose', 'Deedee'], 'Tom'))),
          card(FX_C, 'Effects', '1 of the 37', step('2.9 s', 'at the hit', 'Soapy splash', 'On the family member it hits', '#8a5a2b', ('Kind: spray', 'Colour: mud brown')) + '<button class="add">+ Add an effect</button>'),
          card(SND_C, 'Sound', '1 cue', step('2.9 s', 'at the hit', 'Splat', 'A wet smack') + '<button class="add">+ Add a sound</button>')],
        fin='<div class="say"><b>Finished by you, Nov 26, 4:02 pm</b>In the game since build movespec-4471. Change anything and it goes back to In progress.</div><button class="ghost">Earlier versions</button><button class="ghost">Send a note</button>')
    return A

DASH = """<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#0b0a18;font-family:-apple-system,system-ui,"Segoe UI",sans-serif;color:#f4f1ff}
.top{height:44px;display:flex;align-items:center;gap:14px;padding:0 16px;background:#14122b;border-bottom:1px solid #2c2852;box-sizing:border-box}
.top b{font-size:17px}.top small{font-size:12px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#a9a3d6}
.lay{display:flex;gap:2px;padding:2px;border-radius:10px;background:#0f0d24;border:1px solid #2c2852;margin-left:12px;align-items:center}
.lay span{font-size:13px;font-weight:700;padding:7px 14px;border-radius:8px}.lay span.on{background:#ffd34d;color:#241b00}.lay em{font-style:normal;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#a9a3d6;padding:0 8px 0 10px}
.panes{display:flex;gap:8px;padding:8px;height:1396px;box-sizing:border-box}
.pane{display:flex;flex-direction:column;border:1px solid #2c2852;border-radius:10px;overflow:hidden;background:#14122b}
.pane.keys{border:2px solid #ffd34d}
.ph{height:40px;flex:none;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid #2c2852;font-size:13px;font-weight:700}
.ph i{font-style:normal;width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff}
.ph u{margin-left:auto;text-decoration:none;font-size:11px;color:#241b00;background:#ffd34d;padding:2px 8px;border-radius:6px}
.pane iframe{flex:1;border:0;width:100%}
.stub{flex:1;display:flex;align-items:center;justify-content:center;color:#a9a3d6;font-size:14px;text-align:center;line-height:1.5;padding:20px}
.game{flex:none;height:648px;background:#000 url(img/preview-@IMG@.jpg) center/cover}
</style>
<div style="width:3440px;height:1440px;overflow:hidden">
<div class="top"><b>Admin Dashboard</b><small>The Adventures of Tom</small><div class="lay"><em>Layout</em><span>All four</span><span>Battle</span><span class="on">Animations</span></div></div>
<div class="panes">
<div class="pane" style="width:420px"><div class="ph"><i style="background:#6d5bd0">1</i>Board</div><div class="stub">The Board, as today</div></div>
<div class="pane" style="width:951px"><div class="ph"><i style="background:#2f8f5b">2</i>Game</div><div class="game"></div><div class="stub">The strip under the game, as today.<br>In a fight opens here.</div></div>
<div class="pane keys" style="width:1589px"><div class="ph"><i style="background:#1f8f8f">3</i>Battle Guide: Animations<u>KEYS HERE</u></div><iframe src="@NAME@.html"></iframe></div>
<div class="pane" style="flex:1"><div class="ph"><i style="background:#b07a2a">4</i>Admin</div><div class="stub">Admin, as today.<br>The Art Library opens here from an object that needs a picture.</div></div>
</div></div>"""

if __name__ == '__main__':
    A = anims()
    for k, a in A.items():
        open(os.path.join(HERE, k + '.html'), 'w', encoding='utf-8').write(page(a))
        open(os.path.join(HERE, k + '-editing.html'), 'w', encoding='utf-8').write(page(a, 'mini'))
        open(os.path.join(HERE, k + '-long.html'), 'w', encoding='utf-8').write(page(a, 'long'))
        open(os.path.join(HERE, 'dash-' + k + '.html'), 'w', encoding='utf-8').write(DASH.replace('@NAME@', k).replace('@IMG@', k))
    print('wrote', len(A) * 4, 'pages')
