import copy

CELL = 8  # px per pixel-cell
W, H = 22, 26  # grid size

# color legend
COLORS = {
    'K': '#2a2420',   # ink - hair/outline
    'S': '#f2e2c4',   # parchment-ish skin
    'O': '#5c7a41',   # olive - outfit
    'O2': '#4a6335',  # darker olive - outfit shade
    'G': '#f0b23a',   # gold - accent/buttons
    'W': '#faf6ec',   # white-ish - eye white
    'P': '#2a2420',   # pupil (ink)
    'B': '#c9552f',   # terracotta - blush/mouth
    'C': '#f4ecd8',   # cream - collar trim
}

def blank():
    return [['.' for _ in range(W)] for _ in range(H)]

g = blank()

def fill(rows_range, cols_range, ch):
    for y in rows_range:
        for x in cols_range:
            g[y][x] = ch

# ---- BASE: hair silhouette (twin low buns + fringe), skin face, shoulders/outfit ----
# hair top cap
fill(range(2,5), range(5,17), 'K')
fill(range(1,3), range(6,16), 'K')
# side hair going down past face (long strands)
fill(range(5,13), range(4,6), 'K')
fill(range(5,13), range(16,18), 'K')
# twin buns
fill(range(9,13), range(2,5), 'K')
fill(range(9,13), range(17,20), 'K')
# fringe over forehead
fill(range(5,7), range(6,16), 'K')

# face/skin block
fill(range(7,14), range(6,16), 'S')
# jaw taper
fill(range(13,14), range(7,15), 'S')

# neck
fill(range(14,16), range(9,13), 'S')

# shoulders / outfit body (olive jacket) - base idle silhouette both arms down
fill(range(16,26), range(3,19), 'O')
fill(range(16,18), range(3,19), 'O2')  # shoulder shade band
# collar trim (cream v-neck)
fill(range(16,19), range(9,13), 'C')
# center button line
for y in range(19,25):
    g[y][10] = 'G'
    g[y][11] = 'G'

BASE = g

def clone():
    return copy.deepcopy(BASE)

def to_svg(grid, state_id):
    parts = [f'<g id="nala-{state_id}" class="nala-state" data-state="{state_id}">']
    for y, row in enumerate(grid):
        x = 0
        while x < W:
            ch = row[x]
            if ch == '.':
                x += 1
                continue
            run = 1
            while x+run < W and row[x+run] == ch:
                run += 1
            color = COLORS.get(ch, '#000')
            parts.append(f'<rect x="{x*CELL}" y="{y*CELL}" width="{run*CELL}" height="{CELL}" fill="{color}"/>')
            x += run
    parts.append('</g>')
    return "\n".join(parts)

states = {}

# ---------- 1. IDLE (neutral, hands down, calm eyes, soft smile) ----------
s = clone()
# eyebrows relaxed
for x in [7,8]: s[7][x]='K'
for x in [14,15]: s[7][x]='K'
# eyes (open, forward)
s[9][7]='W'; s[9][8]='P'
s[9][13]='W'; s[9][14]='P'
# blush
s[10][6]='B'; s[10][15]='B'
# soft closed smile
s[11][9]='B'; s[11][10]='B'; s[11][11]='B'
states['idle'] = s

# ---------- 2. LISTENING (head tilt via ear/hair shift, eyebrow raised, attentive eyes wide) ----------
s = clone()
# raised eyebrows (shifted up 1 row + arched via extra pixel)
for x in [7,8]: s[6][x]='K'
for x in [14,15]: s[6][x]='K'
s[6][9]='K'  # arch peak left brow
# wide attentive eyes
s[9][7]='W'; s[9][8]='P'
s[9][13]='W'; s[9][14]='P'
s[8][7]='W'; s[8][13]='W'  # eyes slightly bigger (open wide)
s[10][6]='B'; s[10][15]='B'
# small open "oh" mouth
s[11][10]='K'; s[11][11]='K'
# one hand raised near ear (right arm bent up)
fill(range(13,17), range(18,20), 'O')
s[13][19]='S'; s[14][19]='S'  # hand near ear
states['listening'] = s

# ---------- 3. THINKING (hand on chin, eyes half closed, one eyebrow up) ----------
s = clone()
for x in [7,8]: s[7][x]='K'
s[6][14]='K'; s[7][15]='K'  # one eyebrow raised (asymmetric)
# half-closed eyes (just a line)
s[9][7]='K'; s[9][8]='K'
s[9][13]='K'; s[9][14]='K'
s[10][6]='B'; s[10][15]='B'
# small flat mouth
s[12][10]='K'; s[12][11]='K'
# arm bent up to chin
fill(range(11,17), range(4,6), 'O')
s[10][6]='S'; s[10][5]='S'  # hand near chin (overwrite blush pixel intentionally)
states['thinking'] = s

# ---------- 4. TALKING (mouth open mid-word, arm pointing outward to the right) ----------
s = clone()
for x in [7,8]: s[7][x]='K'
for x in [14,15]: s[7][x]='K'
s[9][7]='W'; s[9][8]='P'
s[9][13]='W'; s[9][14]='P'
s[10][6]='B'; s[10][15]='B'
# open mouth (talking)
fill(range(11,13), range(9,12), 'B')
s[11][10]='K'
# pointing arm extended right, straight
fill(range(18,20), range(19,22), 'O')
fill(range(18,20), range(21,22), 'S')  # hand tip
states['talking'] = s

# ---------- 5. HAPPY (big smile, eyes closed happy ^ ^, waving hand up) ----------
s = clone()
for x in [7,8]: s[6][x]='K'
for x in [14,15]: s[6][x]='K'
# happy closed eyes (^ shape via 2 small marks)
s[9][7]='K'; s[9][8]='K'
s[9][13]='K'; s[9][14]='K'
s[10][6]='B'; s[10][15]='B'
# big open smile
fill(range(11,13), range(8,13), 'B')
s[10][10]='B'; s[10][11]='B'
# waving arm raised high beside head
fill(range(3,13), range(19,21), 'O')
fill(range(1,4), range(19,22), 'S')  # waving hand up top
states['happy'] = s

# ---------- 6. CONFUSED (furrowed brow, small mouth, question mark accessory, hand near head) ----------
s = clone()
# furrowed brows angled inward
s[7][8]='K'; s[7][9]='K'
s[7][13]='K'; s[7][14]='K'
s[8][9]='K'; s[8][13]='K'
# uneven eyes
s[9][7]='W'; s[9][8]='P'
s[9][13]='W'; s[9][14]='K'
s[10][6]='B'; s[10][15]='B'
# small wavy confused mouth
s[12][9]='K'; s[12][10]='K'; s[12][12]='K'
# hand scratching near head
fill(range(9,14), range(18,20), 'O')
s[8][19]='S'; s[9][19]='S'
states['confused'] = s

svg_groups = []
for i,(name, grid) in enumerate(states.items()):
    svg_groups.append(to_svg(grid, name))

full_w = W*CELL
full_h = H*CELL

svg = f'''<svg viewBox="0 0 {full_w} {full_h}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="image-rendering:pixelated">
<style>
  .nala-state {{ display: none; }}
  .nala-state.is-active {{ display: block; }}
</style>
{chr(10).join(svg_groups)}
</svg>'''

with open('./nala-character.svg', 'w') as f:
    f.write(svg)

print("states:", list(states.keys()))
print("size:", full_w, full_h)