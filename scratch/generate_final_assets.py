import os
import resvg_py
from PIL import Image
import sys
sys.path.append('.')
import scratch.vector_defs as vd

os.makedirs('uploads/Loghi', exist_ok=True)
os.makedirs('scratch/previews', exist_ok=True)

# 1. MASTER BRAND LOGO (Original Layout: Logotype Left, Symbol Right)
# ViewBox: 0 0 680 260
svg_master = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 260" width="100%" height="100%">
  <!-- NEW LIFE - Master Logo (Transparent Vector) -->
  <g transform="translate(20, 20)">
    {vd.get_logotype_paths(vd.GREEN)}
  </g>
  <g transform="translate(420, 10)">
    {vd.get_symbol_paths(vd.GREEN, vd.BLUE)}
  </g>
</svg>'''

# 2. STANDALONE SYMBOL MARK (Canvas 260x260)
svg_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="100%" height="100%">
  <!-- NEW LIFE - Symbol Mark -->
  <g transform="translate(10, 10)">
    {vd.get_symbol_paths(vd.GREEN, vd.BLUE)}
  </g>
</svg>'''

# 3. STANDALONE LOGOTYPE "NEW LIFE" (Canvas 420x240)
svg_logotype = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240" width="100%" height="100%">
  <!-- NEW LIFE - Logotype -->
  <g transform="translate(10, 10)">
    {vd.get_logotype_paths(vd.GREEN)}
  </g>
</svg>'''

# 4. CORPORATE SUITE (Logotype Left + Symbol Right + "S.à r.l. Luxembourg" Subtitle)
svg_corporate = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 310" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&amp;display=swap');
      .corp-legal {{
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: 0.32em;
        fill: #334155;
        text-transform: uppercase;
      }}
      .corp-loc {{
        font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.35em;
        fill: #68C3E8;
        text-transform: uppercase;
      }}
    </style>
  </defs>
  <!-- NEW LIFE - Corporate Master Logo -->
  <g transform="translate(20, 15)">
    {vd.get_logotype_paths(vd.GREEN)}
  </g>
  <g transform="translate(440, 10)">
    {vd.get_symbol_paths(vd.GREEN, vd.BLUE)}
  </g>
  <!-- Corporate Subtitle -->
  <g transform="translate(58, 275)">
    <text class="corp-legal" x="0" y="0">S.À R.L.</text>
    <circle cx="130" cy="-6" r="3.5" fill="#8DC63F" />
    <text class="corp-loc" x="148" y="0">LUXEMBOURG</text>
  </g>
</svg>'''

# 5. HORIZONTAL WEB BAR (Symbol Left, Logotype Right - Perfect for navigation bars)
# ViewBox: 0 0 720 220
svg_horizontal = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 220" width="100%" height="100%">
  <!-- NEW LIFE - Horizontal Header Layout -->
  <g transform="translate(15, -10) scale(0.92)">
    {vd.get_symbol_paths(vd.GREEN, vd.BLUE)}
  </g>
  <g transform="translate(270, -2) scale(0.95)">
    {vd.get_logotype_paths(vd.GREEN)}
  </g>
</svg>'''

# 6. STACKED / VERTICAL CENTERED (Symbol Top, Logotype Bottom)
# ViewBox: 0 0 500 500
svg_stacked = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- NEW LIFE - Stacked Centered Layout -->
  <g transform="translate(130, 20)">
    {vd.get_symbol_paths(vd.GREEN, vd.BLUE)}
  </g>
  <g transform="translate(50, 250)">
    {vd.get_logotype_paths(vd.GREEN)}
  </g>
</svg>'''

# 7. MONOCHROME WHITE (For dark backgrounds / dark mode)
svg_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 260" width="100%" height="100%">
  <!-- NEW LIFE - White Monochrome -->
  <g transform="translate(20, 20)">
    {vd.get_logotype_paths("#FFFFFF")}
  </g>
  <g transform="translate(420, 10)">
    {vd.get_symbol_paths("#FFFFFF", "#FFFFFF")}
  </g>
</svg>'''

svg_symbol_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="100%" height="100%">
  <!-- NEW LIFE - Symbol White -->
  <g transform="translate(10, 10)">
    {vd.get_symbol_paths("#FFFFFF", "#FFFFFF")}
  </g>
</svg>'''

# Save all SVGs
files_to_save = [
    ("uploads/Loghi/logo-newlife-complete.svg", svg_master),
    ("uploads/Loghi/logo-newlife.svg", svg_master),
    ("uploads/Loghi/logo-newlife-symbol.svg", svg_symbol),
    ("uploads/Loghi/logo-newlife-text.svg", svg_logotype),
    ("uploads/Loghi/logo-newlife-corporate.svg", svg_corporate),
    ("uploads/Loghi/logo-newlife-horizontal.svg", svg_horizontal),
    ("uploads/Loghi/logo-newlife-stacked.svg", svg_stacked),
    ("uploads/Loghi/logo-newlife-white.svg", svg_white),
    ("uploads/Loghi/logo-newlife-symbol-white.svg", svg_symbol_white),
]

for path, content in files_to_save:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Saved all SVGs successfully!")

# Render High-Resolution PNGs with resvg_py
png_renders = [
    ("uploads/Loghi/logo-newlife-complete.png", svg_master, 2040, 780),
    ("uploads/Loghi/logo-newlife.png", svg_master, 2040, 780),
    ("uploads/Loghi/logo-newlife-symbol.png", svg_symbol, 1040, 1040),
    ("uploads/Loghi/Logo NewLife figura.png", svg_symbol, 512, 512),
    ("uploads/Loghi/logo-newlife-text.png", svg_logotype, 1680, 960),
    ("uploads/Loghi/logo-newlife-corporate.png", svg_corporate, 2160, 930),
    ("uploads/Loghi/logo-newlife-horizontal.png", svg_horizontal, 2160, 660),
    ("uploads/Loghi/logo-newlife-stacked.png", svg_stacked, 1500, 1500),
    ("uploads/Loghi/logo-newlife-white.png", svg_white, 2040, 780),
    ("uploads/Loghi/logo-newlife-symbol-white.png", svg_symbol_white, 1040, 1040),
]

for path, svg_code, w, h in png_renders:
    # We insert explicit width and height into svg tag for resvg
    styled_svg = svg_code.replace('width="100%" height="100%"', f'width="{w}" height="{h}"')
    png_bytes = resvg_py.svg_to_bytes(styled_svg)
    with open(path, 'wb') as f:
        f.write(png_bytes)
    print(f"Rendered PNG: {path} ({w}x{h})")

print("All master assets generated successfully!")
