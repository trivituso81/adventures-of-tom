import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def defringe(im, ylimit=0.55, band=14):
    a = np.array(im).astype(float)
    R, G, B, A = a[:,:,0], a[:,:,1], a[:,:,2], a[:,:,3]
    h = a.shape[0]
    yy = (np.arange(h)/h)[:,None] * np.ones((1,a.shape[1]))
    vis = A > 8
    core = ndi.binary_erosion(A > 200, iterations=band)
    edge = vis & ~core & (yy < ylimit)                  # thin ring along the silhouette only
    pink = edge & (R-G > 70) & (B-G > 30) & (R > B-4)
    strong = edge & (R-G > 105) & (B-G > 50) & (R > B+10)
    pinkg = ndi.binary_dilation(pink, iterations=2) & edge & (R-G > 35) & (R > B-8)
    good = vis & ~pinkg & (A > 200) & ~(edge & (R-G > 70) & (B-G > 30))
    idx = ndi.distance_transform_edt(~good, return_distances=False, return_indices=True)
    out = a.copy()
    soft = pinkg & ~strong
    for c in range(3):
        out[:,:,c] = np.where(soft, a[idx[0], idx[1], c], a[:,:,c])
    out[:,:,3] = np.where(strong, 0, A)
    al = out[:,:,3] > 8
    lab, n = ndi.label(al)
    sizes = ndi.sum(al, lab, range(1, n+1))
    keep = np.isin(lab, [i+1 for i, s in enumerate(sizes) if s >= 400])
    out[:,:,3] = np.where(keep, out[:,:,3], 0)
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8), 'RGBA')

NAMES = ['down_stand','down_step1','down_step2','up_stand','up_step1','up_step2','left_stand','left_step1','left_step2']
if __name__ == '__main__':
    import os
    os.makedirs('clean', exist_ok=True)
    for k in NAMES:
        defringe(Image.open(f'keyed/{k}.png')).save(f'clean/{k}.png')
    bg=(120,140,120); ims=[]
    for k in ['down_stand','up_stand','left_stand']:
        im = Image.open(f'clean/{k}.png'); c = im.crop((0,0,im.width,420))
        b = Image.new('RGB', c.size, bg); b.paste(c,(0,0),c); ims.append(b)
    s = Image.new('RGB',(sum(i.width for i in ims),420),bg); x=0
    for i in ims: s.paste(i,(x,0)); x+=i.width
    s.resize((s.width*2,s.height*2)).save('hair_zoom3.png'); print(s.size)
