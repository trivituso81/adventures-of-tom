#!/usr/bin/env python3
# Builds data/battle-emoji.js: the big, sharp pictures Rose Mode's menus use (engine/battle-pictures.js).
# One Twemoji picture (CC-BY 4.0, https://github.com/jdecked/twemoji) per move, Tombo, item and menu button.
# Usage: npm install @twemoji/svg (in a scratch folder), then  python3 tools/build_bp_emoji.py <path to node_modules/@twemoji/svg>
# Edit the MAP below to change a picture, then re-run. Keys: 'char.moveKey', Tombo id, item id, or a menu id (x_*, m_*).
import sys, os, base64, json
SVG=sys.argv[1] if len(sys.argv)>1 else 'node_modules/@twemoji/svg'
MAP={
# menu
'x_moves':'👊','x_tombo':'💕','m_magnify':'🔍','x_bag':'🎒','x_back':'⬅️','x_run':'🏃','x_praise':'👏','x_crust':'🥖','x_bench':'🔄',
# specials (command cross, right button)
'tom.defend':'🛡️','grace.dance':'💃','rose.silly':'😝','amy.pep':'📣','amy.pep_talk':'📣','deedee.hug':'🤗','deedee.moon_back':'🤗','boppy.grumble':'😤','tnb.wardrobe':'👗','nara.puppy':'🥹','nara.puppy_eyes':'🥹',
# Tom
'tom.button_mash':'🎮','tom.starter_splash':'💦','tom.sourdough_snob':'🍞','tom.overpriced_gadget':'🛍️','tom.noise_canceling':'🎧','tom.seat_1a':'💺','tom.delta_ult':'✈️','tom.flashcard_flurry':'🃏','tom.konami_code':'🕹️','tom.skincare_10':'🧴','tom.kanji_strike':'🈶','tom.know_it_all':'🤓','tom.cart_ult':'👾',
# Grace
'grace.cartwheel':'🤸','grace.squishy_squeeze':'🧸','grace.glitter_nails':'💅','grace.welcome_back':'📹','grace.like_subscribe':'👍','grace.dumpling_drop':'🥟','grace.viral_ult':'🔔','grace.dance_battle':'🕺','grace.beam_dismount':'🙌','grace.handstand_contest':'🙃','grace.split_leap':'🩰','grace.chalk_up':'🖍️','grace.olympic_ult':'💎','grace.instax':'📸',
# Rose
'rose.boop':'👃','rose.boo':'👻','rose.dress_up_tiara':'🦄','rose.giggle_storm':'🤣','rose.lamby_hug':'🐑','rose.floor_is_lava':'🌋','rose.teaparty_ult':'🫖','rose.lookout_lamby':'🪃','rose.piggyback_pounce':'🐷','rose.bedtime_story':'📖','rose.lamby_boomerang':'🍪','rose.pillow_fort':'🏰','rose.mecha_ult':'🤖',
# Amy
'amy.kettlebell_swing':'🏋️','amy.red_pen':'🖊️','amy.hot_lunch_tray':'🍽️','amy.goldstar_recess':'⭐','amy.inside_voices':'🤫','amy.pop_quiz':'❓','amy.detention_ult':'🚪','amy.burpee_blitz':'💪','amy.hill_repeats':'⛰️','amy.oat_milk_please':'🥛','amy.false_start':'🏃','amy.negative_split':'⏱️','amy.marathon_ult':'🏅',
# Deedee
'deedee.dish_towel_flick':'🧽','deedee.registered_nut':'👩‍⚕️','deedee.corner_piece':'🍰','deedee.wet_floor':'🪣','deedee.wine':'🍷','deedee.oven_mitt_ultimatum':'🧤','deedee.sunday_ult':'🍗','deedee.brisk_means_brisk':'🚶','deedee.garden_shower':'🌻','deedee.rise_and_shine':'☀️','deedee.beanie_master':'🧶','deedee.grandma_squeeze':'🫂','deedee.moon_ult':'🌙',
# Boppy
'boppy.cap_swat':'🧢','boppy.patient_angler':'🎣','boppy.recliner_reservation':'🛋️','boppy.headcount_again':'🔢','boppy.lockdown':'🔒','boppy.everybody_waits':'⏳','boppy.fish_ult':'🐟','boppy.pepper_breath':'🌶️','boppy.seeds_of_trouble':'🌱','boppy.mild_for_company':'🫑','boppy.nineteen_seventy':'📻','boppy.five_alarm_jar':'🫙','boppy.xc_ult':'🌳',
# TNB
'tnb.mug_toss':'☕','tnb.foraged_at_dawn':'🍄','tnb.dont_split_up':'🔦','tnb.metro_tap':'🚇','tnb.slasher_scare':'😱','tnb.scope_creep':'📋','tnb.tasting_ult':'🍴','tnb.throw_down':'🏺','tnb.around_the_bend':'🛹','tnb.round_with_jojo':'🥏','tnb.coffee_run':'🥤','tnb.kiln_door_policy':'🔥','tnb.hillbomb_ult':'💣',
# Nara
'nara.jump_up':'🐕','nara.tennis_ball_fetch':'🎾','nara.dont_leave_me':'🥺','nara.just_one_bite':'🦴','nara.counter_surfer':'🥓','nara.stranger_alert':'🚨','nara.squirrel_ult':'🐿️','nara.doodle_fluff':'🐩','nara.shake_everyone':'💧','nara.not_leaving':'🏠','nara.happy_puddle':'☔','nara.food_inspector':'🧐','nara.pack_ult':'🐾',
# Tombos
'grace1':'📦','grace1_dc':'👍','rose1':'✈️','rose1_dc':'☁️','deedee1':'🥂','deedee1_dc':'🧹','tnb1':'🍿','tnb1_dc':'🪟','nara1':'🐾','nara1_dc':'🧩','boppy1':'🥅','boppy1_dc':'🎣','amy1':'📣','amy1_dc':'🎭',
'grace2':'🤸','grace2_dc':'⚖️','rose2':'🧳','rose2_dc':'👑','amy2':'🎨','amy2_dc':'🎈','deedee2':'🌿','deedee2_dc':'🇮🇹','boppy2':'🚫','boppy2_dc':'📏','tnb2':'📏','tnb2_dc':'🚆','nara2':'🪢','nara2_dc':'🙅',
'grace3':'🥟','grace3_dc':'🌑','rose3':'🎧','rose3_dc':'💡','amy3':'🛑','amy3_dc':'🛗','deedee3':'🍳','deedee3_dc':'🍽️','boppy3':'🌱','boppy3_dc':'🏆','tnb3':'🏺','tnb3_dc':'✨','nara3':'🤗','nara3_dc':'🪑',
'ff1':'🛏️','ff2':'🏃','ff3':'💍','ff4':'🪑','ff1_dc':'🏺','ff2_dc':'🥞','ff3_dc':'🚶','ff4_dc':'🍽️','wish':'🎂',
# Items
'roll':'🥐','biscuit':'🥯','cookie':'🍪','mudpie':'🥧','honey':'🍯','fogjuice':'🌫️','dodgeitem':'🔴','acorn':'🌰','sapjar':'🫙','peanuts':'🥜','flatpage':'📄','popcard':'💌','tepidcoffee':'☕','leftovers':'🍝','hotsauce':'🌶️','cufflink':'🌙','pretzels':'🥨','coldbrew':'🧊','juice':'🧃','bandage':'🩹','picnic':'🧺','lemonade':'🍹','cocoa':'🍫','whistle':'🔔','balloon':'🎈','popper':'🎉','cushion':'💨','kazoo':'🎵','goldstar':'⭐','jerky':'🍖',
'bandage1':'🩹','bandage2':'🩹','bandage3':'🩺','picnic1':'🧺','picnic2':'🍔','picnic3':'🦃','popper1':'🎊','popper2':'🎆','popper3':'🚀','ramen':'🍜','greenjuice':'🥬','popcorn':'🍿','lemons':'🍋','praline':'🍬','pupusa':'🫓','sweettea':'🍵','kombucha':'🍶','oatlatte':'🥛','nspepper':'🌶️',
}
def names(e):
    cps=[c for c in e]; hexs=[format(ord(c),'x') for c in cps]
    a='-'.join(h for h in hexs if h!='fe0f'); b='-'.join(hexs)
    return [a,b]
svgs={}; missing=[]; out={}
for k,e in MAP.items():
    code=None
    for n in names(e):
        if os.path.exists(f'{SVG}/{n}.svg'): code=n; break
    if not code: missing.append((k,e)); continue
    if code not in svgs:
        svgs[code]='data:image/svg+xml;base64,'+base64.b64encode(open(f'{SVG}/{code}.svg','rb').read()).decode()
    out[k]=code
if missing: print('MISSING',missing); sys.exit(1)
js="'use strict';\n// data/battle-emoji.js: GENERATED by tools/build_bp_emoji.py. Big, sharp pictures for Rose Mode's menus (engine/battle-pictures.js).\n// Pictures are Twemoji by Twitter / jdecked, CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Do not hand-edit.\nconst BE_SVG="+json.dumps(svgs,separators=(',',':'))+";\nconst BE_MAP="+json.dumps(out,separators=(',',':'),ensure_ascii=False)+";\n"
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data','battle-emoji.js'),'w').write(js)
print(len(out),'ids,',len(svgs),'pictures,',len(js)//1024,'KB')
