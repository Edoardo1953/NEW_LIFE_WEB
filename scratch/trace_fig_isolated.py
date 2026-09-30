import sys
sys.path.append('.')
import scratch.trace_exact_running_figure as te
from PIL import Image
import resvg_py

im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
w, h = im_fig.size

def is_green(r, g, b): return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235
def is_blue(r, g, b): return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

g_paths = te.extract_smooth_vector_paths(im_fig, is_green, upscale=4, sigma=1.0, eps=0.45, tension=0.28)
b_paths = te.extract_smooth_vector_paths(im_fig, is_blue, upscale=4, sigma=1.0, eps=0.45, tension=0.28)

svg_fig = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="440" height="460">
  <g fill="#8DC63F">{''.join(f'<path d="{p}" />' for p in g_paths)}</g>
  <g fill="#68C3E8">{''.join(f'<path d="{p}" />' for p in b_paths)}</g>
</svg>'''

png_bytes = resvg_py.svg_to_bytes(svg_fig)
with open('scratch/test_fig_isolated_faithful.png', 'wb') as f:
    f.write(png_bytes)
print(f"Done: green={len(g_paths)}, blue={len(b_paths)}")
