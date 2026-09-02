# Maintaining the Feedback Form

This document explains how to keep the learner feedback form synchronized with the current training sections.

## Overview

The learner feedback form (`.github/ISSUE_TEMPLATE/learner-feedback.yml`) includes individual rating dropdowns for each training section. When new sections are added to the training content, the feedback form must be updated to include them.

## Current Section Count

The form currently includes sections 0-23. This should be updated whenever new sections are added.

## Automated Update Process

### Method 1: Use the Update Script (Recommended)

A Python script is provided to automatically scan the training sections and update the feedback form:

```bash
# Run from the repository root
python .github/scripts/update-feedback-sections.py
```

**Requirements:**
- Python 3.x
- No additional dependencies needed

**What the script does:**
1. Scans the `1.sections/` directory for all `section-XXX-*` folders
2. Reads each section's `content.md` file to extract the proper title
3. Generates the complete section rating YAML block
4. Updates the feedback form with all current sections

**After running the script:**
1. Review the changes in `.github/ISSUE_TEMPLATE/learner-feedback.yml`
2. Test the form by navigating to the Issues tab and creating a new issue
3. Commit and push the changes

### Method 2: Manual Update

If you prefer to update manually or the script doesn't work:

1. **Find new sections:**
   ```bash
   ls 1.sections/ | grep section- | sort
   ```

2. **Get section titles:**
   Look at the `# Section XXX: Title` line in each `content.md` file

3. **Add to feedback form:**
   - Open `.github/ISSUE_TEMPLATE/learner-feedback.yml`
   - Find the section rating dropdowns (around line 88)
   - Add new sections following the existing pattern:
   ```yaml
   - type: dropdown
     id: section-24-rating
     attributes:
       label: "Section 24 — New Section Title"
       description: Rate this section if you completed it (1=negative, 5=positive)
       options:
         - ""
         - "1 — Negative experience"
         - "2 — Below expectations"
         - "3 — Met expectations"
         - "4 — Above expectations"
         - "5 — Excellent experience"
     validations:
       required: false
   ```

## When to Update

Update the feedback form:
- **Immediately after adding new training sections**
- **Before releasing new training content**
- **When section titles change significantly**

## Validation

After updating, always:

1. **Test the form locally:**
   - Navigate to your repository on GitHub
   - Go to Issues → New Issue
   - Select "Learner Feedback" template
   - Verify all sections appear correctly

2. **Check for errors:**
   - YAML syntax errors will prevent the form from loading
   - Missing sections will confuse learners
   - Incorrect titles will look unprofessional

3. **Validate YAML syntax (optional):**
   ```bash
   # If you have PyYAML installed:
   python -c "import yaml; yaml.safe_load(open('.github/ISSUE_TEMPLATE/learner-feedback.yml'))"
   
   # Alternative: use online YAML validator or GitHub's built-in validation
   # GitHub will show syntax errors when you try to use the form
   ```

## Integration with CI/CD

Consider adding a check to your CI/CD pipeline:

```yaml
# Example GitHub Action check
- name: Verify feedback form is current
  run: |
    python .github/scripts/update-feedback-sections.py --dry-run
    if [ $? -ne 0 ]; then
      echo "❌ Feedback form is out of sync with training sections"
      exit 1
    fi
```

## Troubleshooting

**Script fails to find sections:**
- Check that you're running from the repository root
- Verify the `1.sections/` directory exists
- Ensure section directories follow the `section-XXX-*` naming pattern

**Form doesn't load after update:**
- Check YAML syntax with a validator
- Ensure all quotes are properly escaped
- Verify the file structure matches GitHub's requirements

**Sections appear with wrong titles:**
- Check that each section's `content.md` starts with `# Section XXX: Title`
- Update the script's title extraction logic if needed
- Consider adding fallback titles for special cases

## Related Files

- **Feedback form:** `.github/ISSUE_TEMPLATE/learner-feedback.yml`
- **Feature requests:** `.github/ISSUE_TEMPLATE/feature-request.yml`
- **Update script:** `.github/scripts/update-feedback-sections.py`
- **Training sections:** `1.sections/section-*/content.md`