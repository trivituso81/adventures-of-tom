# tools/sprite-bake/hires.py: bake the painted BATTLE atlases at a higher resolution without touching a bake script.
#
# Why (Tom, 2026-11-05: the party looks blurry in battle): the battle atlases were baked at 2 picture pixels per sprite row,
# but an iPhone shows each row over about 2.7 to 2.9 screen pixels, so every frame was stretched 1.1x to 1.45x on screen.
# The source paintings hold more detail than the atlases kept.
#
# How: run a bake script through this file. It follows every picture the script builds (scaled_to, crop, paste,
# alpha_composite, flips, resize) and, when the script saves an atlas .webp, re-builds the same atlas S times larger
# straight from the source painting (one Lanczos resize instead of a small bake that the phone then enlarges).
# The script's own outputs (the small atlas, the rows, the data file) are written exactly as before, so a run also shows
# whether the script still reproduces the files in the repo. Anything the script painted on a frame AFTER scaling
# (a black eye, removed slivers) is found by comparing the big atlas against the small one and copied across.
#
# Usage (repo root):  HIRES=1.5 HIRES_OUT=/tmp/hires python3 tools/sprite-bake/hires.py tools/sprite-bake/bake_amy.py [args]
#   then              python3 tools/sprite-bake/hires_install.py /tmp/hires amy-battle amy-ko ...
import builtins, os, re, sys
import numpy as np
from PIL import Image, ImageFilter

S = float(os.environ.get('HIRES', '1.5'))
OUT = os.environ.get('HIRES_OUT', '/tmp/hires')
SHARP = float(os.environ.get('HIRES_SHARP', '0'))     # unsharp amount in percent (0 = off)
LOG = []

_new, _fromarray = Image.new, Image.fromarray
_I = Image.Image
_crop, _paste, _comp, _transpose, _copy, _resize, _save = _I.crop, _I.paste, _I.alpha_composite, _I.transpose, _I.copy, _I.resize, _I.save


def _r(v): return int(round(v * S))


