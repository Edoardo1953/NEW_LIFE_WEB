import math
from PIL import Image
import scratch.trace_tools as tt

im_nome = Image.open('uploads/Loghi/Logo solo nome.jpg').convert('RGB')
im_fig = Image.open('uploads/Loghi/Logo NewLife figura.jpg').convert('RGB')

def is_green_fig(r, g, b):
    return g > 110 and g > r + 10 and g > b + 25 and (r+g+b)/3 < 235

def is_blue_fig(r, g, b):
    return b > 140 and g > 140 and b > r + 15 and (r+g+b)/3 < 235

def is_dark(r, g, b):
    return (r + g + b) / 3 < 150

fig_g_loops = tt.trace_component(im_fig, is_green_fig, (0, 0, im_fig.width, im_fig.height))
fig_b_loops = tt.trace_component(im_fig, is_blue_fig, (0, 0, im_fig.width, im_fig.height))
nome_loops = tt.trace_component(im_nome, is_dark, (0, 0, im_nome.width, im_nome.height))

# Function to resample and fit smooth bezier with optimal point spacing
def fit_resampled_bezier(loop, target_spacing=5.0, tension=0.33):
    n = len(loop)
    if n < 3:
        return ""
        
    # Calculate perimeter
    dists = [0.0]
    for i in range(n):
        p1 = loop[i]
        p2 = loop[(i + 1) % n]
        dists.append(dists[-1] + math.hypot(p2[0] - p1[0], p2[1] - p1[1]))
    total_len = dists[-1]
    
    if total_len < 2.0:
        return ""
        
    num_pts = max(6, int(round(total_len / target_spacing)))
    step = total_len / num_pts
    
    def pt_at(d):
        d = d % total_len
        low, high = 0, len(dists) - 1
        while low < high - 1:
            mid = (low + high) // 2
            if dists[mid] <= d:
                low = mid
            else:
                high = mid
        seg_len = dists[high] - dists[low]
        if seg_len == 0:
            return loop[low % n]
        t = (d - dists[low]) / seg_len
        p1 = loop[low % n]
        p2 = loop[(low + 1) % n]
        return (p1[0] + t*(p2[0] - p1[0]), p1[1] + t*(p2[1] - p1[1]))
        
    resampled = [pt_at(i * step) for i in range(num_pts)]
    K = len(resampled)
    
    path = [f"M {resampled[0][0]:.2f} {resampled[0][1]:.2f}"]
    for i in range(K):
        p0 = resampled[(i - 1 + K) % K]
        p1 = resampled[i]
        p2 = resampled[(i + 1) % K]
        p3 = resampled[(i + 2) % K]
        
        cp1x = p1[0] + (p2[0] - p0[0]) * tension
        cp1y = p1[1] + (p2[1] - p0[1]) * tension
        cp2x = p2[0] - (p3[0] - p1[0]) * tension
        cp2y = p2[1] - (p3[1] - p1[1]) * tension
        
        path.append(f"C {cp1x:.2f} {cp1y:.2f}, {cp2x:.2f} {cp2y:.2f}, {p2[0]:.2f} {p2[1]:.2f}")
    path.append("Z")
    return " ".join(path)

print("Refinement helper defined")
