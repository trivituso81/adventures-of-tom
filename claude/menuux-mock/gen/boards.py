from kit import *

NEXT = 'Follow the muffin wrappers up to Grump Hollow'

# ---------- shared pieces ----------
PEOPLE = {
 'tom':    dict(name='Tom', title='Uncle', lv=2, hp=(74, 132), vibe='Frequent Flier', rank=2, row='Front', nxt=64, lean='Guard'),
 'grace':  dict(name='Grace', title='Niece, age 9', lv=2, hp=(115, 115), vibe='Squishy Collector', rank=2, row='Front', nxt=64, lean='Tempo'),
 'rose':   dict(name='Rose', title='Niece, age 6', lv=2, hp=(98, 115), vibe='Sugar Rush', rank=1, row='Front', nxt=64, lean='Striker'),
 'deedee': dict(name='Deedee', title='Grandma', lv=2, hp=(52, 115), vibe='Registered Nut', rank=2, row='Back', nxt=64, lean='Support'),
}

def hpcolor(hp):
    return CORAL if hp[0]/hp[1] <= .25 else GREEN

def plate(pid, w, sel=False, new=None, name_size=25):
    p = PEOPLE[pid]
    hl = f'background:linear-gradient(transparent 58%,{LAMP} 58%,{LAMP} 96%,transparent 96%);' if sel else ''
    nw = f'<div>{chip(new, LAMP, INK, 12, "3px 9px")}</div>' if new else ''
    return (f'<button type="button" style="width:{w}px;flex:none;border:0;background:transparent;text-align:left;padding:10px 6px 0 6px;box-sizing:border-box;color:{INK};{T};cursor:pointer;display:flex;flex-direction:column;gap:6px">'
            f'<div style="display:flex;align-items:baseline;gap:8px"><span style="{D};font-weight:800;font-size:{name_size}px;line-height:1.05;letter-spacing:-.015em;padding:0 3px;margin-left:-3px;{hl}">{p["name"]}</span>'
            f'<span style="font-size:13px;font-weight:700;color:{SOFT};white-space:nowrap">Level {p["lv"]}</span></div>'
            f'<div style="display:flex;flex-direction:column;gap:3px">{bar(p["hp"][0]/p["hp"][1], hpcolor(p["hp"]))}'
            f'<div style="display:flex;justify-content:space-between;font-size:13px;color:{SOFT}"><span style="font-weight:600">Health</span>'
            f'<span><span style="{D};font-weight:800;font-size:16px;color:{INK}">{p["hp"][0]}</span> of {p["hp"][1]}</span></div></div>'
            f'<div style="display:flex;flex-direction:column;gap:3px"><span style="font-size:14px;font-weight:700;line-height:1.2">{p["vibe"]}</span>'
            f'<div style="display:flex;align-items:center;gap:8px">{stars(p["rank"], 14)}{chip(p["row"]+" row", SHADE, INK, 12, "2px 8px")}</div></div>{nw}</button>')

def person_header(pid, fig_ppi=3.25, w=335, deltas=None, badge=None):
    """Left page of Vibes and Gear: who you are looking at, their level and their four numbers."""
    p = PEOPLE[pid]; deltas = deltas or {}
    stats = {'tom': (132, 26, 18, 100), 'grace': (115, 26, 16, 115)}.get(pid, (115, 26, 16, 100))
    area = 250
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">{switcher(pid, badge=badge)}'
            f'<span style="font-size:12.5px;color:{SOFT};text-align:right;line-height:1.25">Swipe or L R<br>to change person</span></div>'
            f'<div style="display:flex;align-items:flex-end;gap:4px;margin-top:6px;border-bottom:2px solid {INK}">'
            f'{figure(pid, fig_ppi, 150, area, tick=False)}'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px;padding-bottom:14px">'
            f'<div style="font-size:13.5px;font-weight:600;color:{SOFT}">{p["title"]}</div>'
            f'<div style="{D};font-weight:800;font-size:44px;line-height:.95;letter-spacing:-.025em">{p["name"]}</div>'
            f'<div style="display:flex;align-items:baseline;gap:8px;margin-top:4px"><span style="{D};font-weight:800;font-size:20px">Level {p["lv"]}</span></div>'
            f'{bar(.36, GOLD, 8)}<div style="font-size:13px;color:{SOFT}">{p["nxt"]} to Level {p["lv"]+1}</div>'
            f'</div></div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:12px 2px 0">'
            f'{stat("Health", stats[0], deltas.get("hp"))}{stat("Attack", stats[1], deltas.get("atk"))}{stat("Defense", stats[2], deltas.get("def"))}{stat("Speed", stats[3], deltas.get("spd"))}</div>')

