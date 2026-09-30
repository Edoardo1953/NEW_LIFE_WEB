import os
import sys
import math
import subprocess
from PIL import Image

sys.path.append('.')
import scratch.trace_tools as tt

os.makedirs('uploads/Loghi', exist_ok=True)
os.makedirs('scratch/renders', exist_ok=True)

# 1. Load source images
im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')
im_full = Image.open('uploads/Loghi/logo 22.jpg').convert('RGB')

# Threshold filters
def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

def is_green_full(r, g, b):
    return g > 120 and g > r + 15 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_full(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

# Smooth point sequence with corner preservation
def smooth_contour(pts, window=3, iterations=3, corner_angle_thresh=70.0):
    n = len(pts)
    if n < 4:
        return pts
    
    # Identify sharp corners to preserve them
    is_corner = [False] * n
    for i in range(n):
        p_prev = pts[(i - 1 + n) % n]
        p_curr = pts[i]
        p_next = pts[(i + 1) % n]
        
        v1 = (p_curr[0] - p_prev[0], p_curr[1] - p_prev[1])
        v2 = (p_next[0] - p_curr[0], p_next[1] - p_curr[1])
        l1 = math.hypot(v1[0], v1[1])
        l2 = math.hypot(v2[0], v2[1])
        if l1 > 0.1 and l2 > 0.1:
            dot = (v1[0]*v2[0] + v1[1]*v2[1]) / (l1 * l2)
            dot = max(-1.0, min(1.0, dot))
            angle = math.degrees(math.acos(dot))
            if angle > corner_angle_thresh:
                is_corner[i] = True
                
    curr_pts = list(pts)
    for _ in range(iterations):
        next_pts = []
        for i in range(n):
            if is_corner[i]:
                next_pts.append(curr_pts[i])
            else:
                p_prev = curr_pts[(i - 1 + n) % n]
                p_curr = curr_pts[i]
                p_next = curr_pts[(i + 1) % n]
                avg_x = 0.25 * p_prev[0] + 0.5 * p_curr[0] + 0.25 * p_next[0]
                avg_y = 0.25 * p_prev[1] + 0.5 * p_curr[1] + 0.25 * p_next[1]
                next_pts.append((avg_x, avg_y))
        curr_pts = next_pts
    return curr_pts

def get_smooth_svg_path(loop, simp_eps=0.4, tension=0.25, scale_x=1.0, scale_y=1.0, offset_x=0.0, offset_y=0.0):
    smoothed = smooth_contour(loop, iterations=3)
    simplified = tt.rdp(smoothed, simp_eps)
    transformed = [(p[0]*scale_x + offset_x, p[1]*scale_y + offset_y) for p in simplified]
    return tt.smooth_to_svg_path(transformed, tension)

# Extract loops
nome_loops = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))
fig_g_loops = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b_loops = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))

# Also extract full logo 22 loops for exact relative positioning
full_g_loops = tt.trace_component(im_full, is_green_full, (0, 0, im_full.width, im_full.height))
full_b_loops = tt.trace_component(im_full, is_blue_full, (0, 0, im_full.width, im_full.height))

print(f"Nome loops: {len(nome_loops)}")
print(f"Figura loops: G={len(fig_g_loops)}, B={len(fig_b_loops)}")
print(f"Full loops: G={len(full_g_loops)}, B={len(full_b_loops)}")
