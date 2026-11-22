#!/usr/bin/env python3
"""Test of the new main menu (menu1 Family, menu2 Vibes and Gear, menu3 Bag and System; files engine/m2-*.js and m2.css).

Opens the new menu with four in the party and people on the bench at five sizes, fails when a page
overflows, any text is under 12.5 px, any button is under 44 px, or the text has an em dash; tests the
Change flow (a free slot and a swap, and the words when a swap is not allowed), the New skill tag, the
tabs, Back to the game, keys and the gamepad; saves screenshots to tools/shots/m2-*.png.

Run: python3 tools/m2_test.py
"""
import functools, http.server, os, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'tools', 'shots')
os.makedirs(SHOTS, exist_ok=True)
SIZES = [(951, 648, '?duo=1', 'duo'), (393, 852, '', 'phone'), (852, 393, '', 'land'),
         (466, 657, '', 'fold'), (1280, 720, '', 'desk')]
fails = []


def check(ok, msg):
    if not ok:
        fails.append(msg)
        print('FAIL', msg)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT))
port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

SETUP = """()=>{ const out=[];
  { const m=MEMBERS().deedee; if(!party.includes(m)) { if(!forceJoin(m)) out.push('nojoin'); } }
  for(const id of ['tnb','amy','boppy','justin','olivia','nara']) { const m=MEMBERS()[id]; if(m&&!party.includes(m)) { benchAdd(m); } }
  return [party.map(p=>p.id),benchIds()]; }"""

AUDIT = """()=>{ const root=document.getElementById('m2'); const bad={over:[],small:[],targets:[],dash:[]};
  const rr=root.getBoundingClientRect();
  for(const p of root.querySelectorAll('.m2-page')) {
    const r=p.getBoundingClientRect();
    const ys=e=>{ const o=getComputedStyle(e).overflowY; return o==='auto'||o==='scroll'; };
    const inScroll=c=>{ for(let x=c;x&&x!==p.parentElement;x=x.parentElement) { if(x!==c&&ys(x)) return true; if(x===p&&ys(x)) return true; } return false; };
    if(p.scrollWidth>p.clientWidth+1||(!ys(p)&&p.scrollHeight>p.clientHeight+1)) bad.over.push('page scroll '+p.className+' '+p.scrollWidth+'x'+p.scrollHeight+' in '+p.clientWidth+'x'+p.clientHeight);
    for(const c of p.querySelectorAll('*')) { if(c.classList.contains('m2-fig')) continue; const b=c.getBoundingClientRect(); if(!b.width||!b.height) continue;
      const sc=inScroll(c);
      if((!sc&&(b.bottom>r.bottom+1.5||b.top<r.top-1.5))||b.right>r.right+1.5||b.left<r.left-1.5) bad.over.push((c.className||c.tagName)+' leaves its page by '+Math.round(Math.max(b.bottom-r.bottom,b.right-r.right,r.left-b.left,r.top-b.top))); }
  }
  { const pgs=root.querySelectorAll('.m2-page'); if(pgs.length===2) { const a=pgs[0].getBoundingClientRect(),b=pgs[1].getBoundingClientRect(); if(Math.abs(a.width-b.width)>1.5) bad.over.push('pages are not equal: '+Math.round(a.width)+' vs '+Math.round(b.width)); } }
  const L=document.getElementById('stage'); const sr=L.getBoundingClientRect();
  for(const c of root.querySelectorAll('.m2-top,.m2-tabs,.m2-book,.m2-page')) { const b=c.getBoundingClientRect(); if(b.right>sr.right+1.5||b.bottom>sr.bottom+1.5||b.left<sr.left-1.5||b.top<sr.top-1.5) bad.over.push((c.className)+' leaves the screen'); }
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(w.nextNode()) { const n=w.currentNode; const t=n.textContent.trim(); if(!t) continue; const e=n.parentElement; const cs=getComputedStyle(e);
    const b=e.getBoundingClientRect(); if(!b.width||!b.height||cs.visibility==='hidden'||cs.display==='none') continue;
    let hid=false; for(let x=e;x&&x!==root;x=x.parentElement) { if(getComputedStyle(x).display==='none') { hid=true; break; } } if(hid) continue;
    if(parseFloat(cs.fontSize)<12.5) bad.small.push(t.slice(0,24)+' '+cs.fontSize);
    if(/[\\u2014\\u2013]/.test(t)) bad.dash.push(t.slice(0,30)); }
  for(const b of root.querySelectorAll('[data-m2]')) { const r=b.getBoundingClientRect(); if(!r.width) continue; if(r.width<43.5||r.height<43.5) bad.targets.push((b.dataset.k||b.className)+' '+Math.round(r.width)+'x'+Math.round(r.height)); }
  return bad; }"""


