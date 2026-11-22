# Golden Hour menu mockups: shared tokens and components. Every element carries inline styles (the Design canvas edits those).
# Image tokens look like @@tom@@ and are swapped for a local path (test render) or an uploaded url (canvas).
D = "font-family:'Bricolage Grotesque','Avenir Next Condensed',system-ui,sans-serif"
T = "font-family:'Figtree','Avenir Next',system-ui,sans-serif"
INK = '#2B1A33'; SOFT = '#5A4558'; PAPER = '#FCE6C3'; SHADE = '#F4D7A9'; DEEP = '#E9C48C'
RULE = 'rgba(43,26,51,.18)'; GOLD = '#F5A623'; LAMP = '#FFCF6E'; GOLDINK = '#A86200'; JAC = '#6243A8'
GREEN = '#22774F'; CORAL = '#C23A22'; DUSK = '#2A1A3E'; CREAM = '#FFF1D6'

FLAV = {'clobber': ('#F0C27B', 'Clobber'), 'sizzle': ('#FF8C5A', 'Sizzle'), 'drench': ('#7CC4F2', 'Drench'),
        'razzle': ('#FFE27A', 'Razzle'), 'racket': ('#D7A4F5', 'Racket'), 'support': ('#8FE3A6', 'Support')}

ICON = {
 'family': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
 'vibes': '<path d="M11 3l2.1 5.9L19 11l-5.9 2.1L11 19l-2.1-5.9L3 11l5.9-2.1z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
 'gear': '<path d="M8 3L3 6l2 4 2-1v11h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
 'bag': '<path d="M6 10a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"/><path d="M9 21v-4h6v4"/>',
 'system': '<path d="M4 6h8"/><path d="M18 6h2"/><circle cx="15" cy="6" r="2.5"/><path d="M4 12h2"/><path d="M12 12h8"/><circle cx="9" cy="12" r="2.5"/><path d="M4 18h8"/><path d="M18 18h2"/><circle cx="15" cy="18" r="2.5"/>',
 'x': '<path d="M6 6l12 12M18 6L6 18"/>',
 'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 'lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 'pin': '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 'chev': '<path d="M9 6l6 6-6 6"/>',
 'swap': '<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 12l4 4-4 4"/><path d="M21 16H7"/>',
 'save': '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3"/><path d="M8 21v-7h8v7"/>',
 'cloud': '<path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11.500 1.500A3.500 3.500 0 0 1 18 18z"/>',
 'flag': '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
 'up': '<path d="M12 19V5"/><path d="M6 11l6-6 6 6"/>',
 'shield': '<path d="M12 3l7 3v6c0 4.500-3 7.500-7 9-4-1.500-7-4.500-7-9V6z"/>',
 'clobber': '<path d="M12 2l2 5 5-2-2 5 5 2-5 2 2 5-5-2-2 5-2-5-5 2 2-5-5-2 5-2-2-5 5 2z"/>',
 'sizzle': '<path d="M12 2s5 4 5 10a5 5 0 0 1-10 0c0-2 1-3 1-3s1 2 2 2c0-4 2-9 2-9z"/>',
 'drench': '<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
 'razzle': '<path d="M12 2l2.200 7.800L22 12l-7.800 2.200L12 22l-2.200-7.800L2 12l7.800-2.200z"/>',
 'racket': '<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18.500 6.500a8 8 0 0 1 0 11"/>',
 'support': '<path d="M12 20s-7-4.500-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.500-7 10-7 10z"/>',
 'check': '<path d="M5 12l5 5 9-10"/>',
}
STAR = 'M12 3l2.700 5.800 6.300.800-4.600 4.400 1.200 6.300L12 17.300 6.400 20.300l1.200-6.300L3 9.600l6.300-.800z'


def icon(name, size=20, color='currentColor', sw=1.9, fill='none'):
    return (f'<svg aria-hidden="true" viewBox="0 0 24 24" width="{size}" height="{size}" fill="{fill}" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" style="flex:none;display:block">{ICON[name]}</svg>')


