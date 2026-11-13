#!/usr/bin/env python3
# Bakes the approved chapter 9 close-up plate (data/closeup-ch9.js). Reads art/raw/props/closeup-ch9-lock-v1.png, writes art/closeup/ch9-lock.webp (1024).
import os
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(os.path.join(ROOT,'art','closeup'),exist_ok=True)
Image.open(os.path.join(ROOT,'art','raw','props','closeup-ch9-lock-v1.png')).convert('RGB').resize((1024,1024),Image.LANCZOS).save(os.path.join(ROOT,'art','closeup','ch9-lock.webp'),quality=90,method=6)
