import resvg_py

svg_data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="80" fill="#8DC63F"/></svg>'
png_bytes = resvg_py.svg_to_bytes(svg_data)
with open('scratch/test_resvg.png', 'wb') as f:
    f.write(png_bytes)
print("resvg rendered successfully! Size:", len(png_bytes))
