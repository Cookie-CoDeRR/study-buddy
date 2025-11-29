# GitHub Pages Deployment Guide

Your Study Buddy project is now configured for deployment on GitHub Pages!

## ✅ What's Been Set Up

### 1. **Vite Configuration** (`vite.config.ts`)
- Added dynamic base path: `/study-buddy/` for GitHub Pages
- Optimized build output for production

### 2. **Build Scripts** (`package.json`)
- `npm run build:gh-pages` - Build optimized for GitHub Pages
- `npm run deploy` - Alias for GitHub Pages build

### 3. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
- Automatic deployment on every push to `main` branch
- Builds and deploys directly to GitHub Pages

## 🚀 Deployment Instructions

### Step 1: Push to GitHub
Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Step 2: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select `GitHub Actions` (or `Deploy from a branch` if using `gh-pages`)
   - If using branch method, select `gh-pages` branch and `/ (root)` folder
4. Wait for the first deployment to complete
5. Your site will be live at: `https://<your-username>.github.io/study-buddy/`

### Step 3: Automatic Deployment
Every time you push to the `main` branch:
1. GitHub Actions will automatically build your project
2. The `deploy.yml` workflow will run
3. Your site will be updated at `https://<your-username>.github.io/study-buddy/`

## 📋 Workflow Details

The `.github/workflows/deploy.yml` file will:
- Trigger on every push to `main` branch
- Install Node.js and dependencies
- Build the project with `GITHUB_PAGES=true` environment variable
- Upload the `dist/` folder as a GitHub Pages artifact
- Deploy to your GitHub Pages site

## 🔧 Custom Domain (Optional)

If you have a custom domain:
1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain (e.g., `studybuddy.example.com`)
3. Add CNAME records to your domain registrar pointing to GitHub Pages
4. GitHub will create a `CNAME` file automatically

## 📊 Monitoring Deployment

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You'll see `Deploy to GitHub Pages` workflow runs
4. Check logs if deployment fails

## ⚙️ Build Configuration

- **Base path**: `/study-buddy/` (auto-configured)
- **Output directory**: `dist/`
- **Environment variable**: `GITHUB_PAGES=true` sets the base path
- **No sourcemaps**: Production builds don't include sourcemaps for smaller size

## 📝 Environment Conditions

The vite config checks for `GITHUB_PAGES` environment variable:
- When deploying: Uses `/study-buddy/` as base path
- During local development: Uses `/` (root path)

## 🐛 Troubleshooting

### Site shows 404
- Check that base path is correctly set in `vite.config.ts`
- Verify the workflow ran successfully in GitHub Actions
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Assets not loading
- Ensure all imports use relative paths
- Check that asset paths are correct in CSS/HTML
- Verify `base` setting in `vite.config.ts`

### Build fails
- Check GitHub Actions logs for error details
- Ensure all dependencies are in `package.json`
- Test locally with `npm run build:gh-pages`

## 📦 Local Testing

To test the production build locally:
```bash
npm run build:gh-pages
npm run preview
```

Then visit `http://localhost:5173/study-buddy/` in your browser.

## 🎯 Next Steps

1. Commit and push changes to GitHub
2. Wait for GitHub Actions to complete (check Actions tab)
3. Visit `https://<your-username>.github.io/study-buddy/`
4. Your app should be live! 🎉

## 📞 Support

If you encounter issues:
- Check GitHub Actions logs for build errors
- Verify repository is public (required for free GitHub Pages)
- Check that Pro educational benefits are applied to your account
- Review vite.config.ts and ensure `base` path is correct

---

**Repository**: `https://github.com/<your-username>/<your-repo>`  
**Live Site**: `https://<your-username>.github.io/study-buddy/`