def ruckus(pct=35, w='100%'):
    return (f'<div style="display:flex;flex-direction:column;gap:5px;width:{w}">'
            f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px"><span style="{D};font-weight:700;font-size:16px">Family Ruckus</span>'
            f'<span style="font-size:13px;color:{SOFT}"><span style="{D};font-weight:800;font-size:16px;color:{INK}">{pct}%</span> &nbsp;Double Team at 50, Full Ruckus at 100</span></div>'
            f'<div style="position:relative;height:12px;border-radius:12px;background:rgba(43,26,51,.15)"><div style="width:{pct}%;height:100%;border-radius:12px;background:{GOLD};box-shadow:inset 0 0 0 1.5px {GOLDINK}"></div>'
            f'<span style="position:absolute;left:50%;top:-3px;width:2px;height:18px;background:{INK};opacity:.55"></span></div></div>')

# ---------- Family ----------
def family_duo():
    ppi = 4.6; area = 356
    lw, rw = 371, 468
    lslots = [('tom', 176), ('grace', 159)]; rslots = [('rose', 200), ('deedee', 232)]
    def half(slots, sel=None, new=None, ticks='left'):
        figs = ''.join(figure(p, ppi, w, area) for p, w in slots)
        plates = ''.join(plate(p, w, sel == p, (new or {}).get(p)) for p, w in slots)
        return (f'<div style="display:flex;align-items:flex-end;border-bottom:2px solid {INK}">{figs}</div>'
                f'<div style="display:flex;align-items:flex-start">{plates}</div>')
    bench = (f'<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:10px;border-top:1.5px solid {RULE}">'
             f'<div style="display:flex">{head("boppy", 34)}<span style="margin-left:-8px;display:block">{head("amy", 34)}</span><span style="margin-left:-8px;display:block">{head("tnb", 34)}</span></div>'
             f'<div style="font-size:13.5px;line-height:1.3;color:{SOFT}"><span style="font-weight:700;color:{INK}">Waiting at home</span><br>Boppy, Amy and TNB</div></div>')
    left = half(lslots, sel='tom', new={'tom': 'New skill to try'}) + bench
    right = half(rslots) + f'<div style="margin-top:auto;padding-top:10px;border-top:1.5px solid {RULE}">{ruckus(35)}</div>'
    return shell_wide(951, 648, 'family', 'world-duo', topbar('The Square', 'Long Island', NEXT), left, right, lw, rw, links=DUO_LINKS)

# ---------- Vibes ----------
def main_vibe(compact_locked=True, desc=True, show_cost=True):
    rows = (skill_row('Trait', 'Priority Boarding', 'Tom starts every fight in Guard Stance, and takes 20% less damage when he steps in for someone.', None, None, not desc)
            + skill_row('Basic', 'Lounge Pass Flex', 'Light Racket hit. Eyes On Me: monsters aim at Tom more until his next turn ends.', 'racket', 0, not desc)
            + skill_row('Skill', 'Zone One Blockade', 'For 2 turns, any monster that hits Tom with a melee or thrown attack gets a Clobber hip-check back.', 'clobber', 2, not desc)
            + skill_row('Skill', 'Suite Door Slide', 'For 2 turns, a hit aimed at the family next to Tom lands on Tom instead, 35% weaker. Each one gives him 1 Pep.', 'support', 3, not desc, new=True)
            + locked_row(3, 'Upgrade Certificate', 'Quirk')
            + locked_row(4, 'Tarmac Porsche Transfer', 'Capstone', 5, show_cost)
            + locked_row(5, 'Million-Miler Status', 'Quirk'))
    return rows

def vibe_head(tag, tagbg, name, sub, lean, rank, vp, of, unlock, tagcolor=INK):
    return (f'<div style="display:flex;flex-direction:column;gap:6px">'
            f'<div style="display:flex;align-items:center;gap:8px">{chip(tag, tagbg, tagcolor, 12.5, "3px 10px")}<span style="font-size:13.5px;color:{SOFT};font-weight:600">{sub}</span><span style="flex:1 1 auto"></span>{stars(rank, 17, gap=2)}</div>'
            f'<div style="{D};font-weight:800;font-size:30px;line-height:1;letter-spacing:-.02em">{name}</div>'
            f'<div style="display:flex;align-items:center;gap:7px;font-size:13.5px;color:{SOFT}">{icon("shield", 16, INK, 2)}<span><span style="font-weight:700;color:{INK}">{lean}</span></span></div>'
            f'<div style="display:flex;align-items:center;gap:10px">{bar(vp/of, GOLD, 8, extra="flex:1 1 auto;")}'
            f'<span style="font-size:13px;color:{SOFT};white-space:nowrap"><span style="{D};font-weight:800;font-size:15px;color:{INK}">{vp}</span> of {of} to Rank {rank+1}: {unlock}</span></div></div>')

