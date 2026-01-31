#!/usr/bin/env python3
"""
Simply remove Promise<void> return type annotations from route handlers.
TypeScript will infer the correct type automatically.
"""

import re
import os

files_to_fix = [
    "src/routes/analytics.ts",
    "src/routes/drugs.ts",
    "src/routes/healthMetrics.ts",
    "src/routes/inventory.ts",
    "src/routes/messages.ts",
    "src/routes/notifications.ts",
    "src/routes/prescriptions.ts",
]

def fix_file(filepath):
    """Remove Promise<void> return type."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove ": Promise<void>" from async route handlers
        pattern = r'async \(req: Request, res: Response\): Promise<void> =>'
        replacement = r'async (req: Request, res: Response) =>'
        
        new_content = re.sub(pattern, replacement, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            count = content.count(': Promise<void>')
            print(f"✓ Removed {count} Promise<void> annotations from {filepath}")
            return True
        else:
            print(f"  No changes in {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("Removing Promise<void> return type annotations...\n")
    
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            fix_file(filepath)
        else:
            print(f"⚠ Not found: {filepath}")
    
    print("\n✓ Done")

if __name__ == "__main__":
    main()
