import re
svg = open('nala-character.svg').read()
groups = re.findall(r'<g id="nala-\w+".*?</g>', svg, re.S)
names = re.findall(r'data-state="(\w+)"', svg)
W,H = 176,208
gap = 20
total_w = (W+gap)*len(groups)+gap
preview = f'<svg viewBox="0 0 {total_w} {H+40}" xmlns="http://www.w3.org/2000/svg" style="background:#f4ecd8">'
for i,(gtag,name) in enumerate(zip(groups,names)):
    x = gap + i*(W+gap)
    gtag2 = gtag.replace('class="nala-state" ', '')
    preview += f'<g transform="translate({x},20)">{gtag2}</g>'
    preview += f'<text x="{x+W/2}" y="{H+35}" font-size="14" text-anchor="middle" fill="#2a2420">{name}</text>'
preview += '</svg>'
open('preview_all.svg','w').write(preview)
print('ok', len(groups))