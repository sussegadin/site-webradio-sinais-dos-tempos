from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'client/public/images/logo.jpeg'
out_png = ROOT / 'client/public/logo-radiosnet.png'
out_svg = ROOT / 'client/public/logo-radiosnet.svg'

W, H = 1600, 500
canvas = Image.new('RGBA', (W, H), (8, 13, 18, 255))
source_img = Image.open(source).convert('RGB')
# Remove the original black field while preserving the gold flame.
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
# Fit symbol into a generous square on the left.
flame.thumbnail((390, 390), Image.Resampling.LANCZOS)
canvas.alpha_composite(flame, (70 + (390 - flame.width)//2, 55 + (390 - flame.height)//2))

def font(name, size):
    candidates = [
        f'/usr/share/fonts/truetype/dejavu/{name}.ttf',
        f'/usr/share/fonts/truetype/liberation2/{name}.ttf',
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

bold = font('DejaVuSans-Bold', 82)
medium = font('DejaVuSans', 40)
small = font('DejaVuSans', 25)
draw = ImageDraw.Draw(canvas)
x = 540
draw.text((x, 120), 'SINAIS DOS TEMPOS', font=bold, fill=(246, 242, 232, 255), spacing=4)
draw.text((x+4, 225), 'WEB RÁDIO', font=medium, fill=(224, 178, 67, 255), spacing=3)
draw.line((x+4, 295, 1420, 295), fill=(224, 178, 67, 170), width=2)
draw.text((x+4, 325), 'A RÁDIO DOS REMANESCENTES', font=small, fill=(205, 211, 211, 255))
canvas.save(out_png, optimize=True)

# Editable vector companion with the same exact wordmark and color system.
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500" viewBox="0 0 1600 500">
<rect width="1600" height="500" fill="#080d12"/>
<image href="/images/logo.jpeg" x="70" y="55" width="390" height="390" preserveAspectRatio="xMidYMid meet"/>
<text x="540" y="185" fill="#f6f2e8" font-family="Arial, sans-serif" font-size="82" font-weight="700" letter-spacing="3">SINAIS DOS TEMPOS</text>
<text x="544" y="265" fill="#e0b243" font-family="Arial, sans-serif" font-size="40" letter-spacing="5">WEB RÁDIO</text>
<line x1="544" y1="295" x2="1420" y2="295" stroke="#e0b243" stroke-opacity=".65" stroke-width="2"/>
<text x="544" y="360" fill="#cdd3d3" font-family="Arial, sans-serif" font-size="25" letter-spacing="2">A RÁDIO DOS REMANESCENTES</text>
</svg>'''
out_svg.write_text(svg, encoding='utf-8')
print(out_png)
print(out_svg)
