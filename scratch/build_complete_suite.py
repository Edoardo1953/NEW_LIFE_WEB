import os
import sys
import math
import subprocess
from PIL import Image

sys.path.append('.')
import scratch.trace_tools as tt

os.makedirs('uploads/Loghi', exist_ok=True)
os.makedirs('scratch/renders', exist_ok=True)

COLOR_GREEN = "#8DC63F"  # Vibrant Fresh Lime Green
COLOR_BLUE = "#68C3E8"   # Crisp Sky / Cyan Blue
COLOR_WHITE = "#FFFFFF"
COLOR_DARK = "#1E293B"

im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')
im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')

def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

def smooth_contour(pts, iterations=4, corner_angle_thresh=65.0):
    n = len(pts)
    if n < 4:
        return pts
    
    is_corner = [False] * n
    for i in range(n):
        p_prev = pts[(i - 1 + n) % n]
        p_curr = pts[i]
        p_next = pts[(i + 1) % n]
        
        v1 = (p_curr[0] - p_prev[0], p_curr[1] - p_prev[1])
        v2 = (p_next[0] - p_curr[0], p_next[1] - p_curr[1])
        l1 = math.hypot(v1[0], v1[1])
        l2 = math.hypot(v2[0], v2[1])
        if l1 > 0.1 and l2 > 0.1:
            dot = (v1[0]*v2[0] + v1[1]*v2[1]) / (l1 * l2)
            dot = max(-1.0, min(1.0, dot))
            angle = math.degrees(math.acos(dot))
            if angle > corner_angle_thresh:
                is_corner[i] = True
                
    curr_pts = list(pts)
    for _ in range(iterations):
        next_pts = []
        for i in range(n):
            if is_corner[i]:
                next_pts.append(curr_pts[i])
            else:
                p_prev = curr_pts[(i - 1 + n) % n]
                p_curr = curr_pts[i]
                p_next = curr_pts[(i + 1) % n]
                avg_x = 0.25 * p_prev[0] + 0.5 * p_curr[0] + 0.25 * p_next[0]
                avg_y = 0.25 * p_prev[1] + 0.5 * p_curr[1] + 0.25 * p_next[1]
                next_pts.append((avg_x, avg_y))
        curr_pts = next_pts
    return curr_pts

def loop_to_path(loop, simp_eps=0.45, tension=0.26, scale_x=1.0, scale_y=1.0, ox=0.0, oy=0.0):
    sm = smooth_contour(loop, iterations=4)
    sim = tt.rdp(sm, simp_eps)
    trans = [(p[0]*scale_x + ox, p[1]*scale_y + oy) for p in sim]
    return tt.smooth_to_svg_path(trans, tension)

fig_g_loops = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b_loops = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))
nome_loops = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))

# Figura bounding box
all_f_pts = [p for l in fig_g_loops + fig_b_loops for p in l]
min_fx, max_fx = min(p[0] for p in all_f_pts), max(p[0] for p in all_f_pts)
min_fy, max_fy = min(p[1] for p in all_f_pts), max(p[1] for p in all_f_pts)
fw, fh = max_fx - min_fx, max_fy - min_fy

# Nome bounding box
all_n_pts = [p for l in nome_loops for p in l]
min_nx, max_nx = min(p[0] for p in all_n_pts), max(p[0] for p in all_n_pts)
min_ny, max_ny = min(p[1] for p in all_n_pts), max(p[1] for p in all_n_pts)
nw, nh = max_nx - min_nx, max_ny - min_ny

print(f"Figura: orig box {fw:.1f}x{fh:.1f}")
print(f"Nome: orig box {nw:.1f}x{nh:.1f}")

# Helper to render figura SVG elements with arbitrary transform
def make_figura_svg_paths(scale, ox, oy, g_color=COLOR_GREEN, b_color=COLOR_BLUE):
    g_paths = [loop_to_path(l, simp_eps=0.45, tension=0.26, scale_x=scale, scale_y=scale, ox=ox - min_fx*scale, oy=oy - min_fy*scale) for l in fig_g_loops]
    b_paths = [loop_to_path(l, simp_eps=0.45, tension=0.26, scale_x=scale, scale_y=scale, ox=ox - min_fx*scale, oy=oy - min_fy*scale) for l in fig_b_loops]
    
    res = f'<g class="logo-symbol-figure">\n'
    for p in g_paths:
        res += f'  <path d="{p}" fill="{g_color}" />\n'
    for p in b_paths:
        res += f'  <path d="{p}" fill="{b_color}" />\n'
    res += '</g>\n'
    return res

# Helper to render nome SVG elements with arbitrary transform
def make_nome_svg_paths(scale, ox, oy, color=COLOR_GREEN):
    paths = [loop_to_path(l, simp_eps=0.45, tension=0.26, scale_x=scale, scale_y=scale, ox=ox - min_nx*scale, oy=oy - min_ny*scale) for l in nome_loops]
    res = f'<g class="logo-logotype" fill="{color}" fill-rule="evenodd">\n'
    for p in paths:
        res += f'  <path d="{p}" />\n'
    res += '</g>\n'
    return res

# 1. STANDALONE SYMBOL (ICON / AVATAR / FAVICON)
# ViewBox: 0 0 500 500 (padded)
symbol_scale = 400.0 / max(fw, fh)
symbol_ox = (500.0 - fw * symbol_scale) / 2.0
symbol_oy = (500.0 - fh * symbol_scale) / 2.0

svg_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- NEW LIFE - Symbol / Mark (Transparent Vector) -->
  {make_figura_svg_paths(symbol_scale, symbol_ox, symbol_oy)}
