# Git Workflow Best Practices for Restore Points

## Current Setup Analysis

### ✅ What's Working
- **Remote Repository**: Connected to `https://github.com/alanwallace9/TrespassTracker.git`
- **Main Branch**: Synced with origin/main
- **Commit History**: 4 commits with clear messages

### ⚠️ What Needs Improvement
- **Only One Branch**: No feature branches for safe experimentation
- **Uncommitted Changes**: Modified constitution.md and new docs/ not committed
- **No Protection**: Main branch not protected from force pushes
- **No Tags**: No version markers for easy rollback

## 🎯 Best Practices for Restore Points

### 1. **Branch Strategy (Feature Branch Workflow)**

This is THE most important practice for restore points. Never work directly on `main`.

#### Create Feature Branches
```bash
# For new features
git checkout -b feature/bolt-mvp-integration

# For bug fixes
git checkout -b fix/auth-redirect-issue

# For experiments
git checkout -b experiment/tailwind-v4-upgrade

# For documentation
git checkout -b docs/migration-guides
```

#### Why This Works
- `main` branch stays stable (your restore point)
- Can work on multiple features simultaneously
- Easy to abandon bad experiments (just delete branch)
- Can always return to `main` if something breaks

### 2. **Commit Frequently with Meaningful Messages**

#### Good Commit Cadence
```bash
# Every logical change should be a commit
git add .
git commit -m "docs: add Bolt MVP migration guide"

git add .
git commit -m "docs: create Clerk vs Supabase comparison"

git add .
git commit -m "feat: update constitution to v2.0.0"
```

#### Commit Message Convention
```
type(scope): subject

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Formatting, missing semicolons, etc.
- refactor: Code change that neither fixes bug nor adds feature
- test: Adding tests
- chore: Updating build tasks, package manager configs, etc.

Examples:
✅ feat(auth): integrate Clerk authentication
✅ fix(dashboard): resolve hydration error in records table
✅ docs(constitution): update to v2.0.0 with modern stack
✅ refactor(components): convert Dashboard to Server Component
```

### 3. **Push Frequently to GitHub**

#### Daily Pushes (Minimum)
```bash
# End of each work session
git push origin feature/bolt-mvp-integration
```

#### Why Push Frequently?
- **Cloud Backup**: Your work is safe even if computer crashes
- **Multiple Restore Points**: Every push is a restore point
- **Collaboration**: Others can see your progress
- **CI/CD Triggers**: Vercel auto-deploys preview

### 4. **Use Git Tags for Major Milestones**

Tags are named restore points for important versions.

#### Create Tags
```bash
# Tag current state
git tag -a v2.0.0 -m "Constitution v2.0.0 - Modern stack"
git push origin v2.0.0

# Tag before major changes
git tag -a pre-bolt-integration -m "Before integrating Bolt MVP"
git push origin pre-bolt-integration

# Tag working states
git tag -a working-auth-clerk -m "Clerk authentication fully working"
git push origin working-auth-clerk
```

#### Restore from Tag
```bash
# View all tags
git tag -l

# Restore to a tagged state
git checkout v2.0.0

# Create new branch from tag
git checkout -b restore-from-v2 v2.0.0
```

### 5. **GitHub Protection Rules**

Protect your `main` branch from accidents.

#### Setup Branch Protection (GitHub Web UI)
1. Go to: Settings → Branches → Branch protection rules
2. Add rule for `main` branch:
   - ✅ Require pull request before merging
   - ✅ Require status checks to pass (Vercel deployment)
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

