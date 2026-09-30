import math
from PIL import Image
import resvg_py
import sys
sys.path.append('.')
import scratch.trace_tools as tt

im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')

def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

fig_g = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))
nome_l = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))

# High-quality uniform arc-length resampling + moving average Gaussian smoothing + Catmull-Rom Bezier
def make_perfect_path(loop, sample_step=3.5, smooth_iter=5, tension=0.30):
    n = len(loop)
    if n < 3:
        return ""
    
    # 1. Arc length
    cum = [0.0]
    for i in range(n):
        p1 = loop[i]
        p2 = loop[(i + 1) % n]
        cum.append(cum[-1] + math.hypot(p2[0] - p1[0], p2[1] - p1[1]))
    total = cum[-1]
    if total < 2.0:
        return ""
        
    num_pts = max(6, int(round(total / sample_step)))
    step = total / num_pts
    
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
        
    pts = [pt_at(i * step) for i in range(num_pts)]
    
    # 2. Smooth iterations with corner protection
    # Corner detection
    is_corner = [False] * num_pts
    for i in range(num_pts):
        p_prev = pts[(i - 1 + num_pts) % num_pts]
        p_curr = pts[i]
        p_next = pts[(i + 1) % num_pts]
        v1 = (p_curr[0] - p_prev[0], p_curr[1] - p_prev[1])
        v2 = (p_next[0] - p_curr[0], p_next[1] - p_curr[1])
        l1 = math.hypot(v1[0], v1[1])
        l2 = math.hypot(v2[0], v2[1])
        if l1 > 0.1 and l2 > 0.1:
            dot = (v1[0]*v2[0] + v1[1]*v2[1]) / (l1 * l2)
            dot = max(-1.0, min(1.0, dot))
            if math.degrees(math.acos(dot)) > 75.0:
                is_corner[i] = True
                
    curr = list(pts)
    for _ in range(smooth_iter):
        nxt = []
        for i in range(num_pts):
            if is_corner[i]:
                nxt.append(curr[i])
            else:
                p_prev = curr[(i - 1 + num_pts) % num_pts]
                p_curr = curr[i]
                p_next = curr[(i + 1) % num_pts]
                nxt.append((0.25*p_prev[0] + 0.5*p_curr[0] + 0.25*p_next[0],
                            0.25*p_prev[1] + 0.5*p_curr[1] + 0.25*p_next[1]))
        curr = nxt
        
    # 3. Output cubic Bezier
    K = len(curr)
    path = [f"M {curr[0][0]:.3f} {curr[0][1]:.3f}"]
    for i in range(K):
        p0 = curr[(i - 1 + K) % K]
        p1 = curr[i]
        p2 = curr[(i + 1) % K]
        p3 = curr[(i + 2) % K]
        
        cp1x = p1[0] + (p2[0] - p0[0]) * tension
        cp1y = p1[1] + (p2[1] - p0[1]) * tension
        cp2x = p2[0] - (p3[0] - p1[0]) * tension
        cp2y = p2[1] - (p3[1] - p1[1]) * tension
        
        path.append(f"C {cp1x:.3f} {cp1y:.3f}, {cp2x:.3f} {cp2y:.3f}, {p2[0]:.3f} {p2[1]:.3f}")
    path.append("Z")
    return " ".join(path)

# Test generating figura & nome
fig_g_paths = [make_perfect_path(l, sample_step=3.0, smooth_iter=4) for l in fig_g]
fig_b_paths = [make_perfect_path(l, sample_step=2.8, smooth_iter=4) for l in fig_b]
nome_paths = [make_perfect_path(l, sample_step=2.2, smooth_iter=4) for l in nome_l]

test_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="800" height="400">
  <g transform="translate(20, 20) scale(1.6)" fill="#8DC63F" fill-rule="evenodd">
    {''.join(f'<path d="{p}"/>' for p in nome_paths)}
  </g>
  <g transform="translate(280, 20) scale(1.4)">
    {''.join(f'<path d="{p}" fill="#8DC63F"/>' for p in fig_g_paths)}
    {''.join(f'<path d="{p}" fill="#68C3E8"/>' for p in fig_b_paths)}
  </g>
</svg>'''

png_bytes = resvg_py.svg_to_bytes(test_svg)
with open('scratch/test_perfect_render.png', 'wb') as f:
    f.write(png_bytes)

print("test_perfect_render.png generated!")
