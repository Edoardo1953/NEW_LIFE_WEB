import os
import subprocess

# Geometric Bézier definitions for Figura (normalized to 100x110 box)
FIGURA_SVG_GEOMETRIC = '''
<!-- Dynamic Human / Vitality Figure (Hand-crafted smooth Bezier curves) -->
<g class="newlife-figure" id="figure-mark">
  <!-- Top Blue Droplet (Head/Arm) -->
  <path d="M 22 2 
           C 34 2, 50 8, 60 22 
           C 52 24, 38 20, 26 14 
           C 16 9, 14 4, 22 2 Z" 
        fill="#68C3E8" />
        
  <!-- Left Green Wing (Upper Torso / Left Arm) -->
  <path d="M 48 29 
           C 32 28, 15 32, 4 39 
           C -1 44, 3 50, 16 51 
           C 30 52, 44 44, 52 38 
           C 54 33, 52 30, 48 29 Z" 
        fill="#8DC63F" />
        
  <!-- Right Blue Droplet (Right Arm) -->
  <path d="M 66 22 
           C 78 20, 94 24, 103 32 
           C 95 38, 80 40, 71 34 
           C 64 29, 64 23, 66 22 Z" 
        fill="#68C3E8" />
        
  <!-- Main Green Sweeping Leg / Body -->
  <path d="M 48 48 
           C 43 54, 48 62, 58 72 
           C 70 84, 88 98, 104 108 
           C 96 92, 85 72, 72 58 
           C 62 48, 53 44, 48 48 Z" 
        fill="#8DC63F" />
        
  <!-- Bottom-Left Blue Droplet (Left Leg) -->
  <path d="M 52 68 
           C 42 68, 25 76, 8 86 
           C 0 91, 10 93, 24 90 
           C 38 85, 49 78, 53 72 
           C 54 70, 53 68, 52 68 Z" 
        fill="#68C3E8" />
</g>
'''

# Let's test render this figure to check its beauty
test_html = f'''<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
  body {{ margin: 0; padding: 40px; background: #f1f5f9; font-family: sans-serif; display: flex; gap: 40px; align-items: center; }}
  .box {{ background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }}
  svg {{ width: 250px; height: 250px; }}
  img {{ width: 250px; height: 250px; object-fit: contain; }}
</style>
</head>
<body>
  <div class="box">
    <h3>Original JPG</h3>
    <img src="../uploads/Loghi/Logo NewLife figura.jpg">
  </div>
  <div class="box">
    <h3>Mathematical Vector SVG</h3>
    <svg viewBox="0 0 110 115">
      {FIGURA_SVG_GEOMETRIC}
    </svg>
  </div>
</body>
</html>'''

with open('scratch/compare_figure.html', 'w', encoding='utf-8') as f:
    f.write(test_html)

print("Figure comparison HTML ready")
