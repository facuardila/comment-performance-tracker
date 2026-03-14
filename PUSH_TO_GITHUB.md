# Push Comment Performance Tracker to GitHub

## Initial Repository Setup

### 1. Create a New Repository on GitHub
1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Give your repository a name (e.g., "comment-performance-tracker")
4. Add a description: "Internal tool for agencies to track Instagram comment performance"
5. Choose "Public" or "Private" based on your preference
6. Do NOT initialize with README, .gitignore, or license (we'll add these locally)
7. Click "Create repository"

### 2. Initialize Git Locally
```bash
# Navigate to your project directory
cd comment-tracker

# Initialize git repository if not already done
git init

# Add all files to the staging area
git add .
```

### 3. Create and Customize .gitignore
First, let's make sure we have a proper .gitignore file:

```bash
# If you don't have a .gitignore file, create one
touch .gitignore
```

Add these entries to your `.gitignore` file:
```
# Dependencies
node_modules/

# Environment variables
.env*
!.env.example

# Build outputs
.next/
dist/
build/
out/

# Database
*.db
*.sqlite

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Runtime
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Next.js
.next
.cache

# Prisma
prisma/migrations/
prisma/schema.prisma.bak

# Playwright
playwright-report/
test-results/
```

### 4. Commit Your Changes
```bash
# Commit all your files
git commit -m "Initial commit: Comment Performance Tracker MVP"

# Add the remote origin (replace with your actual repository URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Verify the remote was added
git remote -v
```

### 5. Push to GitHub
```bash
# Push the main branch to GitHub
git push -u origin main
```

## Alternative Method: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Navigate to your project directory
cd comment-tracker

# Login to GitHub (if not already logged in)
gh auth login

# Create a new repository and push your code
gh repo create YOUR_REPOSITORY_NAME --public --push
# or gh repo create YOUR_REPOSITORY_NAME --private --push for private repos
```

## Post-Push Verification

### 1. Verify Files Uploaded
- Go to your GitHub repository page
- Verify that all your files are present
- Check that sensitive files (like .env) are properly ignored

### 2. Update README (Optional)
You can enhance your GitHub repository by updating the README with badges and additional information:

```markdown
# Comment Performance Tracker

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-DB-3FCF8E?style=flat&logo=supabase)](https://supabase.io/)
[![Playwright](https://img.shields.io/badge/Playwright-Testing-58A53F?style=flat&logo=playwright)](https://playwright.dev/)

An internal tool for agencies to track the performance of Instagram comments posted by community managers on third-party accounts, without using client credentials and without depending on official APIs.

## Features

- **Quick Add**: Ultra-fast interface for daily use by community managers
- **Instagram Scraping**: Extracts public metrics without API credentials
- **Historical Tracking**: Saves snapshots of comment performance over time
- **Dashboard**: Visual analytics and KPIs
- **XLSX Import**: Seed historical data from spreadsheets
- **Bookmarklet**: Quick capture from Instagram web interface
- **Database View**: Usable table view with filters and search

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd comment-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your Supabase credentials

5. Initialize the database:
```bash
npm run db:init
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
```

## Setting up GitHub Pages (Optional)

If you want to host a demo of your application:

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/" folder
5. Click "Save"

Note: This only works for static sites. For a Next.js app, you'd need to build it as a static export first.

## Protecting Your Branches

To protect your main branch:

1. Go to your repository settings
2. Click on "Branches"
3. Click "Add rule" next to "Branch protection rules"
4. Enter "main" as the branch name pattern
5. Check "Require pull request reviews before merging"
6. Check "Require status checks to pass before merging"
7. Save changes

## Final Steps

1. **Verify everything pushed correctly** by checking your GitHub repository
2. **Share the repository** with your team members
3. **Set up any CI/CD pipelines** you might need
4. **Update the repository description** and topics on GitHub
5. **Invite collaborators** if needed

Your Comment Performance Tracker is now successfully pushed to GitHub!