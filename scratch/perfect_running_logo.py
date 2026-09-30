import os
import math
from PIL import Image, ImageFilter
import resvg_py

# Load original logo 22.jpg
im_full = Image.open('uploads/Loghi/logo 22.jpg').convert('RGB')
w, h = im_full.size

def extract_smooth_paths(im, color_fn, upscale=12, sigma=2.8, eps=0.6, tension=0.30):
    up_w, up_h = w * upscale, h * upscale
    im_up = im.resize((up_w, up_h), Image.Resampling.LANCZOS)
    im_blur = im_up.filter(ImageFilter.GaussianBlur(sigma))
    
    mask = [[0]*up_w for _ in range(up_h)]
    for y in range(up_h):
        for x in range(up_w):
            r, g, b = im_blur.getpixel((x, y))
            if color_fn(r, g, b):
                mask[y][x] = 1
                
    padded = [[0]*(up_w+2) for _ in range(up_h+2)]
    for y in range(up_h):
        for x in range(up_w):
            padded[y+1][x+1] = mask[y][x]
            
    segments = {}
    for y in range(up_h + 1):
        for x in range(up_w + 1):
            tl = padded[y][x]
            tr = padded[y][x+1]
            br = padded[y+1][x+1]
            bl = padded[y+1][x]
            case = tl | (tr << 1) | (br << 2) | (bl << 3)
            if case == 0 or case == 15:
                continue
            
            wx = (x - 0.5) / upscale
            wy = (y - 0.5) / upscale
            step = 0.5 / upscale
            
            N = (wx, wy - step)
            E = (wx + step, wy)
            S = (wx, wy + step)
            W = (wx - step, wy)
            
            seg_list = []
            if case == 1:   seg_list.append((W, N))
            elif case == 2: seg_list.append((N, E))
            elif case == 3: seg_list.append((W, E))
            elif case == 4: seg_list.append((E, S))
            elif case == 5: seg_list.extend([(W, N), (E, S)])
            elif case == 6: seg_list.append((N, S))
            elif case == 7: seg_list.append((W, S))
            elif case == 8: seg_list.append((S, W))
            elif case == 9: seg_list.append((S, N))
            elif case == 10: seg_list.extend([(S, W), (N, E)])
            elif case == 11: seg_list.append((S, E))
            elif case == 12: seg_list.append((E, W))
            elif case == 13: seg_list.append((E, N))
            elif case == 14: seg_list.append((N, W))
            
            for p1, p2 in seg_list:
                segments.setdefault(p1, []).append(p2)
                
    loops = []
    while segments:
        start_pt = next(iter(segments.keys()))
        curr = start_pt
        loop = [curr]
        while True:
            if curr not in segments or not segments[curr]:
                break
            nxt = segments[curr].pop(0)
            if not segments[curr]:
                del segments[curr]
            if nxt == start_pt:
                break
            loop.append(nxt)
            curr = nxt
        if len(loop) > 20:
            loops.append(loop)
            
    def rdp(points, epsilon):
        if len(points) < 3: return points
        start, end = points[0], points[-1]
        def pt_dist(pt, p1, p2):
            dx, dy = p2[0] - p1[0], p2[1] - p1[1]
            if dx == 0 and dy == 0: return math.hypot(pt[0] - p1[0], pt[1] - p1[1])
            t = max(0, min(1, ((pt[0] - p1[0])*dx + (pt[1] - p1[1])*dy) / (dx*dx + dy*dy)))
            return math.hypot(pt[0] - (p1[0] + t*dx), pt[1] - (p1[1] + t*dy))
        dmax, idx = 0.0, 0
        for i in range(1, len(points)-1):
            d = pt_dist(points[i], start, end)
            if d > dmax: idx, dmax = i, d
        if dmax > epsilon:
            return rdp(points[:idx+1], epsilon)[:-1] + rdp(points[idx:], epsilon)
        return [start, end]

    svg_paths = []
    for loop in loops:
        sim = rdp(loop, eps)
        n = len(sim)
        if n < 3: continue
        path = [f"M {sim[0][0]:.2f} {sim[0][1]:.2f}"]
        for i in range(n):
            p0 = sim[(i - 1 + n) % n]
            p1 = sim[i]
            p2 = sim[(i + 1) % n]
            p3 = sim[(i + 2) % n]
            cp1x = p1[0] + (p2[0] - p0[0]) * tension
            cp1y = p1[1] + (p2[1] - p0[1]) * tension
            cp2x = p2[0] - (p3[0] - p1[0]) * tension
            cp2y = p2[1] - (p3[1] - p1[1]) * tension
            path.append(f"C {cp1x:.2f} {cp1y:.2f}, {cp2x:.2f} {cp2y:.2f}, {p2[0]:.2f} {p2[1]:.2f}")
        path.append("Z")
        svg_paths.append(" ".join(path))
        
    return svg_paths

def is_green(r, g, b):
    return g > 115 and g > r + 15 and g > b + 25 and (r+g+b)/3 < 230

def is_blue(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 230

green_paths = extract_smooth_paths(im_full, is_green, upscale=12, sigma=2.8, eps=0.55, tension=0.28)
blue_paths = extract_smooth_paths(im_full, is_blue, upscale=12, sigma=2.8, eps=0.55, tension=0.28)

print(f"Computed silky smooth paths: {len(green_paths)} green, {len(blue_paths)} blue")

# Separate figure paths from name paths in logo 22.jpg
# Figure elements have X > 220
# In green_paths, the loops with min_x > 220 are figure elements (2 loops: torso leaf and trailing leg)
# In blue_paths, all 3 loops are figure elements (top head, right arm, bottom-left leg)

# Generate pristine master SVGs
svg_master = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <!-- NEW LIFE - Master Running Figure Logo (Silky Smooth Mathematical Vector) -->
  <g fill="#8DC63F" fill-rule="evenodd">
    {''.join(f'<path d="{p}" />' for p in green_paths)}
  </g>
  <g fill="#68C3E8">
    {''.join(f'<path d="{p}" />' for p in blue_paths)}
  </g>
</svg>'''

with open('uploads/Loghi/logo-newlife-complete.svg', 'w', encoding='utf-8') as f:
    f.write(svg_master)

with open('uploads/Loghi/logo-newlife.svg', 'w', encoding='utf-8') as f:
    f.write(svg_master)

# Render high-resolution PNG
png_bytes = resvg_py.svg_to_bytes(svg_master.replace('width="100%" height="100%"', 'width="2480" height="1142"'))
with open('uploads/Loghi/logo-newlife-complete.png', 'wb') as f:
    f.write(png_bytes)
with open('uploads/Loghi/logo-newlife.png', 'wb') as f:
    f.write(png_bytes)

print("Master SVG and 4K PNG saved successfully!")
