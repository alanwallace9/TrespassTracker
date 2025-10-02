# Git Quick Reference Card

## 🎯 Your Current Setup

### Branches
```
main                              ← Stable, protected (don't work here)
feature/bolt-mvp-integration      ← YOU ARE HERE (work here)
```

### Tags (Restore Points)
```
v2.0.0                           ← Project version
constitution-v2.0.0              ← Constitution milestone
stable-pre-bolt-integration      ← Safe restore point
```

### Remote
```
GitHub: https://github.com/alanwallace9/TrespassTracker.git
```

## 📋 Daily Commands (Copy & Paste)

### Morning: Start Your Day
```bash
# Check which branch you're on
git branch

# If on main, switch to feature branch
git checkout feature/bolt-mvp-integration

# Get latest changes
git pull origin feature/bolt-mvp-integration
```

### During Work: Save Progress (Every 30-60 min)
```bash
# See what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "feat: describe what you did"

# Push to GitHub (cloud backup)
git push origin feature/bolt-mvp-integration
```

### End of Day: Final Backup
```bash
# Save everything
git add .
git commit -m "wip: end of day - current progress"
git push origin feature/bolt-mvp-integration
```

## 🚨 Emergency Commands

### "I Want to Undo My Last Commit"
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes (CAREFUL!)
git reset --hard HEAD~1
```

### "I Want to Go Back to Main Branch"
```bash
# Save your work first!
git add .
git commit -m "wip: saving before switching"

# Switch to main
git checkout main
```

### "I Need to Start Over from Stable Point"
```bash
# Abandon current branch (CAREFUL!)
git checkout main
git branch -D feature/bolt-mvp-integration

# Create fresh branch from stable tag
git checkout -b feature/bolt-mvp-integration-v2 stable-pre-bolt-integration
git push -u origin feature/bolt-mvp-integration-v2
```

### "I Accidentally Deleted Something"
```bash
# Restore file from last commit
git checkout HEAD -- path/to/file.tsx

# Restore everything
git checkout HEAD .
```

### "I Want to See What Changed"
```bash
# See changes not yet committed
git diff

# See changes in last commit
git show HEAD

# See commit history
git log --oneline -10
```

## ✅ Commit Message Examples

```bash
# New feature
git commit -m "feat(auth): add Clerk sign-in page"

# Bug fix
git commit -m "fix(dashboard): resolve hydration error"

# Documentation
git commit -m "docs: update migration guide with Vercel steps"

# Work in progress
git commit -m "wip: halfway through CSV export feature"

# Refactoring
git commit -m "refactor(components): convert to Server Components"
```

## 🔄 When to Create Pull Request

When your feature is ready:

1. **Push final changes**
   ```bash
   git add .
   git commit -m "feat: complete Bolt MVP integration"
   git push origin feature/bolt-mvp-integration
   ```

2. **Go to GitHub**
   - Visit: https://github.com/alanwallace9/TrespassTracker
   - Click "Compare & pull request"
   - Add description
   - Click "Create pull request"

3. **Test preview deployment** (Vercel will auto-create)

4. **Merge when ready**

5. **Update local main**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/bolt-mvp-integration
   ```

## 📦 Creating New Features

```bash
# Always start from main
git checkout main
git pull origin main

# Create new feature branch
git checkout -b feature/csv-export

# Push to GitHub
git push -u origin feature/csv-export

# Work, commit, push frequently!
```

## 🏷️ Creating Tags for Milestones

```bash
# Tag current state
git tag -a v2.1.0 -m "Added CSV export feature"

# Push tag to GitHub
git push origin v2.1.0

# List all tags
git tag -l
```

## 🆘 Help Commands

```bash
# Where am I?
git branch

# What changed?
git status

# What's the history?
git log --oneline -10

# Show all branches and tags
git log --oneline --graph --all --decorate -10

# What tags exist?
git tag -l
```

## 📍 Current State (After Setup)

```
✅ Main branch: Stable with constitution v2.0.0
✅ Tags: v2.0.0, constitution-v2.0.0, stable-pre-bolt-integration
✅ Feature branch: feature/bolt-mvp-integration (YOUR WORKING BRANCH)
✅ GitHub: Everything backed up
✅ .gitignore: Updated for local files
```

## 🎯 Remember

1. **ALWAYS work on feature branches** (never on main)
2. **Commit every 30-60 minutes** (frequent restore points)
3. **Push every hour** (cloud backup)
4. **Use descriptive messages** (easier to find things later)
5. **Main branch is sacred** (only merge tested code)

---

**Need More Help?** See `.specify/docs/git-workflow-best-practices.md` for full guide.
