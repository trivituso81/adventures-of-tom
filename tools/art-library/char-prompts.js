// Characters tab (Tom 2026-11-05 23:24 and 23:46): one 3 x 2 sheet per ability. Every ability sheet attaches the hero picture,
// the walk sheet and both battle sheets. Tom sends all four pictures to Claude (no Library entries make them); Claude saves them as
// art/raw/characters/<id>-hero-ref-v1.png, <id>-walk-sheet-v1.png, <id>-battle-sheet-1-v1.png, <id>-battle-sheet-2-v1.png.
// art.html shows an ability blocked until its pictures exist.
// Ability frames follow the beats of the real animation in engine/<id>-moves.js (Primary kit, data/abilities.js B8_KITS).
// Shared text: prompts/char-ability-sheet.txt (no left/right words).
const fs = require('fs');
const P = f => fs.readFileSync(__dirname + '/prompts/' + f, 'utf8').trim();
const R = 'art/raw/characters/';

// [move key, move name, row 1 frames, row 2 frames]
const ABILITIES = {
  tom: [
    ['button_mash', 'Disconnected Controller', [
      'Holding a black wireless game controller in both hands at chest height, thumbs on the buttons, calm face.',
      'The same, pressing one button hard, staring down at the controller, eyebrows raised, mouth flat.',
      'Holding the controller out at arm\'s length in one hand, frowning at it, unimpressed.'], [
      'Wind-up: the controller in one hand pulled back behind the shoulder, weight on the back leg, eyes narrowed.',
      'Throw: the arm swung fully forward, the controller just leaving the open fingers, front knee bent.',
      'Empty hands, brushing one palm against the other, a dry satisfied look.']],
    ['defend', 'DEFEND', [
      'Stepping forward quickly, the front foot landing, one arm rising.',
      'Planted, one arm straight out with the palm flat in a calm stop gesture, the other arm held back sheltering someone behind him, firm calm face.',
      'The same stop gesture, chin up, eyes half closed, mouth slightly open, politely saying "no touching, please."'], [
      'Braced: knees bent, both forearms raised in front, shoulders squared, eyes squinting.',
      'Rocked back a little, feet still planted, one palm still out, unbothered face.',
      'Standing tall again, straightening the front of his shirt with both hands, a small dry smile.']],
    ['starter_splash', 'Starter Splash', [
      'Walking, a big glass jar of bubbly sourdough starter hugged in both arms against his chest, proud.',
      'Standing, holding the jar out at arm\'s length in both hands, the lid lifting, eyebrows raised in alarm.',
      'Twisting the lid off with one hand, the jar tipped forward in the other, leaning back.'], [
      'The open jar held out low in both hands and tipped forward, mouth open in a shout.',
      'The jar upright in one hand, the other hand screwing the lid back on, satisfied.',
      'Hugging the closed jar, patting it fondly with one hand, eyes closed, a warm smile.']],
    ['sourdough_snob', 'Sourdough Snob', [
      'Holding a round golden sourdough loaf up in both hands, presenting it proudly.',
      'Tearing the loaf in two with both hands, focused.',
      'Holding out a thick slice of bread on one flat palm, offering it forward, a kind smile.'], [
      'A long thin pointer in one hand pointing upward, the other hand raised with one finger up, mouth open mid lecture, eyebrows raised.',
      'Tapping the pointer on a small chart board held in the other hand, earnest.',
      'Holding the loaf close to his face, studying the crust with narrowed eyes, very serious.']],
    ['overpriced_gadget', 'Retail Therapy', [
      'Kneeling on one knee, both hands resting on top of a large matte-black box on the ground in front of him, excited eyes.',
      'Still kneeling, lifting the lid off the box slowly with both hands, mouth open in awe.',
      'Standing, holding a small sleek silver gadget up high in both hands, a big joyful grin.'], [
      'Holding a very long paper receipt in both hands, the paper hanging to the floor and piled at his feet, reading it.',
      'The same receipt held up close to his eyes, eyebrows raised, lips pressed together.',
      'The receipt folded under one arm, eyes closed, a slow calm nod.']],
    ['noise_canceling', 'Noise-Canceling', [
      'Walking forward calmly, large black over-ear headphones held in one hand at his side, flat face.',
      'Standing, holding the headphones open with both hands above his head, about to put them on.',
      'Headphones on his ears, both hands pressing the ear cups, eyes closing.'], [
      'Headphones on, one finger pressing a button on an ear cup, the other hand raised with the palm out.',
      'Headphones on, arms folded, eyes closed, a peaceful tiny smile, standing perfectly still.',
      'Headphones on, head tilted back slightly, eyes closed, blissful, one hand resting on an ear cup.']],
    ['seat_1a', 'Seat 1A, Peasants', [
      'Standing tall, a boarding pass held up beside his face, chin raised, smug.',
      'Pressing one button on a small remote held out in one hand, eyebrows raised, unbothered.',
      'One arm raised high with the hand closed, pulling something down, the remote in the other hand.'], [
      'A thick plush white duvet held spread in both arms, stepping forward.',
      'Leaning forward, smoothing the duvet down with both hands, a gentle caring face.',
      'Standing straight, hands clasped in front, a polite flight attendant smile.']],
    ['delta_ult', 'Boarding Group Zero', [
      'Tapping a phone held up in one hand, chin raised, proud.',
      'One arm swept out wide and low, palm open, welcoming someone forward, a grand smile.',
      'Standing relaxed, a sleep mask pushed up on his forehead, arms stretched overhead.'], [
      'Lying back almost flat, propped on one elbow, the sleep mask over his eyes, blissful.',
      'One arm pointing straight forward, the other fist on the hip, a bold look.',
      'Holding out a rolled white towel with silver tongs in one hand, a gracious smile.']],
    ['flashcard_flurry', 'Flashcard Flurry', [
      'A thick deck of white flashcards in one hand, fanning it with the other thumb, focused.',
      'Holding up a single flashcard at arm\'s length, eyebrows raised, quizzing.',
      'Flicking a card forward with a snap of the wrist, the deck in the other hand.'], [
      'Flicking another card with the other hand, body turned, mid-throw.',
      'Both arms flung forward, several cards leaving his fingers.',
      'Squaring the deck between both hands, a satisfied teacher look.']],
    ['konami_code', 'Konami Code', [
      'Rubbing his hands together, eyes wide with excitement, a huge grin.',
      'Hopping forward, the front foot stomping down, knees bent, arms out for balance.',
      'Hopping back, the back foot stomping down, arms swinging.'], [
      'One foot stomping, the other leg lifted high, both arms up.',
      'Jumping straight up, both knees tucked, both fists raised.',
      'Landing in a crouch with one fist punched up high, mouth open in a triumphant shout.']],
    ['skincare_10', '10-Step Skincare', [
      'One hand raised flat, palm forward, in a pause gesture, serious face.',
      'A small tray of skincare bottles and jars balanced flat on one hand, the other hand picking up a bottle.',
      'Patting his cheeks with both hands, eyes closed, calm.'], [
      'Holding a white face mask dotted with glowing red lights up to his face with both hands.',
      'Wearing the glowing red-light mask over his face, arms folded, standing still and patient.',
      'The mask lifted up onto his forehead, fingertips touching one cheek, a refreshed glowing smile.']],
    ['kanji_strike', 'Kanji Strike', [
      'Walking, a very large calligraphy brush carried over one shoulder like a pole, calm.',
      'The brush held upright in both hands in front of him, eyes closed, focusing.',
      'Sweeping the brush in a big level stroke, body turned, arms extended.'], [
      'Bringing the brush down in a big downward stroke, front knee bent, leaning in.',
      'The brush raised high on a diagonal above him for the last stroke, mouth open in a shout.',
      'Flicking the brush to the side with one hand to shake off the ink, the other hand on the hip, cool look.']],
    ['know_it_all', 'Know-It-All', [
      'Arms folded, eyebrows raised, a skeptical squint.',
      'One index finger raised high, mouth open, an "um, actually" face.',
      'Leaning forward, the raised finger wagging, eyes half closed, smug.'], [
      'A big red rubber stamp held high in one hand, about to stamp.',
      'Slamming the stamp forward and down at arm\'s length, front knee bent, determined.',
      'Blowing on the stamp held up beside his face, a satisfied smirk.']],
    ['cart_ult', 'Cartridge Tilt', [
      'Looking straight out at the viewer, a flat unimpressed face, head tilted, mid head shake.',
      'Reaching straight up high with both arms, fingers spread, up on his toes.',
      'A large grey game cartridge held in both hands in front of his face, blowing into its bottom edge, cheeks puffed.'], [
      'Pushing the cartridge down with both hands, leaning into it hard, teeth gritted.',
      'The whole body leaning hard to one side, both arms pushing, tilting something huge.',
      'Landing on both feet from a small hop, brushing one palm against the other, a dry satisfied look.']],
  ],
  grace: [
    ['cartwheel', 'Cartwheel', [
      'A lunge with the front knee bent and both arms stretched straight up, eager face.',
      'Mid cartwheel, one hand planted on the ground, body upside down in a wide star, legs straight.',
      'Mid cartwheel, both hands on the ground, legs split wide overhead, hair hanging down.'], [
      'Landed standing tall, one leg kicking high forward, arms out for balance, determined.',
      'Both arms flung up high in a gymnast salute, chest out, a big proud grin.',
      'A small hop on both feet, arms swinging, a happy grin.']],
    ['dance', 'DANCE', [
      'Snapping her fingers with both hands up by her shoulders, counting in, a big smile.',
      'A step-touch: one foot stepping out, the other toe tapping beside it, arms swinging.',
      'A grapevine step, feet crossed, hips swaying, one hand on her hip.'], [
      'A hip sway to one side, both arms pumping, eyes closed, singing along.',
      'Spinning on one foot, the other knee lifted, arms wrapped in, hair flying out.',
      'The final pose: one hand on her hip, the other arm pointing up high, a confident grin.']],
    ['squishy_squeeze', 'Squishy Squeeze', [
      'Walking quickly, a round gold dumpling squishy hugged in both hands against her chest, proud.',
      'Holding the gold dumpling squishy out in both hands at arm\'s length, offering it, a kind smile.',
      'Squeezing the squishy flat between both palms to show how, cheeks puffed, eyes squeezed shut.'], [
      'Holding the squishy out again on one flat palm, the other hand giving a thumbs up.',
      'Hugging the squishy to one cheek, eyes closed, a soft happy smile.',
      'Tucking the squishy under one arm, the other hand waving, a cheerful grin.']],
    ['glitter_nails', 'Glitter Nails', [
      'Walking, a big sparkly bottle of glitter nail polish held up in one hand, excited.',
      'Twisting the cap off the bottle with the other hand, the tiny brush lifting out, tongue poking out in focus.',
      'Bent forward, painting with the tiny brush held delicately, the bottle in the other hand, very focused.'], [
      'Holding her own hand up fingers spread, admiring glittery nails, mouth open in delight.',
      'Blowing on her fingertips, cheeks puffed, the bottle in the other hand.',
      'Wiggling all her glittery fingers up beside her face, a sparkly grin.']],
    ['welcome_back', 'Welcome Back to My Channel', [
      'Holding a purple hairbrush up to her mouth like a microphone, waving at the viewer with the other hand, looking at the viewer, a big vlogger smile.',
      'Talking into the hairbrush microphone, one hand flung out wide, eyebrows up, very dramatic.',
      'Holding the hairbrush microphone out at arm\'s length, offering it forward for an interview, eager face.'], [
      'Nodding seriously, the hairbrush still held out, the other hand on her chin, listening.',
      'The hairbrush back at her mouth, one hand on her heart, a sweet caring face.',
      'Blowing a kiss to the viewer with one hand, the hairbrush held up in the other, looking at the viewer.']],
    ['like_subscribe', 'Like and Subscribe', [
      'Marching forward, arms swinging, chin up, a determined grin.',
      'Pointing straight up at the sky with one finger, the other hand on her hip, mouth open.',
      'Looking up, both hands cupped by her mouth, shouting, eyes wide.'], [
      'Jumping up with both fists in the air, a huge excited grin.',
      'Pointing straight at the viewer with one finger, a cheeky smile, looking at the viewer.',
      'A small hop with both thumbs up, a big grin.']],
    ['dumpling_drop', 'Dumpling Drop', [
      'Running, a stuffed backpack bouncing on her back, both arms pumping, excited.',
      'Holding the open backpack upside down over her head in both hands, a grin.',
      'Bouncing on her toes, both hands cupped by her mouth, shouting "incoming!"'], [
      'Hands pressed to her cheeks, eyes wide, mouth open in an excited gasp.',
      'Hopping with both arms up, cheering, eyes squeezed shut.',
      'Hugging the empty backpack, a sheepish worried look.']],
    ['viral_ult', 'Ten Million Subscribers', [
      'Holding the purple hairbrush microphone to her mouth, waving with the other hand, looking at the viewer, a sunny vlogger smile.',
      'Staring at the hairbrush microphone, eyebrows raised, mouth in a small surprised O.',
      'Both hands pressed to her cheeks, jaw dropped, eyes huge, overjoyed.'], [
      'Holding up a homemade square plaque wrapped in tinfoil with a glitter-glue diamond, both arms raised high, a proud grin.',
      'The tinfoil plaque held out in front of her in both hands, tilted forward, a determined shout.',
      'Hugging the tinfoil plaque to her chest, eyes closed, a happy, teary smile.']],
    ['dance_battle', 'Dance Battle', [
      'Strutting forward, shoulders back, one hand on her hip, a sassy smirk.',
      'Pointing forward with one finger, the other hand beckoning "come on", eyebrows raised.',
      'A shimmy, shoulders shaking, both arms bent, a cheeky grin.'], [
      'A hip pop to one side, both hands on her hips, chin up.',
      'A vogue pose: one hand framing her face, the other arm angled up, a cool look.',
      'A hair flip, head tossed back, one hand pushing her hair, a winning grin.']],
    ['open_strings', 'Open Strings', [
      'Marching proudly, a small violin tucked under one arm and the bow in the other hand.',
      'The violin tucked under her chin, the bow resting on the strings, eyes closed, serious.',
      'Sawing the bow hard across the strings, elbow high, teeth gritted, eyes squeezed shut.'], [
      'Staring at the violin held out in front of her, mouth open, eyebrows up, startled.',
      'Shrugging with the violin in one hand and the bow in the other, a sheepish grin.',
      'A recital bow, bent forward at the waist, the violin and bow held at her sides, proud.']],
    ['handstand_contest', 'Handstand Contest', [
      'One arm raised high, calling out, a bossy confident grin.',
      'A lunge forward, both arms reaching down toward the floor, focused.',
      'A perfect handstand, hands planted, legs straight up together, hair hanging down, steady.'], [
      'In the handstand, legs opened in a wide straddle, toes pointed.',
      'Landed standing tall, arms up high in a gymnast salute, chest out.',
      'Holding a small gold trophy up in both hands, a huge proud grin.']],
    ['portrait_mode', 'Portrait Mode', [
      'Holding a spiral sketchbook against her chest in one arm, a pencil held up in the other hand, measuring with one eye closed.',
      'Pointing the pencil forward sternly, eyebrows down, mouth open, ordering "hold still."',
      'Drawing fast in the sketchbook, pencil scribbling, tongue poking out, very focused.'], [
      'Jabbing the pencil forward at arm\'s length like a tiny fencer, front knee bent, determined.',
      'Holding a torn-out drawing page up in both hands, admiring it, a proud smile.',
      'Holding the drawing page up in front of her like a shield, both arms out, brave face.']],
    ['bedazzle_blast', 'Bedazzle Blast', [
      'Holding a pink rhinestone gun in both hands, pointed up, a mischievous grin.',
      'Aiming the rhinestone gun forward with both hands, one eye closed, focused.',
      'Sweeping the rhinestone gun across, leaning forward, mouth open in a shout.'], [
      'Blowing on the tip of the rhinestone gun held up beside her face, a cool look.',
      'Inspecting forward with the rhinestone gun lowered, head tilted, a thinking face.',
      'A pose with the rhinestone gun on her shoulder and the other hand on her hip, a sparkly grin.']],
    ['olympic_ult', 'Diamond Leotard Finale', [
      'A gymnast salute, one arm straight up, chin high, serious and ready.',
      'Sprinting forward, arms pumping, hair streaming back, determined.',
      'A round-off, both hands on the ground, legs swinging over together.'], [
      'High in a twist, arms tucked tight to her chest, legs straight together, eyes shut.',
      'Landing with both knees bent and arms out, sticking it, fierce face.',
      'Arms up high in a final salute, chest out, a huge proud grin.']],
  ],
  rose: [
    ['boop', 'Boop', [
      'Walking forward with little bouncy steps, one pointer finger already sticking out, a mischievous grin.',
      'Leaning in, poking forward with one pointer finger at arm\'s length, eyes wide, lips pressed together.',
      'Poking again with the same finger, up on tiptoe, giggling.'], [
      'Up on tiptoe, the whole arm stretched forward, one finger jabbing out in a big BOOP, mouth open wide.',
      'Pulling the finger back to her chest, both shoulders scrunched up, laughing with her eyes squeezed shut.',
      'Standing with both hands on her hips, chin up, a proud cheeky smile.']],
    ['silly', 'RASPBERRY', [
      'Standing very still, taking a huge breath, cheeks puffing up round, eyes wide and serious.',
      'Leaning forward from the waist, cheeks puffed out as far as they go, hands balled into fists at her sides.',
      'Blowing a raspberry, tongue stuck out between flapping lips, eyes squeezed shut, head shaking.'], [
      'Still blowing the raspberry, both hands waving beside her ears with fingers spread, tongue out.',
      'Doubled over laughing, both hands over her mouth.',
      'Standing up straight, wiping her mouth with the back of one hand, a very pleased grin.']],
    ['boo', 'Boo!!', [
      'Covering her eyes with both hands, knees bent, sinking down, giggling behind her hands.',
      'Crouched low in a little ball, both hands over her mouth, eyes peeking, trying not to laugh.',
      'Tiptoeing, knees high, both hands held up by her chest like little paws, sneaky face.'], [
      'Jumping up out of a crouch, arms flung up high with fingers spread like claws, mouth wide open yelling BOO.',
      'Landing on both feet, arms still up in claws, a big scary-silly face with her tongue out.',
      'Rolling back on her heels laughing, both hands on her tummy.']],
    ['dress_up_tiara', 'Rainbow Unicorn Cut-Out', [
      'Kneeling on the ground, a crayon in one hand drawing on a sheet of white paper held flat on her knees, tongue poking out in concentration.',
      'Still kneeling, holding up the paper with a rainbow and a unicorn drawn on it, beaming.',
      'Kneeling, cutting around the drawing with small round-tipped safety scissors, very careful face.'], [
      'Standing, holding the cut-out rainbow unicorn up high in both hands, mouth open in delight.',
      'Running forward, the cut-out held out in front of her at arm\'s length, ready to stick it on something.',
      'Pressing the cut-out forward with one flat palm as if sticking it on, the other hand on her hip, proud.']],
    ['giggle_storm', 'Tickle Storm', [
      'Creeping on tiptoe, knees bent, both hands up with wiggling fingers, a sneaky grin.',
      'Crouching low, ready to pounce, eyes narrowed, fingers wiggling.',
      'Leaping forward through the air, both arms reaching out, fingers spread, laughing.'], [
      'Landing, both hands a blur of tickling fingers held out in front, giggling hard.',
      'Swishing a big fluffy feather in one hand in a wide sweep, the other hand up, laughing.',
      'Twirling the feather above her head, standing on one foot, eyes closed, giggling.']],
    ['lamby_hug', 'Lamby Hug', [
      'Walking, Lamby in one hand and Backup Lamby in the other, both small plush lambs held up by her shoulders, a sweet smile.',
      'Standing, holding the two plush lambs out in front of her side by side, kissing one on the head.',
      'Squeezing both plush lambs together against her cheek, eyes closed, a big happy smile.'], [
      'Arms out wide, one plush lamb in each hand, about to give a big hug, mouth open.',
      'Pushing both plush lambs forward in a squishy hug, one in each hand, leaning in, eyes squeezed shut.',
      'Hugging both plush lambs tight to her chest, swaying, a dreamy smile.']],
    ['floor_is_lava', 'Floor Is Lava!', [
      'Pointing at the ground with one finger, the other hand cupped at her mouth, yelling, eyes huge.',
      'Holding a puffy square couch seat cushion over her head in both hands, about to throw it down.',
      'Jumping onto a puffy couch seat cushion on the ground, both knees tucked, arms up.'], [
      'Standing on the couch seat cushion, wobbling on one foot, arms out wide for balance, laughing.',
      'Hopping on the cushion with both feet, pointing ahead with one finger, mouth open in a shout.',
      'Standing safe on the cushion, both fists raised, a triumphant grin.']],
    ['teaparty_ult', 'Tea Party with Lamby', [
      'Walking proudly, a big pink plastic toy teapot held in both hands in front of her, a sweet smile.',
      'Pouring from the toy teapot held in one hand, tilted forward, the other hand holding a tiny pink toy teacup.',
      'Holding the tiny toy teacup up by its handle with her pinky finger sticking out, eyes closed, very fancy face.'], [
      'Clapping her hands together over her head, the teapot on the ground by her feet, mouth open yelling DRINK UP.',
      'Pretending to sip from the tiny toy teacup, pinky out, cheeks round, eyes looking up sideways.',
      'Holding the teacup and the teapot up high, one in each hand, jumping with both feet off the ground, laughing.']],
    ['lookout_lamby', 'Lamby Boomerang', [
      'Standing, Lamby and Backup Lamby each dangling from a pink hair ribbon, one ribbon in each hand, a determined grin.',
      'Whirling both plush lambs around on their ribbons over her head, both arms up, mouth open in a whoop.',
      'Letting go, both arms flung forward, front foot stepping out, eyes wide.'], [
      'Shading her eyes with one flat hand, watching far away, up on tiptoe.',
      'Catching a plush lamb in each hand, arms out, both knees bent, laughing.',
      'Hugging both plush lambs to her chest, bouncing on her toes, a proud smile.']],
    ['piggyback_pounce', 'Piggyback Pounce', [
      'Running forward fast, both arms pumping, a wild excited grin.',
      'Crouching low, ready to jump, both arms swung back, eyes on something high up.',
      'Springing high into the air, arms stretched up, legs kicked back, mouth open in a whoop.'], [
      'Tucked into a ball in midair, knees to her chest, eyes squeezed shut, giggling.',
      'Dropping down feet first, both knees bent, both arms up, mouth open yelling.',
      'Landing on both feet with arms flung out wide like a gymnast, a huge proud grin.']],
    ['bedtime_story', 'Bedtime Story', [
      'Walking, a big picture book hugged against her chest in both arms, Lamby tucked under one arm, a sleepy smile.',
      'Sitting cross-legged on the ground, the big picture book open on her lap, Lamby sitting beside her.',
      'Sitting, holding the open book up and turned outward to show the pictures, mouth open, reading aloud.'], [
      'Sitting, turning a page with one hand, eyes wide, a "what happens next" face.',
      'Sitting, the book on her lap, a big yawn, one hand over her mouth, eyes closing.',
      'Holding the book closed against her chest, eyes shut, a soft smile, saying THE END.']],
    ['lamby_boomerang', 'Ms. Cathy\'s Snack Attack', [
      'Cupping both hands around her mouth, leaning forward, yelling as loud as she can, eyes squeezed shut.',
      'Waving one arm high over her head, up on tiptoe, a huge excited grin.',
      'Bouncing up and down, both fists by her chin, eyes sparkling.'], [
      'Throwing a big round chocolate chip cookie overhand with one arm, front foot forward, mouth open.',
      'Taking a big bite of a cookie held in both hands, cheeks full, eyes closed, very happy.',
      'Jumping straight up with both arms raised, crumbs on her chin, a sugar rush grin.']],
    ['pillow_fort', 'Pillow Fort', [
      'Running in, a big puffy couch cushion hugged in both arms, laughing.',
      'Heaving the couch cushion up over her head with both arms, tongue out with effort.',
      'Dragging a big soft blanket behind her by one corner in one hand, leaning forward, determined.'], [
      'Holding a small square throw pillow up in both hands, about to toss it, giggling.',
      'Peeking out over the top of a big couch cushion she holds in front of her, only her eyes and the top of her head showing, grinning.',
      'Sitting cross-legged, the blanket wrapped around her shoulders like a cape, Lamby in her lap, cozy smile.']],
    ['mecha_ult', 'Operation Shoulder Mecha', [
      'Standing, a taped-up cardboard box held up in both hands, crayon scribbles on it, a huge excited grin.',
      'Pulling the cardboard box down over her head like a helmet, a square eyehole cut in the front, her eyes peeking out.',
      'Wearing the box helmet, both arms out stiff like a robot, one foot stomping, serious face in the eyehole.'], [
      'Wearing the box helmet, pulling back on two paper towel tubes held one in each hand like levers, leaning back.',
      'Wearing the box helmet, one arm punched straight forward with a small cardboard box on the fist, mouth open yelling.',
      'The box helmet pushed up on top of her head, both arms raised high, jumping, a triumphant grin.']],
  ],
  deedee: [
    ['dish_towel_flick', 'Dish-Towel Flick', [
      'Power-walking forward, arms pumping, a folded white dish towel in one hand, eyes narrowed at a spot.',
      'Stopped, leaning in, pointing with one finger, the towel held ready in the other hand, a stern squint.',
      'Wind-up: the dish towel twisted tight between both hands, pulled back over one shoulder, lips pressed together.'], [
      'Flick: the arm snapped forward, the towel cracking out straight from the hand, front knee bent.',
      'Folding the towel into a neat square against her stomach, satisfied.',
      'One hand on her hip, the folded towel over the other forearm, a proud little nod.']],
    ['moon_back', 'MOON & BACK', [
      'Walking forward, both arms opening wide, a warm loving smile.',
      'Arms spread wide for a big group hug, up on her toes, eyes bright.',
      'Pointing up high with one hand, the other hand on her heart, mouth open saying "to the moon and back".'], [
      'Arms wrapped around the air in a big squeezy hug, eyes closed, cheek tilted, smiling.',
      'Both hands pressed over her heart, eyes shining, a tender smile.',
      'Blowing a kiss from her open palm, puckered lips, eyes twinkling.']],
    ['registered_nut', 'Registered Nut, Reporting', [
      'Hurrying forward, an old white nurse cap on her head, a big stethoscope around her neck, eager.',
      'Leaning in, the stethoscope ear pieces in, holding the chest piece out at arm\'s length, eyebrows raised, listening.',
      'Holding up one finger, eyes on a wristwatch, counting, very focused.'], [
      'Peeling a big bandage open with both hands, tongue poking out in concentration.',
      'Pressing the bandage forward with one flat palm, a bright energetic grin.',
      'A quick salute at the brim of the nurse cap, the stethoscope bouncing, a cheeky smile.']],
    ['corner_piece', 'Corner-Piece Privilege', [
      'Walking briskly, a large glass baking dish of steaming rhubarb crisp held in two oven mitts, proud.',
      'Tipping the dish forward to show one golden corner, eyebrows raised, a knowing smile.',
      'Holding a small plate with one square of crisp on it out on one mitt, offering it forward, warm.'], [
      'Scooping the corner piece with a big serving spoon, the dish balanced on one mitt, concentrating.',
      'One mitt on her hip, the dish tucked against her side, a satisfied grin.',
      'A happy little hop, the dish raised in both mitts, eyes closed, beaming.']],
    ['wet_floor', 'Wet Floor!', [
      'Walking quickly, a mop held upright in one hand, a bucket in the other, determined.',
      'Mopping in big swirls, both hands on the mop handle, the mop head on the floor, leaning into it.',
      'Mopping fast, body turned, the mop swept wide, a focused frown.'], [
      'Setting down a big yellow wet floor sign with both hands, bent at the waist.',
      'One hand on her hip, the mop upright in the other hand, admiring the floor, pleased.',
      'Both hands over her mouth, eyes wide, mid "oh!", the mop leaning on her shoulder.']],
    ['wine', 'Wine O\'Clock', [
      'Walking forward, a wine glass held up in one hand and a small spoon in the other, chin up, ready to announce.',
      'Tapping the glass gently with the spoon, eyes on it, eyebrows raised.',
      'Tapping the glass harder with the spoon, glass raised higher, mouth open for attention.'], [
      'Raising the glass high in a toast, the spoon in the other hand, a bright smile.',
      'Taking a sip, the glass tipped to her lips, eyes closed.',
      'The glass held low, one hand on her chest, a contented "ahh" face, eyes half closed.']],
    ['oven_mitt_ultimatum', 'Oven Mitt Ultimatum', [
      'Walking forward, a pair of huge fluffy oven mitts held in one hand, a no-nonsense look.',
      'Pulling one big fluffy oven mitt onto a hand, the other already on, slow and deliberate.',
      'Both oven mitts on, held up in front of her chest, palms out, eyebrows raised, stern.'], [
      'Clapping the two oven mitts together hard, arms forward, mouth open, firm.',
      'Hands on her hips in the oven mitts, chin up, an "I mean it" face.',
      'Arms spread wide in the oven mitts, a satisfied little smile.']],
    ['sunday_ult', 'Sunday Roast Spread', [
      'Ringing a brass dinner bell high in one hand, the other hand cupped by her mouth, calling everyone in.',
      'Tying an apron behind her back with both hands, a determined smile.',
      'Stirring fast with a big wooden spoon in one hand, a pot lid in the other, cooking at top speed.'], [
      'Spinning on one foot, a rolling pin in one hand and a colander in the other, a joyful busy grin.',
      'Carrying a big roast turkey on a platter in both hands, proud and beaming.',
      'Standing with arms spread wide over an imagined table, mouth open saying "dinner\'s ready", radiant.']],
    ['brisk_means_brisk', 'Brisk Walk', [
      'Picking up two small pink hand weights, one in each hand, perfect upright posture.',
      'Power-walking, one arm pumping forward with a weight, the opposite knee high, chin up.',
      'Power-walking, the other arm pumping forward, the back foot pushing off, focused.'], [
      'Mid stride, both arms pumping, elbows bent, a determined set mouth.',
      'Stopped, the weights held at her shoulders, slightly out of breath, cheeks rosy.',
      'One weight raised high in a small victory pump, the other at her side, a proud smile.']],
    ['garden_shower', 'Garden Shower', [
      'Walking over with a garden hose with a spray nozzle in both hands, cheerful.',
      'Holding the nozzle up close to her face, reading it, eyebrows raised.',
      'Aiming the nozzle forward in both hands, squeezing the trigger, leaning back a little.'], [
      'Sweeping the hose wide across, body turned, both hands on the nozzle, delighted.',
      'Checking the nozzle again up close, lips pursed, puzzled.',
      'The hose lowered, one hand on her hip, a sheepish smile.']],
    ['rise_and_shine', 'Rise and Shine', [
      'Walking forward, arms swinging, a disapproving look.',
      'Reaching up high with one hand, gripping a window shade cord, the other hand on her hip.',
      'Yanking the cord down hard with both hands, knees bent, mouth open.'], [
      'Throwing both arms up high, a big bright morning smile.',
      'One hand shading her eyes, squinting happily, the other hand on her hip.',
      'Clapping her hands once, mouth open in a cheery "up and at \'em".']],
    ['beanie_master', 'Beanie Master', [
      'Walking forward, a hand on her stomach, a puzzled frown.',
      'Stopped, both hands on her stomach, eyes wide, lips pressed tight.',
      'Turned away, glancing back over her shoulder, eyebrows raised, a guilty look.'], [
      'Both hands clapped over her mouth, eyes wide, mid "oh my!"',
      'Waving one hand in front of her face, the other hand over her mouth, an embarrassed giggle.',
      'Hands clasped at her chest, cheeks pink, a sheepish grin, shoulders raised.']],
    ['grandma_squeeze', 'Grandma Squeeze', [
      'Arms flung open wide from far away, up on her toes, an "oh come here" face.',
      'Hurrying forward with arms still wide open, a huge loving smile.',
      'Arms wrapped tight around the air in a big squeezy hug, eyes shut, rocking side to side.'], [
      'Still hugging the air, cheek tilted, a squeezed happy face.',
      'Leaning in with puckered lips for a kiss on the cheek, eyes closed.',
      'Standing back, both hands clasped at her chest, a bright red lipstick smile, beaming.']],
    ['moon_ult', 'To the Moon and Back', [
      'Looking up and pointing high with one hand, the other hand on her heart, eyes full of wonder.',
      'Arms spread wide, gathering everyone in for a group hug, a warm smile.',
      'Both hands cupped together held up high above her head, offering something up, eyes shining.'], [
      'Watching upward, both hands pressed over her heart, mouth open in awe.',
      'Arms wrapped around herself, eyes closed, smiling softly.',
      'Blowing a kiss forward from her open palm, puckered lips, eyes twinkling.']],
  ],
  tnb: [
    ['mug_toss', 'Mug Toss', [
      'Standing relaxed, one hand reaching into a canvas tote bag at his side, a calm half smile.',
      'Holding up one slightly crooked clay mug in one hand, studying it, eyebrows raised.',
      'Winding up with the mug held back at shoulder height, relaxed stance, eyes on the target.'], [
      'Mug thrown: the arm extended forward, the mug leaving his hand, an easy shrug of a face.',
      'Hands in his pockets, watching, a small satisfied nod.',
      'A little fist pump at hip height, a quiet grin.']],
    ['wardrobe', 'WARDROBE', [
      'Walking forward pushing a rolling wardrobe rack of costumes with both hands, relaxed.',
      'Stopped beside the rack, one hand on the rail, the other lifting a costume off a hanger, a friendly look.',
      'Holding a costume open with both hands, arms stretched wide, as if helping someone into it, kind smile.'], [
      'Smoothing a collar flat with both hands, tilting his head, checking the fit.',
      'Stepping back, one hand on his chin, admiring his work, pleased.',
      'Two thumbs up, a warm grin, the rack beside him.']],
    ['foraged_at_dawn', 'Foraged at Dawn', [
      'Walking forward holding a very large white plate in both hands out in front of him, serious waiter face.',
      'Bending slightly, the large plate presented low, one finger of the other hand pointing at the tiny center of it.',
      'Speaking in a low hush, eyebrows raised, the plate held steady, leaning in.'], [
      'Both arms sweeping slowly in a long explanation, the plate balanced on one palm, eyes closed with feeling.',
      'A small respectful bow, the plate held against his chest.',
      'Straightening up, the plate back in both hands, a satisfied closed-mouth smile.']],
    ['dont_split_up', "Don't Split Up", [
      'Reaching one hand out to grab a friend by the arm, eyes wide, alert.',
      'Holding a flashlight pointed up under his chin, wide eyes, a spooky dead-serious face.',
      'Standing tall, the flashlight held out in front, whispering over his shoulder, tense.'], [
      'Standing with his back turned, the flashlight raised, scanning, tense shoulders.',
      'Flinching and jumping at a noise, the flashlight swinging, mouth open.',
      'Hand pressed to his chest, breathing out, a nervous laugh.']],
    ['metro_tap', 'Metro Tap Card', [
      'Patting his jacket pockets one by one, a thoughtful frown.',
      'Pulling a small plastic transit card out of one pocket, pleased, holding it up.',
      'Reaching forward, tapping the card flat against a small card reader, relaxed.'], [
      'Holding one arm out, palm up, gesturing "after you" toward a train door, a polite smile.',
      'Leaning on a pole, one foot crossed over the other, calm commuter face.',
      'A little wave goodbye with two fingers, a mellow smile.']],
    ['slasher_scare', 'Slasher Jump Scare', [
      'Reaching up to flip a light switch, a mischievous look.',
      'Holding a flashlight under his chin, wide eyes, an eerie grin.',
      'Pointing the flashlight beam straight ahead, eyebrows raised, whispering, delighted.'], [
      'Both hands thrown up, mouth wide open in a big dramatic scream.',
      'Clutching his own chest, doubled over laughing.',
      'A proud little bow, the flashlight under one arm, a gleeful grin.']],
    ['scope_creep', 'Scope Creep', [
      'Standing holding an open laptop in one arm, the other hand on the keys, a tidy professional smile.',
      'Pushing his glasses up with one finger, the laptop held up, saying "just a tiny change", innocent face.',
      'One finger raised, "one more thing", the laptop on his forearm, eyebrows high.'], [
      'Both hands out, wincing apologetically, the laptop under one arm, a pained smile.',
      'Holding the laptop at arm\'s length like it is heavy, eyes wide, mouth open.',
      'Shrugging with both palms up, the laptop snapped shut under his arm, a sheepish grin.']],
    ['tasting_ult', 'Tasting Menu', [
      'Snapping a white tablecloth out wide with both hands, arms spread, elegant.',
      'Walking with a silver dish cover held in one hand, a white napkin over the other forearm, a refined smile.',
      'Lifting a silver dish cover with a flourish, the other arm folded behind his back, proud.'], [
      'Presenting a small plate with one hand, the other behind his back, bowing slightly, calm and gracious.',
      'Stacking empty plates up one arm, quick and tidy, concentrating.',
      'Holding out a small slip of paper, the check, with a polite closed-mouth smile.']],
    ['throw_down', 'Throw Down', [
      'Sitting at a pottery wheel, both hands cupped around a lump of wet clay, calm focus.',
      'Both hands pulling the clay walls of a smooth bowl upward, eyes on the clay, serene.',
      'One foot pressing the wheel pedal, a quick glance down, a hint of a smirk.'], [
      'Leaning back, hands off the clay, eyes wide, spattered with clay flecks.',
      'Lifting a small bowl out in both hands, holding it up, pleased.',
      'Wiping a clay-smudged cheek with the back of a wrist, a sheepish smile.']],
    ['around_the_bend', 'Just Around the Bend', [
      'Standing on a hiking trail, pointing ahead up the path, a bright reassuring smile.',
      'Walking uphill in a hiking stride, a daypack on his back, one arm swinging, upbeat.',
      'Pointing ahead again with a pleading smile, a little out of breath, hair damp.'], [
      'Bent forward with both hands on his knees, breathing hard, still smiling.',
      'Standing tall at the top, arms thrown wide, face lit by golden light, delighted.',
      'Looking away, one hand rubbing the back of his neck, acting like this was the plan.']],
    ['round_with_jojo', 'Frisbee Golf', [
      'Standing with a flying disc held in one hand, relaxed, waving an arm toward someone off to the side.',
      'Winding up to throw the disc, one arm back, feet planted, calling out with his mouth open.',
      'Disc thrown: the arm sweeping forward, body twisted, following the throw with his eyes.'], [
      'Standing with a hand shading his eyes, watching the disc fly, relaxed.',
      'Both hands cupped around his mouth, calling out, a big grin.',
      'Hands on hips, shaking his head with a laugh, affectionate.']],
    ['coffee_run', 'Coffee Run', [
      'Jogging forward at a quick pace, one hand raised, a quick "see you soon" over his shoulder, cheerful.',
      'Standing patiently holding a small paper order slip, one foot tapping, calm.',
      'Walking carefully with a cardboard tray of four paper cups held in both hands, eyes on the cups.'], [
      'Presenting one paper cup held out in one hand, the tray in the other, a warm smile.',
      'Holding the cup up to read the name written on it, one eyebrow raised.',
      'Giving a small satisfied nod, the tray held against his hip, easy confidence.']],
    ['kiln_door_policy', 'Kiln Door Policy', [
      'Standing next to a small brick kiln, one hand turning a round dial on it, a calm look.',
      'Both hands gripping the kiln door handle, leaning back to pull, set jaw.',
      'The door pulled wide open, turning his face away and bracing, one arm raised to shield his eyes.'], [
      'Arms folded, standing relaxed with the open door beside him, a smug half smile.',
      'Pushing the kiln door closed with one flat palm, eyes calm.',
      'Dusting his hands together, a tiny satisfied smile.']],
    ['hillbomb_ult', 'Baxter Street Bomb', [
      'Standing at the top of a steep street, one foot on a longboard, a hand over his eyes, very relaxed.',
      'Crouched low on a longboard, arms tucked, leaning forward, a fierce grin.',
      'Riding in a deep crouch, one hand trailing out for balance, hair blown back, joyful.'], [
      'Reaching one hand into a tote bag at his hip while riding, a mischievous smile.',
      'Leaning hard into a turn, one hand out, the board carving, wide eyes, thrilled.',
      'Standing on the board coasting, both arms stretched wide, an enormous grin.']],
  ],
};

