#!/usr/bin/env python3
"""
Fix route handlers by adding explicit 'return;' after res.json() calls
that don't already have 'return' keyword.
"""

import re

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
    """Add return; after res.json() calls without return."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        i = 0
        changes = 0
        
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            
            # Check if this line has res.json() or res.status().json() WITHOUT 'return'
            stripped = line.strip()
            if (('res.json(' in line or 'res.status(' in line and '.json(' in line) 
                and not stripped.startswith('return') 
                and stripped.endswith(');')):
                
                # Get indentation
                indent = len(line) - len(line.lstrip())
                
                # Add return; on next line
                new_lines.append(' ' * indent + 'return;\n')
                changes += 1
            
            i += 1
        
        if changes > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"✓ Added {changes} return statements in {filepath}")
            return True
        else:
            print(f"  No changes needed in {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Adding explicit return statements after res.json() calls...\n")
    
    for filepath in files_to_fix:
        try:
            fix_file(filepath)
        except Exception as e:
            print(f"Failed on {filepath}: {e}")
    
    print("\n✓ Done")

if __name__ == "__main__":
    main()