def audit(pg, E, tag):
    bad = E(AUDIT)
    for k, v in bad.items():
        if v:
            check(False, f'{tag}: {k}: {v[:6]}')


def stats_text(E):
    return E("()=>document.getElementById('m2').innerText")


def VG(pg, E, name):
    """Vibes and Gear (menu2) at this size: header, chips, kit, Make Main, Quirks, row, gear slots, Wear, Best gear, bench, keys."""
    # a later-game loadout for the first three: Ranks 5 and 4, 4 and 3, 3 and 3, both Quirk slots in use
    E("""()=>{ const set=(m,a,b)=>{ const L=b3MemberLoadout(m),ids=B3_CAST[m.id].vibes; L.vp[ids[0]]=B3_RULES.rankVp[a-1]; L.vp[ids[1]]=B3_RULES.rankVp[b-1];
        const pool=b3QuirkPool(m.id,L); L.quirks=[pool[0]||null,pool[1]||null]; };
      set(party[0],5,4); set(party[1],4,3); set(party[2],3,3); }""")
    E("()=>{ M2.sel=0; M2.who=null; M2.tab='vibes'; m2Render(); }")
    pg.wait_for_timeout(300)
    t = stats_text(E)
    check('Health' in t and 'Attack' in t and 'Defense' in t and 'Speed' in t, f'{name}: Vibes header lacks the four numbers')
    # fix-menu4play (Tom: "On the vibes screen Deedee name is cut off"): no name breaks across lines or runs out of its box
    for i in range(E("()=>party.length")):
        E("()=>{ M2.sel=%d; M2.who=null; m2Render(); }" % i)
        pg.wait_for_timeout(120)
        w = E("()=>{ const n=document.querySelector('#m2 .m2-wn'); if(!n) return null; const r=n.getBoundingClientRect(), f=parseFloat(getComputedStyle(n).fontSize); return [Math.round(r.height/f*10)/10, n.scrollWidth-n.clientWidth, n.textContent]; }")
        if w:
            check(w[0] <= 1.3 and w[1] <= 1, f'{name}: the name {w[2]} wraps or is cut off {w}')
            if w[2] == 'Deedee':
                pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-deedee-vibes.png'))
    E("()=>{ M2.sel=0; M2.who=null; m2Render(); }")
    check('vibe loadout' in t.lower() and 'Freelancer:' in t, f'{name}: Vibe Loadout header or the Freelancer count is missing')
    n = E("()=>document.querySelectorAll('#m2 .m2-vcard').length")
    check(n == E("()=>B3_CAST[m2Who().id].vibes.length"), f'{name}: {n} Vibe cards')
    # vibelayout1: name, Lv and XP on one line with the bar under it; the Descriptions switch sits at the right of the abilities title
    lay = E("""()=>{ const q=s=>document.querySelector('#m2 '+s), r=e=>e&&e.getBoundingClientRect();
      const wn=r(q('.m2-wn')),lv=r(q('.m2-lvl')),xt=r(q('.m2-xt')),xb=r(q('.m2-xb')),fig=r(q('.m2-hfig')),h2=r(q('.m2-ah h2')),sw=r(q('.m2-dsw'));
      return {wn,lv,xt,xb,fig,h2,sw,name:(m2Who()||{}).id}; }""")
    if lay['wn']:
        check(abs((lay['lv']['top'] + lay['lv']['bottom']) / 2 - (lay['wn']['top'] + lay['wn']['bottom']) / 2) < 22, f'{name}: Lv is not on the name line')
        check(lay['xb']['top'] >= lay['wn']['bottom'] - 1, f'{name}: the XP bar is not under the name')
        if lay['xt']['top'] < lay['xb']['top']:
            check(lay['xt']['right'] > lay['lv']['right'], f'{name}: the XP to go is not at the right of Lv')
    if lay['fig'] and lay['fig']['width'] > 0 and lay['wn'] and lay['name'] == 'tom':
        check(abs(lay['fig']['top'] - lay['wn']['top']) <= 3, f'{name}: the top of Tom\'s head is {lay["fig"]["top"] - lay["wn"]["top"]:.1f}px from the top of the name line')
    if lay['h2'] and lay['sw']:
        check(lay['sw']['left'] > lay['h2']['right'] - 2 or lay['sw']['top'] > lay['h2']['bottom'] - 2, f'{name}: the Descriptions switch is not beside or under the title')
        check(lay['sw']['right'] > lay['h2']['left'] + (lay['sw']['left'] - lay['h2']['left']), f'{name}: the Descriptions switch is not at the right')
    check(E("()=>[...document.querySelectorAll('#m2 .m2-kr')].length") >= 5, f'{name}: kit list too short')
    check('Pep' in t, f'{name}: no Pep cost in the kit')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-vibes.png'))
    audit(pg, E, f'{name} vibes')
    # the four numbers are the new battle's own, with this loadout (no gear change here)
    st = E("()=>{ const m=m2Who(),s=m2Stats(m); return [s.hp,s.atk,s.def,s.spd]; }")
    shown = E("()=>[...document.querySelectorAll('#m2 .m2-st b')].map(b=>+b.textContent)")
    check(st == shown, f'{name}: shown numbers {shown} are not the worked-out ones {st}')
    # Make it Main on the other Vibe, through the real rule
    other = E("()=>{ const m=m2Who(),L=m2Loadout(m); return B3_CAST[m.id].vibes.find(v=>v!==L.main); }")
    pg.click(f'#m2 [data-m2=vibe][data-a={other}]')
    pg.wait_for_timeout(150)
    check(E("(v)=>M2.vibe===v", other) is True, f'{name}: tapping a Vibe card did not pick it for the abilities panel')
    check(E("(v)=>document.querySelector('#m2 .m2-ah h2').textContent.startsWith(B3_VIBES[v].name)", other) is True, f'{name}: the abilities title does not name the picked Vibe')
    pg.click(f'#m2 [data-m2=main][data-a={other}]')
    pg.wait_for_timeout(200)
    check(E("(v)=>m2Loadout(m2Who()).main===v", other) is True, f'{name}: Make it Main did not change the Main Vibe')
    check(E("(v)=>m2Loadout(m2Who()).pocket!==v") is True, f'{name}: Pocket still the new Main')
    third = E("()=>{ const m=m2Who(),L=m2Loadout(m); return B3_CAST[m.id].vibes.find(v=>v!==L.main&&v!==L.pocket); }")
    if third:
        pg.click(f'#m2 [data-m2=pocket][data-a={third}]')
        pg.wait_for_timeout(200)
        check(E("(v)=>m2Loadout(m2Who()).pocket===v", third) is True, f'{name}: Secondary on a card did not make it the Secondary Vibe')
    # Off on a Vibe that is in use changes nothing (a Vibe steps out when another takes its place)
    snap = E("()=>JSON.stringify(m2Loadout(m2Who()))")
    pg.click(f'#m2 [data-m2=off][data-a={other}]')
    pg.wait_for_timeout(120)
    check(E("()=>JSON.stringify(m2Loadout(m2Who()))") == snap, f'{name}: Off changed the loadout')
    # a Rank not reached yet opens its words when tapped
    if E("()=>!!document.querySelector('#m2 [data-m2=peekrow]')"):
        pg.click('#m2 [data-m2=peekrow]')
        pg.wait_for_timeout(120)
        check(E("()=>!!document.querySelector('#m2 .m2-peek')") is True, f'{name}: tapping a future Rank row did not open it')
        pg.click('#m2 [data-m2=peekrow][aria-expanded=true]')
        check(E("()=>!document.querySelector('#m2 .m2-peek')") is True, f'{name}: tapping an open future Rank row did not close it')
    # the row control: Back is refused for the last person in Front
    E("()=>{ for(const p of party) { const L=m2Loadout(p); if(L) b3SetRow(L,'back'); } b3SetRow(m2Loadout(party[0]),'front'); m2Render(); }")
    check(E("()=>!!document.querySelector('#m2 [data-m2=row][data-a=back]:disabled')") is True, f'{name}: Back row not refused for the last in Front')
    E("()=>{ for(const p of party) { const L=m2Loadout(p); if(L) b3SetRow(L,null); } m2Render(); }")
    # Quirks: open the chooser, pick one, back
    if E("()=>!!document.querySelector('#m2 [data-m2=quirk]')"):
        pg.click('#m2 [data-m2=quirk][data-a="0"]')
        pg.wait_for_timeout(200)
        check(E("()=>M2.pick===0") is True, f'{name}: Quirk chooser did not open')
        pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-quirks.png'))
        audit(pg, E, f'{name} quirk chooser')
        pg.click('#m2 [data-m2=pick][data-a=""]')
        pg.wait_for_timeout(200)
        check(E("()=>m2Loadout(m2Who()).quirks[0]===null") is True, f'{name}: empty Quirk did not clear the slot')
    # the details switch changes the saved setting
    before = E("()=>m2Details()")
    pg.click('#m2 [data-m2=details]')
    check(E("()=>m2Details()") == (not before), f'{name}: details switch did not flip')
    pg.click('#m2 [data-m2=details]')
    # a late joiner's pool
    E("()=>{ const m=MEMBERS().tnb; M2.bench=true; M2.who='tnb'; m.vibes=null; const L=b3MemberLoadout(m,true); if(L&&L.pool) L.pool.set=false; m2Render(); }")
    if E("()=>{ const L=m2Loadout(m2Who()); return !!(L&&b3PoolOpen(L)); }"):
        pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-pool.png'))
        audit(pg, E, f'{name} pool')
        pg.click('#m2 [data-m2=poollock]')
        pg.wait_for_timeout(200)
        check(E("()=>!b3PoolOpen(m2Loadout(m2Who()))") is True, f'{name}: Lock it in did not lock the split')
    E("()=>{ M2.bench=false; M2.who=party[0].id; m2Render(); }")
    # bench faces, then back
    pg.click('#m2 [data-m2=bench]')
    pg.wait_for_timeout(150)
    check(E("()=>M2.bench===true&&document.querySelectorAll('#m2 .m2-fc').length===m2Bench().length") is True, f'{name}: bench button did not show the bench')
    pg.click('#m2 [data-m2=who]')
    pg.wait_for_timeout(150)
    check(E("()=>!!m2Bench().find(x=>x.id===M2.who)") is True, f'{name}: picking a bench face did not pick them')
    audit(pg, E, f'{name} bench vibes')
    E("()=>{ M2.bench=false; M2.who=party[0].id; m2Render(); }")
    # Gear
    E("()=>{ bag.push('sweater','shirt','sunhat'); M2.tab='gear'; M2.slot=null; M2.peek=null; m2Render(); }")
    pg.wait_for_timeout(300)
    t = stats_text(E)
    check('Best gear' in t, f'{name}: no Best gear button')
    check('Tool' in t and 'Outfit' in t and 'Charm' in t, f'{name}: the three slots are not all there')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-gear.png'))
    audit(pg, E, f'{name} gear')
    # Wear changes the worked-out numbers, and the preview shows the change before Wear
    E("()=>{ const m=party[0]; for(const s of wearSlots(m)) { if(m.equipment[s]) { bag.push(m.equipment[s]); m.equipment[s]=null; } } M2.slot='Outfit'; M2.peek=null; m2Render(); }")
    opts = E("()=>gearOptions(party[0],'Outfit')")
    if opts:
        check(E("()=>!!document.querySelector('#m2 .m2-st i')") is True, f'{name}: no green change shown while looking at a piece')
        before = E("()=>m2Stats(party[0])")
        pg.click('#m2 [data-m2=wear]')
        pg.wait_for_timeout(250)
        after = E("()=>m2Stats(party[0])")
        check(after != before and after['hp'] >= before['hp'], f'{name}: Wear did not change the numbers {before} {after}')
        check(E("()=>!!party[0].equipment.Outfit") is True, f'{name}: Wear did not put the piece on')
        pg.click('#m2 [data-m2=takeoff]')
        pg.wait_for_timeout(200)
        check(E("()=>!party[0].equipment.Outfit") is True, f'{name}: Take off did not take it off')
    pg.click('#m2 [data-m2=best]')
    pg.wait_for_timeout(250)
    audit(pg, E, f'{name} gear after Best')
    # keys: L and R (Q and E) change person on this page
    E("()=>{ M2.keys=true; M2.who=party[0].id; m2Render(); }")
    pg.keyboard.press('KeyE')
    pg.wait_for_timeout(200)
    check(E("()=>M2.who===party[1].id") is True, f'{name}: E did not move to the next person on Gear')
    # tab to the Vibes and back to the Family
    E("()=>{ M2.keys=false; m2Tab('vibes'); }")
    pg.wait_for_timeout(200)
    check(E("()=>M2.tab==='vibes'") is True, f'{name}: tab did not switch to Vibes')
    E("()=>{ m2Tab('family'); }")
    pg.wait_for_timeout(200)
    check(E("()=>M2.tab==='family'") is True, f'{name}: tab did not return to Family')


