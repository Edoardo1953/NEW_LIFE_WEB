import glob
import os
import shutil

# 1. Update HTML files (sidebar & login) to use 'uploads/Loghi/Loghi NL Claude/NewLife_figura.svg'
html_files = glob.glob('*.html')

for fpath in html_files:
    if fpath == 'logo_showcase.html':
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace logo paths
    modified = False
    if 'logo-newlife-symbol.svg' in content:
        content = content.replace('uploads/Loghi/logo-newlife-symbol.svg', 'uploads/Loghi/Loghi NL Claude/NewLife_figura.svg')
        modified = True
    elif 'Logo NewLife figura.jpg' in content:
        content = content.replace('uploads/Loghi/Logo NewLife figura.jpg', 'uploads/Loghi/Loghi NL Claude/NewLife_figura.svg')
        modified = True
        
    if modified:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {fpath}")

print("HTML pages successfully updated to use Loghi NL Claude!")