def stars(rank, size=14, of=5, gap=1):
    out = ''
    for i in range(of):
        on = i < rank
        out += (f'<svg aria-hidden="true" viewBox="0 0 24 24" width="{size}" height="{size}" style="flex:none;display:block">'
                f'<path d="{STAR}" fill="{GOLD if on else "none"}" stroke="{GOLDINK if on else "rgba(43,26,51,.38)"}" stroke-width="1.6" stroke-linejoin="round"/></svg>')
    return f'<span role="img" aria-label="Rank {rank} of {of}" style="display:inline-flex;gap:{gap}px;align-items:center">{out}</span>'


def bar(frac, color=GREEN, h=8, track='rgba(43,26,51,.15)', extra=''):
    return (f'<div style="height:{h}px;border-radius:{h}px;background:{track};overflow:hidden;{extra}">'
            f'<div style="width:{round(frac*100)}%;height:100%;border-radius:{h}px;background:{color}"></div></div>')


def chip(text, bg=SHADE, color=INK, size=12.5, pad='3px 9px', extra=''):
    return f'<span style="display:inline-flex;align-items:center;gap:5px;padding:{pad};border-radius:99px;background:{bg};color:{color};font-size:{size}px;font-weight:600;line-height:1.25;white-space:nowrap;{extra}">{text}</span>'


def flavor(f, size=22):
    c, name = FLAV[f]
    return (f'<span role="img" aria-label="{name}" style="flex:none;width:{size}px;height:{size}px;border-radius:50%;background:{c};'
            f'box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.55);display:inline-flex;align-items:center;justify-content:center;color:{INK}">'
            f'{icon(f, round(size*.6), INK, 2)}</span>')


def pep(n, size=13):
    if n == 0:
        return f'<span style="font-size:{size}px;font-weight:600;color:{SOFT};white-space:nowrap">Free</span>'
    return (f'<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap">'
            f'<span style="{D};font-weight:800;font-size:{size+3}px;color:{INK};line-height:1">{n}</span>'
            f'<span style="font-size:{size}px;font-weight:600;color:{SOFT}">Pep</span></span>')


def head(pid, size=44, ring=None, dim=False):
    r = f'box-shadow:0 0 0 3px {ring};' if ring else 'box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.3);'
    return (f'<span style="flex:none;width:{size}px;height:{size}px;border-radius:50%;background:{PAPER};overflow:hidden;display:block;{r}{"opacity:.55;" if dim else ""}">'
            f'<img src="@@{pid}-head@@" alt="" style="width:100%;height:100%;display:block;object-fit:cover;mix-blend-mode:multiply"></span>')


# real heights in inches (data/heights.json is the source in the game)
INCH = {'tom': 71, 'grace': 50, 'rose': 40, 'deedee': 65, 'tnb': 70, 'boppy': 67, 'amy': 65}
FT = {'tom': "5'11\"", 'grace': "4'2\"", 'rose': "3'4\"", 'deedee': "5'5\"", 'tnb': "5'10\"", 'boppy': "5'7\"", 'amy': "5'5\""}
ASPECT = {k: 547/820 for k in INCH}
FIG = .935   # share of the picture's height the figure fills (hair top to soles)
FEET = .04  # share of the picture below the soles (the pencil ground shadow)


def figure(pid, ppi, slot_w, area_h, tick=True, tick_side='left'):
    """A hero painting standing on the floor line at its real height. ppi = px per inch of real height."""
    fig = INCH[pid]*ppi; img_h = fig/FIG; img_w = img_h*ASPECT[pid]
    t = ''
    if tick:
        side = 'left:0' if tick_side == 'left' else 'right:0'
        t = (f'<div style="position:absolute;{side};bottom:{fig-9:.0f}px;display:flex;align-items:center;gap:4px;color:{SOFT};font-size:12px;font-weight:600;white-space:nowrap">'
             f'<span>{FT[pid]}</span><span style="width:14px;height:1.5px;background:{SOFT};opacity:.6"></span></div>')
        if tick_side != 'left':
            t = (f'<div style="position:absolute;{side};bottom:{fig-9:.0f}px;display:flex;align-items:center;gap:4px;color:{SOFT};font-size:12px;font-weight:600;white-space:nowrap">'
                 f'<span style="width:14px;height:1.5px;background:{SOFT};opacity:.6"></span><span>{FT[pid]}</span></div>')
    return (f'<div style="position:relative;width:{slot_w}px;height:{area_h}px;flex:none">'
            f'<img src="@@{pid}@@" alt="" style="position:absolute;left:50%;bottom:{-img_h*FEET:.0f}px;width:{img_w:.0f}px;height:{img_h:.0f}px;margin-left:{-img_w/2:.0f}px;mix-blend-mode:multiply;display:block">'
            f'{t}</div>')


