#!/bin/bash

# This script will help identify all the route files that need fixing
# and show which specific lines have the "Not all code paths return a value" error

echo "Checking for route files with missing return statements..."
echo ""

# Files mentioned in the error logs:
files=(
  "src/routes/analytics.ts"
  "src/routes/drugs.ts"
  "src/routes/healthMetrics.ts"
  "src/routes/prescriptions.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "File: $file"
    # Count async route handlers
    grep -n "router\.\(get\|post\|put\|patch\|delete\)" "$file" | head -20
    echo ""
  fi
done
