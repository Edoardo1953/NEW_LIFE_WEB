import os
import resvg_py
from PIL import Image

GREEN = "#8DC63F"       # Vibrant Spring Lime Green
BLUE = "#68C3E8"        # Crisp Sky / Cyan Blue
WHITE = "#FFFFFF"
DARK_SLATE = "#1E293B"  # High-contrast Slate

# -------------------------------------------------------------
# 1. PERFECTED DYNAMIC FIGURE SYMBOL (5 Elements in 240x240 box)
# -------------------------------------------------------------
def get_symbol_paths(g_col=GREEN, b_col=BLUE):
    return f'''
    <!-- Top-Right Sky Blue Droplet (Head/Arm) -->
    <path d="M 115 16
             C 135 16, 170 30, 185 58
             C 174 65, 146 56, 128 42
             C 108 26, 105 16, 115 16 Z" 
          fill="{b_col}" />

    <!-- Upper-Left Green Wing (Torso/Left Arm) -->
    <path d="M 110 62
             C 78 58, 36 68, 12 88
             C -2 98, 6 110, 32 112
             C 64 114, 96 96, 115 80
             C 120 72, 118 64, 110 62 Z" 
          fill="{g_col}" />

    <!-- Middle-Right Sky Blue Droplet (Right Arm) -->
    <path d="M 146 54
             C 170 48, 202 58, 222 74
             C 204 88, 172 90, 154 78
             C 142 68, 142 56, 146 54 Z" 
          fill="{b_col}" />

    <!-- Central Green Sweeping Body & Leg -->
    <path d="M 112 102
             C 104 112, 114 128, 128 146
             C 148 174, 178 212, 216 226
             C 198 196, 170 152, 146 122
             C 132 104, 120 96, 112 102 Z" 
          fill="{g_col}" />

    <!-- Bottom-Left Sky Blue Droplet (Left Leg) -->
    <path d="M 116 146
             C 94 146, 54 164, 16 188
             C -2 198, 18 204, 48 196
             C 80 186, 106 170, 118 158
             C 120 152, 118 146, 116 146 Z" 
          fill="{b_col}" />
    '''