def pocket_strip():
    return (f'<div style="margin-top:auto;display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:12px;background:{SHADE};box-shadow:inset 0 0 0 1.5px {RULE}">'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px">'
            f'<div style="display:flex;align-items:center;gap:8px">{chip("Pocket Vibe", JAC, "#fff", 12.5, "3px 10px")}{stars(1, 14)}</div>'
            f'<div style="{D};font-weight:800;font-size:19px;line-height:1.1">Gamer Geek</div>'
            f'<div style="font-size:13.5px;color:{SOFT};display:flex;align-items:center;gap:6px;white-space:nowrap">Adds its skills: {flavor("clobber", 18)}<span style="font-weight:700;color:{INK}">Controller Toss</span> {pep(2, 12)}</div></div>'
            f'{btn("Swap with Main", "line", 13.5, "0 14px", 44, ic="swap")}</div>')

def vibes_duo():
    lw, rw = 371, 468
    left = (person_header('tom')
            + f'<div style="margin-top:14px;display:flex;flex-direction:column;gap:6px">{label("Stands in")}{seg(["Front row", "Back row"], "Front row", 38, 13.5)}</div>'
            + f'<div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="font-size:14px;font-weight:600">Show what each skill does</span>{toggle(True, "Show what each skill does")}</div>'
            + f'<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:10px;border-top:1.5px solid {RULE};color:{SOFT};font-size:13.5px;line-height:1.3">'
              f'{icon("lock", 18, SOFT, 2)}<span><span style="font-weight:700;color:{INK}">2 Quirk slots</span> open when one of Tom&#39;s Vibes reaches Rank 3.</span></div>')
    right = (vibe_head('Main Vibe', LAMP, 'Frequent Flier', 'Sky Club Applicant', 'Guard: 15% more Health and Defense', 2, 90, 220, 'first Quirk')
             + f'<div style="margin-top:6px;display:flex;flex-direction:column">{main_vibe()}</div>'
             + pocket_strip())
    return shell_wide(951, 648, 'vibes', 'world-duo', topbar('The Square', 'Long Island', NEXT), left, right, lw, rw, dot=(), links=DUO_LINKS)

# ---------- Gear ----------
def gear_slot(slot, iid, name, effect, sel=False, empty=False, size=48):
    bg = f'background:{LAMP};box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.35);' if sel else f'background:transparent;box-shadow:inset 0 0 0 1.5px {RULE};'
    pic = (f'<span style="width:{size}px;height:{size}px;flex:none;border-radius:12px;box-shadow:inset 0 0 0 1.5px {RULE};display:block;background:repeating-linear-gradient(135deg,transparent 0 6px,rgba(43,26,51,.08) 6px 7px)"></span>'
           if empty else item_img(iid, size))
    return (f'<button type="button" aria-pressed="{"true" if sel else "false"}" style="{bg}border:0;border-radius:14px;padding:8px 12px;display:flex;align-items:center;gap:12px;text-align:left;color:{INK};{T};cursor:pointer;width:100%;box-sizing:border-box;min-height:64px">'
            f'{pic}<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="font-size:12.5px;font-weight:700;color:{SOFT}">{slot}</span>'
            f'<span style="{D};font-weight:700;font-size:17px;line-height:1.15;{"color:"+SOFT+";" if empty else ""}">{name}</span>'
            f'<span style="font-size:13.5px;color:{SOFT};font-weight:600">{effect}</span></span>{icon("chev", 18, SOFT, 2.2)}</button>')

def gear_option(iid, name, effect, better, quote, action='Wear'):
    return (f'<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-top:1.5px solid {RULE}">{item_img(iid, 48)}'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px"><span style="{D};font-weight:700;font-size:16.5px;line-height:1.15">{name}</span>'
            f'<span style="font-size:13.5px;font-weight:600;color:{SOFT}">{effect}</span>'
            f'<span style="font-size:13.5px;font-weight:700;color:{GREEN};display:flex;align-items:center;gap:4px">{icon("up", 14, GREEN, 2.6)}{better}</span></div>'
            f'{btn(action, "ink", 14, "0 18px", 44)}</div>')