</svg>'''

with open('uploads/Loghi/logo-newlife-symbol.svg', 'w', encoding='utf-8') as f:
    f.write(svg_symbol)

# Symbol White
svg_symbol_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- NEW LIFE - Symbol White (Transparent Vector) -->
  {make_figura_svg_paths(symbol_scale, symbol_ox, symbol_oy, g_color="#FFFFFF", b_color="#FFFFFF")}
</svg>'''
with open('uploads/Loghi/logo-newlife-symbol-white.svg', 'w', encoding='utf-8') as f:
    f.write(svg_symbol_white)

# 2. STANDALONE LOGOTYPE "NEW LIFE"
# ViewBox: 0 0 900 450
text_scale = 750.0 / nw
text_ox = (900.0 - nw * text_scale) / 2.0
text_oy = (450.0 - nh * text_scale) / 2.0

svg_text = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 450" width="100%" height="100%">
  <!-- NEW LIFE - Logotype (Transparent Vector) -->
  {make_nome_svg_paths(text_scale, text_ox, text_oy)}
</svg>'''
with open('uploads/Loghi/logo-newlife-text.svg', 'w', encoding='utf-8') as f:
    f.write(svg_text)

# 3. ORIGINAL / REMASTERED BRAND LOGO (Text on left, Symbol on right, matching logo 22.jpg)
# ViewBox: 0 0 1000 460
orig_text_scale = 3.6
orig_fig_scale = 3.4
orig_text_ox = 60.0
orig_text_oy = 85.0
orig_fig_ox = 620.0
orig_fig_oy = 45.0

svg_original = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" width="100%" height="100%">
  <!-- NEW LIFE - Master Brand Logo (Original Composition, Transparent Vector) -->
  {make_nome_svg_paths(orig_text_scale, orig_text_ox, orig_text_oy)}
  {make_figura_svg_paths(orig_fig_scale, orig_fig_ox, orig_fig_oy)}
</svg>'''
with open('uploads/Loghi/logo-newlife-complete.svg', 'w', encoding='utf-8') as f:
    f.write(svg_original)

with open('uploads/Loghi/logo-newlife.svg', 'w', encoding='utf-8') as f:
    f.write(svg_original)

# 4. MASTER LOGO WHITE (for dark background)
svg_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" width="100%" height="100%">
  <!-- NEW LIFE - Master Brand Logo White (Transparent Vector) -->
  {make_nome_svg_paths(orig_text_scale, orig_text_ox, orig_text_oy, color="#FFFFFF")}
  {make_figura_svg_paths(orig_fig_scale, orig_fig_ox, orig_fig_oy, g_color="#FFFFFF", b_color="#FFFFFF")}
</svg>'''
with open('uploads/Loghi/logo-newlife-white.svg', 'w', encoding='utf-8') as f:
    f.write(svg_white)

# 5. CORPORATE LOGO WITH LEGAL NAME ("NEW LIFE S.à r.l. Luxembourg")
svg_corporate = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 520" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&amp;display=swap');
      .corp-sub {{
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
        font-size: 26px;
        font-weight: 600;
        letter-spacing: 0.28em;
        fill: #475569;
        text-transform: uppercase;
      }}
      .corp-city {{
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
        font-size: 18px;
        font-weight: 500;
        letter-spacing: 0.35em;
        fill: #68C3E8;
        text-transform: uppercase;
      }}
    </style>
  </defs>
  <!-- NEW LIFE S.à r.l. - Corporate Master Logo -->
  {make_nome_svg_paths(orig_text_scale, 60.0, 75.0)}
  {make_figura_svg_paths(orig_fig_scale, 650.0, 40.0)}
  
  <!-- Corporate Subtitles -->
  <g transform="translate(68, 440)">
    <text class="corp-sub" x="0" y="0">S.À R.L.</text>
    <circle cx="165" cy="-8" r="3.5" fill="#8DC63F" />
    <text class="corp-city" x="185" y="0">LUXEMBOURG</text>
  </g>
</svg>'''
with open('uploads/Loghi/logo-newlife-corporate.svg', 'w', encoding='utf-8') as f:
    f.write(svg_corporate)

# 6. HORIZONTAL APP HEADER LOGO (Symbol Left, Text Right)
# ViewBox: 0 0 1100 360
h_fig_scale = 2.8
h_fig_ox = 50.0
h_fig_oy = 30.0
h_text_scale = 2.9
h_text_ox = 380.0
h_text_oy = 55.0

svg_horizontal = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 360" width="100%" height="100%">
  <!-- NEW LIFE - Horizontal Header Composition (Transparent Vector) -->
  {make_figura_svg_paths(h_fig_scale, h_fig_ox, h_fig_oy)}
  {make_nome_svg_paths(h_text_scale, h_text_ox, h_text_oy)}
</svg>'''
with open('uploads/Loghi/logo-newlife-horizontal.svg', 'w', encoding='utf-8') as f:
    f.write(svg_horizontal)

# 7. STACKED / VERTICAL CENTERED LOGO
# ViewBox: 0 0 700 750
v_fig_scale = 3.6
v_fig_ox = (700.0 - fw * v_fig_scale) / 2.0
v_fig_oy = 50.0
v_text_scale = 2.8
v_text_ox = (700.0 - nw * v_text_scale) / 2.0
v_text_oy = 440.0

svg_stacked = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 750" width="100%" height="100%">
  <!-- NEW LIFE - Stacked Centered Composition (Transparent Vector) -->
  {make_figura_svg_paths(v_fig_scale, v_fig_ox, v_fig_oy)}
  {make_nome_svg_paths(v_text_scale, v_text_ox, v_text_oy)}
</svg>'''
with open('uploads/Loghi/logo-newlife-stacked.svg', 'w', encoding='utf-8') as f:
    f.write(svg_stacked)

print("All SVGs created successfully in uploads/Loghi/")