# -------------------------------------------------------------
# 2. PERFECTED LOGOTYPE "NEW LIFE" (400x220 box)
# -------------------------------------------------------------
def get_logotype_paths(color=GREEN):
    return f'''
    <!-- ====== TOP LINE: "new" ====== -->
    <!-- 'n' and Underline continuous bar -->
    <path d="M 30 84
             L 30 46
             C 30 24, 46 12, 66 12
             C 86 12, 102 24, 102 46
             L 102 74
             L 338 74
             C 346 74, 350 78, 350 84
             C 350 90, 346 94, 338 94
             L 84 94
             L 84 46
             C 84 34, 76 28, 66 28
             C 56 28, 48 34, 48 46
             L 48 84
             C 48 90, 44 94, 39 94
             C 34 94, 30 90, 30 84 Z" 
          fill="{color}" />

    <!-- 'e' Arch Dome -->
    <path d="M 126 74
             C 126 38, 144 14, 176 14
             C 208 14, 224 38, 224 56
             C 224 62, 220 66, 214 66
             C 208 66, 204 62, 204 56
             C 204 44, 194 30, 176 30
             C 156 30, 146 48, 146 74
             L 126 74 Z" 
          fill="{color}" />
    <!-- 'e' Floating Eye Pill -->
    <path d="M 166 42
             L 198 42
             C 204 42, 208 46, 208 50
             C 208 54, 204 58, 198 58
             L 166 58
             C 160 58, 156 54, 156 50
             C 156 46, 160 42, 166 42 Z" 
          fill="{color}" />

    <!-- 'w' Triple Stem with Expressive Rounded Flick -->
    <path d="M 246 22
             C 252 22, 256 26, 256 32
             L 256 64
             C 256 70, 262 76, 268 76
             C 274 76, 280 70, 280 64
             L 280 32
             C 280 26, 284 22, 290 22
             C 296 22, 300 26, 300 32
             L 300 64
             C 300 70, 306 76, 312 76
             C 318 76, 324 70, 324 64
             L 324 32
             C 324 24, 330 16, 338 14
             C 344 12, 350 16, 350 22
             C 350 28, 346 34, 342 38
             L 342 64
             C 342 82, 328 94, 312 94
             C 298 94, 288 86, 282 76
             C 276 86, 266 94, 252 94
             C 234 94, 238 76, 238 64
             L 238 32
             C 238 26, 242 22, 246 22 Z" 
          fill="{color}" />

    <!-- ====== BOTTOM LINE: "L I F E" ====== -->
    <!-- 'L' -->
    <path d="M 39 120
             C 45 120, 49 124, 49 130
             L 49 184
             C 49 190, 54 195, 60 195
             L 82 195
             C 88 195, 92 199, 92 205
             C 92 211, 88 215, 82 215
             L 60 215
             C 42 215, 29 202, 29 184
             L 29 130
             C 29 124, 33 120, 39 120 Z" 
          fill="{color}" />

    <!-- 'I' -->
    <path d="M 128 120
             C 134 120, 138 124, 138 130
             L 138 205
             C 138 211, 134 215, 128 215
             C 122 215, 118 211, 118 205
             L 118 130
             C 118 124, 122 120, 128 120 Z" 
          fill="{color}" />

    <!-- 'F' -->
    <path d="M 174 130
             C 174 124, 178 120, 184 120
             L 230 120
             C 236 120, 240 124, 240 130
             C 240 136, 236 140, 230 140
             L 194 140
             L 194 205
             C 194 211, 190 215, 184 215
             C 178 215, 174 211, 174 205
             L 174 130 Z" 
          fill="{color}" />
    <!-- 'F' Floating Middle Pill -->
    <path d="M 198 157
             L 224 157
             C 230 157, 234 161, 234 166
             C 234 171, 230 175, 224 175
             L 198 175
             C 192 175, 188 171, 188 166
             C 188 161, 192 157, 198 157 Z" 
          fill="{color}" />

    <!-- 'E' -->
    <path d="M 326 130
             C 326 124, 322 120, 316 120
             L 282 120
             C 264 120, 250 134, 250 152
             L 250 183
             C 250 201, 264 215, 282 215
             L 316 215
             C 322 215, 326 211, 326 205
             C 326 199, 322 195, 316 195
             L 282 195
             C 274 195, 270 189, 270 181
             L 270 154
             C 270 146, 274 140, 282 140
             L 316 140
             C 322 140, 326 136, 326 130 Z" 
          fill="{color}" />
    <!-- 'E' Floating Middle Pill -->
    <path d="M 276 157
             L 302 157
             C 308 157, 312 161, 312 166
             C 312 171, 308 175, 302 175
             L 276 175
             C 270 175, 266 171, 266 166
             C 266 161, 270 157, 276 157 Z" 
          fill="{color}" />
    '''

# Generate all SVGs and PNGs
# 1. Master Brand Logo (Original Layout)
svg_master = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 260" width="100%" height="100%">
  <!-- NEW LIFE - Master Logo (Transparent Vector) -->
  <g transform="translate(15, 20)">
    {get_logotype_paths(GREEN)}
  </g>
  <g transform="translate(415, 10)">
    {get_symbol_paths(GREEN, BLUE)}
  </g>
</svg>'''

# 2. Standalone Symbol Mark
svg_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="100%" height="100%">
  <!-- NEW LIFE - Symbol Mark -->
  <g transform="translate(5, 5)">
    {get_symbol_paths(GREEN, BLUE)}
  </g>
</svg>'''

# 3. Standalone Logotype
svg_text = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="100%" height="100%">
  <!-- NEW LIFE - Logotype -->
  <g transform="translate(15, 10)">
    {get_logotype_paths(GREEN)}
  </g>