def gear_right(compact=False):
    opts = (gear_option('sweater', 'Lucky Red Sweater', 'Health +16, Defense +2', 'Health +8 and Defense +1 over the shirt', '')
            + f'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0 2px;border-top:1.5px solid {RULE}"><span style="font-size:13.5px;color:{SOFT}">Deedee knit it in a weekend. It&#39;s never lost.</span>{btn("Take off shirt", "line", 13, "0 12px", 36)}</div>')
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">{h2("What Tom is wearing", 22)}{btn("Best gear", "line", 13.5, "0 14px", 40, ic="vibes")}</div>'
            f'<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">'
            f'{gear_slot("Tool", "k_keyboard", "Mechanical Keyboard", "Attack +2")}'
            f'{gear_slot("Outfit", "shirt", "Sunny Shirt", "Health +8, Defense +1", sel=True)}'
            f'<div style="padding:0 4px 0 16px;display:flex;flex-direction:column">{label("In the bag for Outfit", 13, SOFT, "padding:4px 0 6px")}{opts}</div>'
            f'{gear_slot("Charm", None, "Nothing on", "2 charms in the bag fit", empty=True)}</div>'
            f'<div style="margin-top:auto;padding-top:10px;border-top:1.5px solid {RULE};font-size:13.5px;color:{SOFT};line-height:1.3">A Tool adds Attack. An Outfit adds Health and Defense. A Charm adds one special perk.</div>')

def gear_duo():
    lw, rw = 371, 468
    left = (person_header('tom', deltas={'hp': '+8', 'def': '+1'}, badge={'tom', 'grace'})
            + f'<div style="margin-top:12px;font-size:13.5px;line-height:1.35;color:{SOFT}">Green shows what changes if Tom puts on the <span style="font-weight:700;color:{INK}">Lucky Red Sweater</span>.</div>'
            + f'<div style="margin-top:auto;display:flex;align-items:center;gap:10px;padding-top:10px;border-top:1.5px solid {RULE};color:{SOFT};font-size:13.5px;line-height:1.3">'
              f'<span aria-hidden="true" style="flex:none;width:16px;height:16px;border-radius:50%;background:{GREEN};display:flex;align-items:center;justify-content:center">{icon("up", 11, "#fff", 3)}</span>'
              f'<span>A green arrow on a face means the bag holds something better for them.</span></div>')
    return shell_wide(951, 648, 'gear', 'world-duo', topbar('The Square', 'Long Island', NEXT), left, gear_right(), lw, rw, links=DUO_LINKS)

# ---------- Bag ----------
BAG = [('cookie', "Deedee's Cookie", 'Heals 56 Health', 3), ('bandage', 'Dino Bandage', 'Heals 96 Health', 1),
       ('sweater', 'Lucky Red Sweater', 'Outfit', 1), ('notebook', 'Pocket Notebook', 'Tool', 1), ('beanie', 'Moon Beanie', 'Charm', 1),
       ('pebble', 'Smooth Pebble', 'Charm', 1), ('sunhat', 'Straw Sunhat', 'Charm', 1), ('button', 'Spare Button', 'Keepsake', 1)]

def bag_row(iid, name, sub, n, sel=False, size=40):
    bg = f'background:{LAMP};box-shadow:inset 0 0 0 1.5px rgba(43,26,51,.35);' if sel else ''
    cnt = f'<span style="{D};font-weight:800;font-size:16px;white-space:nowrap"><span style="font-size:12.5px;font-weight:600;color:{SOFT}">x</span>{n}</span>' if n > 1 else ''
    return (f'<button type="button" aria-pressed="{"true" if sel else "false"}" style="{bg}border:0;border-radius:12px;padding:5px 10px;display:flex;align-items:center;gap:12px;text-align:left;color:{INK};{T};cursor:pointer;width:100%;box-sizing:border-box;min-height:50px;background-color:{"" if sel else "transparent"}">'
            f'{item_img(iid, size)}<span style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="{D};font-weight:700;font-size:16px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{name}</span>'
            f'<span style="font-size:13px;color:{SOFT};font-weight:600">{sub}</span></span>{cnt}</button>')

def use_row(pid, after=None, full=False):
    p = PEOPLE[pid]
    right = (chip('Full', SHADE, SOFT, 13, '6px 14px') if full else btn('Use', 'ink', 14, '0 18px', 40))
    aft = f'<span style="font-size:13px;font-weight:700;color:{GREEN};white-space:nowrap">to {after}</span>' if after else ''
    return (f'<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1.5px solid {RULE}">{head(pid, 40)}'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px"><div style="display:flex;align-items:baseline;gap:8px"><span style="{D};font-weight:700;font-size:16px">{p["name"]}</span>'
            f'<span style="font-size:13px;color:{SOFT}"><span style="{D};font-weight:800;font-size:14.5px;color:{INK}">{p["hp"][0]}</span> of {p["hp"][1]}</span>{aft}</div>'
            f'{bar(p["hp"][0]/p["hp"][1], hpcolor(p["hp"]), 7)}</div>{right}</div>')

