#!/usr/bin/env python3
"""
Script to automatically fix TypeScript "Not all code paths return a value" errors
by adding explicit return statements after res.json() and res.status().json() calls.
"""

import re
import sys

# Files and line numbers from Vercel build logs
fixes = {
    "src/routes/analytics.ts": [86, 254],
    "src/routes/drugs.ts": [47, 167, 217, 300],
    "src/routes/healthMetrics.ts": [44, 132, 194, 367],
    "src/routes/inventory.ts": [46, 258, 364],
    "src/routes/messages.ts": [38, 246, 407],
    "src/routes/notifications.ts": [47, 167, 220],
    "src/routes/prescriptions.ts": [65, 151, 273],
}

def fix_file(filepath, line_numbers):
    """Add return statements after res.json() calls at specified line numbers."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Sort line numbers in reverse order to avoid offset issues
        for line_num in sorted(line_numbers, reverse=True):
            idx = line_num - 1  # Convert to 0-indexed
            if idx < len(lines):
                line = lines[idx]
                # Check if this line contains res.json() or similar response send
                if 'res.json(' in line or 'res.status(' in line:
                    # Check if there's already a return statement
                    if not line.strip().startswith('return'):
                        # Get the indentation
                        indent = len(line) - len(line.lstrip())
                        # Check if the next line already has a return
                        if idx + 1 < len(lines) and 'return;' not in lines[idx + 1]:
                            # Insert a return statement after this line
                            lines.insert(idx + 1, ' ' * indent + 'return;\n')
                            print(f"  Added return at line {line_num + 1} in {filepath}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        return True
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")
        return False

def main():
    print("Fixing TypeScript route handler return statements...")
    print()
    
    for filepath, line_numbers in fixes.items():
        print(f"Processing {filepath}...")
        fix_file(filepath, line_numbers)
    
    print()
    print("Done! All files have been processed.")

if __name__ == "__main__":
    main()
