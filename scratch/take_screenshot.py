import os
import subprocess

edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_path = "file:///" + os.path.abspath("scratch/compare_figure.html").replace("\\", "/")
png_path = os.path.abspath("scratch/compare_figure.png")

cmd = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    "--window-size=900,500",
    f"--screenshot={png_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True)
print("Return code:", res.returncode)
print("File exists:", os.path.exists(png_path))