def bag_detail(art=112, name_size=30):
    return (f'<div style="display:flex;align-items:center;gap:16px">{item_img("cookie", art)}'
            f'<div style="display:flex;flex-direction:column;gap:5px;min-width:0">{h2("Deedee&#39;s Cookie", name_size)}'
            f'<div style="font-size:14.5px;color:{SOFT};font-style:italic">Still warm.</div>'
            f'<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">{chip("Heals 56 Health", "#BFE8CC", INK, 13, "4px 11px")}{chip("You have 3", SHADE, INK, 13, "4px 11px")}</div></div></div>'
            f'<div style="font-size:13.5px;color:{SOFT};margin-top:10px">Works here and in a fight.</div>'
            f'<div style="margin-top:12px;display:flex;flex-direction:column">{label("Use it on", 13, SOFT, "padding-bottom:6px")}'
            f'{use_row("deedee", 108)}{use_row("tom", 130)}{use_row("rose", 115)}{use_row("grace", full=True)}</div>')

def bag_duo():
    lw, rw = 371, 468
    rows = ''.join(bag_row(i, n, s, c, sel=(i == 'cookie')) for i, n, s, c in BAG)
    left = (f'{seg(["All 8", "Heal", "Gear", "Keepsakes"], "All 8", 36, 13)}'
            f'<div style="display:flex;flex-direction:column;gap:2px;margin-top:10px">{rows}</div>')
    right = bag_detail() + (f'<div style="margin-top:auto;padding-top:10px;border-top:1.5px solid {RULE};font-size:13.5px;color:{SOFT};line-height:1.3">The list puts whoever is hurt most at the top.</div>')
    return shell_wide(951, 648, 'bag', 'world-duo', topbar('The Square', 'Long Island', NEXT), left, right, lw, rw, links=DUO_LINKS)

# ---------- System ----------
def save_row(name, meta, when, empty=False, auto=False):
    acts = (btn('Save here', 'line', 13, '0 14px', 40) if empty else
            (btn('Load', 'line', 13, '0 14px', 40) if auto else btn('Save', 'ink', 13, '0 14px', 40) + btn('Load', 'line', 13, '0 14px', 40)))
    m = (f'<span style="font-size:13.5px;color:{SOFT}">Empty</span>' if empty else
         f'<span style="font-size:13.5px;color:{SOFT};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{meta}</span><span style="font-size:12.5px;color:{SOFT}">{when}</span>')
    return (f'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1.5px solid {RULE}">'
            f'<span style="flex:none;width:36px;height:36px;border-radius:50%;background:{SHADE};display:flex;align-items:center;justify-content:center">{icon("clock" if auto else "save", 18, INK, 2)}</span>'
            f'<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column"><span style="{D};font-weight:700;font-size:16.5px;line-height:1.2">{name}</span>{m}</div>'
            f'<div style="display:flex;gap:6px;flex:none">{acts}</div></div>')

def opt_row(name, control, note=None):
    n = f'<div style="font-size:12.5px;color:{SOFT};line-height:1.3">{note}</div>' if note else ''
    return (f'<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:7px 0;border-top:1.5px solid {RULE}">'
            f'<div style="min-width:0"><div style="font-size:14px;font-weight:600">{name}</div>{n}</div><div style="flex:none">{control}</div></div>')

def system_duo():
    lw, rw = 371, 468
    left = (h2('Saved games', 22)
            + f'<div style="display:flex;flex-direction:column;margin-top:10px">'
              f'{save_row("Autosave", "The Square, Level 2, 0:01", "A minute ago", auto=True)}'
              f'{save_row("Slot 1", "Deedee&#39;s kitchen, Level 1", "Today, 5:12 PM")}'
              f'{save_row("Slot 2", "", "", empty=True)}{save_row("Slot 3", "", "", empty=True)}</div>'
            + f'<div style="display:flex;gap:8px;margin-top:10px">{btn("Back up", "line", 13, "0 12px", 40, ic="cloud")}{btn("Restore", "line", 13, "0 12px", 40)}</div>'
            + f'<div style="font-size:12.5px;color:{SOFT};margin-top:8px;line-height:1.35">The game also saves by itself at every door and after each fight.</div>'
            + f'<div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;border-top:1.5px solid {RULE}">'
              f'<button type="button" style="border:0;background:transparent;padding:0;text-align:left;color:{INK};{T};cursor:pointer;min-height:44px"><span style="font-size:12.5px;color:{SOFT};font-weight:600;display:block">Build</span>'
              f'<span style="font-size:14px;font-weight:700;text-decoration:underline;text-underline-offset:3px">reports-2026-11-22b</span> <span style="font-size:12.5px;color:{SOFT}">Nov 21, 5:29 PM</span></button>'
              f'{btn("Quit to title", "line", 13, "0 14px", 40)}</div>')
    right = (h2('Options', 22)
             + f'<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">{slider("Music", 10)}{slider("Voices", 10)}{slider("Sound effects", 8)}</div>'
             + f'<div style="display:flex;flex-direction:column;margin-top:12px">'
             + opt_row('Difficulty', f'<div style="width:250px">{seg(["Rose", "Grace", "Director"], "Grace", 36, 13)}</div>', 'Grace is the game as designed.')
             + opt_row('Battle speed', f'<div style="width:140px">{seg(["1x", "2x"], "1x", 36, 13)}</div>')
             + opt_row('Show what each skill does', toggle(True, 'Show what each skill does'), 'In this menu and in fights.')
             + opt_row('Turn the screen sideways', toggle(False, 'Turn the screen sideways'))
             + opt_row('Less motion', toggle(False, 'Less motion'), 'Pages change without sliding.')
             + '</div>')
    return shell_wide(951, 648, 'system', 'world-duo', topbar('The Square', 'Long Island', NEXT), left, right, lw, rw, links=DUO_LINKS)

