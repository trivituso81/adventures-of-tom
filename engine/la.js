'use strict';
// engine/la.js — Los Angeles: the second town, reached by plane from Long Island Taxi Co.
// Three areas: Downtown LA (map id 'blvd'), Jefferson Park ('jpark', south) and Griffith Park ('griffith', monsters, north).
// The maps, people and dialogue are content in data/maps-la.js; this file registers them, adds LA items and souvenirs,
// and builds the maps. Every LA map and room has region:'la'. Rendering lives in engine/la-render.js; the flight and
// taxis in engine/travel.js.

const regionOf=map=>(map&&map.region)||'le';
const REGION_NAME={le:'LONG ISLAND',la:'LOS ANGELES'};

// Buildings, palettes, Nickel's lines, areas and rooms are content in data/maps-la.js.
for(const h of LA_HOUSES) { h.region='la'; h.light=h.awning||h.roof; houses.push(h); houseById[h.id]=h; }
for(const h of houses) if(!h.region) h.region='le';
// TNB's building: the street door opens on the lobby (map loftlobby); the elevator goes up to the loft (map lofts). Both rooms belong to the one LOFTS door.
houseById.lofts.enterMap='loftlobby'; houseById.loftlobby=houseById.lofts;
Object.assign(palettes,LA_PALETTES);

// ---------- Items found in LA ----------
Object.assign(items,{
  coldbrew:{price:10,name:'Cold Brew',icon:'\u{1F9CA}',slot:null,vp:4,desc:'Souvenir from Golden Hour Coffee. Steeped for eighteen hours. Tastes like ambition.'},
  ramen:{price:12,name:'Takeout Ramen',icon:'\u{1F35C}',slot:null,heal:80,desc:'Souvenir from Ramen Ramen. Extra egg. The chef insisted.'},
  greenjuice:{price:9,name:'Very Green Juice',icon:'\u{1F96C}',slot:null,heal:56,desc:'Souvenir from Very Green Juice. Kale, celery and a feeling of superiority.'},
  crewjacket:{sell:12,name:'Crew Jacket',icon:'\u{1F9E5}',slot:'Outfit',color:'#2f3a4a',desc:'Souvenir from Backlot Wardrobe. Says CREW on the back. Gets you past any velvet rope.',stats:{hp:14,grit:2,cool:3}},
  popcorn:{price:8,name:'Starlite Popcorn',icon:'\u{1F37F}',slot:null,heal:48,desc:'Souvenir from The Starlite. Real butter. Tom isn\'t asking questions.'},
  skatewax:{sell:6,name:'Skate Wax',icon:'\u{1F6F9}',slot:'Charm',desc:'Souvenir from Board Room. Makes everything slide. Including you.',perk:{evade:.06}},
  claytaco:{name:'Tiny Clay Taco',icon:'\u{1F32E}',slot:'Charm',desc:"Souvenir from TNB's loft. He made it. It holds one paperclip, perfectly.",perk:{kind:.2}},
  lemons:{sell:2,name:'Backyard Lemons',icon:'\u{1F34B}',slot:null,heal:32,desc:'Souvenir from Casa Alvarez. Every yard in this city has too many lemons.'},
  screenplay:{sell:6,name:'Draft 41',icon:'\u{1F4DC}',slot:'Tool',desc:'Souvenir from The Duplex. A screenplay. Wes wants notes. Be kind.',stats:{warmth:4}},
  skyjar:{sell:2,name:'Jar of Hazy Air',icon:'\u{1FAD9}',slot:null,desc:'The Smoglet left it. Labeled LOS ANGELES, AUGUST. Don\'t open.'},
  parkticket:{sell:1,name:'Parking Ticket',icon:'\u{1F3AB}',slot:null,desc:'Sells for one coin. Costs seventy-three to pay. Tom isn\'t paying it.'},
  bandana:{sell:18,name:'Dusty Bandana',icon:'\u{1F9E3}',slot:'Charm',color:'#c9463d',desc:'The coyote left it on a rock. Smells like sage and bad decisions.',perk:{stat:{pep:.08}}},
  hubcap:{sell:15,name:'Lucky Hubcap',icon:'\u{1F6DE}',slot:'Tool',desc:'Rolled off Gridlock. Shiny enough to signal for help.',stats:{pow:4,warmth:1}},
  fossil:{sell:20,name:'Tiny Fossil',icon:'\u{1F9B4}',slot:'Charm',desc:'Popped out of the tar. Ten thousand years old. Fits in a pocket.',perk:{stat:{grit:.08}}},
  rooftop:{sell:5,name:'Rooftop Pass',icon:'\u{1F3D9}',slot:'Charm',desc:'Souvenir from The Grand Tower. Pool on the roof. Nobody swims. Everyone takes photos.',perk:{startVp:1}},
  praline:{price:9,name:'Pecan Praline',icon:'\u{1F36C}',slot:null,heal:64,desc:"Souvenir from Odette's Creole Kitchen. Her mother's recipe. Don't ask for it."},
  pupusa:{price:8,name:'Pupusa Revuelta',icon:'\u{1FAD3}',slot:null,heal:72,desc:'Souvenir from Pupuseria La Ceiba. Cheese, beans, pork, curtido on the side. The curtido isn\'t optional.'},
  sweettea:{sell:2,name:'Sweet Tea',icon:'\u{1F9CB}',slot:null,vp:3,desc:"Souvenir from Ms. Pearl's. Brewed on the porch in the sun. Sweet enough to stand a spoon in."},
  chalk:{name:'Chalk Drawing',icon:'\u{1F58D}',slot:'Charm',desc:'From Daisy and the little ones at Casa Alvarez. It\'s Tom, ten Alvarezes and one very tired grandma. Everyone is smiling except her.',perk:{heart:10}},
  kombucha:{sell:4,name:'Homebrew Kombucha',icon:'\u{1F376}',slot:null,vp:3,desc:"Souvenir from Jordan and Sam's. Fermented in a jar they named. Tastes like a vinegar that went to college."},
  oatlatte:{price:7,name:'Oat Milk Latte',icon:'\u{2615}',slot:null,vp:2,desc:"Souvenir from Dakota and Ryan's. Made on a machine that cost more than Tom's first car."},
  quakemedal:{name:'Big Shake Medal',icon:'\u{1F3C5}',slot:'Charm',desc:'I SURVIVED THE BIG SHAKE. Tom has already told everyone.',perk:{immune:['stunned','frozen']}}
});
Object.assign(souvenirs,{coffee:'coldbrew',ramen:'ramen',juicebar:'greenjuice',wardrobe:'crewjacket',cinema:'popcorn',boards:'skatewax',tomhouse:'fridgephoto',lofts:'claytaco',tower:'rooftop',creole:'praline',pupuseria:'pupusa',jordansam:'kombucha',dakota:'oatlatte',casa:'chalk'});

// ---------- Maps (built from data/maps-la.js by buildArea and makeRoom in engine/world.js) ----------
for(const spec of LA_AREAS) worlds[spec.id]=buildArea(spec);
for(const spec of LA_ROOMS) worlds[spec.id]=makeRoom(spec);