def btn(label, kind='ink', size=14, pad='0 16px', h=44, extra='', ic=None):
    styles = {
        'ink': f'background:{INK};color:{CREAM};',
        'lamp': f'background:{LAMP};color:{INK};box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.35);',
        'line': f'background:transparent;color:{INK};box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.45);',
        'ghost': f'background:rgba(255,241,214,.14);color:{CREAM};box-shadow:inset 0 0 0 1.5px rgba(255,241,214,.35);',
    }[kind]
    i = icon(ic, 18) if ic else ''
    return (f'<button type="button" style="{styles}border:0;border-radius:{h//2}px;min-height:{h}px;padding:{pad};{T};font-size:{size}px;font-weight:700;'
            f'display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;cursor:pointer;{extra}">{i}{label}</button>')


TABS = [('family', 'Family'), ('vibes', 'Vibes'), ('gear', 'Gear'), ('bag', 'Bag'), ('system', 'System')]


def rail(active, w=96, dot=('vibes',), item_h=64, links=None):
    """Index tabs down the left edge of the book (Duo, desktop, phone sideways)."""
    out = ''
    for k, label in TABS:
        on = k == active
        st = (f'background:{PAPER};color:{INK};box-shadow:0 2px 0 {DEEP};' if on
              else f'background:rgba(255,241,214,.13);color:{CREAM};')
        d = (f'<span aria-label="Something new" role="img" style="position:absolute;top:8px;right:12px;width:10px;height:10px;border-radius:50%;background:{GOLD};box-shadow:0 0 0 2px {DUSK}"></span>'
             if (k in dot and not on) else '')
        tag = f'a href="{links[k]}"' if links else 'button type="button"'
        out += (f'<{tag} aria-current="{"page" if on else "false"}" style="position:relative;{st}border:0;text-decoration:none;box-sizing:border-box;border-radius:14px 0 0 14px;margin-left:{0 if on else 10}px;margin-right:{-8 if on else 0}px;'
                f'min-height:{item_h}px;padding:{8 if item_h>=60 else 4}px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{4 if item_h>=60 else 2}px;{T};font-size:{14 if item_h>=60 else 12.5}px;font-weight:700;cursor:pointer">'
                f'{icon(k, 24 if item_h>=60 else 20)}<span>{label}</span>{d}</{"a" if links else "button"}>')
    return f'<nav aria-label="Menu" style="width:{w}px;display:flex;flex-direction:column;gap:6px;padding-top:10px;box-sizing:border-box">{out}</nav>'


def tabbar(active, dot=('vibes',), links=None):
    """The same five tabs along the bottom edge (phone upright, Duo folded)."""
    out = ''
    for k, label in TABS:
        on = k == active
        st = (f'background:{PAPER};color:{INK};' if on else f'background:rgba(255,241,214,.13);color:{CREAM};')
        d = (f'<span aria-label="Something new" role="img" style="position:absolute;top:7px;right:16px;width:10px;height:10px;border-radius:50%;background:{GOLD};box-shadow:0 0 0 2px {DUSK}"></span>'
             if (k in dot and not on) else '')
        tag = f'a href="{links[k]}"' if links else 'button type="button"'
        out += (f'<{tag} aria-current="{"page" if on else "false"}" style="position:relative;flex:1 1 0;min-width:0;{st}border:0;text-decoration:none;box-sizing:border-box;border-radius:0 0 14px 14px;margin-top:{0 if on else 8}px;'
                f'min-height:{60 if on else 52}px;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;{T};font-size:13px;font-weight:700;cursor:pointer">'
                f'{icon(k, 22)}<span>{label}</span>{d}</{"a" if links else "button"}>')
    return f'<nav aria-label="Menu" style="display:flex;gap:5px;padding:0 8px;box-sizing:border-box">{out}</nav>'


