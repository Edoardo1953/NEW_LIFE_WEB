import os
import math
import subprocess
from PIL import Image
import scratch.trace_tools as tt

os.makedirs('uploads/Loghi', exist_ok=True)
os.makedirs('scratch', exist_ok=True)

# 1. Load images
im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')
im_full = Image.open('uploads/Loghi/logo 22.jpg').convert('RGB')

# Extract figura loops
def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

fig_g_loops = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b_loops = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))

# Extract nome loops
def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

nome_loops = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))

# Normalize and scale paths
def loop_to_svg_d(loop, simp_eps=0.45, tension=0.26):
    simplified = tt.rdp(loop, simp_eps)
    return tt.smooth_to_svg_path(simplified, tension)

# Generate SVG strings for figura elements
fig_paths_g = [loop_to_svg_d(l) for l in fig_g_loops]
fig_paths_b = [loop_to_svg_d(l) for l in fig_b_loops]
nome_paths = [loop_to_svg_d(l) for l in nome_loops]

print(f"Generated {len(fig_paths_g)} green figure paths, {len(fig_paths_b)} blue figure paths, {len(nome_paths)} name paths")