#### Why This Matters
- Can't accidentally push broken code to main
- Forces code review (even if it's you reviewing)
- Ensures all changes go through PR workflow
- Vercel previews test changes before merge

### 6. **Recommended Workflow for Your Project**

#### Daily Workflow
```bash
# Morning: Start fresh from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-csv-export

# Work and commit frequently
# ... make changes ...
git add .
git commit -m "feat(export): add CSV export button"

# ... make more changes ...
git add .
git commit -m "feat(export): implement CSV generation logic"

# Push to GitHub (creates backup)
git push origin feature/add-csv-export

# End of day: Push final state
git add .
git commit -m "wip: CSV export 80% complete"
git push origin feature/add-csv-export
```

#### Weekly: Create Pull Request
```bash
# When feature is ready
# 1. Go to GitHub
# 2. Create Pull Request from feature branch to main
# 3. Review changes
# 4. Test Vercel preview deployment
# 5. Merge PR
# 6. Delete feature branch

# Locally: Update main
git checkout main
git pull origin main
git branch -d feature/add-csv-export  # Delete local branch
```

### 7. **Restore Point Strategy**

#### Multiple Layers of Safety

**Layer 1: Local Commits** (Every 15-30 minutes)
```bash
git add .
git commit -m "wip: working on dashboard layout"
```

**Layer 2: Remote Branch Pushes** (Every hour or end of session)
```bash
git push origin feature/dashboard-redesign
```

**Layer 3: Pull Request Merges** (When feature complete)
```bash
# Merge via GitHub PR
# main branch now has tested, working code
```

**Layer 4: Version Tags** (Major milestones)
```bash
git tag -a v2.1.0 -m "Added CSV export feature"
git push origin v2.1.0
```

**Layer 5: GitHub Releases** (Production deployments)
- Create release on GitHub
- Tag with version
- Attach build artifacts if needed

### 8. **Emergency Restore Scenarios**

#### Scenario 1: "I broke something in my current branch"
```bash
# Option A: Undo last commit (keep changes)
git reset --soft HEAD~1

# Option B: Undo last commit (discard changes)
git reset --hard HEAD~1

# Option C: Go back 3 commits
git reset --hard HEAD~3

# Option D: Abandon everything, start from main
git checkout main
git branch -D feature/broken-branch
git checkout -b feature/broken-branch-v2
```

#### Scenario 2: "Main branch is broken"
```bash
# Find last working commit
git log --oneline

# Option A: Revert to specific commit
git checkout <commit-hash>
git checkout -b hotfix/restore-working-state

# Option B: Revert to tagged version
git checkout v2.0.0
git checkout -b hotfix/restore-from-v2
```

#### Scenario 3: "I need to restore from yesterday"
```bash
# Find yesterday's commits
git log --since="yesterday" --oneline

# Create branch from that commit
git checkout -b restore-from-yesterday <commit-hash>
```

#### Scenario 4: "I accidentally pushed to main"
```bash
# Revert last commit (creates new commit that undoes it)
git revert HEAD
git push origin main

# OR: Force push previous state (DANGEROUS - use with caution)
git reset --hard HEAD~1
git push origin main --force
```

#### Scenario 5: "I deleted a file accidentally"
```bash
# Restore single file from last commit
git checkout HEAD -- path/to/file.tsx

# Restore from specific commit
git checkout <commit-hash> -- path/to/file.tsx

# Restore all deleted files
git checkout HEAD .
```

### 9. **Git Stash for Quick Saves**

Save work without committing.

```bash
# Save current changes temporarily
git stash save "WIP: dashboard redesign"

# Switch branches to fix urgent bug
git checkout main
git checkout -b hotfix/urgent-fix
# ... fix bug ...
git commit -m "fix: urgent production issue"
git push origin hotfix/urgent-fix

# Return to your work
git checkout feature/dashboard-redesign
git stash pop  # Restore your changes
```

### 10. **GitHub Desktop / VS Code for Visual Management**

#### Using Cursor/VS Code Git UI
- **View Changes**: Click "Source Control" icon (left sidebar)
- **Stage Files**: Click "+" next to files
- **Commit**: Enter message, click "✓ Commit"
- **Push**: Click "..." → Push
- **Create Branch**: Click branch name → "Create new branch"

#### GitHub Desktop (Alternative)
Download from: https://desktop.github.com
- Visual diff viewer
- Easy branch switching
- Simple commit/push workflow
- Great for beginners

## 🚀 Recommended Setup for Your Project

### Step 1: Commit Current Changes
```bash
# You have uncommitted changes, let's save them
git add .specify/memory/constitution.md
git add .specify/docs/
git commit -m "docs: update constitution to v2.0.0 and add migration guides

- Update constitution from v1.0.0 to v2.0.0 (MAJOR)
- Add Next.js 15.5+, Tailwind v4, Clerk auth, Vercel deployment
- Create Bolt MVP migration guide
- Document Clerk vs Supabase Auth decision
- Add integration summary with 3 approach options"

git push origin main
```

### Step 2: Create Tag for This Version
```bash
# Tag constitution v2.0.0
git tag -a constitution-v2.0.0 -m "Constitution v2.0.0 with modern stack"
git push origin constitution-v2.0.0
```

### Step 3: Create Feature Branch for Bolt Integration
```bash
# Start new branch for actual integration work
git checkout -b feature/bolt-mvp-integration

# This is your working branch - commit often here
```

### Step 4: Enable Branch Protection (GitHub Web)
1. Go to: https://github.com/alanwallace9/TrespassTracker/settings/branches
2. Add rule for `main`
3. Enable "Require pull request before merging"

## 📋 Daily Checklist

**Morning**:
- [ ] `git checkout main && git pull` (start fresh)
- [ ] `git checkout -b feature/descriptive-name` (or checkout existing feature branch)

**During Work** (every 30-60 min):
- [ ] `git add .` (stage changes)
- [ ] `git commit -m "type: descriptive message"` (commit)
- [ ] `git push origin branch-name` (backup to cloud)

**End of Day**:
- [ ] `git add .` (stage everything)
- [ ] `git commit -m "wip: description of current state"` (save state)
- [ ] `git push origin branch-name` (final backup)

**End of Feature**:
- [ ] Create Pull Request on GitHub
- [ ] Test Vercel preview
- [ ] Merge PR
- [ ] `git checkout main && git pull` (update local)
- [ ] `git branch -d feature/old-branch` (cleanup)

## 🔧 Useful Git Commands Cheatsheet

### Viewing History
```bash
git log --oneline --graph --all -20    # Visual commit history
git log --since="2 days ago"           # Recent commits
git show <commit-hash>                 # View specific commit
git diff HEAD~1 HEAD                   # Compare last 2 commits
```

### Branch Management
```bash
git branch                             # List local branches
git branch -a                          # List all branches (including remote)
git branch -d feature/old-branch       # Delete local branch
git push origin --delete feature/old   # Delete remote branch
```

### Undoing Changes
```bash
git checkout -- file.tsx               # Discard changes to file
git restore file.tsx                   # Same as above (newer syntax)
git reset --soft HEAD~1                # Undo commit, keep changes
git reset --hard HEAD~1                # Undo commit, discard changes
git revert HEAD                        # Create new commit undoing last commit
```

### Syncing
```bash
git fetch origin                       # Download changes (don't merge)
git pull origin main                   # Download and merge changes
git push origin branch-name            # Upload your commits
git push origin --tags                 # Upload all tags
```

## 🎯 Summary: Your Restore Point Strategy

1. **Commit every 30-60 minutes** = Restore points while working
2. **Push every hour or end of session** = Cloud backup restore points
3. **Feature branches** = Main branch is always safe restore point
4. **Tags at milestones** = Named restore points for big changes
5. **Pull Requests** = Tested, reviewed restore points
6. **Never force push to main** = Keep history intact

**Remember**: In Git, almost nothing is truly lost. As long as you commit and push, you can always restore!

---

**Need Help?**
- Git Docs: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Interactive Tutorial: https://learngitbranching.js.org