def backdrop(world):
    return (f'<img src="@@{world}@@" alt="" style="position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block">'
            f'<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(180deg,rgba(38,22,60,.84) 0%,rgba(58,30,78,.70) 55%,rgba(140,64,70,.56) 100%)"></div>')


def coin(n, size=15):
    return (f'<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap"><span aria-hidden="true" style="width:{size}px;height:{size}px;border-radius:50%;background:{GOLD};box-shadow:inset 0 0 0 2px #FFD98A,0 0 0 1px rgba(0,0,0,.25);display:block"></span>'
            f'<span style="{D};font-weight:700;font-size:{size+3}px">{n}</span><span style="font-size:{size-2}px;opacity:.85">coins</span></span>')


def topbar(place, sub, nxt, compact=False):
    n = (f'<div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:8px;font-size:14px;color:{CREAM}">{icon("flag", 17, LAMP)}'
         f'<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="font-weight:700;color:{LAMP}">Next</span>&nbsp; {nxt}</span></div>') if nxt else '<div style="flex:1 1 auto"></div>'
    return (f'<header style="display:flex;align-items:center;gap:18px;padding:0 10px 0 6px;color:{CREAM};min-width:0">'
            f'<div style="display:flex;align-items:baseline;gap:8px;flex:none">{""}<span style="{D};font-weight:800;font-size:{20 if not compact else 18}px;letter-spacing:-.01em">{place}</span>'
            f'<span style="font-size:13px;opacity:.8">{sub}</span></div>{n}'
            f'<div style="display:flex;align-items:center;gap:16px;flex:none;font-size:14px">{coin(37)}'
            f'<span style="display:inline-flex;align-items:center;gap:5px">{icon("clock", 16)}<span style="{D};font-weight:700;font-size:17px">0:01</span></span></div>'
            f'<button type="button" aria-label="Back to the game" style="flex:none;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,241,214,.14);color:{CREAM};display:flex;align-items:center;justify-content:center;cursor:pointer">{icon("x", 20)}</button>'
            f'</header>')


def page(inner, side, w, pad='16px 18px', extra=''):
    """One page of the open book. side: 'l' (gutter on its right), 'r' (gutter on its left) or 'one' (a single sheet)."""
    if side == 'l':
        bg = f'linear-gradient(90deg,rgba(120,70,40,0) calc(100% - 22px),rgba(120,70,40,.20) 100%),{PAPER}'; rad = '14px 0 0 14px'
    elif side == 'r':
        bg = f'linear-gradient(90deg,rgba(120,70,40,.20) 0,rgba(120,70,40,0) 22px),{PAPER}'; rad = '0 14px 14px 0'
    else:
        bg = PAPER; rad = '14px'
    return (f'<section style="width:{w};box-sizing:border-box;background:{bg};border-radius:{rad};padding:{pad};display:flex;flex-direction:column;min-width:0;min-height:0;{extra}">{inner}</section>')


BOOKSHADOW = f'box-shadow:0 3px 0 {DEEP},0 6px 0 #D8B37C,0 22px 44px rgba(16,6,26,.55);border-radius:14px'


def label(text, size=13, color=SOFT, extra=''):
    return f'<div style="font-size:{size}px;font-weight:600;color:{color};{extra}">{text}</div>'


def stat(name, val, delta=None, size=26, note=None):
    d = f'<span style="font-size:13px;font-weight:700;color:{GREEN}">{delta}</span>' if delta else ''
    nt = f'<div style="font-size:12px;color:{SOFT};line-height:1.25">{note}</div>' if note else ''
    return (f'<div style="display:flex;flex-direction:column;gap:1px;min-width:0"><div style="font-size:13px;font-weight:600;color:{SOFT}">{name}</div>'
            f'<div style="display:flex;align-items:baseline;gap:6px"><span style="{D};font-weight:800;font-size:{size}px;line-height:1;letter-spacing:-.01em">{val}</span>{d}</div>{nt}</div>')


