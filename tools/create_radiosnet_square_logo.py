from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'client/public/images/logo.jpeg'
out = ROOT / 'client/public/logo-radiosnet-quadrada.png'
W = H = 1000
canvas = Image.new('RGBA', (W, H), (8, 13, 18, 255))
source_img = Image.open(source).convert('RGB')
pix = source_img.load()
flame = Image.new('RGBA', source_img.size, (0, 0, 0, 0))
fpix = flame.load()
for y in range(source_img.height):
    for x in range(source_img.width):
        r, g, b = pix[x, y]
        strength = max(r, g, b)
        if strength > 22:
            alpha = min(255, max(0, int((strength - 16) * 1.35)))
            fpix[x, y] = (r, g, b, alpha)
flame.thumbnail((430, 430), Image.Resampling.LANCZOS)
canvas.alpha_composite(flame, ((W - flame.width)//2, 34 + (430 - flame.height)//2))

def font(size):
    path = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
    return ImageFont.truetype(path, size)

draw = ImageDraw.Draw(canvas)
white = (246, 242, 232, 255)
gold = (224, 178, 67, 255)
small = (205, 211, 211, 255)
# Centered wordmark with generous size for small square thumbnails.
def centered(text, y, fnt, fill, spacing=0):
    box = draw.textbbox((0, 0), text, font=fnt, spacing=spacing)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=fnt, fill=fill, spacing=spacing)

centered('SINAIS DOS', 498, font(68), white)
centered('TEMPOS', 576, font(82), white)
draw.line((190, 688, 810, 688), fill=gold, width=3)
centered('WEB RÁDIO', 710, font(38), gold)
centered('A RÁDIO DOS REMANESCENTES', 774, font(20), small)
canvas.save(out, optimize=True)
print(out)
