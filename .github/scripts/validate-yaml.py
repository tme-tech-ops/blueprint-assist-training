#!/usr/bin/env python3
"""Simple YAML validation script that doesn't require external dependencies."""

import os
import sys

def validate_basic_yaml(file_path):
    """Basic YAML validation without requiring PyYAML."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        issues = []
        
        for i, line in enumerate(lines, 1):
            # Check for basic YAML syntax issues
            stripped = line.strip()
            
            # Check indentation consistency (should be spaces, not tabs)
            if '\t' in line:
                issues.append(f"Line {i}: Contains tabs (use spaces for indentation)")
            
            # Check for unquoted strings that might cause issues (focus on labels which need quotes)
            if 'label:' in stripped and not stripped.startswith('#'):
                # Extract value after colon
                value_part = stripped.split(':', 1)[1].strip()
                if value_part and not (value_part.startswith('"') or value_part.startswith("'")):
                    if any(char in value_part for char in [':', '"', "'"]):
                        issues.append(f"Line {i}: Label with special characters should be quoted: {value_part[:50]}...")
        
        return issues
        
    except Exception as e:
        return [f"Error reading file: {e}"]

def main():
    file_path = '.github/ISSUE_TEMPLATE/learner-feedback.yml'
    
    if not os.path.exists(file_path):
        print(f"ERROR: {file_path} not found")
        return 1
    
    print(f"Validating {file_path}...")
    
    issues = validate_basic_yaml(file_path)
    
    if not issues:
        print("SUCCESS: Basic validation passed - no obvious issues found")
        return 0
    else:
        print(f"WARNING: Found {len(issues)} potential issues:")
        for issue in issues:
            print(f"  - {issue}")
        print("\nNote: These are basic checks. Test the form on GitHub for full validation.")
        return 0  # Don't fail on warnings

if __name__ == "__main__":
    sys.exit(main())