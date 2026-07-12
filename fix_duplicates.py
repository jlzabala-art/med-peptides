import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    new_lines = []
    fb_imported = False

    for line in lines:
        if "import * as fb from" in line:
            if fb_imported:
                continue
            fb_imported = True
        new_lines.append(line)

    if new_lines != lines:
        print(f"Fixed {filepath}")
        with open(filepath, 'w') as f:
            f.writelines(new_lines)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))
