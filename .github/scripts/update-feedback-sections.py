#!/usr/bin/env python3
"""
Script to automatically update the learner feedback form with current training sections.

This script scans the 1.sections directory for section folders, extracts their titles,
and updates the .github/ISSUE_TEMPLATE/learner-feedback.yml file to include all sections
with their proper titles and rating dropdowns.

Usage:
    python .github/scripts/update-feedback-sections.py

The script will:
1. Scan 1.sections/ for section-XXX-* directories
2. Read the title from each section's content.md file
3. Generate the section rating dropdowns
4. Update the learner-feedback.yml file
"""

import os
import re
import sys
from pathlib import Path

def extract_section_title(content_file_path):
    """Extract the section title from a content.md file."""
    try:
        with open(content_file_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('# Section '):
                    # Extract title after "Section XXX: "
                    match = re.match(r'# Section (\d+): (.+)', line)
                    if match:
                        section_num = match.group(1)
                        title = match.group(2)
                        return f"Section {section_num} — {title}"
                    else:
                        # Fallback: use the whole line without #
                        return line[2:].strip()
    except FileNotFoundError:
        print(f"Warning: {content_file_path} not found")
        return None
    except Exception as e:
        print(f"Error reading {content_file_path}: {e}")
        return None

def find_sections():
    """Find all section directories and extract their information."""
    sections_dir = Path("1.sections")
    if not sections_dir.exists():
        print(f"Error: {sections_dir} directory not found")
        return []

    sections = []
    
    # Find all section-XXX-* directories
    for section_dir in sections_dir.iterdir():
        if not section_dir.is_dir():
            continue
            
        match = re.match(r'section-(\d+)-', section_dir.name)
        if not match:
            continue
            
        section_num = int(match.group(1))
        content_file = section_dir / "content.md"
        
        title = extract_section_title(content_file)
        if title:
            sections.append({
                'number': section_num,
                'title': title,
                'directory': section_dir.name
            })
        else:
            # Fallback title based on directory name
            fallback_title = section_dir.name.replace('section-', 'Section ').replace('-', ' — ', 1)
            sections.append({
                'number': section_num,
                'title': fallback_title,
                'directory': section_dir.name
            })
    
    # Sort by section number
    sections.sort(key=lambda x: x['number'])
    return sections

def generate_section_rating_yaml(sections):
    """Generate the YAML for section rating dropdowns."""
    yaml_content = []
    
    yaml_content.append("  - type: markdown")
    yaml_content.append("    attributes:")
    yaml_content.append("      value: |")
    yaml_content.append("        ## Sections Completed and Ratings")
    yaml_content.append("        ")
    yaml_content.append("        For each section you completed, please rate your experience from 1 (negative) to 5 (positive). Leave sections blank if you didn't complete them.")
    yaml_content.append("")
    
    for section in sections:
        section_id = f"section-{section['number']}-rating"
        yaml_content.append(f"  - type: dropdown")
        yaml_content.append(f"    id: {section_id}")
        yaml_content.append(f"    attributes:")
        yaml_content.append(f'      label: "{section["title"]}"')
        yaml_content.append(f"      description: Rate this section if you completed it (1=negative, 5=positive)")
        yaml_content.append(f"      options:")
        yaml_content.append(f'        - ""')
        yaml_content.append(f'        - "1 — Negative experience"')
        yaml_content.append(f'        - "2 — Below expectations"')
        yaml_content.append(f'        - "3 — Met expectations"')
        yaml_content.append(f'        - "4 — Above expectations"')
        yaml_content.append(f'        - "5 — Excellent experience"')
        yaml_content.append(f"    validations:")
        yaml_content.append(f"      required: false")
        yaml_content.append("")
    
    return '\n'.join(yaml_content)

def update_feedback_form(sections):
    """Update the learner-feedback.yml file with current sections."""
    feedback_file = Path(".github/ISSUE_TEMPLATE/learner-feedback.yml")
    
    if not feedback_file.exists():
        print(f"Error: {feedback_file} not found")
        return False
    
    # Read the current file
    with open(feedback_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Generate new section ratings YAML
    new_sections_yaml = generate_section_rating_yaml(sections)
    
    # Find the sections rating block and replace it
    # Look for the markdown header "## Sections Completed and Ratings" and replace until the next major section
    start_marker = "  - type: markdown\n    attributes:\n      value: |\n        ## Sections Completed and Ratings"
    end_marker = "  - type: textarea\n    id: what-worked"
    
    start_pos = content.find(start_marker)
    end_pos = content.find(end_marker)
    
    if start_pos == -1 or end_pos == -1:
        print("Error: Could not find section ratings block in feedback form")
        print(f"Start marker found: {start_pos != -1}")
        print(f"End marker found: {end_pos != -1}")
        return False
    
    # Replace the content
    new_content = (
        content[:start_pos] + 
        new_sections_yaml + 
        content[end_pos:]
    )
    
    # Write back to file
    with open(feedback_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated {feedback_file} with {len(sections)} sections")
    return True

def main():
    """Main function."""
    print("Scanning for training sections...")
    
    sections = find_sections()
    if not sections:
        print("ERROR: No sections found")
        return 1
    
    print(f"Found {len(sections)} sections:")
    for section in sections:
        print(f"  {section['number']:03d}: {section['title']}")
    
    print("\nUpdating feedback form...")
    
    if update_feedback_form(sections):
        print("SUCCESS: Feedback form updated successfully!")
        print("\nNext steps:")
        print("1. Review the changes in .github/ISSUE_TEMPLATE/learner-feedback.yml")
        print("2. Test the form by creating a new issue")
        print("3. Commit and push the changes")
        return 0
    else:
        print("ERROR: Failed to update feedback form")
        return 1

if __name__ == "__main__":
    sys.exit(main())