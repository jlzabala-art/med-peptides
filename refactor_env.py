import os
import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Replace import.meta.env.VITE_ with process.env.NEXT_PUBLIC_
        content = content.replace('import.meta.env.VITE_', 'process.env.NEXT_PUBLIC_')
        # Sometimes it's just import.meta.env for checking dev mode
        content = content.replace('import.meta.env.MODE', 'process.env.NODE_ENV')
        content = content.replace('import.meta.env.DEV', '(process.env.NODE_ENV === "development")')
        content = content.replace('import.meta.env.PROD', '(process.env.NODE_ENV === "production")')
        # In case they use REACT_APP_
        content = content.replace('process.env.REACT_APP_', 'process.env.NEXT_PUBLIC_')

        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated env vars in {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")

def walk_dir(directory):
    for root, _, set_files in os.walk(directory):
        for file in set_files:
            if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    walk_dir('src')
    
    # Also update .env files
    for env_file in ['.env', '.env.local', '.env.production', '.env.development']:
        if os.path.exists(env_file):
            with open(env_file, 'r', encoding='utf-8') as f:
                content = f.read()
            content = content.replace('VITE_', 'NEXT_PUBLIC_')
            content = content.replace('REACT_APP_', 'NEXT_PUBLIC_')
            with open(env_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {env_file}")
