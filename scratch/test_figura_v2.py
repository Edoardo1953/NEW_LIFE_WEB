import resvg_py

SVG_FIGURA_V2 = '''
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 115" width="440" height="460">
  <!-- Top Blue Droplet (Head) -->
  <path d="M 14 6 
           C 25 1, 46 3, 60 25 
           C 46 19, 30 14, 14 6 Z" 
        fill="#68C3E8" />

  <!-- Left Green Leaf (Upper Torso/Arm) -->
  <path d="M 0 48 
           C 12 32, 34 27, 52 35 
           C 52 43, 42 49, 28 53 
           C 16 56, 5 54, 0 48 Z" 
        fill="#8DC63F" />

  <!-- Right Blue Droplet (Right Arm) -->
  <path d="M 64 30 
           C 75 20, 92 19, 103 26 
           C 95 36, 78 40, 64 30 Z" 
        fill="#68C3E8" />

  <!-- Main Green Body & Sweeping Leg -->
  <path d="M 46 48 
           C 43 56, 48 66, 62 78 
           C 78 94, 96 104, 103 108 
           C 96 90, 80 66, 60 52 
           C 52 46, 47 46, 46 48 Z" 
        fill="#8DC63F" />

  <!-- Bottom-Left Blue Droplet (Left Leg) -->
  <path d="M 0 88 
           C 15 74, 35 65, 52 70 
           C 44 82, 26 88, 0 88 Z" 
        fill="#68C3E8" />
</svg>
'''

png_bytes = resvg_py.svg_to_bytes(SVG_FIGURA_V2)
with open('scratch/test_figura_v2.png', 'wb') as f:
    f.write(png_bytes)

print("test_figura_v2.png rendered!")
