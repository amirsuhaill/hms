#!/usr/bin/env python3
"""
Fix TypeScript route handler return type errors by adding explicit Promise<void> return types.
This fixes the "Not all code paths return a value" errors in Express async route handlers.
"""

import re
import os

# Files and their route handler patterns that need fixing
files_to_fix = [
    "src/routes/analytics.ts",
    "src/routes/drugs.ts",
    "src/routes/healthMetrics.ts",
    "src/routes/inventory.ts",
    "src/routes/messages.ts",
    "src/routes/notifications.ts",
    "src/routes/prescriptions.ts",
]

def fix_route_handlers(filepath):
    """Add Promise<void> return type to async route handlers."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match async route handlers without return type
        # Matches: async (req: Request, res: Response) =>
        # Replace with: async (req: Request, res: Response): Promise<void> =>
        pattern = r'async \(req: Request, res: Response\) =>'
        replacement = r'async (req: Request, res: Response): Promise<void> =>'
        
        new_content = re.sub(pattern, replacement, content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            # Count replacements
            count = content.count('async (req: Request, res: Response) =>')
            print(f"✓ Fixed {count} route handlers in {filepath}")
            return True
        else:
            print(f"  No changes needed in {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}")
        return False

def main():
    print("Fixing TypeScript route handler return types...\n")
    
    fixed_count = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if fix_route_handlers(filepath):
                fixed_count += 1
        else:
            print(f"⚠ File not found: {filepath}")
    
    print(f"\n✓ Fixed {fixed_count} files")
    print("\nNow run: npm run build")

if __name__ == "__main__":
    main()