def switcher(sel, ids=('tom', 'grace', 'rose', 'deedee'), size=44, badge=None, more=6):
    """Faces of the four in the party, then one button for everyone on the bench (they keep earning XP and Vibe Points)."""
    out = ''
    names = {'tom': 'Tom', 'grace': 'Grace', 'rose': 'Rose', 'deedee': 'Deedee'}
    for p in ids:
        on = p == sel
        b = (f'<span aria-hidden="true" style="position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:{GREEN};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px {PAPER}">{icon("up", 11, "#fff", 3)}</span>'
             if (badge and p in badge) else '')
        out += (f'<button type="button" aria-label="{names[p]}" aria-pressed="{"true" if on else "false"}" style="position:relative;border:0;background:transparent;padding:3px;border-radius:50%;cursor:pointer;display:block">'
                f'{head(p, size, ring=INK if on else None, dim=False)}{b}</button>')
    if more:
        out += (f'<button type="button" aria-label="{more} more on the bench" style="border:0;cursor:pointer;width:{size}px;height:{size}px;border-radius:50%;background:{SHADE};box-shadow:inset 0 0 0 1.5px {RULE};color:{INK};'
                f'{D};font-weight:800;font-size:{round(size*.36)}px;display:flex;align-items:center;justify-content:center;margin-left:3px;flex:none">+{more}</button>')
    return f'<div style="display:flex;gap:{8 if size >= 44 else 4}px;align-items:center">{out}</div>'


def skill_row(kind, name, desc, flav=None, cost=None, compact=False, new=False, size=15):
    """One line of a Vibe's kit. The same row is meant for the battle screen's skill list."""
    left = flavor(flav, 24) if flav else f'<span style="flex:none;width:24px;height:24px;border-radius:50%;background:{SHADE};display:inline-flex;align-items:center;justify-content:center;color:{INK}">{icon("shield" if kind=="Trait" else "vibes", 14, INK, 2)}</span>'
    right = pep(cost) if cost is not None else f'<span style="font-size:13px;font-weight:600;color:{SOFT};white-space:nowrap">{"Always on" if kind in ("Trait","Quirk") else ""}</span>'
    nw = chip('New', LAMP, INK, 11.5, '2px 7px') if new else ''
    d = '' if compact else f'<div style="font-size:13.5px;line-height:1.3;color:{SOFT};text-wrap:pretty">{desc}</div>'
    return (f'<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-top:1.5px solid {RULE}">{left}'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:2px">'
            f'<div style="display:flex;align-items:baseline;gap:8px"><span style="{D};font-weight:700;font-size:{size+1}px;line-height:1.2;letter-spacing:-.005em">{name}</span>{nw}'
            f'<span style="font-size:12.5px;font-weight:600;color:{SOFT};white-space:nowrap">{(FLAV[flav][1] + " " + kind.lower()) if flav else kind}</span><span style="flex:1 1 auto"></span>{right}</div>{d}</div></div>')


def locked_row(rank, name, kind, cost=None, show_cost=True):
    c = f'<span style="font-size:12.5px;color:{SOFT};white-space:nowrap">{cost} Pep</span>' if (cost and show_cost) else ''
    return (f'<div style="display:flex;gap:10px;align-items:center;padding:3px 0;border-top:1.5px solid {RULE};color:{SOFT}">'
            f'<span style="flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center">{icon("lock", 16, SOFT, 2)}</span>'
            f'<span style="{D};font-weight:600;font-size:15px;color:{SOFT};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">{name}</span>'
            f'<span style="font-size:12.5px;font-weight:600;white-space:nowrap">{kind}</span><span style="flex:1 1 auto"></span>{c}'
            f'<span style="font-size:12.5px;font-weight:700;white-space:nowrap;color:{INK}">Rank {rank}</span></div>')


def toggle(on=True, label_text=''):
    knob = f'<span style="width:20px;height:20px;border-radius:50%;background:{CREAM};display:block;margin-left:{20 if on else 0}px;box-shadow:0 1px 2px rgba(0,0,0,.3)"></span>'
    return (f'<button type="button" role="switch" aria-checked="{"true" if on else "false"}" aria-label="{label_text}" style="border:0;cursor:pointer;width:46px;height:26px;border-radius:13px;padding:3px;box-sizing:border-box;'
            f'background:{GREEN if on else "rgba(43,26,51,.35)"};display:block;flex:none">{knob}</button>')


