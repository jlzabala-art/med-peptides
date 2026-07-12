import re

missing_icons = [
    "AlertOctagon", "Battery", "BellRing", "Blocks", "Book", "BookCopy", 
    "BookMarked", "Bookmark", "Calculator", "Camera", "ChevronsDown", "Coins", 
    "Dumbbell", "Edit2", "FileBarChart", "FileDown", "FileWarning", "Frown", 
    "HardDrive", "Hash", "ImageIcon", "KeyRound", "Laptop", "LayoutList", 
    "Library", "Lightbulb", "Link", "Link2Off", "LinkIcon", "Loader", "LogIn", 
    "Maximize2", "Monitor", "PackagePlus", "PackageX", "Paintbrush", "Palette", 
    "PanelLeft", "PiggyBank", "Pin", "PinOff", "Pipette", "Plug", "PlusSquare", 
    "Server", "Settings2", "Sliders", "Smartphone", "Smile", "Snowflake", 
    "SortAsc", "Sun", "Table", "Terminal", "Thermometer", "ThumbsDown", "Video", 
    "Volume2", "VolumeX"
]

def camel_to_kebab(name):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', name).lower()

with open('src/lib/icons.js', 'a') as f:
    for icon in missing_icons:
        kebab = camel_to_kebab(icon)
        # Handle special cases if any, typically lucide-react uses kebab case
        # ImageIcon is image, LinkIcon is link... Wait, lucide uses image and link? Let's just use kebab case of the name and see if it works.
        f.write(f"export {{ default as {icon} }} from 'lucide-react/dist/esm/icons/{kebab}';\n")

print("Added icons")