def _pm_resize(img, size):
    """Premultiplied-alpha Lanczos resize (the bake scripts' scaled_to, to an exact size)."""
    if img.mode != 'RGBA': return _resize(img, size, Image.LANCZOS)
    arr = np.asarray(img).astype(np.float32)
    al = arr[:, :, 3:4] / 255.0
    pm = _resize(_fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB'), size, Image.LANCZOS)
    alr = _resize(_fromarray(arr[:, :, 3].astype(np.uint8), 'L'), size, Image.LANCZOS)
    pa, aa = np.asarray(pm).astype(np.float32), np.asarray(alr).astype(np.float32) / 255.0
    rgb = np.where(aa[:, :, None] > 0.02, pa / np.maximum(aa[:, :, None], 0.02), 0)
    return _fromarray(np.dstack([np.clip(rgb, 0, 255), aa * 255]).astype(np.uint8), 'RGBA')


def real(img):
    """True when a larger version of img can be built from something better than img itself."""
    d = img.__dict__
    if '_hr_real' in d: return d['_hr_real']
    hx = d.get('_hx'); ops = d.get('_ops') or []
    d['_hr_real'] = False                                   # guards cycles
    if hx is None: v = False
    elif hx[0] == 'scale': v = hx[1].width > img.width * 1.02 or real(hx[1])
    elif hx[0] == 'resize': v = hx[1].width > img.width * 1.02 or real(hx[1])
    else: v = real(hx[1])
    v = v or any(real(o[1]) for o in ops if isinstance(o[1], _I))
    d['_hr_real'] = v
    return v


def hi(img):
    """img rebuilt S times larger (size = round(S * size))."""
    d = img.__dict__
    if '_hr' in d: return d['_hr']
    W, H = max(1, _r(img.width)), max(1, _r(img.height))
    hx = d.get('_hx')
    if not real(img):
        out = _pm_resize(img, (W, H))
    else:
        if hx is None:
            out = _new(img.mode, (W, H), d.get('_blank', 0)) if '_blank' in d else _pm_resize(img, (W, H))
        elif hx[0] in ('scale', 'resize'):
            src = hx[1]
            out = _pm_resize(hi(src) if real(src) else src, (W, H))
        elif hx[0] == 'crop':
            x0, y0 = hx[2][0], hx[2][1]
            out = _crop(hi(hx[1]), (_r(x0), _r(y0), _r(x0) + W, _r(y0) + H))
        elif hx[0] == 'transpose':
            out = _transpose(hi(hx[1]), hx[2])
            if out.size != (W, H): out = _pm_resize(out, (W, H))
        elif hx[0] == 'copy':
            out = _copy(hi(hx[1]))
        elif hx[0] == 'delta':                              # an array edit of a tracked picture: keep the edit, sharpen the rest
            out = _patch(hi(hx[1]), img, hx[1])
        for op in d.get('_ops') or []:
            kind, child, pos, mask = op
            x, y = _r(pos[0]), _r(pos[1])
            if not isinstance(child, _I):                   # a flat colour paste
                continue
            ch = hi(child)
            if kind == 'comp' or (mask is not None and mask is child):
                _safe_comp(out, ch, x, y)
            else:
                m = None if mask is None else _resize(mask, ch.size, Image.LANCZOS)
                _paste(out, ch, (x, y), m) if m is not None else _paste(out, ch, (x, y))
    d['_hr'] = out
    return out


def _safe_comp(base, ch, x, y):
    w, h = min(ch.width, base.width - x), min(ch.height, base.height - y)
    if w <= 0 or h <= 0: return
    if (w, h) != ch.size: ch = _crop(ch, (0, 0, w, h))
    if base.mode == 'RGBA' and ch.mode == 'RGBA': _comp(base, ch, (x, y))
    else: _paste(base, ch, (x, y))


def _patch(big, low_new, low_old, thr=0):
    """big (built from low_old's source) with every pixel that low_new changed taken from low_new instead."""
    a, b = np.asarray(low_new).astype(np.int16), np.asarray(low_old).astype(np.int16)
    m = (np.abs(a - b).max(axis=2) > thr) if a.ndim == 3 else (np.abs(a - b) > thr)
    if not m.any(): return big
    return _blend(big, low_new, m)


def _blend(big, low, m, grow=1):
    mi = _fromarray((m * 255).astype(np.uint8), 'L')
    if grow: mi = mi.filter(ImageFilter.MaxFilter(2 * grow + 1))
    mb = _resize(mi, big.size, Image.BILINEAR)
    up = _pm_resize(low, big.size)
    out = _copy(big)
    _paste(out, up, (0, 0), mb)
    return out


def verify(big, low, name):
    """Copy across anything the small atlas shows that the big one lost (edits painted after scaling). Returns the fixed big atlas."""
    down = np.asarray(_pm_resize(big, low.size)).astype(np.float32)
    lo = np.asarray(low).astype(np.float32)
    if lo.ndim != 3 or lo.shape[2] != 4: return big
    pd, pl = down[:, :, :3] * down[:, :, 3:4] / 255, lo[:, :, :3] * lo[:, :, 3:4] / 255
    # Compare blurred copies, so a crisper edge (the whole point) is not mistaken for an edit; a painted mark or a removed piece still shows.
    def soft(a): return np.dstack([np.asarray(_fromarray(np.clip(a[:, :, i], 0, 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) for i in range(a.shape[2])])
    dm = np.abs(soft(np.dstack([pd, down[:, :, 3:4]])) - soft(np.dstack([pl, lo[:, :, 3:4]]))).max(axis=2)
    m = dm > 16
    frac = float(m.mean()); op = float((lo[:, :, 3] > 8).mean())
    LOG.append('%s: differs from the small atlas on %.2f%% of pixels (%.2f%% of the figure)' % (name, 100 * frac, 100 * frac / max(op, 1e-6)))
    if not m.any(): return big
    _fromarray((m * 255).astype(np.uint8), 'L').save(os.path.join(OUT, name + '.patchmask.png'))
    return _blend(big, low, m, grow=2)


def sharpen(big):
    if SHARP <= 0: return big
    arr = np.asarray(big).astype(np.float32); al = arr[:, :, 3:4] / 255
    pm = _fromarray((arr[:, :, :3] * al).clip(0, 255).astype(np.uint8), 'RGB')
    sh = np.asarray(pm.filter(ImageFilter.UnsharpMask(radius=1.2, percent=int(SHARP), threshold=2))).astype(np.float32)
    rgb = np.where(al > 0.02, sh / np.maximum(al, 0.02), 0)
    # keep the soft edge untouched: only fully inside the figure
    inside = np.asarray(_fromarray(arr[:, :, 3].astype(np.uint8), 'L').filter(ImageFilter.MinFilter(5))).astype(np.float32)[:, :, None] / 255
    rgb = arr[:, :, :3] * (1 - inside) + np.clip(rgb, 0, 255) * inside
    return _fromarray(np.dstack([rgb, arr[:, :, 3]]).astype(np.uint8), 'RGBA')


# ------------------------------------------------------------------ tracking (patches on PIL)
def _ops(im): return im.__dict__.setdefault('_ops', [])


def new(mode, size, color=0):
    im = _new(mode, size, color); im.__dict__['_blank'] = color; return im


def crop(self, box=None):
    out = _crop(self, box)
    if box is not None: out.__dict__['_hx'] = ('crop', self, tuple(box))
    return out


def paste(self, im, box=None, mask=None):
    _paste(self, im, box, mask)
    self.__dict__.pop('_hr', None); self.__dict__.pop('_hr_real', None)
    if isinstance(im, _I): _ops(self).append(('paste', im, (0, 0) if box is None else (box[0], box[1]), mask))
    else: self.__dict__['_dirty'] = True


def alpha_composite(self, im, dest=(0, 0), source=(0, 0)):
    _comp(self, im, dest, source)
    self.__dict__.pop('_hr', None); self.__dict__.pop('_hr_real', None)
    if tuple(source) == (0, 0): _ops(self).append(('comp', im, tuple(dest), None))


def transpose(self, method):
    out = _transpose(self, method); out.__dict__['_hx'] = ('transpose', self, method); return out


def copy(self):
    out = _copy(self); out.__dict__['_hx'] = ('copy', self); return out


def resize(self, size, resample=None, *a, **k):
    out = _resize(self, size, resample, *a, **k)
    if self.mode in ('RGB', 'L') and self.size in _arrayed and tuple(size) != self.size: _last_rs[0] = (_arrayed[self.size], tuple(size))
    if self.mode == 'RGBA' and not a and not k: out.__dict__['_hx'] = ('resize', self)
    return out


_recent = []                                                # tracked pictures lately read as arrays (for array edits)


_arrayed = {}                                               # size -> the RGBA picture last read as an array (inline premultiplied resizes)
_last_rs = [None]


def _array_iface(self):
    if self.mode == 'RGBA': _arrayed[self.size] = self
    if self.mode == 'RGBA' and ('_hx' in self.__dict__ or '_ops' in self.__dict__):
        if not any(c is self for c in _recent):
            _recent.append(self); del _recent[:-60]
    return _orig_iface.fget(self)


def fromarray(obj, mode=None):
    out = _fromarray(obj, mode)
    if out.mode == 'RGBA' and _recent:
        a = np.asarray(obj)
        for c in reversed(_recent):
            if c.size == out.size and real(c):
                b = _orig_iface_array(c)
                if (a == b).all(axis=2).mean() > 0.5:
                    out.__dict__['_hx'] = ('delta', c); break
    if out.mode == 'RGBA' and '_hx' not in out.__dict__ and _last_rs[0] and _last_rs[0][1] == out.size:
        out.__dict__['_hx'] = ('scale', _last_rs[0][0]); _last_rs[0] = None      # a premultiplied resize written out by hand
    return out


def _orig_iface_array(im):
    return np.array(_copy(im))


def track_scale(fn):
    def scaled_to(img, f, *a, **k):
        out = fn(img, f, *a, **k)
        out.__dict__['_hx'] = ('scale', img)
        return out
    return scaled_to


def save(self, fp, format=None, **params):
    _save(self, fp, format, **params)
    if isinstance(fp, str) and fp.endswith('.webp') and os.sep + os.path.join('art', 'chars') + os.sep in os.path.abspath(fp):
        name = os.path.basename(fp)[:-5]
        if not real(self):
            LOG.append('%s: NOT tracked (no larger source found), skipped' % name); return
        os.makedirs(OUT, exist_ok=True)
        big = verify(hi(self), self, name)
        big = sharpen(big)
        _save(big, os.path.join(OUT, name + '.webp'), 'WEBP', lossless=True, quality=100, method=6)
        LOG.append('%s: %s -> %s' % (name, self.size, big.size))


_exec = builtins.exec
_PAT = re.compile(r'^def scaled_to\(', re.M)


def _tr(src):
    return _PAT.sub("@__import__('hires').track_scale\ndef scaled_to(", src) if isinstance(src, str) else src


def exec_(src, *a):
    if not a:
        fr = sys._getframe(1); return _exec(_tr(src), fr.f_globals, fr.f_locals)
    return _exec(_tr(src), *a)


def install():
    global _orig_iface
    Image.new, Image.fromarray = new, fromarray
    _I.crop, _I.paste, _I.alpha_composite, _I.transpose, _I.copy, _I.resize, _I.save = crop, paste, alpha_composite, transpose, copy, resize, save
    _orig_iface = _I.__dict__['__array_interface__']
    _I.__array_interface__ = property(_array_iface)
    builtins.exec = exec_


if __name__ == '__main__':
    script = os.path.abspath(sys.argv[1])
    sys.modules['hires'] = sys.modules['__main__']
    sys.path.insert(0, os.path.dirname(script))
    sys.argv = sys.argv[1:]
    install()
    g = {'__name__': '__main__', '__file__': script, '__builtins__': builtins}
    try:
        _exec(compile(_tr(open(script).read()), script, 'exec'), g)
    finally:
        print('\nHIRES x%s (sharpen %s)' % (S, SHARP))
        for l in LOG: print('  ' + l)
