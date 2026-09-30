import os
import math
from PIL import Image, ImageFilter

def get_binary_mask(img, col_filter):
    w, h = img.size
    mask = [[0]*w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b = img.getpixel((x, y))
            if col_filter(r, g, b):
                mask[y][x] = 1
    return mask

def find_contours(mask, w, h):
    # Find boundary edges using Moore-Neighbor / Marching squares
    # Or find all 4-connected boundary loops
    visited_edges = set()
    contours = []
    
    # Pad mask by 1
    padded = [[0]*(w+2) for _ in range(h+2)]
    for y in range(h):
        for x in range(w):
            padded[y+1][x+1] = mask[y][x]
            
    # Marching squares lookup table
    # cell corners: top-left (1), top-right (2), bottom-right (4), bottom-left (8)
    segments = {} # (x, y) -> list of directed segments
    for y in range(h + 1):
        for x in range(w + 1):
            tl = padded[y][x]
            tr = padded[y][x+1]
            br = padded[y+1][x+1]
            bl = padded[y+1][x]
            case = tl | (tr << 1) | (br << 2) | (bl << 3)
            if case == 0 or case == 15:
                continue
            
            # Midpoints: N=(x+0.5, y), E=(x+1, y+0.5), S=(x+0.5, y+1), W=(x, y+0.5)
            N = (x - 0.5, y - 1.0)
            E = (x, y - 0.5)
            S = (x - 0.5, y)
            W = (x - 1.0, y - 0.5)
            
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
                
    # Connect segments into loops
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
        if len(loop) > 10:
            loops.append(loop)
    return loops

def rdp(points, epsilon):
    if len(points) < 3:
        return points
    # Find point with max distance from line between start and end
    start = points[0]
    end = points[-1]
    
    def pt_dist(pt, p1, p2):
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        if dx == 0 and dy == 0:
            return math.hypot(pt[0] - p1[0], pt[1] - p1[1])
        t = ((pt[0] - p1[0])*dx + (pt[1] - p1[1])*dy) / (dx*dx + dy*dy)
        t = max(0, min(1, t))
        proj_x = p1[0] + t*dx
        proj_y = p1[1] + t*dy
        return math.hypot(pt[0] - proj_x, pt[1] - proj_y)
        
    dmax = 0.0
    index = 0
    for i in range(1, len(points) - 1):
        d = pt_dist(points[i], start, end)
        if d > dmax:
            index = i
            dmax = d
            
    if dmax > epsilon:
        rec1 = rdp(points[:index+1], epsilon)
        rec2 = rdp(points[index:], epsilon)
        return rec1[:-1] + rec2
    else:
        return [start, end]

def smooth_loop_to_bezier(loop, tension=0.3):
    # Convert points into smooth cubic bezier SVG path
    n = len(loop)
    if n < 3:
        return ""
    
    path = [f"M {loop[0][0]:.2f},{loop[0][1]:.2f}"]
    for i in range(n):
        p0 = loop[(i - 1 + n) % n]
        p1 = loop[i]
        p2 = loop[(i + 1) % n]
        p3 = loop[(i + 2) % n]
        
        # Catmull-Rom to Bezier conversion
        cp1x = p1[0] + (p2[0] - p0[0]) * tension
        cp1y = p1[1] + (p2[1] - p0[1]) * tension
        cp2x = p2[0] - (p3[0] - p1[0]) * tension
        cp2y = p2[1] - (p3[1] - p1[1]) * tension
        
        path.append(f"C {cp1x:.2f},{cp1y:.2f} {cp2x:.2f},{cp2y:.2f} {p2[0]:.2f},{p2[1]:.2f}")
    path.append("Z")
    return " ".join(path)

print("Helper ready")
