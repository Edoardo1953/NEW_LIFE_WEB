import resvg_py

SVG_FIGURA_PRECISION = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 115" width="440" height="460">
  <!-- Top Blue Droplet (Head) -->
  <path d="M 15 6 
           C 25 1, 48 3, 60 25 
           C 48 20, 32 14, 15 6 Z" 
        fill="#68C3E8" />

  <!-- Left Green Leaf (Upper Torso/Arm) -->
  <path d="M 0 48 
           C 12 32, 34 28, 52 35 
           C 52 42, 44 48, 30 52 
           C 18 55, 6 54, 0 48 Z" 
        fill="#8DC63F" />

  <!-- Right Blue Droplet (Right Arm) -->
  <path d="M 65 30 
           C 75 21, 90 20, 102 26 
           C 96 36, 80 40, 65 30 Z" 
        fill="#68C3E8" />

  <!-- Main Green Crescent Swoosh -->
  <path d="M 48 52 
           C 58 45, 78 52, 90 70 
           C 98 84, 103 98, 103 108 
           C 98 90, 80 66, 62 56 
           C 52 50, 48 50, 48 52 Z" 
        fill="#8DC63F" />

  <!-- Bottom-Left Blue Droplet (Left Leg) -->
  <path d="M 0 88 
           C 15 75, 35 66, 52 70 
           C 45 82, 28 88, 0 88 Z" 
        fill="#68C3E8" />
</svg>
'''

png_bytes = resvg_py.svg_to_bytes(SVG_FIGURA_PRECISION)
with open('scratch/test_figura_precision.png', 'wb') as f:
    f.write(png_bytes)

print("test_figura_precision.png rendered!")
