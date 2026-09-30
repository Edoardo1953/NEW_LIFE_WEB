import os
import subprocess
import time
from PIL import Image

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_exe):
    edge_exe = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

svg_files = [
    ("logo-newlife-complete.svg", "logo-newlife-complete.png", 2000, 920),
    ("logo-newlife-symbol.svg", "logo-newlife-symbol.png", 1000, 1000),
    ("logo-newlife-text.svg", "logo-newlife-text.png", 1800, 900),
    ("logo-newlife-corporate.svg", "logo-newlife-corporate.png", 2120, 1040),
    ("logo-newlife-horizontal.svg", "logo-newlife-horizontal.png", 2200, 720),
    ("logo-newlife-stacked.svg", "logo-newlife-stacked.png", 1400, 1500),
    ("logo-newlife-white.svg", "logo-newlife-white.png", 2000, 920),
    ("logo-newlife-symbol-white.svg", "logo-newlife-symbol-white.png", 1000, 1000),
    ("logo-newlife-symbol.svg", "Logo NewLife figura.png", 512, 512),
]

for svg_name, png_name, w, h in svg_files:
    svg_path = os.path.abspath(os.path.join("uploads/Loghi", svg_name))
    png_path = os.path.abspath(os.path.join("uploads/Loghi", png_name))
    
    # Create a small standalone HTML page that renders the SVG with transparency
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()
        
    html_content = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{
    width: {w}px;
    height: {h}px;
    background: transparent;
    overflow: hidden;
  }}
  svg {{
    width: 100%;
    height: 100%;
    display: block;
  }}
</style>
</head>
<body>
{svg_content}
</body>
</html>'''
    temp_html = os.path.abspath(f"scratch/temp_{png_name}.html")
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(html_content)
        
    # Run Edge headless screenshot
    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        f"--window-size={w},{h}",
        "--hide-scrollbars",
        "--default-background-color=00000000",
        f"--screenshot={png_path}",
        temp_html
    ]
    subprocess.run(cmd, capture_output=True)
    print(f"Rendered {png_name} ({w}x{h})")
    if os.path.exists(temp_html):
        os.remove(temp_html)

print("All PNG renders complete!")
