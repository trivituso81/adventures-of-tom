// Painted battle props (art/props/<character>/<slug>.webp, cut by tools/sprite-bake/bake_prop_sheets.py from the prop sheets).
// Classic script, one global scope. Load after engine/stage.js and before the *-moves.js files.
// Usage inside a draw function (gfx is the stage canvas context):
//   if(PROPART.draw('rose/lamby',x,y,{h:40,rot:.3,flip:false})) return;   // painted; otherwise fall through to the drawn version
// Images load the first time they are asked for (or from PROPART.preload); until then draw() returns false so the
// drawn pixel version shows. Size by h (height) or w (width) in stage units; sx and sy squash or stretch afterwards.
const PROPART=(()=>{
  const V='pa4', imgs={}, hits={};
  const get=id=>{ let im=imgs[id]; if(!im) { im=new Image(); im.src='art/props/'+id+'.webp?v='+V; imgs[id]=im; } return im; };
  const ready=id=>{ const im=get(id); return !!(im.complete&&im.naturalWidth); };
  const draw=(id,x,y,o)=>{
    const im=get(id); if(!(im.complete&&im.naturalWidth)) return false;
    PROPART.hits[id]=(PROPART.hits[id]||0)+1;   // lets tools/kit_test.py report which painted props a move really drew
    o=o||{}; const ar=im.naturalWidth/im.naturalHeight;
    let w=o.w, h=o.h; if(w==null&&h==null) h=40; if(h==null) h=w/ar; if(w==null) w=h*ar;
    gfx.save(); gfx.translate(x,y); if(o.rot) gfx.rotate(o.rot); gfx.scale((o.flip?-1:1)*(o.sx||1),o.sy||1);
    const sm=gfx.imageSmoothingEnabled; gfx.imageSmoothingEnabled=true; if('imageSmoothingQuality' in gfx) gfx.imageSmoothingQuality='high';
    gfx.drawImage(im,-w/2,-h/2,w,h); gfx.imageSmoothingEnabled=sm; gfx.restore(); return true;
  };
  const preload=ids=>{ for(const id of ids) get(id); };
  return {draw,ready,preload,get,hits};
})();
// Props that moves already use; fetched shortly after start so the first fight shows them, not the drawn fallback.
setTimeout(()=>PROPART.preload(['tom/headphones','tom/sourdough_boule','grace/gold_dumpling_squishy','rose/lamby','rose/backup_lamby','amy/kettlebell','deedee/crisp_pan','boppy/cayenne_pepper','tnb/test_mug','tom/airliner','tom/lie_flat_pod','tom/airline_suite_door','tom/boarding_group_5_sign','tom/duvet','tom/sleep_mask','tom/phone_and_boarding_passes','tom/gate_scanner','tom/gate_0_door','tom/hot_towel','tom/sourdough_starter_jar']),2500);