def seg(options, sel, h=40, size=14):
    out = ''
    for o in options:
        on = o == sel
        out += (f'<button type="button" aria-pressed="{"true" if on else "false"}" style="flex:1 1 0;border:0;min-height:{h}px;border-radius:{h//2}px;cursor:pointer;{T};font-size:{size}px;font-weight:700;'
                f'background:{INK if on else "transparent"};color:{CREAM if on else INK};padding:0 12px;white-space:nowrap">{o}</button>')
    return f'<div style="display:flex;gap:2px;padding:3px;border-radius:{h//2+3}px;background:{SHADE};box-shadow:inset 0 0 0 1.5px {RULE}">{out}</div>'


def item_img(iid, size=48):
    return f'<img src="@@item-{iid}@@" alt="" style="width:{size}px;height:{size}px;object-fit:contain;flex:none;display:block">'


def shell_wide(w, h, active, world, top, left, right, lw, rw, rail_w=96, dot=('vibes',), top_h=48, pad='16px 18px', rail_h=64, links=None):
    """Duo unfolded, desktop, phone sideways: tabs down the left edge, a two-page spread, the fold in the gutter."""
    return (f'<div style="position:relative;width:{w}px;height:{h}px;overflow:hidden;background:{DUSK};{T};color:{INK};font-size:15px;line-height:1.3">'
            f'{backdrop(world)}'
            f'<div style="position:absolute;left:0;top:0;width:{w}px;height:{h}px;display:grid;grid-template-columns:{rail_w}px minmax(0,1fr);grid-template-rows:{top_h}px minmax(0,1fr);column-gap:8px;padding:0 8px 12px 0;box-sizing:border-box">'
            f'<div></div>{top}{rail(active, rail_w, dot, rail_h, links)}'
            f'<main style="display:flex;min-width:0;min-height:0;{BOOKSHADOW}">{page(left, "l", f"{lw}px", pad)}{page(right, "r", f"{rw}px", pad)}</main>'
            f'</div></div>')


def shell_tall(w, h, active, world, top, body, dot=('vibes',), sheet_pad='12px 14px', safe_top=0, safe_bottom=10, links=None):
    """Phone upright and Duo folded: one page, the same five tabs along the bottom edge."""
    return (f'<div style="position:relative;width:{w}px;height:{h}px;overflow:hidden;background:{DUSK};{T};color:{INK};font-size:15px;line-height:1.3">'
            f'{backdrop(world)}'
            f'<div style="position:absolute;left:0;top:0;width:{w}px;height:{h}px;display:flex;flex-direction:column;padding:{safe_top}px 0 {safe_bottom}px;box-sizing:border-box">'
            f'{top}'
            f'<main style="flex:1 1 auto;min-height:0;margin:0 8px;display:flex;box-shadow:0 22px 44px rgba(16,6,26,.55);border-radius:14px">{page(body, "one", "100%", sheet_pad, "overflow:hidden;")}</main>'
            f'{tabbar(active, dot, links)}'
            f'</div></div>')


def topbar_phone(place, sub, nxt=None):
    n = (f'<div style="display:flex;align-items:center;gap:7px;font-size:13.5px;color:{CREAM};padding:0 14px 8px;min-width:0">{icon("flag", 16, LAMP)}'
         f'<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0"><span style="font-weight:700;color:{LAMP}">Next</span>&nbsp; {nxt}</span></div>') if nxt else ''
    return (f'<header style="flex:none;color:{CREAM}"><div style="display:flex;align-items:center;gap:12px;padding:0 6px 0 14px;height:48px">'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;align-items:baseline;gap:7px"><span style="{D};font-weight:800;font-size:20px;letter-spacing:-.01em;white-space:nowrap">{place}</span>'
            f'<span style="font-size:12.5px;opacity:.8;white-space:nowrap">{sub}</span></div>'
            f'<span role="img" aria-label="37 coins" style="display:inline-flex;align-items:center;gap:5px;flex:none"><span aria-hidden="true" style="width:14px;height:14px;border-radius:50%;background:{GOLD};box-shadow:inset 0 0 0 2px #FFD98A;display:block"></span><span style="{D};font-weight:700;font-size:17px">37</span></span>'
            f'<span style="display:inline-flex;align-items:center;gap:4px;flex:none">{icon("clock", 15)}<span style="{D};font-weight:700;font-size:16px">0:01</span></span>'
            f'<button type="button" aria-label="Back to the game" style="flex:none;width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,241,214,.14);color:{CREAM};display:flex;align-items:center;justify-content:center;cursor:pointer">{icon("x", 20)}</button>'
            f'</div>{n}</header>')