</svg>'''

# 4. Corporate Master with Subtitle
svg_corporate = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 310" width="100%" height="100%">
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
  <g transform="translate(15, 15)">
    {get_logotype_paths(GREEN)}
  </g>
  <g transform="translate(425, 10)">
    {get_symbol_paths(GREEN, BLUE)}
  </g>
  <g transform="translate(50, 275)">
    <text class="corp-legal" x="0" y="0">S.À R.L.</text>
    <circle cx="130" cy="-6" r="3.5" fill="#8DC63F" />
    <text class="corp-loc" x="148" y="0">LUXEMBOURG</text>
  </g>
</svg>'''

# 5. Horizontal Layout
svg_horizontal = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 220" width="100%" height="100%">
  <!-- NEW LIFE - Horizontal Header Layout -->
  <g transform="translate(15, -10) scale(0.92)">
    {get_symbol_paths(GREEN, BLUE)}
  </g>
  <g transform="translate(255, -2) scale(0.95)">
    {get_logotype_paths(GREEN)}
  </g>
</svg>'''

# 6. Stacked Layout
svg_stacked = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 480" width="100%" height="100%">
  <!-- NEW LIFE - Stacked Centered Layout -->
  <g transform="translate(110, 15)">
    {get_symbol_paths(GREEN, BLUE)}
  </g>
  <g transform="translate(30, 240)">
    {get_logotype_paths(GREEN)}
  </g>
</svg>'''

# 7. White Monochrome
svg_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 260" width="100%" height="100%">
  <!-- NEW LIFE - White Monochrome -->
  <g transform="translate(15, 20)">
    {get_logotype_paths("#FFFFFF")}
  </g>
  <g transform="translate(415, 10)">
    {get_symbol_paths("#FFFFFF", "#FFFFFF")}
  </g>
</svg>'''

svg_symbol_white = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" width="100%" height="100%">
  <!-- NEW LIFE - Symbol White -->
  <g transform="translate(5, 5)">
    {get_symbol_paths("#FFFFFF", "#FFFFFF")}
  </g>
</svg>'''

all_files = [
    ("uploads/Loghi/logo-newlife-complete.svg", svg_master),
    ("uploads/Loghi/logo-newlife.svg", svg_master),
    ("uploads/Loghi/logo-newlife-symbol.svg", svg_symbol),
    ("uploads/Loghi/logo-newlife-text.svg", svg_text),
    ("uploads/Loghi/logo-newlife-corporate.svg", svg_corporate),
    ("uploads/Loghi/logo-newlife-horizontal.svg", svg_horizontal),
    ("uploads/Loghi/logo-newlife-stacked.svg", svg_stacked),
    ("uploads/Loghi/logo-newlife-white.svg", svg_white),
    ("uploads/Loghi/logo-newlife-symbol-white.svg", svg_symbol_white),
]

for path, code in all_files:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

png_exports = [
    ("uploads/Loghi/logo-newlife-complete.png", svg_master, 2040, 780),
    ("uploads/Loghi/logo-newlife.png", svg_master, 2040, 780),
    ("uploads/Loghi/logo-newlife-symbol.png", svg_symbol, 1000, 1000),
    ("uploads/Loghi/Logo NewLife figura.png", svg_symbol, 512, 512),
    ("uploads/Loghi/logo-newlife-text.png", svg_text, 1600, 960),
    ("uploads/Loghi/logo-newlife-corporate.png", svg_corporate, 2100, 930),
    ("uploads/Loghi/logo-newlife-horizontal.png", svg_horizontal, 2040, 660),
    ("uploads/Loghi/logo-newlife-stacked.png", svg_stacked, 1380, 1440),
    ("uploads/Loghi/logo-newlife-white.png", svg_white, 2040, 780),
    ("uploads/Loghi/logo-newlife-symbol-white.png", svg_symbol_white, 1000, 1000),
]

for path, code, w, h in png_exports:
    styled = code.replace('width="100%" height="100%"', f'width="{w}" height="{h}"')
    png_bytes = resvg_py.svg_to_bytes(styled)
    with open(path, 'wb') as f:
        f.write(png_bytes)
    print(f"Rendered: {path}")

print("Master asset generation completed successfully!")
