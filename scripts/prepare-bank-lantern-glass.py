"""Build transparent unlit glass overlays from the checked-in quay illustration."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
assets = Path(__file__).resolve().parents[1] / 'dist/assets'
scene = Image.open(assets/'ferry-landing.png').convert('RGB')
sheet=Image.new('RGBA',(128,72))
patches=[
 ((558,238), [(20,30),(43,30),(42,41),(38,51),(32,55),(26,52),(22,45)]),
 ((1290,315), [(30,45),(50,44),(49,58),(45,65),(36,65),(33,63)]),
]
for i,((x,y),polygon) in enumerate(patches):
 lum=scene.crop((x,y,x+64,y+72)).convert('L')
 mask=Image.new('L',(64,72));ImageDraw.Draw(mask).polygon(polygon,fill=255)
 dim=Image.merge('RGBA',(lum.point(lambda z:round(9+z*.11)),lum.point(lambda z:round(12+z*.13)),lum.point(lambda z:round(13+z*.15)),mask.filter(ImageFilter.GaussianBlur(.85))))
 sheet.paste(dim,(64*i,0))
sheet.save(assets/'bank-lantern-glass.png',optimize=True)