def slider(name, val, of=10):
    return (f'<div style="display:flex;align-items:center;gap:12px"><span style="width:104px;flex:none;font-size:14px;font-weight:600">{name}</span>'
            f'<div style="position:relative;flex:1 1 auto;height:28px;display:flex;align-items:center"><div style="width:100%;height:8px;border-radius:8px;background:rgba(43,26,51,.16)"><div style="width:{val*100//of}%;height:100%;border-radius:8px;background:{INK}"></div></div>'
            f'<span style="position:absolute;left:calc({val*100//of}% - 13px);top:1px;width:26px;height:26px;border-radius:50%;background:{CREAM};box-shadow:inset 0 0 0 2px {INK},0 1px 3px rgba(0,0,0,.25);display:block"></span></div>'
            f'<span style="{D};font-weight:800;font-size:17px;width:22px;text-align:right;flex:none">{val}</span></div>')


def h2(text, size=24, extra=''):
    return f'<h2 style="margin:0;{D};font-weight:800;font-size:{size}px;line-height:1.05;letter-spacing:-.02em;{extra}">{text}</h2>'

DUO_LINKS = {'family': 'Main.dc.html', 'vibes': 'Vibes-Duo.dc.html', 'gear': 'Gear-Duo.dc.html', 'bag': 'Bag-Duo.dc.html', 'system': 'System-Duo.dc.html'}
PHONE_LINKS = {'family': 'Family-Phone.dc.html', 'vibes': 'Vibes-Phone.dc.html', 'gear': 'Gear-Phone.dc.html', 'bag': 'Bag-Phone.dc.html', 'system': 'System-Phone.dc.html'}


def vibe_picker(items, sel, freelancer=None, name_size=15):
    """The person's three Vibes side by side: which one is Main, which is in the Pocket, and the one being read below.
    items: (name, rank, slot) with slot 'Main', 'Pocket' or ''. freelancer: None, or the words under the fourth chip."""
    out = ''
    for i, (name, rank, slot) in enumerate(items):
        on = i == sel
        bg = f'background:{LAMP};box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.4);' if on else f'background:{SHADE};box-shadow:inset 0 0 0 1.5px {RULE};'
        tag = (chip('Main', INK, CREAM, 11.5, '1px 8px') if slot == 'Main' else chip('Pocket', JAC, '#fff', 11.5, '1px 8px') if slot == 'Pocket'
               else f'<span style="font-size:11.5px;font-weight:600;color:{SOFT};line-height:1.25;padding:1px 0">Not in use</span>')
        st = ''
        out += (f'<button type="button" aria-pressed="{"true" if on else "false"}" style="{bg}flex:1 1 0;min-width:0;border:0;border-radius:12px;padding:6px 9px 7px;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;color:{INK};{T};cursor:pointer;min-height:44px">'
                f'<span style="display:flex;align-items:center;gap:6px;width:100%">{tag}<span style="flex:1 1 auto"></span>{st}</span>'
                f'<span style="{D};font-weight:700;font-size:{name_size}px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">{name}</span>{stars(rank, 12)}</button>')
    if freelancer:
        out += (f'<button type="button" aria-pressed="false" style="flex:.8 1 0;min-width:0;overflow:hidden;border:0;border-radius:12px;padding:6px 7px 7px;background:transparent;box-shadow:inset 0 0 0 1.5px {RULE};display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;color:{SOFT};{T};cursor:pointer;min-height:44px">'
                f'<span style="display:flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;line-height:1.25;padding:1px 0">{icon("lock", 12, SOFT, 2.2)}Locked</span>'
                f'<span style="{D};font-weight:700;font-size:{name_size-.5}px;line-height:1.1;white-space:nowrap">Freelancer</span>'
                f'<span style="font-size:11.5px;line-height:1.15;white-space:nowrap">{freelancer}</span></button>')
    return f'<div style="display:flex;gap:6px;align-items:stretch">{out}</div>'