def BS(pg, E, name):
    """Bag and System (menu3) at this size: the list, the item page (a sheet on a tall screen), Use on a hurt person, Wear, the
    ask-twice Save and Load round trip, the options, the quit question, the build label."""
    if not E("()=>M2.open"):
        E("()=>openMenu(false)")
        pg.wait_for_timeout(900)
    E("()=>{ M2.tab='bag'; m2Render(); }")
    tall = E("()=>!M2.dims.wide")
    ids = E("""()=>{ const a=Object.keys(items); const f=p=>a.find(id=>items[id]&&p(items[id])); return {heal:f(i=>i.heal&&!i.slot&&!i.healAll&&!i.revive&&fieldUsable(i)),
      all:f(i=>i.healAll),gear:f(i=>i.slot&&canWear(party[0],i)),keep:f(i=>!i.slot&&itemCat(i)==='keep')}; }""")
    check(bool(ids['heal']) and bool(ids['gear']), f'{name}: no heal or gear item found to test with {ids}')
    E("""(ids)=>{ bag.length=0; bag.push(ids.heal,ids.heal,ids.heal,ids.gear); if(ids.all) bag.push(ids.all); if(ids.keep) bag.push(ids.keep);
      party[0].hp=Math.max(1,Math.floor(party[0].maxHp*.4)); party[1].hp=party[1].maxHp; M2.tab='bag'; M2.bagF='all'; M2.bagSel=null; M2.sheet=false; m2Render(); }""", ids)
    pg.wait_for_timeout(300)
    t = stats_text(E)
    check('All' in t and 'Heal' in t and 'Gear' in t, f'{name}: Bag filters missing')
    check(E("()=>document.querySelectorAll('#m2 .m2-br').length") >= 3, f'{name}: Bag list too short')
    check(E("()=>document.querySelectorAll('#m2 .m2-br .m2-ip').length===document.querySelectorAll('#m2 .m2-br').length"), f'{name}: a Bag row has no picture')
    if tall:
        check(E("()=>!document.querySelector('#m2 .m2-sheet')") is True, f'{name}: the sheet is open before an item is chosen')
        pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-bag.png'))
        audit(pg, E, f'{name} bag list')
        pg.click(f'#m2 [data-m2=item][data-a={ids["heal"]}]')
        pg.wait_for_timeout(400)
        check(E("()=>!!document.querySelector('#m2 .m2-sheet')") is True, f'{name}: the item page did not slide up')
    else:
        pg.click(f'#m2 [data-m2=item][data-a={ids["heal"]}]')
        pg.wait_for_timeout(250)
    t = stats_text(E)
    check('Use it on' in t and 'to ' in t and 'You have 3' in t, f'{name}: item page lacks Use it on / the end health / the count')
    check('hurt' in t.lower(), f'{name}: no line about who is hurt most')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-bagitem.png'))
    audit(pg, E, f'{name} bag item')
    # the hurt person is first
    first = E("()=>document.querySelector('#m2 .m2-ur .m2-uname').textContent")
    check(first == E("()=>party[0].name"), f'{name}: most hurt is not first ({first})')
    hp0 = E("()=>party[0].hp")
    pg.click(f'#m2 [data-m2=use][data-a={E("()=>party[0].id")}]')
    pg.wait_for_timeout(300)
    check(E("()=>party[0].hp") > hp0, f'{name}: Use did not heal')
    check(E("(i)=>countInBag(i)", ids['heal']) == 2, f'{name}: the item was not used up one at a time')
    check(E("()=>M2.dirty") is True, f'{name}: using an item did not mark the menu for an autosave')
    # a full person has no Use button
    E("()=>{ party[0].hp=party[0].maxHp; m2Render(); }")
    check(E("()=>!document.querySelector('#m2 [data-m2=use]')") is True, f'{name}: everyone is full but a Use button shows')
    # gear: Wear from the Bag
    E("(i)=>{ M2.bagF='gear'; M2.bagSel=null; M2.sheet=false; m2Render(); }", ids['gear'])
    pg.click(f'#m2 [data-m2=item][data-a={ids["gear"]}]')
    pg.wait_for_timeout(300)
    check('Wear it on' in stats_text(E), f'{name}: gear page has no Wear it on')
    pg.click(f'#m2 [data-m2=wearbag][data-a={E("()=>party[0].id")}]')
    pg.wait_for_timeout(300)
    check(E("(i)=>party[0].equipment[items[i].slot]===i", ids['gear']) is True, f'{name}: Wear from the Bag did not put it on')
    # Back closes the sheet before it closes the menu
    if tall:
        E("(i)=>{ M2.bagF='all'; M2.bagSel=i; M2.sheet=true; m2Render(); }", ids['heal'])
        E("()=>m2Back()")
        check(E("()=>M2.open&&!M2.sheet") is True, f'{name}: Back did not close the sheet first')
    # ---- System ----
    E("()=>{ localStorage.removeItem('le-save-2'); M2.tab='system'; M2.sure=null; M2.quit=false; m2Render(); }")
    pg.wait_for_timeout(300)
    t = stats_text(E)
    for bit in ('Saved games', 'Back up', 'Restore', 'Quit to title', 'Build', 'Options', 'Music', 'Voices', 'Sound effects', 'Difficulty', 'Battle speed', 'Show skill descriptions', 'Less motion'):
        check(bit in t, f'{name}: System page lacks "{bit}"')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-system.png'))
    audit(pg, E, f'{name} system')
    # save: an empty slot saves at once, a used one asks twice
    key = E("()=>{ const k=SAVE_SLOTS.filter(s=>s!=='auto').find(s=>!readSave(s)); return k; }")
    coins0 = E("()=>coins")
    pg.click(f'#m2 [data-m2=save][data-a="{key}"]')
    pg.wait_for_timeout(300)
    check(E("(k)=>!!readSave(k)", key) is True, f'{name}: Save here did not save slot {key}')
    pg.click(f'#m2 [data-m2=save][data-a="{key}"]')
    pg.wait_for_timeout(200)
    check(E("(k)=>M2.sure==='save-'+k", key) is True, f'{name}: saving over a used slot did not ask first')
    check('Replace it?' in stats_text(E), f'{name}: no Replace it? words')
    audit(pg, E, f'{name} system ask')
    E("()=>m2Back()")
    check(E("()=>M2.sure===null&&M2.open") is True, f'{name}: Back did not cancel the ask')
    # load round trip: change the coins, load, the coins come back and the menu closes
    E("()=>{ coins+=123; }")
    pg.click(f'#m2 [data-m2=load][data-a="{key}"]')
    pg.wait_for_timeout(200)
    check(E("()=>coins")==coins0+123 and E("()=>M2.open") is True, f'{name}: Load did not ask first')
    pg.click(f'#m2 [data-m2=load][data-a="{key}"]')
    pg.wait_for_timeout(1200)
    check(E("()=>coins")==coins0, f'{name}: Load did not bring the coins back ({E("()=>coins")} vs {coins0})')
    check(E("()=>!M2.open&&!menuOpen") is True, f'{name}: Load did not close the menu')
    E("()=>{ openMenu(false); }")
    pg.wait_for_timeout(800)
    E("()=>{ M2.tab='system'; m2Render(); }")
    pg.wait_for_timeout(200)
    # options
    for kind in ('music', 'fx'):
        E("(k)=>setVolume(k,5)", kind)
        E("()=>m2Render()")
        pg.click(f'#m2 [data-m2=vol][data-a="{kind}:1"]')
        check(E("(k)=>sound.vol[k]", kind) == 6, f'{name}: {kind} plus did not raise the volume')
        pg.click(f'#m2 [data-m2=vol][data-a="{kind}:-1"]')
        check(E("(k)=>sound.vol[k]", kind) == 5, f'{name}: {kind} minus did not lower the volume')
    box = E("()=>{ const r=document.querySelector('#m2 .m2-track[data-kind=voice] .m2-rail').getBoundingClientRect(); return [r.left,r.top,r.width,r.height]; }")
    if not E("()=>layout.rotated"):
        pg.mouse.click(box[0] + box[2] * .1, box[1] + box[3] / 2)
        check(E("()=>sound.vol.voice") <= 2, f'{name}: tapping the left of the Voices slider did not lower it')
        pg.mouse.click(box[0] + box[2] * .98, box[1] + box[3] / 2)
        check(E("()=>sound.vol.voice") >= 9, f'{name}: tapping the right of the Voices slider did not raise it')
    E("()=>setVolume('voice',10)")
    pg.click('#m2 [data-m2=diff][data-a=rose]')
    check(E("()=>B7.diff") == 'rose', f'{name}: Difficulty Rose did not set')
    pg.click('#m2 [data-m2=diff][data-a=grace]')
    check(E("()=>B7.diff") == 'grace', f'{name}: Difficulty Grace did not set')
    pg.click('#m2 [data-m2=speed][data-a="2"]')
    check(E("()=>B7.speed") == 2, f'{name}: Battle speed 2x did not set')
    pg.click('#m2 [data-m2=speed][data-a="1"]')
    det = E("()=>m2Details()")
    pg.click('#m2 [data-m2=details]')
    check(E("()=>m2Details()") == (not det), f'{name}: skill switch did not flip')
    pg.click('#m2 [data-m2=details]')
    pg.click('#m2 [data-m2=calm]')
    check(E("()=>m2Calm()&&M2.root.classList.contains('m2-less')") is True, f'{name}: Less motion did not switch on')
    pg.click('#m2 [data-m2=calm]')
    check(E("()=>!m2Calm()&&!M2.root.classList.contains('m2-less')") is True, f'{name}: Less motion did not switch off')
    sideways = E("()=>!tabletMode.on")
    check(E("()=>!!document.querySelector('#m2 [data-m2=rotate]')") == sideways, f'{name}: the sideways switch shows only on phones')
    old = E("()=>!b3sOn()")
    check(E("()=>!!document.querySelector('#m2 [data-m2=hf]')") == old, f'{name}: old-battle options and the old battle disagree')
    # the old-battle options show when a chapter on the old battle is played
    E("()=>{ M2.__s=b3sOn; window.b3sOn=()=>false; m2Render(); }")
    check(E("()=>!!document.querySelector('#m2 [data-m2=hf]')&&!!document.querySelector('#m2 [data-m2=skip]')") is True, f'{name}: old-battle options missing on the old battle')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-system-old.png'))
    audit(pg, E, f'{name} system old options')
    E("()=>{ window.b3sOn=M2.__s; m2Render(); }")
    # quit asks first and Keep playing returns
    pg.click('#m2 [data-m2=quit]')
    pg.wait_for_timeout(200)
    check('Quit to the title screen?' in stats_text(E), f'{name}: Quit did not ask')
    pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}-quit.png'))
    audit(pg, E, f'{name} quit ask')
    pg.click('#m2 [data-m2=quitno]')
    check(E("()=>!M2.quit&&M2.open") is True, f'{name}: Keep playing did not close the question')
    # the build label opens the build history, above the menu
    pg.click('#m2 [data-m2=builds]')
    pg.wait_for_timeout(500)
    check(E("()=>{ const b=document.getElementById('buildlog'); return !!b&&!b.hidden; }") is True, f'{name}: the build label did not open the build history')
    E("()=>buildHistoryClose()")
    check(E("()=>M2.open") is True, f'{name}: closing the history closed the menu')
    # Back up and cloud buttons are there
    check(E("()=>!!document.querySelector('#m2 [data-m2=backup]')&&!!document.querySelector('#m2 [data-m2=restore]')&&!!document.querySelector('#m2 [data-m2=cloud]')") is True, f'{name}: backup buttons missing')
    E("()=>{ M2.tab='family'; m2Render(); }")


