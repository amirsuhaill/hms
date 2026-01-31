#!/usr/bin/env python3
"""
Fix TypeScript route handler errors by removing Promise<void> return type
and ensuring all return statements are void (no value returned).
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

def fix_route_handlers(filepath):
    """Remove Promise<void> and fix return statements."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove Promise<void> return type
        pattern1 = r'async \(req: Request, res: Response\): Promise<void> =>'
        replacement1 = r'async (req: Request, res: Response) =>'
        content = re.sub(pattern1, replacement1, content)
        
        # Fix return statements - change "return res.json(...)" to "res.json(...); return;"
        # This ensures we return void, not the Response object
        pattern2 = r'(\s+)return res\.(status\([^)]+\)\.)?json\('
        
        def replace_return(match):
            indent = match.group(1)
            status_part = match.group(2) if match.group(2) else ''
            return f'{indent}res.{status_part}json('
        
        # First pass: remove 'return' from res.json() calls
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            # Check if line has "return res.json(" or "return res.status().json("
            if 'return res.' in line and ('.json(' in line or '.status(' in line):
                # Remove the 'return ' part
                new_line = line.replace('return res.', 'res.')
                new_lines.append(new_line)
                # Add explicit return on next line if this is inside a conditional
                indent = len(line) - len(line.lstrip())
                # Check if we need to add return (if inside if/else block)
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    # If next line is closing brace or another statement, add return
                    if next_line.startswith('}') or (next_line and not next_line.startswith('//')):
                        new_lines.append(' ' * indent + 'return;')
            else:
                new_lines.append(line)
            i += 1
        
        new_content = '\n'.join(new_lines)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✓ Fixed {filepath}")
            return True
        else:
            print(f"  No changes needed in {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error fixing {filepath}: {e}")
        return False

def main():
    print("Fixing TypeScript route handler return type errors...\n")
    
    fixed_count = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if fix_route_handlers(filepath):
                fixed_count += 1
        else:
            print(f"⚠ File not found: {filepath}")
    
    print(f"\n✓ Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
