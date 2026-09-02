# Section Update Checklist

Quick reference for when adding new training sections.

## ✅ Checklist: Adding a New Section

When you add a new training section, **always** update the feedback form:

### 1. Create Your Section
- [ ] Create `1.sections/section-XXX-your-topic/` directory
- [ ] Add `content.md` with proper title format: `# Section XXX: Your Topic Title`
- [ ] Test the section content

### 2. Update Feedback Form (Choose One Method)

#### Option A: Automated (Recommended)
```bash
# Run from repository root
python .github/scripts/update-feedback-sections.py
```

#### Option B: Manual
- [ ] Edit `.github/ISSUE_TEMPLATE/learner-feedback.yml`
- [ ] Add new section rating dropdown (copy existing pattern)
- [ ] Use format: `"Section XXX — Your Topic Title"`

### 3. Validate Changes
- [ ] Test the issue form on GitHub (Issues → New Issue → Learner Feedback)
- [ ] Verify new section appears in the dropdown list
- [ ] Check YAML syntax is valid

### 4. Update Documentation
- [ ] Update any section counts in documentation
- [ ] Mention new section in release notes if applicable

## 🚨 Important Notes

- **Always update the feedback form immediately** - don't wait until later
- **Use consistent title format** - `Section XXX — Title` (with em dash)
- **Test the form** - broken forms frustrate users
- **The GitHub Action will check** - but manual testing is still needed

## 📞 Need Help?

- See detailed instructions: `.github/MAINTAINING-FEEDBACK-FORM.md`
- Check the update script: `.github/scripts/update-feedback-sections.py`
- Ask in team chat if the automation isn't working