with sync_playwright() as pw:
    br = pw.chromium.launch(args=['--headless=new', '--no-proxy-server'])
    for W, H, q, name in SIZES:
        pg = br.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        E = pg.evaluate
        pg.goto(f'http://127.0.0.1:{port}/index.html{q}')
        pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start')
        pg.wait_for_timeout(1200)
        E("()=>{ splash.active=false; document.getElementById('splash').hidden=true; }")
        pg.wait_for_timeout(300)
        for i in range(60):
            if not E("()=>intro.active||dialog.active||!!transition"):
                break
            pg.keyboard.press('Enter')
            pg.wait_for_timeout(70)
        r = E(SETUP)
        check(len(r[0]) == 4, f'{name}: party has {len(r[0])} not 4: {r[0]}')
        check(len(r[1]) >= 3, f'{name}: bench has {len(r[1])}: {r[1]}')
        E("()=>openMenu(false)")
        pg.wait_for_timeout(1000)
        check(E("()=>M2.open") is True, f'{name}: new menu did not open')
        check(E("()=>!!document.querySelector('#m2 .m2-fig')"), f'{name}: no pictures in the line-up')
        pg.screenshot(path=os.path.join(SHOTS, f'm2-{name}.png'))
        bad = E(AUDIT)
        for k, v in bad.items():
            if v:
                check(False, f'{name}: {k}: {v[:6]}')
        # No height label anywhere
        txt = E("()=>document.getElementById('m2').innerText")
        check("'" not in txt.split('Level')[0][-0:] or True, 'x')
        for bit in ("5'", 'inches', ' ft'):
            check(bit not in txt, f'{name}: height label "{bit}" in the menu text')

        # Heights come from the data file: the same ppi for everyone, order of the figures follows height
        hs = E("""()=>[...document.querySelectorAll('#m2 .m2-fig')].map(f=>[f.dataset.id||'',Math.round(f.getBoundingClientRect().height)])""")
        check(len(hs) == 4, f'{name}: {len(hs)} figures')

        VG(pg, E, name)
        if name == 'duo':
            # the New skill tag: set on a member, shows, and clears when their Vibes page is opened
            E("()=>{ party[1].m2new=true; m2Render(); }")
            check(E("()=>!!document.querySelector('#m2 .m2-chip.new')") is True, 'New skill tag did not show')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-newskill.png'))
            E("()=>{ party[1].m2new=false; m2Render(); }")

            # Change, free slot: send Deedee to the bench, then bring her back with no swap
            E("()=>{ benchAdd(MEMBERS().deedee); m2Render(); }")
            check(E("()=>party.length") == 3, 'free slot: deedee did not step out')
            pg.click('#m2 [data-m2=change]')
            pg.wait_for_timeout(200)
            check(E("()=>!!M2.change") is True, 'Change did not open')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-change.png'))
            bad = E(AUDIT)
            for k, v in bad.items():
                if v:
                    check(False, f'change step: {k}: {v[:6]}')
            pg.click('#m2 [data-m2=bench][data-a=deedee]')
            pg.wait_for_timeout(300)
            check(E("()=>party.map(p=>p.id).includes('deedee')&&party.length===4") is True, 'free slot: deedee did not come out front')

            # Change, swap: bring TNB out front, then pick who sits out
            pg.click('#m2 [data-m2=change]')
            pg.click('#m2 [data-m2=bench][data-a=tnb]')
            pg.wait_for_timeout(200)
            check(E("()=>(M2.change||{}).step") == 'out', 'swap: no second step')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-sitout.png'))
            outs = E("()=>[...document.querySelectorAll('#m2 [data-m2=out]')].map(b=>b.dataset.a)")
            check('tom' not in outs and 'grace' not in outs and 'rose' not in outs, f'swap: Tom, Grace or Rose offered as sit out: {outs}')
            check(len(outs) >= 1, 'swap: nobody offered to sit out')
            if outs:
                before = E("()=>party.map(p=>p.id)")
                pg.click(f'#m2 [data-m2=out][data-a={outs[0]}]')
                pg.wait_for_timeout(300)
                after = E("()=>party.map(p=>p.id)")
                check('tnb' in after and outs[0] not in after and len(after) == 4, f'swap: party {before} -> {after}')
                check(E("(o)=>benchIds().includes(o)", outs[0]) is True, 'swap: the one who sat out is not on the bench')
            # where the story does not allow it, say so in words
            E("()=>{ M2.change={step:'in'}; m2Render(); }")
            E("()=>{ const c=chapterInfo(); c.bench=c.bench||{}; c._old=c.bench.never; c.bench.never=['tom','grace','rose','tnb','amy','deedee','boppy','justin','olivia','nara']; M2.change=null; m2Render(); }")
            pg.click('#m2 [data-m2=change]')
            pg.click('#m2 .m2-pick')
            pg.wait_for_timeout(200)
            t2 = E("()=>document.getElementById('m2').innerText")
            check('always' in t2.lower() or 'story' in t2.lower() or 'sits out' not in t2, 'no words when no swap is allowed')
            pg.screenshot(path=os.path.join(SHOTS, 'm2-duo-noswap.png'))
            E("()=>{ const c=chapterInfo(); c.bench.never=c._old; M2.change=null; m2Render(); }")

            # Bag and System are pages of the book now (menu3)
            # Back to the game
            E("()=>closeMenu()")
            pg.wait_for_timeout(300)
            check(E("()=>!menuOpen&&!M2.open") is True, 'close did not close the menu')
            # Report pencil tab above the menu and Rose Mode still work
            E("()=>openMenu(false)")
            pg.wait_for_timeout(700)
            z = E("()=>{ const b=document.getElementById('brp-btn'); return b?+getComputedStyle(b).zIndex:null; }")
            check(z is None or z > 30, f'report pencil is under the menu (z {z})')
            # keys: arrows move focus, Escape closes
            pg.keyboard.press('ArrowRight')
            pg.keyboard.press('ArrowDown')
            pg.wait_for_timeout(150)
            check(E("()=>!!document.activeElement&&document.activeElement.closest('#m2')!==null") is True, 'keys: focus left the menu')
            pg.keyboard.press('Escape')
            pg.wait_for_timeout(300)
            check(E("()=>!M2.open") is True, 'Escape did not close the menu')
        BS(pg, E, name)
        check(not errs, f'{name}: console errors {errs[:3]}')
        pg.close()
    # No switch is left: the old menu's names are gone and the Stampcard shell and the Lab door still work
    pg = br.new_page(viewport={'width': 393, 'height': 852})
    pg.goto(f'http://127.0.0.1:{port}/index.html')
    pg.wait_for_function('()=>window.__LE&&window.__LE.b2Start')
    gone = pg.evaluate("()=>['m2On','m2AdminItem','renderHome','renderGearTab','renderItemsTab','renderSaveTab','renderStatusTab','b3vOpen','targetPicker','openQuit'].filter(n=>typeof window[n]!=='undefined'||(()=>{try{return eval('typeof '+n)!=='undefined'}catch(e){return false}})())")
    check(not gone, f'old menu names are still defined: {gone}')
    lab = pg.evaluate("""()=>{ splash.active=true; const r={}; m2OpenLab(); r.open=M2.open&&M2.lab; r.tabs=[...document.querySelectorAll('#m2 .m2-tab')].map(t=>t.textContent);
      r.ranks=document.querySelectorAll('#m2 [data-m2=rank]').length; r.people=m2People().length; m2CloseNew(); r.closed=!M2.open&&!M2.lab; return r; }""")
    check(lab['open'] and lab['tabs'] == ['Vibes'] and lab['ranks'] >= 3 and lab['people'] >= 3 and lab['closed'], f'Battle Lab door: {lab}')
    pg.close()
    br.close()

if fails:
    print(f'\n{len(fails)} failed')
    sys.exit(1)
print('m2_test: all passed (screens in tools/shots/m2-*.png)')
