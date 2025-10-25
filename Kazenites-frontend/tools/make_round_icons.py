"""
Create circular launcher icons (kazenites_launcher_round.png) for all mipmap densities
by masking existing `kazenites_launcher.png` images.

Usage: python make_round_icons.py

It picks the largest existing `kazenites_launcher.png` as source, resizes and masks for
mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi sizes and writes `kazenites_launcher_round.png` into each
mipmap folder.
"""
from PIL import Image, ImageOps
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
MIPMAP_FOLDERS = ['mipmap-mdpi','mipmap-hdpi','mipmap-xhdpi','mipmap-xxhdpi','mipmap-xxxhdpi']
# Target sizes (px) recommended for launcher icons (mdpi baseline)
TARGET_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}
SOURCE_CANDIDATES = []
for folder in MIPMAP_FOLDERS:
    p = os.path.join(RES, folder, 'kazenites_launcher.png')
    if os.path.isfile(p):
        SOURCE_CANDIDATES.append(p)

if not SOURCE_CANDIDATES:
    print('No source `kazenites_launcher.png` found in mipmap folders. Aborting.')
    raise SystemExit(1)

# choose the largest file by dimensions
def image_size(path):
    try:
        with Image.open(path) as im:
            return im.size[0] * im.size[1]
    except Exception:
        return 0

SOURCE_CANDIDATES.sort(key=image_size, reverse=True)
source = SOURCE_CANDIDATES[0]
print('Using source:', source)

with Image.open(source).convert('RGBA') as src_im:
    for folder in MIPMAP_FOLDERS:
        size = TARGET_SIZES[folder]
        out_dir = os.path.join(RES, folder)
        if not os.path.isdir(out_dir):
            print('Skipping missing folder', out_dir)
            continue

        # Resize source to target size, keeping aspect ratio and filling
        s = src_im.copy()
        s = ImageOps.fit(s, (size, size), Image.LANCZOS)

        # Create circular mask
        mask = Image.new('L', (size, size), 0)
        from PIL import ImageDraw
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)

        # Apply mask to alpha channel
        result = Image.new('RGBA', (size, size), (0,0,0,0))
        result.paste(s, (0,0), mask)

        out_path = os.path.join(out_dir, 'kazenites_launcher_round.png')
        result.save(out_path, format='PNG')
        print('Wrote', out_path)

print('Done. Created round icons for densities where sources existed.')