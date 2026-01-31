#!/usr/bin/env python3
"""
Script to fix TypeScript return type errors in Express route handlers.
Replaces 'return res.status()...' with 'res.status()...; return;'
"""

import re
import sys

def fix_return_statements(file_path):
    """Fix return res. statements in the given file."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern to match: return res.status(...).json(...)
    # We need to handle both single-line and multi-line cases
    
    # Pattern 1: Single line return res.status(...).json(...)
    pattern1 = r'(\s+)return (res\.status\([^)]+\)\.json\([^;]+\));'
    replacement1 = r'\1\2;\n\1return;'
    content = re.sub(pattern1, replacement1, content)
    
    # Pattern 2: Multi-line return res.status(...).json({...})
    # This is trickier - we need to find the opening return and closing });
    lines = content.split('\n')
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Check if line starts with 'return res.status' or 'return res.json'
        match = re.match(r'^(\s+)return (res\.(status|json)\(.*)$', line)
        
        if match:
            indent = match.group(1)
            rest_of_line = match.group(2)
            
            # Check if this is a complete statement on one line
            if ');' in line:
                # Single line - already handled by pattern1 above
                fixed_lines.append(line)
                i += 1
            else:
                # Multi-line statement - collect all lines until we find the closing
                statement_lines = [indent + rest_of_line]
                i += 1
                
                # Find the closing of this statement
                while i < len(lines):
                    statement_lines.append(lines[i])
                    if '});' in lines[i] or ');' in lines[i]:
                        # Found the end
                        break
                    i += 1
                
                # Add the fixed version
                fixed_lines.extend(statement_lines)
                fixed_lines.append(indent + 'return;')
                i += 1
        else:
            fixed_lines.append(line)
            i += 1
    
    content = '\n'.join(fixed_lines)
    
    # Write back if changed
    if content != original_content:
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Fixed {file_path}")
        return True
    else:
        print(f"No changes needed for {file_path}")
        return False

if __name__ == '__main__':
    files_to_fix = [
        'src/routes/drugs.ts',
        'src/routes/healthMetrics.ts',
        'src/routes/inventory.ts',
        'src/routes/messages.ts',
        'src/routes/notifications.ts',
        'src/routes/prescriptions.ts',
    ]
    
    import os
    os.chdir('/Users/amirsuhail/Desktop/hms/backend')
    
    for file_path in files_to_fix:
        fix_return_statements(file_path)
