import math
import numpy as np

def fit_smooth_bezier(loop, num_segments=8, preserve_sharp=True, sharp_thresh=70.0):
    # loop is list of (x, y) points
    n = len(loop)
    if n < 4:
        return ""
    
    # 1. Detect corners
    corners = []
    for i in range(n):
        p_prev = loop[(i - 1 + n) % n]
        p_curr = loop[i]
        p_next = loop[(i + 1) % n]
        v1 = (p_curr[0] - p_prev[0], p_curr[1] - p_prev[1])
        v2 = (p_next[0] - p_curr[0], p_next[1] - p_curr[1])
        l1 = math.hypot(v1[0], v1[1])
        l2 = math.hypot(v2[0], v2[1])
        if l1 > 0.5 and l2 > 0.5:
            dot = (v1[0]*v2[0] + v1[1]*v2[1]) / (l1 * l2)
            dot = max(-1.0, min(1.0, dot))
            deg = math.degrees(math.acos(dot))
            if deg > sharp_thresh:
                corners.append(i)
                
    # 2. Resample loop into evenly spaced arc-length points
    cum_dist = [0.0]
    for i in range(n):
        p1 = loop[i]
        p2 = loop[(i + 1) % n]
        cum_dist.append(cum_dist[-1] + math.hypot(p2[0] - p1[0], p2[1] - p1[1]))
    total_len = cum_dist[-1]
    if total_len < 1.0:
        return ""
        
    def get_pt_at_dist(d):
        d = d % total_len
        # binary search in cum_dist
        low, high = 0, len(cum_dist) - 1
        while low < high - 1:
            mid = (low + high) // 2
            if cum_dist[mid] <= d:
                low = mid
            else:
                high = mid
        seg_len = cum_dist[high] - cum_dist[low]
        if seg_len == 0:
            return loop[low % n]
        t = (d - cum_dist[low]) / seg_len
        p1 = loop[low % n]
        p2 = loop[(low + 1) % n]
        return (p1[0] + t*(p2[0] - p1[0]), p1[1] + t*(p2[1] - p1[1]))

    # Pick K smooth sample points around the perimeter
    K = max(6, min(num_segments, int(total_len / 4.0)))
    step = total_len / K
    samples = [get_pt_at_dist(i * step) for i in range(K)]
    
    # 3. Fit smooth Catmull-Rom / cubic bezier through samples
    path = [f"M {samples[0][0]:.2f} {samples[0][1]:.2f}"]
    tension = 0.333
    for i in range(K):
        p0 = samples[(i - 1 + K) % K]
        p1 = samples[i]
        p2 = samples[(i + 1) % K]
        p3 = samples[(i + 2) % K]
        
        cp1x = p1[0] + (p2[0] - p0[0]) * tension
        cp1y = p1[1] + (p2[1] - p0[1]) * tension
        cp2x = p2[0] - (p3[0] - p1[0]) * tension
        cp2y = p2[1] - (p3[1] - p1[1]) * tension
        
        path.append(f"C {cp1x:.2f} {cp1y:.2f}, {cp2x:.2f} {cp2y:.2f}, {p2[0]:.2f} {p2[1]:.2f}")
    path.append("Z")
    return " ".join(path)

print("Smooth bezier fitter ready")
