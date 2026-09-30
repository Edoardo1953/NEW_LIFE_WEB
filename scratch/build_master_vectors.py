import os
import resvg_py
from PIL import Image

# MASTER COLORS
GREEN = "#8DC63F"        # Fresh Vitality Lime Green (Brand Primary)
GREEN_DARK = "#76A832"   # Deep Lime Green
BLUE = "#68C3E8"         # Sky Cyan (Brand Accent)
DARK = "#1E293B"         # Deep Slate for Corporate Text
WHITE = "#FFFFFF"

# -------------------------------------------------------------
# 1. MATHEMATICAL GEOMETRY: DYNAMIC FIGURE (SYMBOL MARK)
# -------------------------------------------------------------
# Standard coordinate space: 0 0 240 240
# The 5 dynamic elements:
# 1) Top Blue Droplet (Head/Arm)
# 2) Left Green Wing/Torso
# 3) Right Blue Droplet (Arm)
# 4) Central Green Sweeping Body/Leg
# 5) Bottom-Left Blue Droplet (Leg)

def get_symbol_svg_paths(g_col=GREEN, b_col=BLUE):
    return f'''
    <!-- Top-Right Sky Blue Droplet -->
    <path d="M 125 18 
             C 140 18, 172 32, 185 64 
             C 172 68, 142 58, 126 44 
             C 108 28, 112 18, 125 18 Z" 
          fill="{b_col}" />

    <!-- Upper-Left Green Wing/Torso -->
    <path d="M 108 64 
             C 76 60, 36 72, 12 90 
             C 0 100, 8 112, 34 114 
             C 66 116, 98 98, 116 82 
             C 120 72, 116 64, 108 64 Z" 
          fill="{g_col}" />

    <!-- Middle-Right Sky Blue Droplet -->
    <path d="M 148 54 
             C 172 50, 204 60, 222 78 
             C 206 90, 174 94, 156 80 
             C 144 70, 144 56, 148 54 Z" 
          fill="{b_col}" />

    <!-- Main Dynamic Green Sweeping Body & Leg -->
    <path d="M 112 104 
             C 126 126, 142 152, 164 178 
             C 192 212, 216 232, 230 230 
             C 214 198, 190 156, 162 126 
             C 140 104, 122 94, 112 104 Z" 
          fill="{g_col}" />

    <!-- Bottom-Left Sky Blue Droplet -->
    <path d="M 116 148 
             C 94 148, 56 166, 18 190 
             C 0 200, 22 204, 52 196 
             C 84 186, 108 170, 118 158 
             C 120 152, 118 148, 116 148 Z" 
          fill="{b_col}" />
    '''

# -------------------------------------------------------------
# 2. MATHEMATICAL GEOMETRY: "NEW LIFE" LOGOTYPE
# -------------------------------------------------------------
# Standard coordinate space: 0 0 460 220
# Top line: "new" + Underline (Y ~ 20 to 95)
# Bottom line: "L I F E" (Y ~ 115 to 205)

def get_logotype_svg_paths(color=GREEN):
    return f'''
    <!-- ====== TOP LINE: n e w + Underline ====== -->
    <!-- Continuous ribbon: 'n' arch + Baseline underline connecting under 'e' and 'w' -->
    <path d="M 38 92
             C 34 92, 30 88, 30 82
             L 30 46
             C 30 28, 44 14, 62 14
             C 80 14, 94 28, 94 46
             L 94 72
             L 330 72
             C 336 72, 340 76, 340 82
             C 340 88, 336 92, 330 92
             L 80 92
             C 74 92, 74 80, 74 72
             L 74 46
             C 74 38, 68 32, 62 32
             C 56 32, 50 38, 50 46
             L 50 82
             C 50 88, 46 92, 38 92 Z" 
          fill="{color}" />

    <!-- Letter 'e' Outer Arch -->
    <path d="M 124 72
             C 124 38, 142 16, 172 16
             C 202 16, 218 36, 218 58
             C 218 64, 214 68, 208 68
             L 142 68
             C 142 70, 144 72, 148 72
             L 202 72
             C 208 72, 212 76, 212 82
             C 212 88, 208 92, 202 92
             L 148 92
             C 134 92, 124 82, 124 72 Z
             M 144 50
             L 198 50
             C 196 36, 186 32, 172 32
             C 156 32, 146 38, 144 50 Z" 
          fill="{color}" />

    <!-- Letter 'w' Double-Trough Curves -->
    <path d="M 238 20
             C 244 20, 248 24, 248 30
             L 248 62
             C 248 70, 254 76, 262 76
             C 270 76, 276 70, 276 62
             L 276 30
             C 276 24, 280 20, 286 20
             C 292 20, 296 24, 296 30
             L 296 62
             C 296 70, 302 76, 310 76
             C 318 76, 324 70, 324 62
             L 324 30
             C 324 24, 328 18, 334 16
             C 340 14, 344 18, 344 24
             L 344 62
             C 344 80, 330 92, 310 92
             C 296 92, 286 84, 280 74
             C 274 84, 264 92, 250 92
             C 230 92, 218 80, 218 62
             L 218 30
             C 218 24, 222 20, 228 20
             L 238 20 Z" 
          fill="{color}" />


    <!-- ====== BOTTOM LINE: L I F E ====== -->
    <!-- Letter 'L' -->
    <path d="M 38 116
             C 44 116, 48 120, 48 126
             L 48 180
             C 48 188, 54 194, 62 194
             L 78 194
             C 84 194, 88 198, 88 204
             C 88 210, 84 214, 78 214
             L 60 214
             C 42 214, 28 200, 28 182
             L 28 126
             C 28 120, 32 116, 38 116 Z" 
          fill="{color}" />

    <!-- Letter 'I' -->
    <path d="M 126 116
             C 132 116, 136 120, 136 126
             L 136 204
             C 136 210, 132 214, 126 214
             C 120 214, 116 210, 116 204
             L 116 126
             C 116 120, 120 116, 126 116 Z" 
          fill="{color}" />

    <!-- Letter 'F' -->
    <path d="M 172 116
             C 188 116, 222 116, 230 116
             C 236 116, 240 120, 240 126
             C 240 132, 236 136, 230 136
             L 192 136
             L 192 152
             L 220 152
             C 226 152, 230 156, 230 162
             C 230 168, 226 172, 220 172
             L 192 172
             L 192 204
             C 192 210, 188 214, 182 214
             C 176 214, 172 210, 172 204
             L 172 116 Z" 
          fill="{color}" />

    <!-- Letter 'E' -->
    <path d="M 334 126
             C 334 120, 330 116, 324 116
             L 276 116
             C 258 116, 244 130, 244 148
             L 244 182
             C 244 200, 258 214, 276 214
             L 324 214
             C 330 214, 334 210, 334 204
             C 334 198, 330 194, 324 194
             L 278 194
             C 268 194, 264 188, 264 180
             L 264 172
             L 310 172
             C 316 172, 320 168, 320 162
             C 320 156, 316 152, 310 152
             L 264 152
             L 264 148
             C 264 140, 268 136, 278 136
             L 324 136
             C 330 136, 334 132, 334 126 Z" 
          fill="{color}" />
    '''

print("Master vector modules defined.")