// Pronoun in the shared header's last line (Tom's entries keep "he").
const PRONOUN = { grace: 'she', rose: 'she', deedee: 'she' };
const GROUP = { tom: 'Tom', grace: 'Grace', rose: 'Rose', deedee: 'Deedee', tnb: 'TNB' };
const entries = [];
for (const id of Object.keys(ABILITIES)) {
  const who = GROUP[id], hero = R + id + '-hero-ref-v1.png', walk = R + id + '-walk-sheet-v1.png';
  const b1 = R + id + '-battle-sheet-1-v1.png', b2 = R + id + '-battle-sheet-2-v1.png';
  for (const [key, name, r1, r2] of ABILITIES[id]) {
    const n = (a, o) => a.map((t, i) => (i + 1 + o) + '. ' + t).join('\n');
    entries.push({ id: id + '-ab-' + key.replace(/_/g, '-'), tab: 'Characters', group: who, title: who + ' ability: ' + name + ' (6 frames; needs your two battle sheets)', ar: '3:2', refs: [hero, walk, b1, b2],
      prompt: P('char-ability-sheet.txt').replace('unless a frame says he looks', 'unless a frame says ' + (PRONOUN[id] || 'he') + ' looks') + '\n\nThe move: ' + name + '.\n\nRow 1:\n' + n(r1, 0) + '\n\nRow 2:\n' + n(r2, 3) });
  }
}
// Objects and effects sheets (Tom 2026-11-06 00:17; Grace, Rose, Deedee 00:34): one 4 x 3 sheet per ability with every object and effect the move needs,
// painted to match. Ref: that ability's newest approved sheet (art/raw/characters/<id>-ab-<move>-vN.png), so held objects
// are copied from it. Shared text: prompts/char-ability-fx.txt. Items follow the scenes the move draws in engine/<id>-moves.js.
const FX = {
  tom: {
    button_mash: [
      'The game controller from the picture, front view.',
      'The same controller tilted at an angle, as if spinning through the air.',
      'A small no-signal badge: four rising signal bars with a red cross over them.',
      'A curved white motion swoosh, the path of a thrown object (wide).',
      'A big jagged impact burst, yellow and white.',
      'Three plump golden stars in a small ring, for dizziness.',
      'A small puff of grey dust.'],
    defend: [
      'A big glowing open hand, palm forward, made of pale blue light: a magic stop sign.',
      'A small wooden placard on a short stake, reading NO TOUCHING in neat hand-painted letters.',
      'A curved pale blue shield arc, like the edge of a glassy dome.',
      'Three short pale blue speed lines.',
      'A small white flash where something bounces off.',
      'A tiny gold twinkle star.'],
    starter_splash: [
      'The glass starter jar from the picture, lid on, full of bubbly cream starter.',
      'The same jar with the lid off, starter foaming up over the rim.',
      'The jar\'s lid alone.',
      'A wide rolling wave of thick bubbly cream sourdough starter, cresting high at one end, glossy, full of bubble holes (wide).',
      'A big crashing splash of the same starter, blobs flying up.',
      'A flat sticky puddle of starter with a few bubbles (wide).',
      'A cluster of five round starter bubbles of different sizes.',
      'One large glossy starter bubble.',
      'A few small flying blobs and drops of starter.'],
    sourdough_snob: [
      'The round sourdough loaf from the picture, whole, with its scored ear on top.',
      'The same loaf torn in half, the soft open crumb showing.',
      'A thick slice of the same bread.',
      'The thin wooden pointer from the picture (tall).',
      'A big flip chart on a wooden easel, like the chart board in the picture, with a simple hand-drawn rising line and bars, no words (tall).',
      'A soft curl of warm white steam.',
      'Three small red hearts.',
      'A cluster of golden sparkles.',
      'A small scatter of bread crumbs.'],
    overpriced_gadget: [
      'The matte-black box from the picture, closed.',
      'The box\'s lid alone.',
      'The open box with warm golden light beaming up out of it.',
      'The silver gadget from the picture, with its big camera bump.',
      'A white paper price tag on a string, reading $1499.',
      'The long paper receipt from the picture, unrolling in a loose curl (tall).',
      'A pile of crumpled receipt paper.',
      'A burst of warm golden light rays.',
      'Three small red hearts.'],
    noise_canceling: [
      'The black over-ear headphones from the picture, open.',
      'The same headphones from the side, ear cups turned flat.',
      'A big jagged red sound wave, a zigzag band of noise (wide).',
      'The same red wave cut off cleanly at one end, as if sliced (wide).',
      'A calm pale blue ripple of rings, a soft wave of quiet.',
      'A spiky shouting speech bubble, empty inside.',
      'Small broken shards of the red zigzag, flying apart.',
      'A small glowing blue power button light.'],
    seat_1a: [
      'The boarding pass from the picture.',
      'The small remote from the picture.',
      'A hanging airport sign reading BOARDING GROUP 5 (wide).',
      'A tall sliding cabin door in deep navy with a brass handle and a small red light (tall).',
      'An airplane window with its pale grey shade pulled all the way down.',
      'The plush white duvet from the picture, spread loose (wide).',
      'A plush white pillow.',
      'A dark navy sleep mask.',
      'A small glowing red light panel reading DO NOT DISTURB.'],
    delta_ult: [
      'The phone from the picture, a boarding pass on its screen.',
      'An airport gate scanner on a short stand, a green light glowing.',
      'A long red carpet runner, rolled out flat (wide).',
      'A tall glowing gate door with a sign reading GATE 0 above it (tall).',
      'A sleek lie-flat airline seat pod, fully reclined, deep navy and cream (wide).',
      'The sleep mask from the picture.',
      'A sleek white passenger jet seen from the side (wide).',
      'The rolled white towel from the picture, steaming.',
      'The silver tongs from the picture.',
      'A long white contrail streak with speed lines (wide).',
      'A soft warm golden glow burst.'],
    flashcard_flurry: [
      'The deck of white flashcards from the picture, squared.',
      'One blank flashcard from the deck.',
      'One flashcard tilted, spinning through the air, a small motion trail.',
      'One flashcard with the kanji 日 in bold black brush strokes.',
      'One flashcard with the kanji 月 in bold black brush strokes.',
      'One flashcard with the kanji 火 in bold black brush strokes.',
      'One flashcard with the kanji 水 in bold black brush strokes.',
      'One flashcard with the kanji 木 in bold black brush strokes.',
      'One flashcard with the kanji 山 in bold black brush strokes.',
      'A shiny gold star sticker.',
      'A square tile with a big question mark.',
      'A small white impact pop.'],
    konami_code: [
      'A huge game controller lying flat on the floor like a mat, the same design as the controller printed on his shirt in the picture, seen from above at an angle (wide).',
      'A giant chunky yellow arrow pointing up.',
      'A giant round red button, like the buttons on that controller.',
      'A giant cross-shaped direction pad, like the one on that controller.',
      'A big white starburst flash.',
      'A small green badge reading 1UP.',
      'A small dust puff from a stomp.',
      'A cluster of gold sparkles.'],
    skincare_10: [
      'The tray of skincare bottles and jars from the picture.',
      'One tall pump bottle from the tray (tall).',
      'One small round jar of cream, lid off.',
      'One dropper bottle.',
      'The white face mask from the picture, lights off.',
      'The same mask with its little lights glowing bright red.',
      'A soft round red-light glow.',
      'A cluster of clean white and gold sparkles.',
      'A big white pause symbol: two thick rounded bars.',
      'A small round countdown timer.'],
    kanji_strike: [
      'The giant calligraphy brush from the picture (tall).',
      'A big kanji 火 written in thick black brush ink, glowing warm orange at the edges, filling the cell.',
      'The first stroke of 火 alone, in the same glowing ink.',
      'The second stroke of 火 alone, in the same glowing ink.',
      'The third stroke of 火 alone, in the same glowing ink.',
      'The fourth stroke of 火 alone, in the same glowing ink.',
      'A splash of black ink drops flying off a brush.',
      'A big burst of orange and yellow flames.',
      'One small flame.',
      'A ring of glowing embers.'],
    know_it_all: [
      'The red rubber stamp from the picture.',
      'A red ink stamp mark: a rough rectangle with the word FALSE and a big X.',
      'A big red X in rough stamp ink.',
      'An empty round white speech bubble.',
      'Two soft red blush ovals, for embarrassed cheeks.',
      'A small white impact burst.',
      'A small gold ding sparkle.'],
    cart_ult: [
      'The big grey game cartridge from the picture, front view, with a colorful label reading THE ADVENTURES OF TOM.',
      'The same cartridge seen from its bottom edge, the gold contact pins showing.',
      'A boxy cream and grey home game console with a cartridge slot on top.',
      'A puff of grey dust blown out in a cone.',
      'A strip of rainbow glitch bars, flat horizontal color stripes (wide).',
      'A big jagged impact burst, white and yellow.',
      'A ring of gold and white sparkles.',
      'A few small grey dust specks.'],
  },
  grace: {
    cartwheel: [
      'A curved trail of gold and white sparkles, the arc of a cartwheel (wide).',
      'A big four-point gold twinkle star.',
      'A cluster of small gold and white sparkles.',
      'A big jagged impact burst, yellow and white.',
      'Three plump golden stars in a small ring, for dizziness.',
      'A small puff of dust.'],
    dance: [
      'A round glowing gold dance-step spot on the floor, seen from above at an angle.',
      'A pair of glowing gold footprints.',
      'A glowing heart-shaped floor spot, warm red and gold.',
      'A burst of colorful paper confetti.',
      'Three musical notes, purple and gold.',
      'A soft warm golden glow ring.',
      'A cluster of small sparkles.'],
    squishy_squeeze: [
      'The gold dumpling squishy from the picture.',
      'The same squishy squeezed flat, as if pressed between two palms.',
      'A puff of gold glitter.',
      'A soft warm golden glow.',
      'Three small red hearts.',
      'A small soft round squish burst.'],
    glitter_nails: [
      'The sparkly glitter nail polish bottle from the picture, cap on.',
      'The bottle\'s cap with its tiny brush, glitter polish on the bristles.',
      'One giant glittery painted fingernail, shiny and sparkling.',
      'A cloud of fine glitter.',
      'A cluster of sparkles.',
      'One glossy drop of glitter polish.'],
    welcome_back: [
      'The purple hairbrush from the picture.',
      'A small recording badge: a glowing red dot and the letters REC.',
      'An empty rounded white speech bubble.',
      'Three small red hearts.',
      'A soft warm golden glow.',
      'A cluster of sparkles.'],
    like_subscribe: [
      'A huge rounded red button reading SUBSCRIBE in white letters (wide).',
      'A golden notification bell, ringing, with little ring lines.',
      'A big round thumbs-up badge.',
      'A big jagged impact burst.',
      'A burst of colorful confetti.',
      'A cluster of sparkles.'],
    dumpling_drop: [
      'The stuffed backpack from the picture, open, squishies peeking out.',
      'The same backpack empty and floppy.',
      'A round gold dumpling squishy.',
      'A strawberry squishy.',
      'A white cat-face bun squishy.',
      'A panda bun squishy.',
      'A peach squishy.',
      'A slice of toast squishy with a smiley face.',
      'Three plump golden stars in a small ring, for dizziness.',
      'A small puff of dust from a bounce.'],
    viral_ult: [
      'The purple hairbrush from the picture.',
      'The homemade tinfoil plaque from the picture, with its glitter-glue diamond, hanging on a string.',
      'A red badge reading LIVE.',
      'A fan of rainbow light spreading out from a small glass prism (wide).',
      'A shower of falling gold sparkles.',
      'A red heart with a white thumbs up inside.',
      'A blown-kiss heart with a tiny sparkle trail.',
      'A big starburst flash.',
      'A burst of glitter.',
      'A swirling storm of red hearts and gold stars (wide).'],
    dance_battle: [
      'A tall cone of white spotlight from above (tall).',
      'A round spot of light on the floor (wide).',
      'A green up arrow.',
      'Three sweat drops.',
      'A small gold trophy cup.',
      'A burst of colorful confetti.',
      'A small puff of dust.',
      'A big starburst.'],
    open_strings: [
      'The small violin from the picture.',
      'The violin bow from the picture (wide).',
      'One wobbly crooked music note, sour green.',
      'A cluster of three crooked sour music notes, green and purple.',
      'A jagged screeching sound wave, zigzag lines (wide).',
      'A music note cracking in two.',
      'A small gold sparkle.'],
    handstand_contest: [
      'The small gold trophy from the picture.',
      'A rectangular blue gymnastics floor mat, seen from above at an angle (wide).',
      'A soft warm golden glow ring.',
      'A small puff of dust.',
      'A big starburst.',
      'A cluster of gold sparkles.'],
    portrait_mode: [
      'The spiral sketchbook from the picture, closed.',
      'The pencil from the picture.',
      'The torn-out drawing page from the picture, with a quick pencil sketch of a funny round monster on it.',
      'A small rubber eraser.',
      'A puff of eraser crumbs.',
      'A swirl of grey pencil scribble lines.',
      'A small pencil-sketch star.'],
    bedazzle_blast: [
      'The rhinestone gun from the picture.',
      'One big faceted rhinestone gem, clear and sparkling.',
      'A spray of many small colorful rhinestones flying (wide).',
      'One sharp pointed crystal gem.',
      'A cluster of sparkles.',
      'A ring of gem glints.'],
    olympic_ult: [
      'A wide royal-blue gymnastics spring floor with a white boundary line, seen from above at an angle (wide).',
      'A white judge\'s score card reading 10.',
      'A cluster of sequin glints, silver and gold.',
      'A blazing meteor streak, gold and white, with a long trail (wide).',
      'A swirling vortex of gold stars.',
      'A round puff cloud.',
      'A big white shock ring on the floor (wide).',
      'A big starburst flash.'],
  },
  rose: {
    boop: [
      'A small round poke ripple, white rings.',
      'A big round soft impact pop, yellow and white.',
      'A small plump cartoon star.',
      'Three small red hearts.',
      'A cluster of sparkles.'],
    silly: [
      'A wide wobbly comic spray of tiny droplets, like a raspberry blown across the room (wide).',
      'A wobbly tongue-shaped sound ring.',
      'A puff of air with little motion lines.',
      'A round poof cloud with a few stars.',
      'Wobbly comic sound lines.',
      'A small swirl of dizzy stars.'],
    boo: [
      'A big round poof cloud.',
      'A few small stars flying out of a poof.',
      'A big jagged scare burst, white and yellow.',
      'A red exclamation mark.',
      'Three small sweat drops.',
      'A flash of white light.'],
    dress_up_tiara: [
      'The crayon from the picture.',
      'The round-tipped safety scissors from the picture.',
      'A blank sheet of white paper.',
      'The sheet of paper with the rainbow and unicorn drawing from the picture.',
      'The cut-out rainbow unicorn from the picture.',
      'A few curly paper scraps.',
      'A cluster of sparkles.'],
    giggle_storm: [
      'The fluffy feather from the picture.',
      'A swirl of many small rainbow feathers (wide).',
      'Three single small feathers in different colors.',
      'Wiggly tickle motion lines.',
      'A few small happy tear drops.',
      'A cluster of sparkles.'],
    lamby_hug: [
      'Lamby, the small plush lamb from the picture.',
      'Backup Lamby, the second plush lamb from the picture.',
      'Lamby flying through the air, tilted.',
      'A big soft red heart.',
      'Three small red hearts.',
      'A soft warm golden glow.'],
    floor_is_lava: [
      'The puffy couch seat cushion from the picture.',
      'A tall stack of three couch cushions (tall).',
      'A wide pool of bright orange cartoon lava, glowing (wide).',
      'A few round lava bubbles popping.',
      'A curl of hot steam.',
      'One small flame.',
      'A few small orange sparks.'],
    teaparty_ult: [
      'The toy teapot from the picture.',
      'The tiny toy teacup from the picture.',
      'A little round kids table with a lacy white tablecloth.',
      'A tiny chair to match the table.',
      'Lamby, the plush lamb, wearing a small bow tie.',
      'A thin trickle of sparkles, like pouring invisible tea.',
      'A tall column of rainbow sparkle fireworks with hearts (tall).',
      'A burst of heart confetti.',
      'A big starburst flash.',
      'A soft warm golden glow.'],
    lookout_lamby: [
      'Lamby dangling from a hair ribbon, as in the picture.',
      'Backup Lamby dangling from a hair ribbon, as in the picture.',
      'Lamby flying and spinning, the ribbon trailing.',
      'A curved swoosh trail, the path of a thrown toy curving back (wide).',
      'A big soft impact burst.',
      'A cluster of sparkles.'],
    piggyback_pounce: [
      'A tall wobbly tower of couch cushions (tall).',
      'A big white shock ring on the floor (wide).',
      'A big jagged impact burst.',
      'A curved white motion trail of a flip.',
      'Three plump golden stars in a small ring, for dizziness.',
      'A small puff of dust.'],
    bedtime_story: [
      'The big picture book from the picture, closed.',
      'The same book open, colorful pictures on both pages.',
      'Lamby, the plush lamb from the picture.',
      'A small glowing crescent moon.',
      'A scatter of twinkling stars.',
      'Big soft letters Zzz.',
      'A few soft dream sparkles drifting.',
      'A soft warm golden glow.'],
    lamby_boomerang: [
      'The chocolate chip cookie from the picture.',
      'The same cookie with a bite taken out.',
      'A big tray of treats: cookies, apple slices and juice boxes (wide).',
      'One juice box.',
      'A small scatter of cookie crumbs.',
      'A big starburst.',
      'A cluster of sparkles.'],
    pillow_fort: [
      'The big puffy couch cushion from the picture.',
      'The small square throw pillow from the picture.',
      'The big soft blanket from the picture, spread loose (wide).',
      'A finished pillow fort: cushions stacked into walls with the blanket over the top (wide).',
      'A small red heart.',
      'A soft warm golden glow.'],
    mecha_ult: [
      'The cardboard box helmet from the picture, eyehole in front.',
      'The two paper towel tube levers from the picture.',
      'A cardboard chest plate with a crayon heart emblem.',
      'The small cardboard box rocket fist from the picture, with a little crayon flame.',
      'A visor cut from a cereal box.',
      'A scribbly red crayon target circle.',
      'A wide beam of rainbow bands with glitter (wide).',
      'Rainbow rings shrinking inward.',
      'Diagonal speed lines.',
      'A big starburst flash.',
      'A cluster of gold stars.',
      'A roll of tape.'],
  },
  deedee: {
    dish_towel_flick: [
      'The white dish towel from the picture, folded into a neat square.',
      'The same towel twisted tight like a rope.',
      'The towel snapped out straight, cracking at the tip (wide).',
      'A small smudge of dirt.',
      'A sharp white crack burst.',
      'Small shock lines.'],
    moon_back: [
      'A soft glowing crescent moon with a sleepy smile.',
      'A soft pale moonbeam (tall).',
      'A big warm red heart.',
      'A few drifting golden motes.',
      'A cluster of sparkles.',
      'A soft warm golden glow.'],
    registered_nut: [
      'The white nurse cap from the picture.',
      'The stethoscope from the picture.',
      'The big bandage from the picture, opened.',
      'A small name badge reading RN.',
      'A red heartbeat line (wide).',
      'A soft warm golden glow.',
      'A small red heart.'],
    corner_piece: [
      'The glass baking dish of rhubarb crisp from the picture.',
      'The same dish with one corner piece missing.',
      'The small plate with one square of crisp from the picture.',
      'The big serving spoon from the picture.',
      'The oven mitts from the picture.',
      'A curl of warm steam.',
      'A cluster of golden sparkles.'],
    wet_floor: [
      'The mop from the picture (tall).',
      'The bucket from the picture.',
      'The yellow wet floor sign from the picture.',
      'A wide shiny wet puddle with a gleam (wide).',
      'A few water drops.',
      'A sticky amber blob.',
      'A clean white sparkle.'],
    wine: [
      'The wine glass from the picture.',
      'The small spoon from the picture.',
      'A bottle of red wine with its cork in.',
      'The cork alone.',
      'A small pop burst.',
      'Three small red hearts.',
      'A small clink sparkle.'],
    oven_mitt_ultimatum: [
      'The pair of huge oven mitts from the picture.',
      'One oven mitt alone.',
      'A wooden rail with hooks (wide).',
      'The two mitts hanging, a little scorched.',
      'A wave of shimmering heat (wide).',
      'A clap burst.',
      'A white shock ring.'],
    sunday_ult: [
      'The brass dinner bell from the picture.',
      'The apron from the picture.',
      'The big wooden spoon from the picture.',
      'The pot lid from the picture.',
      'The rolling pin from the picture.',
      'The colander from the picture.',
      'The roast turkey on its platter from the picture.',
      'An enamel kitchen stove with four burners (wide).',
      'A ring of burner flame, blue and orange.',
      'A whirlwind cyclone with flour and steam (tall).',
      'A curl of steam.',
      'A long dinner table covered with food (wide).'],
    brisk_means_brisk: [
      'The pair of small hand weights from the picture.',
      'One hand weight.',
      'A small sign on a stick reading SIGHTSEEING.',
      'Speed lines (wide).',
      'A small puff of dust.',
      'A thump impact burst.'],
    garden_shower: [
      'The garden hose nozzle from the picture.',
      'A coil of green garden hose.',
      'A big arc of water spray (wide).',
      'A spray of water drops.',
      'A small splash.',
      'A small rainbow in a mist of water.'],
    rise_and_shine: [
      'A window with its shade pulled down and a cord hanging.',
      'The same window with the shade rolled up, bright light pouring in.',
      'A wide beam of bright morning sunlight (wide).',
      'A bright sun glare burst.',
      'A few floating dust motes in the light.',
      'Three short wavy glare lines.'],
    beanie_master: [
      'A big soft green cloud of mist, wispy, no outline (wide).',
      'A small green puff with a thin ring around it.',
      'A few curling green wisps.',
      'A small bowl of baked beans.',
      'A soft golden glow with fine twinkles.',
      'Short speed lines.'],
    grandma_squeeze: [
      'A bright red lipstick kiss mark.',
      'A big warm red heart.',
      'Three small red hearts.',
      'Squeeze motion lines.',
      'A soft warm golden glow.'],
    moon_ult: [
      'A big golden full moon with a sleepy smile.',
      'A wide dark blue night sky with twinkling stars (wide).',
      'A wide shimmering moonbeam (tall).',
      'A golden heart with a sparkly trail.',
      'A patchwork quilt of 3 by 3 stitched patches with a scalloped hem (wide).',
      'A red lipstick kiss mark.',
      'A shower of falling starlight.',
      'Three big soft red hearts.',
      'A big starburst flash.'],
  },
  tnb: {
    mug_toss: [
      'The slightly crooked clay mug from the picture, upright, with a small sticker on it.',
      'The same mug tilted, as if tumbling through the air.',
      'A curved white swoosh, the path of a thrown object (wide).',
      'A big jagged impact burst, yellow and white.',
      'A small star burst.',
      'A small sparkle.'],
    wardrobe: [
      'The rolling wardrobe rack from the picture with costumes on hangers (wide).',
      'The costume from the picture on a wooden hanger.',
      'A burst of colorful confetti.',
      'A soft warm glow.',
      'A cluster of sparkles.',
      'A small steam puff.'],
    foraged_at_dawn: [
      'The very large white plate from the picture, with one tiny green pea in the center.',
      'A single green pea.',
      'A round speech bubble, empty.',
      'Three small drifting letters Z for sleep.',
      'A soft pale green glow.',
      'A cluster of sparkles.'],
    dont_split_up: [
      'The flashlight from the picture.',
      'A wide cone of pale flashlight beam (wide).',
      'A dark vignette frame, black fading to clear in the middle (wide).',
      'A small glowing ring of light.',
      'A small snapped twig.',
      'A few small alarm marks.'],
    metro_tap: [
      'The small plastic transit card from the picture.',
      'A small card reader with a glowing green light.',
      'A modern light-rail train car, side view (wide).',
      'A soft warm glow.',
      'A cluster of sparkles.',
      'A small curl of warm air.'],
    slasher_scare: [
      'The flashlight from the picture.',
      'A wide cone of pale flashlight beam (wide).',
      'A dark vignette frame, black fading to clear in the middle (wide).',
      'A cartoon slasher in a white mask and dark coveralls, arms up, goofy and friendly (tall).',
      'A big white flash burst.',
      'A word balloon reading AAAAH in jagged red letters.',
      'A small clapperboard.'],
    scope_creep: [
      'The open laptop from the picture, front view.',
      'A project timeline chart with one tidy long bar (wide).',
      'The same timeline with many sub-bars sprouting off it (wide).',
      'A small deadline flag on a pole.',
      'A burst of paper sheets in the air.',
      'A small cloud of grey dust.',
      'A small sticky note reading TINY CHANGE.'],
    tasting_ult: [
      'A white tablecloth spread flat with a lit candle on it (wide).',
      'A silver dish cover.',
      'The same silver dish cover with the lid lifted off a small plate.',
      'A small plate with a seared scallop and a saffron drizzle.',
      'A white folded napkin.',
      'A restaurant check on a small tray.',
      'A shower of gold sparkles.',
      'A soft warm golden glow.'],
    throw_down: [
      'A pottery wheel with a lump of wet clay on it.',
      'The same wheel with a smooth finished bowl on it.',
      'A lumpy clay bowl flying apart in pieces.',
      'A few flying drops of muddy water.',
      'A clay-spattered splash burst.',
      'A small mud-colored dust puff.',
      'A small ceramic bowl, finished and glazed.'],
    around_the_bend: [
      'A wooden trail sign on a post reading SHORT HIKE.',
      'A winding dirt trail with a bend (wide).',
      'A small wooden sign reading JUST AROUND THE BEND.',
      'A small daypack.',
      'A soft golden sunset glow (wide).',
      'A cluster of sparkles.'],
    round_with_jojo: [
      'The flying disc from the picture.',
      'The same disc tilted, seen at an angle in flight.',
      'A curved white swoosh, the path of a thrown disc (wide).',
      'A small puff of dust.',
      'A small cheer burst with little stars.',
      'A basket-shaped disc golf target on a pole (tall).'],
    coffee_run: [
      'The cardboard tray holding four paper cups from the picture.',
      'One paper cup with a lid and a name scrawled on it.',
      'A small coffee shop awning with a counter (wide).',
      'A speed streak (wide).',
      'A curl of steam.',
      'A soft warm golden glow.',
      'A cluster of sparkles.'],
    kiln_door_policy: [
      'The small brick kiln from the picture with its door closed.',
      'The same kiln with the door swung open, bright orange glow inside.',
      'A big blast of orange fire and heat (wide).',
      'A wave of shimmering heat (wide).',
      'A big starburst flash, orange and white.',
      'A small curl of smoke.',
      'A small shield of pale blue light.'],
    hillbomb_ult: [
      'The longboard from the picture, seen from the side (wide).',
      'The same longboard seen from above.',
      'A very steep street with parked cars and a sign reading 32 PERCENT GRADE (wide).',
      'Speed lines (wide).',
      'A trail of dust kicked up behind a skateboard (wide).',
      'A burst of flying clay shards.',
      'A big impact burst, yellow and white.',
      'A small clay mug, crooked, in flight.'],
  },
};
for (const id of Object.keys(FX)) {
  const who = GROUP[id];
  for (const [key, name] of ABILITIES[id].map(a => [a[0], a[1]])) {
    const items = FX[id][key]; if (!items) continue;
    const slug = id + '-ab-' + key.replace(/_/g, '-');
    let v = 1; while (fs.existsSync(__dirname + '/../../' + R + slug + '-v' + (v + 1) + '.png')) v++;
    entries.push({ id: id + '-fx-' + key.replace(/_/g, '-'), tab: 'Characters', group: who, title: who + ' objects and effects: ' + name + ' (' + items.length + ' items; attaches the approved ' + name + ' sheet)', ar: '4:3', refs: [R + slug + '-v' + v + '.png'],
      prompt: (PRONOUN[id] === 'she' ? P('char-ability-fx.txt').replace('object he holds', 'object she holds').replace('his hands', 'her hands') : P('char-ability-fx.txt')) + '\n\nThe move: ' + name + '.\n\nItems:\n' + items.map((t, i) => (i + 1) + '. ' + t).join('\n') });
  }
}
// Emotion sheets (Tom 2026-11-05 23:43, docs/EMOTIONS.md): one 4 x 2 full-body sheet per character with a hero picture,
// the 8 core emotions in order happy, loving, sad, angry, scared, surprised, proud, unimpressed. Ref: hero only.
const EMOTION_CAST = { tom: 'Tom', tnb: 'TNB', grace: 'Grace', rose: 'Rose', amy: 'Amy', justin: 'Justin', deedee: 'Deedee', boppy: 'Boppy', ellie: 'Aunt Ellie', olivia: 'Olivia', nara: 'Nara' };
for (const [id, who] of Object.entries(EMOTION_CAST)) {
  const dog = id === 'nara';   // Nara: her own prompt, dog body language (Tom 2026-11-06 00:09)
  entries.push({ id: id + '-emotions', tab: 'Characters', group: who, title: who + (dog ? ' emotion sheet: 8 feelings, dog body language' : ' emotion sheet: 8 feelings, full body') + ' (happy, loving, sad, angry, scared, surprised, proud, unimpressed)', ar: '2:1', refs: [R + id + '-hero-ref-v1.png'], prompt: P(dog ? 'dog-emotion-sheet.txt' : 'char-emotion-sheet.txt') });
}
module.exports = { entries };
