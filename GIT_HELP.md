# Git Help - Comment Performance Tracker

## Essential Git Commands for This Project

### Basic Commands
```bash
# Check current status
git status

# See commit history
git log --oneline

# Add all changes to staging
git add .

# Create a commit
git commit -m "Descriptive commit message"

# Push changes to GitHub
git push origin main

# Pull latest changes from GitHub
git pull origin main
```

### Branch Management
```bash
# List all branches
git branch

# Create and switch to a new branch
git checkout -b feature-branch-name

# Switch to an existing branch
git checkout branch-name

# Merge a branch into current branch
git merge feature-branch-name

# Delete a local branch
git branch -d branch-name

# Delete a remote branch
git push origin --delete branch-name
```

### Undo Operations
```bash
# Undo the last commit but keep changes
git reset --soft HEAD~1

# Undo the last commit and discard changes
git reset --hard HEAD~1

# Discard all local changes
git reset --hard HEAD

# Revert a specific commit
git revert <commit-hash>
```

### Remote Repository Commands
```bash
# Add a remote repository
git remote add origin https://github.com/username/repository.git

# Change remote repository URL
git remote set-url origin https://github.com/username/repository.git

# Fetch changes from remote
git fetch origin

# Show remote repositories
git remote -v

# Remove remote repository
git remote remove origin
```

## Recommended Git Workflow for This Project

### Daily Workflow
1. **Start your day** by pulling the latest changes:
   ```bash
   git pull origin main
   ```

2. **Create a feature branch** for new work:
   ```bash
   git checkout -b feature-descriptive-name
   ```

3. **Make your changes** and commit regularly:
   ```bash
   git add .
   git commit -m "Add: new feature or fix issue"
   ```

4. **Push your feature branch** to GitHub:
   ```bash
   git push origin feature-descriptive-name
   ```

5. **Create a Pull Request** on GitHub to merge into main

6. **After PR is merged**, switch to main and pull:
   ```bash
   git checkout main
   git pull origin main
   ```

7. **Clean up** your feature branch:
   ```bash
   git branch -d feature-descriptive-name
   git push origin --delete feature-descriptive-name
   ```

### Working with This Comment Tracker Project
```bash
# When working on scraping improvements
git checkout -b feature/instagram-scraper-improvements

# When adding new UI components
git checkout -b feature/new-dashboard-widgets

# When fixing bugs
git checkout -b fix/issue-description

# When updating documentation
git checkout -b docs/update-readme
```

## Common Scenarios for This Project

### If you accidentally commit to main branch:
```bash
# Create a branch from your current commit
git branch temp-branch

# Reset main branch to previous commit
git reset --hard HEAD~1

# Switch to the new branch with your changes
git checkout temp-branch

# Push the new branch to GitHub
git push origin temp-branch
```

### If you need to combine multiple commits:
```bash
# Interactive rebase to squash last 3 commits
git rebase -i HEAD~3
```

### If you want to stash changes temporarily:
```bash
# Stash current changes
git stash

# List stashes
git stash list

# Apply the most recent stash
git stash pop

# Apply a specific stash
git stash apply stash@{1}
```

## Collaboration Tips

### Before pushing to shared branches:
1. Always pull the latest changes:
   ```bash
   git pull origin main
   ```
2. Resolve any conflicts locally
3. Test your code still works
4. Then push your changes

### Useful aliases for this project:
```bash
# Add these to your ~/.gitconfig file

# Quick status with short format
git config --local alias.st "status -s"

# View commit history graph
git config --local alias.tree "log --oneline --graph --all"

# Undo last commit but keep changes
git config --local alias.uncommit "reset --soft HEAD~1"

# Show changes in last commit
git config --local alias.showlast "show --name-only HEAD"

# Sync with remote and clean up merged branches
git config --local alias.cleanup "!git fetch origin && git remote prune origin && git branch --merged | grep -v '\\*\\|main\\|master\\|develop' | xargs -n 1 git branch -d"
```

## Troubleshooting Common Issues

### If you get a merge conflict:
1. Git will mark conflicted files
2. Open each file and look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Edit to keep the correct code
4. Stage the resolved files:
   ```bash
   git add resolved-file.js
   ```
5. Complete the merge:
   ```bash
   git commit
   ```

### If you accidentally delete uncommitted work:
```bash
# Look for deleted files in git reflog
git fsck --lost-found
# Or try to recover from git's object database
git reflog
git checkout HEAD@{n} -- path/to/file
```

### If you need to force push (be careful!):
```bash
# Only on your feature branches that you're sure about
git push --force-with-lease origin feature-branch
```

## Git Configuration for This Project

Recommended global settings:
```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch to main
git config --global init.defaultBranch main

# Set editor for commit messages (optional)
git config --global core.editor "code --wait"  # For VS Code
```

Remember to never force push to the main branch of shared repositories!