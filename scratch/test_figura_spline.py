import os
import math
from PIL import Image
import resvg_py
import sys
sys.path.append('.')
import scratch.trace_tools as tt

im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')

def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

fig_g = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))

# Ultra-smooth closed spline resampler
def spline_smooth(loop, num_control_pts=18, tension=0.33):
    n = len(loop)
    cum = [0.0]
    for i in range(n):
        p1 = loop[i]
        p2 = loop[(i + 1) % n]
        cum.append(cum[-1] + math.hypot(p2[0] - p1[0], p2[1] - p1[1]))
    total = cum[-1]
    
    K = num_control_pts
    step = total / K
    
    def pt_at(d):
        d = d % total
        low, high = 0, len(cum) - 1
        while low < high - 1:
            mid = (low + high) // 2
            if cum[mid] <= d:
                low = mid
            else:
                high = mid
        seg_len = cum[high] - cum[low]
        if seg_len == 0:
            return loop[low % n]
        t = (d - cum[low]) / seg_len
        p1 = loop[low % n]
        p2 = loop[(low + 1) % n]
        return (p1[0] + t*(p2[0] - p1[0]), p1[1] + t*(p2[1] - p1[1]))
        
    pts = [pt_at(i * step) for i in range(K)]
    
    # 3-pass smoothing on control points
    for _ in range(4):
        nxt = []
        for i in range(K):
            p_prev = pts[(i - 1 + K) % K]
            p_curr = pts[i]
            p_next = pts[(i + 1) % K]
            nxt.append((0.25*p_prev[0] + 0.5*p_curr[0] + 0.25*p_next[0],
                        0.25*p_prev[1] + 0.5*p_curr[1] + 0.25*p_next[1]))
        pts = nxt
        
    path = [f"M {pts[0][0]:.2f} {pts[0][1]:.2f}"]
    for i in range(K):
        p0 = pts[(i - 1 + K) % K]
        p1 = pts[i]
        p2 = pts[(i + 1) % K]
        p3 = pts[(i + 2) % K]
        
        cp1x = p1[0] + (p2[0] - p0[0]) * tension
        cp1y = p1[1] + (p2[1] - p0[1]) * tension
        cp2x = p2[0] - (p3[0] - p1[0]) * tension
        cp2y = p2[1] - (p3[1] - p1[1]) * tension
        
        path.append(f"C {cp1x:.2f} {cp1y:.2f}, {cp2x:.2f} {cp2y:.2f}, {p2[0]:.2f} {p2[1]:.2f}")
    path.append("Z")
    return " ".join(path)

# Fig green loops:
# G0: left leaf (perimeter ~ 100)
# G1: main crescent swoosh (perimeter ~ 150)
fig_g_paths = [spline_smooth(l, num_control_pts=16 if len(l) < 200 else 24) for l in fig_g]
fig_b_paths = [spline_smooth(l, num_control_pts=14) for l in fig_b]

test_fig = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115 120" width="460" height="480">
  {''.join(f'<path d="{p}" fill="#8DC63F" />' for p in fig_g_paths)}
  {''.join(f'<path d="{p}" fill="#68C3E8" />' for p in fig_b_paths)}
</svg>'''

png_bytes = resvg_py.svg_to_bytes(test_fig)
with open('scratch/test_figura_spline.png', 'wb') as f:
    f.write(png_bytes)

print("test_figura_spline.png rendered!")