# ---------- Phone upright ----------
def prow(pid, sel=False, new=None):
    p = PEOPLE[pid]
    hl = f'background:linear-gradient(transparent 58%,{LAMP} 58%,{LAMP} 96%,transparent 96%);' if sel else ''
    nw = chip(new, LAMP, INK, 11.5, '2px 8px') if new else ''
    return (f'<button type="button" style="border:0;background:transparent;text-align:left;padding:6px 2px 7px;color:{INK};{T};cursor:pointer;display:flex;flex-direction:column;gap:4px;border-top:1.5px solid {RULE};width:100%;box-sizing:border-box">'
            f'<div style="display:flex;align-items:baseline;gap:8px"><span style="{D};font-weight:800;font-size:22px;line-height:1.05;letter-spacing:-.015em;padding:0 3px;margin-left:-3px;{hl}">{p["name"]}</span>'
            f'<span style="font-size:13px;font-weight:700;color:{SOFT}">Level {p["lv"]}</span><span style="flex:1 1 auto"></span>'
            f'<span style="font-size:13px;color:{SOFT};white-space:nowrap"><span style="{D};font-weight:800;font-size:16px;color:{INK}">{p["hp"][0]}</span> of {p["hp"][1]}</span></div>'
            f'{bar(p["hp"][0]/p["hp"][1], hpcolor(p["hp"]), 7)}'
            f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:14px;font-weight:700;white-space:nowrap">{p["vibe"]}</span>{stars(p["rank"], 13)}{nw}<span style="flex:1 1 auto"></span>{chip(p["row"]+" row", SHADE, INK, 12, "2px 8px")}</div></button>')

def family_phone():
    ppi = 3.12; area = 236
    slots = [('tom', 99), ('grace', 86), ('rose', 76), ('deedee', 88)]
    figs = ''.join(figure(p, ppi, w, area, tick=False) for p, w in slots)
    body = (f'<div style="display:flex;align-items:flex-end;border-bottom:2px solid {INK}">{figs}</div>'
            f'<div style="display:flex;flex-direction:column">{prow("tom", True, "New skill")}{prow("grace")}{prow("rose")}{prow("deedee")}</div>'
            f'<div style="display:flex;align-items:center;gap:10px;padding:7px 2px;border-top:1.5px solid {RULE}"><div style="display:flex">{head("boppy", 30)}<span style="margin-left:-8px;display:block">{head("amy", 30)}</span><span style="margin-left:-8px;display:block">{head("tnb", 30)}</span></div>'
            f'<div style="font-size:13.5px;color:{SOFT}"><span style="font-weight:700;color:{INK}">Waiting at home:</span> Boppy, Amy and TNB</div></div>'
            f'<div style="margin-top:auto;padding-top:10px;border-top:1.5px solid {RULE}">'
            f'<div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:5px"><span style="{D};font-weight:700;font-size:16px">Family Ruckus</span><span style="{D};font-weight:800;font-size:16px">35%</span></div>'
            f'<div style="position:relative;height:12px;border-radius:12px;background:rgba(43,26,51,.15)"><div style="width:35%;height:100%;border-radius:12px;background:{GOLD};box-shadow:inset 0 0 0 1.5px {GOLDINK}"></div><span style="position:absolute;left:50%;top:-3px;width:2px;height:18px;background:{INK};opacity:.55"></span></div></div>')
    return shell_tall(393, 852, 'family', 'world-p', topbar_phone('The Square', 'Long Island', NEXT), body, safe_top=50, sheet_pad='10px 14px 14px', links=PHONE_LINKS)

def who_strip(pid, deltas=None, badge=None):
    p = PEOPLE[pid]; deltas = deltas or {}
    return (f'<div style="display:flex;align-items:center;gap:10px">{switcher(pid, size=42, badge=badge)}<span style="flex:1 1 auto"></span>'
            f'<div style="text-align:right"><div style="{D};font-weight:800;font-size:26px;line-height:1;letter-spacing:-.02em">{p["name"]}</div><div style="font-size:13px;font-weight:700;color:{SOFT};margin-top:2px">Level {p["lv"]}</div></div></div>'
            f'<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px 2px 10px;margin-top:8px;border-top:2px solid {INK}">'
            f'{stat("Health", 132, deltas.get("hp"), 22)}{stat("Attack", 26, deltas.get("atk"), 22)}{stat("Defense", 18, deltas.get("def"), 22)}{stat("Speed", 100, deltas.get("spd"), 22)}</div>')

def vibes_phone():
    body = (who_strip('tom')
            + seg(['Main: Frequent Flier', 'Pocket: Gamer Geek'], 'Main: Frequent Flier', 38, 13)
            + f'<div style="display:flex;flex-direction:column;gap:5px;margin-top:10px">'
              f'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:13.5px;font-weight:600;color:{SOFT}">Sky Club Applicant</span><span style="flex:1 1 auto"></span>{stars(2, 16, gap=2)}</div>'
              f'<div style="display:flex;align-items:center;gap:7px;font-size:13.5px">{icon("shield", 16, INK, 2)}<span style="font-weight:700">Guard: 15% more Health and Defense</span></div>'
              f'<div style="display:flex;align-items:center;gap:10px">{bar(90/220, GOLD, 8, extra="flex:1 1 auto;")}<span style="font-size:13px;color:{SOFT};white-space:nowrap"><span style="{D};font-weight:800;font-size:15px;color:{INK}">90</span> of 220 to Rank 3</span></div></div>'
            + f'<div style="margin-top:8px;display:flex;flex-direction:column">{main_vibe(show_cost=False)}</div>')
    return shell_tall(393, 852, 'vibes', 'world-p', topbar_phone('The Square', 'Long Island'), body, dot=(), safe_top=50, sheet_pad='12px 14px 0', links=PHONE_LINKS)

def gear_phone():
    opts = (gear_option('sweater', 'Lucky Red Sweater', 'Health +16, Defense +2', '+8 Health, +1 Defense', ''))
    body = (who_strip('tom', deltas={'hp': '+8', 'def': '+1'}, badge={'tom', 'grace'})
            + f'<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2px">{h2("Wearing", 20)}{btn("Best gear", "line", 13.5, "0 14px", 40, ic="vibes")}</div>'
            + f'<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">'
              f'{gear_slot("Tool", "k_keyboard", "Mechanical Keyboard", "Attack +2")}'
              f'{gear_slot("Outfit", "shirt", "Sunny Shirt", "Health +8, Defense +1", sel=True)}'
              f'<div style="padding:0 2px 0 12px;display:flex;flex-direction:column">{label("In the bag for Outfit", 13, SOFT, "padding:2px 0 6px")}{opts}'
              f'<div style="padding:6px 0 2px;border-top:1.5px solid {RULE}">{btn("Take off shirt", "line", 13, "0 12px", 36)}</div></div>'
              f'{gear_slot("Charm", None, "Nothing on", "2 charms in the bag fit", empty=True)}</div>')
    return shell_tall(393, 852, 'gear', 'world-p', topbar_phone('The Square', 'Long Island'), body, safe_top=50, sheet_pad='12px 14px 0', links=PHONE_LINKS)

def bag_phone():
    rows = ''.join(bag_row(i, n, s, c, sel=(i == 'cookie')) for i, n, s, c in BAG[:4])
    sheet = (f'<div style="margin:10px -14px 0;padding:6px 14px 12px;background:{CREAM};border-radius:18px 18px 0 0;box-shadow:0 -10px 24px rgba(43,26,51,.28),inset 0 0 0 1.5px {RULE};flex:1 1 auto;display:flex;flex-direction:column">'
             f'<div aria-hidden="true" style="width:44px;height:5px;border-radius:5px;background:rgba(43,26,51,.3);margin:2px auto 10px"></div>{bag_detail(84, 24)}</div>')
    body = (f'{seg(["All 8", "Heal", "Gear", "Keepsakes"], "All 8", 36, 13)}'
            f'<div style="display:flex;flex-direction:column;gap:2px;margin-top:8px">{rows}</div>{sheet}')
    return shell_tall(393, 852, 'bag', 'world-p', topbar_phone('The Square', 'Long Island'), body, safe_top=50, sheet_pad='12px 14px 0', links=PHONE_LINKS)

# ---------- Phone sideways ----------
def plate_s(pid, w, sel=False):
    p = PEOPLE[pid]
    hl = f'background:linear-gradient(transparent 58%,{LAMP} 58%,{LAMP} 96%,transparent 96%);' if sel else ''
    return (f'<button type="button" style="width:{w}px;flex:none;border:0;background:transparent;text-align:left;padding:6px 6px 0;box-sizing:border-box;color:{INK};{T};cursor:pointer;display:flex;flex-direction:column;gap:4px">'
            f'<div style="display:flex;align-items:baseline;gap:6px"><span style="{D};font-weight:800;font-size:20px;line-height:1.05;letter-spacing:-.015em;padding:0 3px;margin-left:-3px;{hl}">{p["name"]}</span>'
            f'<span style="font-size:12.5px;font-weight:700;color:{SOFT};white-space:nowrap">Lv {p["lv"]}</span><span style="flex:1 1 auto"></span>'
            f'<span style="font-size:12.5px;color:{SOFT};white-space:nowrap"><span style="{D};font-weight:800;font-size:14.5px;color:{INK}">{p["hp"][0]}</span>/{p["hp"][1]}</span></div>'
            f'{bar(p["hp"][0]/p["hp"][1], hpcolor(p["hp"]), 6)}'
            f'<span style="font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{p["vibe"]}</span>'
            f'<div style="display:flex;align-items:center;gap:6px">{stars(p["rank"], 12)}{chip(p["row"], SHADE, INK, 11.5, "1px 7px")}</div></button>')

def family_land():
    ppi = 2.98; area = 222
    lw, rw = 382, 382
    def half(slots, sel=None):
        figs = ''.join(figure(p, ppi, w, area, tick=True) for p, w in slots)
        plates = ''.join(plate_s(p, w, sel == p) for p, w in slots)
        return f'<div style="display:flex;align-items:flex-end;border-bottom:2px solid {INK}">{figs}</div><div style="display:flex;align-items:flex-start">{plates}</div>'
    left = half([('tom', 180), ('grace', 174)], 'tom'); right = half([('rose', 174), ('deedee', 180)])
    top = (f'<header style="display:flex;align-items:center;gap:14px;padding:0 6px;color:{CREAM};min-width:0">'
           f'<span style="{D};font-weight:800;font-size:17px;white-space:nowrap">The Square</span>'
           f'<div style="flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;font-size:13px">{icon("flag", 15, LAMP)}<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"><span style="font-weight:700;color:{LAMP}">Next</span>&nbsp; {NEXT}</span></div>'
           f'<span style="font-size:13px;white-space:nowrap;flex:none">Ruckus <span style="{D};font-weight:800;font-size:15px">35%</span></span>'
           f'<span role="img" aria-label="37 coins" style="display:inline-flex;align-items:center;gap:5px;flex:none"><span aria-hidden="true" style="width:13px;height:13px;border-radius:50%;background:{GOLD};box-shadow:inset 0 0 0 2px #FFD98A;display:block"></span><span style="{D};font-weight:700;font-size:15px">37</span></span>'
           f'<span style="display:inline-flex;align-items:center;gap:4px;flex:none">{icon("clock", 14)}<span style="{D};font-weight:700;font-size:15px">0:01</span></span>'
           f'<button type="button" aria-label="Back to the game" style="flex:none;width:44px;height:36px;border-radius:18px;border:0;background:rgba(255,241,214,.14);color:{CREAM};display:flex;align-items:center;justify-content:center;cursor:pointer">{icon("x", 18)}</button></header>')
    return shell_wide(852, 393, 'family', 'world-desk', top, left, right, lw, rw, rail_w=72, top_h=40, pad='8px 14px 8px', rail_h=58)


def system_phone():
    body = (h2('Saved games', 20)
            + f'<div style="display:flex;flex-direction:column;margin-top:8px">'
              f'{save_row("Autosave", "The Square, Level 2, 0:01", "A minute ago", auto=True)}'
              f'{save_row("Slot 1", "Deedee&#39;s kitchen, Level 1", "Today, 5:12 PM")}'
              f'{save_row("Slot 2", "", "", empty=True)}{save_row("Slot 3", "", "", empty=True)}</div>'
            + f'<div style="margin-top:10px;padding-top:12px;border-top:2px solid {INK}">{h2("Options", 20)}</div>'
            + f'<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">{slider("Music", 10)}{slider("Voices", 10)}{slider("Sound effects", 8)}</div>'
            + f'<div style="display:flex;flex-direction:column;margin-top:10px">'
            + opt_row('Difficulty', f'<div style="width:226px">{seg(["Rose", "Grace", "Director"], "Grace", 36, 13)}</div>')
            + opt_row('Battle speed', f'<div style="width:130px">{seg(["1x", "2x"], "1x", 36, 13)}</div>')
            + opt_row('Show what each skill does', toggle(True, 'Show what each skill does'))
            + '</div>')
    return shell_tall(393, 852, 'system', 'world-p', topbar_phone('The Square', 'Long Island'), body, safe_top=50, sheet_pad='12px 14px 0', links=PHONE_LINKS)
