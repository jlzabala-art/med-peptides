import json

dirs = ['functions-ai', 'functions-cron', 'functions-finance', 'functions-triggers']

for d in dirs:
    path = f"{d}/package.json"
    try:
        with open(path, 'r') as f:
            content = f.read()
            # Try to fix bad JSON from sed command
            # The bad line looks like: "build": "rm -rf src "build": "rm -rf src && cp -R ../functions/src ./src""build": "rm -rf src && cp -R ../functions/src ./src" cp -R ../functions/src ./src && cp -R ../functions/emailTemplates ./emailTemplates",
            import re
            content = re.sub(r'"build":\s*"rm -rf src.*?",', '"build": "rm -rf src && cp -R ../functions/src ./src && cp -R ../functions/emailTemplates ./emailTemplates",', content)
        
        data = json.loads(content)
        data['scripts']['build'] = "rm -rf src && cp -R ../functions/src ./src && cp -R ../functions/emailTemplates ./emailTemplates"
        
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Fixed {path}")
    except Exception as e:
        print(f"Error fixing {path}: {e}")
