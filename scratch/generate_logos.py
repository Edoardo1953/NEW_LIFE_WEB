import os
import sys
import math
import subprocess
from PIL import Image

sys.path.append('.')
import scratch.trace_tools as tt

# 1. Load source images
im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')
im_full = Image.open('uploads/Loghi/logo 22.jpg').convert('RGB')

# Helper: trace loops
def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

fig_g_loops = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b_loops = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))
nome_loops = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))

# Fit smooth bezier curves to each loop
def loop_to_bezier_path(loop, simp_eps=0.5, tension=0.28, scale=1.0, offset_x=0.0, offset_y=0.0):
    sim = tt.rdp(loop, simp_eps)
    # Apply offset and scale
    scaled = [(p[0]*scale + offset_x, p[1]*scale + offset_y) for p in sim]
    return tt.smooth_to_svg_path(scaled, tension)

# Extract figura elements:
# We sort by position:
# Blue loops:
# - top droplet (B0: y is smallest)
# - right droplet (B1: x is largest)
# - bottom-left droplet (B2: y is largest, x is smallest)
fig_b_sorted = sorted(fig_b_loops, key=lambda l: (min(p[1] for p in l), min(p[0] for p in l)))
fig_g_sorted = sorted(fig_g_loops, key=lambda l: (min(p[1] for p in l), min(p[0] for p in l)))

print(f"Figura: {len(fig_g_sorted)} green, {len(fig_b_sorted)} blue")
print(f"Nome: {len(nome_loops)} parts")
