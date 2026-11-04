#!/usr/bin/env python3
"""Cutout rig: build walk frames from ONE painted still by cutting it into layers and rotating them at joints.
(Tom, 2026-11-04: "cut the character into parts ... and animate those pieces with rotation and position instead of
drawing full-body frames". This reverses the 11-03 no-composites rule for walks.)

Nothing is scaled or warped: every layer is the still's own pixels, moved and rotated whole. Heads never move.

A rig file (JSON) says, per view:
  still:   path of the painted still (magenta background)
  layers:  list of {name, rect:[x0,y0,x1,y1], pivot:[x,y], parent, z, copy_of, shade}
           rect  = the box of the still the layer is cut from (the magenta key removes the background)
           pivot = the joint the layer rotates about, in still coordinates
           parent= the layer whose rotation carries this one (a shin follows its thigh)
           copy_of = take the pixels of another layer (the far leg is the near leg, drawn darker, behind)
           shade = multiply the copy's colour (0.82 = 18 percent darker)
  poses:   {frame_name: {layer_name: angle_degrees, "_dy": body_offset_px}}   positive angle = the free end swings
           toward the LEFT of the picture (forward, for a figure facing left)

render(rig, frame) -> RGBA image the size of the still. sheet(rig, names, cell) -> magenta sheet, one cell per frame.
"""
import json, math, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def key_magenta(im):
    """Magenta still -> RGBA. The background colour is read from the picture's edge (it is never exactly #FF00FF)."""
    a = np.array(im.convert('RGB')).astype(float)
    edge = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(2))
    alpha = np.clip((dist - 25) / 40.0, 0, 1)            # soft edge over 40 units of colour distance
    out = np.dstack([a, alpha * 255]).astype(np.uint8)
    from defringe import defringe                      # tools/sprite-bake/defringe.py: pulls magenta out of the edge pixels
    return defringe(Image.fromarray(out, 'RGBA'))


def cut(src, rect):
    """A layer: the still's pixels inside rect, everything else transparent. Returned at full still size."""
    x0, y0, x1, y1 = rect
    layer = Image.new('RGBA', src.size, (0, 0, 0, 0))
    layer.paste(src.crop((x0, y0, x1, y1)), (x0, y0))
    return layer


def _rot(pivot, deg):
    """Forward affine (3x3) for a rotation about pivot; positive deg swings the part below the pivot to the left."""
    px, py = pivot
    t = math.radians(deg)
    c, s = math.cos(t), math.sin(t)
    R = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1.0]])
    T1 = np.array([[1, 0, -px], [0, 1, -py], [0, 0, 1.0]])
    T2 = np.array([[1, 0, px], [0, 1, py], [0, 0, 1.0]])
    return T2 @ R @ T1


def apply_affine(layer, M):
    """Apply a forward 3x3 affine to a full-size RGBA layer (Image.transform wants the inverse map)."""
    if np.allclose(M, np.eye(3)):
        return layer
    inv = np.linalg.inv(M)
    a, b, c = inv[0]; d, e, f = inv[1]
    return layer.transform(layer.size, Image.AFFINE, (a, b, c, d, e, f), resample=Image.BICUBIC)


def shade(layer, k):
    a = np.array(layer).astype(float)
    a[:, :, :3] *= k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


class Rig:
    def __init__(self, path):
        self.dir = os.path.dirname(os.path.abspath(path))
        self.spec = json.load(open(path))
        self.src = key_magenta(Image.open(os.path.join(self.dir, self.spec['still'])))
        self.layers = {}
        for L in sorted(self.spec['layers'], key=lambda L: 'copy_of' in L):   # cut originals first, then copies
            if 'copy_of' in L:
                im = self.layers[L['copy_of']]['im']
                if L.get('shade', 1) != 1:
                    im = shade(im, L['shade'])
            else:
                im = cut(self.src, L['rect'])
            self.layers[L['name']] = dict(L, im=im)
        self.order = sorted(self.layers.values(), key=lambda L: L['z'])

    def _matrix(self, name, pose):
        """Forward affine for a layer: its own rotation about its own joint, then carried by its parent's transform."""
        L = self.layers[name]
        M = _rot(tuple(L['pivot']), pose.get(name, 0))
        if L.get('offset'):                                  # a constant shift for the whole layer (the far leg sits behind)
            ox, oy = L['offset']
            M = np.array([[1, 0, ox], [0, 1, oy], [0, 0, 1.0]]) @ M
        if L.get('parent'):
            M = self._matrix(L['parent'], pose) @ M
        return M

    def render(self, frame):
        pose = self.spec['poses'][frame]
        dy = pose.get('_dy', 0)
        out = Image.new('RGBA', self.src.size, (0, 0, 0, 0))
        for L in self.order:
            M = self._matrix(L['name'], pose)
            if dy and not L.get('fixed_ground'):
                M = np.array([[1, 0, 0], [0, 1, dy], [0, 0, 1.0]]) @ M
            out.alpha_composite(apply_affine(L['im'], M))
        return out

    def sheet(self, names, cols, cell, scale):
        """Magenta sheet: len(names) frames in rows of cols, each frame scaled by `scale`, feet on one ground line."""
        rows = -(-len(names) // cols)
        sh = Image.new('RGB', (cols * cell, rows * cell), (255, 0, 255))
        for i, nm in enumerate(names):
            fr = self.render(nm)
            fr = fr.resize((int(fr.width * scale), int(fr.height * scale)), Image.LANCZOS)
            bb = fr.getbbox()
            fr = fr.crop(bb)
            cx, cy = (i % cols) * cell, (i // cols) * cell
            x = cx + (cell - fr.width) // 2
            y = cy + cell - 24 - fr.height
            sh.paste(fr, (x, y), fr)
        return sh


if __name__ == '__main__':
    rig = Rig(sys.argv[1])
    out = sys.argv[2]
    names = sys.argv[3].split(',')
    for nm in names:
        rig.render(nm).save(os.path.join(out, nm + '.png'))
    print('rendered', names)
