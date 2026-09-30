import os
import resvg_py
from PIL import Image

# 1. Coordinate definitions for Figura (viewBox 0 0 220 230)
FIG_TOP_BLUE = (
    "M 48 6 "
    "C 68 8, 105 20, 120 50 "
    "C 104 54, 76 44, 56 32 "
    "C 38 22, 34 10, 48 6 Z"
)

FIG_LEFT_GREEN = (
    "M 98 62 "
    "C 66 58, 30 68, 8 82 "
    "C -2 92, 6 104, 30 106 "
    "C 60 108, 90 92, 106 78 "
    "C 110 68, 106 62, 98 62 Z"
)

FIG_RIGHT_BLUE = (
    "M 132 46 "
    "C 156 42, 188 50, 206 66 "
    "C 192 78, 162 82, 144 70 "
    "C 130 60, 130 48, 132 46 Z"
)

FIG_MAIN_GREEN = (
    "M 98 98 "
    "C 112 118, 126 142, 146 166 "
    "C 172 198, 194 218, 210 216 "
    "C 194 186, 172 146, 146 118 "
    "C 126 98, 108 90, 98 98 Z"
)

FIG_BOTTOM_BLUE = (
    "M 104 138 "
    "C 84 138, 50 154, 16 174 "
    "C 0 184, 20 188, 48 182 "
    "C 76 172, 98 158, 106 146 "
    "C 108 142, 106 138, 104 138 Z"
)

def make_figura_group(g_col="#8DC63F", b_col="#68C3E8"):
    return f'''<g class="symbol-figure">
      <path d="{FIG_TOP_BLUE}" fill="{b_col}" />
      <path d="{FIG_LEFT_GREEN}" fill="{g_col}" />
      <path d="{FIG_RIGHT_BLUE}" fill="{b_col}" />
      <path d="{FIG_MAIN_GREEN}" fill="{g_col}" />
      <path d="{FIG_BOTTOM_BLUE}" fill="{b_col}" />
    </g>'''

svg_fig = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230" width="440" height="460">
  {make_figura_group()}
</svg>'''

png_bytes = resvg_py.svg_to_bytes(svg_fig)
with open('scratch/test_figura_clean.png', 'wb') as f:
    f.write(png_bytes)

print("test_figura_clean.png generated!")
