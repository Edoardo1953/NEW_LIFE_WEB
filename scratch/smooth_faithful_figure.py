import sys
sys.path.append('.')
import scratch.trace_exact_running_figure as te
from PIL import Image, ImageFilter
import resvg_py
import math

im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')
w, h = im_fig.size

def extract_smooth_vector_figure(im, upscale=4, sigma=1.2, eps=0.35, tension=0.28):
    up_w, up_h = w * upscale, h * upscale
    im_up = im.resize((up_w, up_h), Image.Resampling.LANCZOS)
    im_blur = im_up.filter(ImageFilter.GaussianBlur(sigma))
    
    def get_loops(col_fn):
        mask = [[0]*up_w for _ in range(up_h)]
        for y in range(up_h):
            for x in range(up_w):
                r, g, b = im_blur.getpixel((x, y))
                if col_fn(r, g, b): mask[y][x] = 1
        padded = [[0]*(up_w+2) for _ in range(up_h+2)]
        for y in range(up_h):
            for x in range(up_w): padded[y+1][x+1] = mask[y][x]
        segments = {}
        for y in range(up_h + 1):
            for x in range(up_w + 1):
                case = padded[y][x] | (padded[y][x+1]<<1) | (padded[y+1][x+1]<<2) | (padded[y+1][x]<<3)
                if case == 0 or case == 15: continue
                wx = (x - 0.5) / upscale
                wy = (y - 0.5) / upscale
                step = 0.5 / upscale
                N, E, S, W = (wx, wy - step), (wx + step, wy), (wx, wy + step), (wx - step, wy)
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
                for p1, p2 in seg_list: segments.setdefault(p1, []).append(p2)
        loops = []
        while segments:
            start_pt = next(iter(segments.keys()))
            curr = start_pt
            loop = [curr]
            while True:
                if curr not in segments or not segments[curr]: break
                nxt = segments[curr].pop(0)
                if not segments[curr]: del segments[curr]
                if nxt == start_pt: break
                loop.append(nxt)
                curr = nxt
            if len(loop) > 15: loops.append(loop)
        return loops

    def is_green(r, g, b): return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235
    def is_blue(r, g, b): return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

    loops_g = get_loops(is_green)
    loops_b = get_loops(is_blue)

    def smooth_and_to_svg(loop):
        # 3-pass smoothing of loop
        curr = list(loop)
        for _ in range(3):
            n = len(curr)
            sm = []
            for i in range(n):
                p0 = curr[(i - 1 + n) % n]
                p1 = curr[i]
                p2 = curr[(i + 1) % n]
                sm.append((0.25*p0[0] + 0.5*p1[0] + 0.25*p2[0],
                           0.25*p0[1] + 0.5*p1[1] + 0.25*p2[1]))
            curr = sm
        
        # RDP simplification
        def rdp(pts, e):
            if len(pts) < 3: return pts
            s, en = pts[0], pts[-1]
            def dist(pt):
                dx, dy = en[0]-s[0], en[1]-s[1]
                if dx==0 and dy==0: return math.hypot(pt[0]-s[0], pt[1]-s[1])
                t = max(0, min(1, ((pt[0]-s[0])*dx + (pt[1]-s[1])*dy)/(dx*dx + dy*dy)))
                return math.hypot(pt[0] - (s[0]+t*dx), pt[1] - (s[1]+t*dy))
            dmax, idx = 0.0, 0
            for i in range(1, len(pts)-1):
                d = dist(pts[i])
                if d > dmax: idx, dmax = i, d
            if dmax > e: return rdp(pts[:idx+1], e)[:-1] + rdp(pts[idx:], e)
            return [s, en]
            
        sim = rdp(curr, eps)
        n = len(sim)
        if n < 3: return ""
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
        return " ".join(path)

    paths_g = [smooth_and_to_svg(l) for l in loops_g]
    paths_b = [smooth_and_to_svg(l) for l in loops_b]
    return paths_g, paths_b

g_paths, b_paths = extract_smooth_vector_figure(im_fig)

svg_clean_fig = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="440" height="460">
  <g fill="#8DC63F">{''.join(f'<path d="{p}" />' for p in g_paths)}</g>
  <g fill="#68C3E8">{''.join(f'<path d="{p}" />' for p in b_paths)}</g>
</svg>'''

png_bytes = resvg_py.svg_to_bytes(svg_clean_fig)
with open('scratch/test_figura_smooth_faithful.png', 'wb') as f:
    f.write(png_bytes)

print(f"Smooth faithful figure generated! G={len(g_paths)}, B={len(b_paths)}")
