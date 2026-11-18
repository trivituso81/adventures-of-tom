#!/usr/bin/env python3
"""Headless test for the admin music (engine/admin-music.js on the admin pages, mcAdminScreen in engine/music-clips.js).
Run from the repo root:  python3 tools/admin_music_test.py   (own server on 8831; needs CHROMIUM and PLAYWRIGHT_BROWSERS_PATH like the other tests)
Checks: every admin page starts the track and reaches its level; the game's music switch off keeps it silent; a clip played on the page
(and the microphone being opened) makes it go quiet and it comes back; moving to another admin page carries on from the same place; the
game's ADMIN menu, the Battle Lab list under it and the Welcome layout editor want 'admin' and the title screen still wants 'title'."""
import os, sys, subprocess, time, asyncio
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PORT = 8831
fails = []
def ok(c, m):
    print(('PASS ' if c else 'FAIL ') + m)
    if not c: fails.append(m)
PAGES = ['voices', 'art', 'music', 'portraits', 'heads', 'areas']
async def main():
    web = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)
    base = 'http://localhost:%d/' % PORT
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM') or None, args=['--autoplay-policy=no-user-gesture-required'])
            ctx = await b.new_context(viewport={'width': 390, 'height': 844})
            for name in PAGES:
                pg = await ctx.new_page(); errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                await pg.goto(base + name + '.html'); await pg.wait_for_timeout(3500)
                st = await pg.evaluate('window.adminMusic&&{s:adminMusic.state,l:adminMusic.level}')
                ok(bool(st) and st['s']['started'] and 0.2 < st['l'] < 0.3, '%s.html: track started, level %.2f' % (name, (st or {}).get('l', 0)))
                ok(not errs, '%s.html: no page errors %s' % (name, errs[:2]))
                await pg.close()
            # level, hold and carry-on, on the Head Sizes page (no audio of its own)
            pg = await ctx.new_page()
            await pg.goto(base + 'heads.html'); await pg.wait_for_timeout(3500)
            pos1 = await pg.evaluate('adminMusic.state.pos')
            await pg.evaluate("window.__a=new Audio('music/victory.mp3'); __a.play()")
            await pg.wait_for_timeout(900)
            ok(await pg.evaluate('adminMusic.level') < 0.05, 'a clip playing on the page makes the admin track go quiet')
            await pg.evaluate('__a.pause()'); await pg.wait_for_timeout(2300)
            ok(await pg.evaluate('adminMusic.level') > 0.2, 'and it comes back after the clip stops')
            await pg.evaluate("adminMusic.hold('t',true)"); await pg.wait_for_timeout(700)
            ok(await pg.evaluate('adminMusic.level') < 0.05, 'hold() fades it out'); await pg.evaluate("adminMusic.hold('t',false)")
            await pg.wait_for_timeout(500); await pg.close()
            pg = await ctx.new_page()                      # next admin page a moment later: carries on, does not restart
            await pg.goto(base + 'portraits.html'); await pg.wait_for_timeout(3000)
            pos2 = await pg.evaluate('adminMusic.state.pos')
            ok(pos2 > pos1 + 2, 'moving to another admin page carries on (position %.1f then %.1f s)' % (pos1, pos2))
            # top bar controls: volume slider and Music On/Off button
            await pg.close(); pg = await ctx.new_page()
            await pg.goto(base + 'voices.html'); await pg.wait_for_timeout(3500)
            ok(await pg.evaluate("!!document.querySelector('header #amctl button')&&!!document.querySelector('header #amctl input[type=range]')"), 'the top bar has a Music button and a volume slider')
            await pg.screenshot(path=os.path.join(ROOT, 'tools/shots/admin-music-bar.png'), clip={'x': 0, 'y': 0, 'width': 390, 'height': 70})
            await pg.evaluate("(()=>{const r=document.querySelector('#amctl input');r.value=100;r.dispatchEvent(new Event('input'))})()"); await pg.wait_for_timeout(800)
            lv = await pg.evaluate('adminMusic.level')
            ok(0.45 < lv < 0.55, 'slider at 100 doubles the level (%.2f)' % lv)
            await pg.evaluate("(()=>{const r=document.querySelector('#amctl input');r.value=20;r.dispatchEvent(new Event('input'))})()"); await pg.wait_for_timeout(800)
            lv = await pg.evaluate('adminMusic.level')
            ok(0.08 < lv < 0.12, 'slider at 20 gives a low level (%.2f)' % lv)
            await pg.click('#amctl button'); await pg.wait_for_timeout(900)
            ok(not await pg.evaluate('adminMusic.playing') and await pg.evaluate('adminMusic.level') < 0.02, 'Music Off button silences it')
            ok(await pg.evaluate("document.querySelector('#amctl button').textContent") == 'Music Off', 'the button reads Music Off')
            await pg.close(); pg = await ctx.new_page(); await pg.goto(base + 'heads.html'); await pg.wait_for_timeout(2500)
            ok(not await pg.evaluate('adminMusic.playing'), 'off stays off on the next admin page')
            await pg.click('#amctl button'); await pg.wait_for_timeout(3500)
            ok(await pg.evaluate('adminMusic.playing') and 0.08 < await pg.evaluate('adminMusic.level') < 0.12, 'Music On brings it back at the saved volume')
            await pg.evaluate("localStorage.removeItem('aot-admin-music-vol')")
            # music switch off
            await pg.evaluate("localStorage.setItem('le-music','off')"); await pg.close()
            pg = await ctx.new_page(); await pg.goto(base + 'heads.html'); await pg.wait_for_timeout(2500)
            ok(not await pg.evaluate('adminMusic.playing'), 'with the game music switch off it stays silent')
            await pg.evaluate("localStorage.removeItem('le-music')"); await pg.close()
            # the game
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(base + 'index.html'); await pg.wait_for_timeout(2500)
            await pg.mouse.click(200, 400); await pg.wait_for_timeout(500)
            want = lambda: pg.evaluate('__LE.clipWanted()')
            ok(await want() == 'title', "title screen still wants 'title' (got %s)" % await want())
            await pg.evaluate("splashSetMode('admin',0)")
            ok(await want() == 'admin', "ADMIN menu wants 'admin'")
            await pg.evaluate("splashSetMode('lab',0)")
            ok(await want() == 'admin', "Battle Lab list wants 'admin'")
            await pg.evaluate("splashSetMode('launch')")
            ok(await want() == 'title', "back on the welcome list it wants 'title' again")
            await pg.evaluate("splash.edit=true")
            ok(await want() == 'admin', "Welcome layout editor wants 'admin'"); await pg.evaluate("splash.edit=false")
            await pg.evaluate("splashSetMode('launch')"); await pg.wait_for_timeout(4500)
            t0 = await pg.evaluate("__LE.MC.cur&&__LE.MC.cur.id")
            await pg.evaluate("splashSetMode('admin',0)"); await pg.wait_for_timeout(1300)
            only = await pg.evaluate("({old:__LE.MC.old.length,synth:!!music.cur,cur:__LE.MC.cur&&__LE.MC.cur.id})")
            ok(t0 == 'title' and only['old'] == 0 and not only['synth'] and only['cur'] == 'admin', 'title theme (%s) is gone 1.3 s after entering ADMIN, only admin plays %s' % (t0, only))
            await pg.wait_for_timeout(3700)
            cur = await pg.evaluate("__LE.MC.cur&&__LE.MC.cur.id")
            gain = await pg.evaluate("__LE.MC.cur.gain.gain.value")
            ok(abs(gain - 0.5) < 0.02, 'in the game the admin track plays at half level (gain %.2f)' % gain)
            await pg.evaluate("localStorage.setItem('aot-admin-music-off','1')"); await pg.wait_for_timeout(300)
            ok(await want() is None, 'in the game the admin off switch silences the ADMIN menu music (wants %s)' % await want())
            await pg.evaluate("localStorage.removeItem('aot-admin-music-off')")
            ok(cur == 'admin', "the game really plays the admin track on the ADMIN menu (cur=%s, log=%s)" % (cur, await pg.evaluate('__LE.MC.log.slice(-3)')))
            ok(not errs, 'game: no page errors %s' % errs[:2])
            await b.close()
    finally:
        web.terminate()
    print('FAILS:', fails); sys.exit(1 if fails else 0)
asyncio.run(main())
