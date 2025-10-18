# 🚀 Deploy to Production - Step-by-Step Guide

## 📋 Pre-Deployment Checklist

### ✅ What You Already Have
- [x] Neynar API Key: `9CB40C40-F4DF-4C1A-BC0A-252B84E3B73D`
- [x] Oracle Secret: Configured
- [x] Cron Secret: Configured
- [x] App code complete
- [x] Local testing done

### 🎯 What We'll Do Now
1. Set up Redis (5 minutes)
2. Push code to GitHub
3. Deploy to Vercel
4. Configure environment variables
5. Test production deployment

---

## Step 1: Set Up Redis (Upstash) - RECOMMENDED

Redis is highly recommended for production to store data persistently.

### Option A: Quick Setup (Use This!)

```bash
# We'll set this up together
# Visit: https://console.upstash.com
```

### Option B: Skip for Now

You can deploy without Redis, but:
- ⚠️ Data will be lost on server restart
- ⚠️ Not suitable for real users
- ✅ Good for testing production deployment

**Decision:** Let's set up Redis (takes 5 minutes)

---

## Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
cd /home/aashish/hyperthon/base-template-mini-app
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Influencer Fantasy League"

# Create GitHub repo and push
# Option 1: Using GitHub CLI (if installed)
gh repo create fantasy-league --public --source=. --remote=origin --push

# Option 2: Manual (if no GitHub CLI)
# 1. Go to github.com/new
# 2. Create repo named "fantasy-league"
# 3. Run these commands:
git remote add origin https://github.com/YOUR_USERNAME/fantasy-league.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? fantasy-league
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Click "Deploy"

---

## Step 4: Configure Environment Variables in Vercel

After deployment, add environment variables:

### Via Vercel Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable for **Production, Preview, and Development**:

```env
NEYNAR_API_KEY=9CB40C40-F4DF-4C1A-BC0A-252B84E3B73D
NEXT_PUBLIC_URL=https://your-app-name.vercel.app
ORACLE_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
CRON_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8
NEXT_PUBLIC_FRAME_NAME=Influencer Fantasy League
NEXT_PUBLIC_FRAME_DESCRIPTION=Draft creators, earn points, win ETH prizes
NEXT_PUBLIC_FRAME_BUTTON_TEXT=Play Now
NEXT_PUBLIC_FRAME_PRIMARY_CATEGORY=gaming
NEXT_PUBLIC_FRAME_TAGS=fantasy,creators,gaming,social
NEXT_PUBLIC_USE_WALLET=true
```

**If you set up Redis, also add:**
```env
KV_REST_API_URL=https://your-database.upstash.io
KV_REST_API_TOKEN=your_token_here
```

### Via Vercel CLI

```bash
# Add each variable
vercel env add NEYNAR_API_KEY production
# Paste: 9CB40C40-F4DF-4C1A-BC0A-252B84E3B73D

vercel env add NEXT_PUBLIC_URL production
# Paste: https://your-app-name.vercel.app

# Repeat for all variables...
```

---

## Step 5: Redeploy with Environment Variables

```bash
# Trigger new deployment with env vars
vercel --prod

# Or in dashboard: Deployments → Latest → Redeploy
```

---

## Step 6: Test Production Deployment

### Test URLs

```bash
# Your production URL
https://your-app-name.vercel.app

# Fantasy League page
https://your-app-name.vercel.app/fantasy

# Test oracle endpoint
curl https://your-app-name.vercel.app/api/oracle/verify/vitalik.eth?week=1
```

### Check Logs

```bash
# View real-time logs
vercel logs --follow

# Or in dashboard: Deployments → View Function Logs
```

---

## Step 7: Verify Cron Job

The cron job should start automatically running every 15 minutes.

### Check Cron Status

1. Vercel Dashboard → Your Project
2. Settings → Cron Jobs
3. Should see: `/api/cron/update-scores` (Every 15 minutes)

### Test Cron Manually

```bash
curl -X POST https://your-app-name.vercel.app/api/cron/update-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🎉 You're Live!

Your Fantasy League is now in production!

### Share Your App

```
Production URL: https://your-app-name.vercel.app/fantasy
```

Share on Farcaster:
```
Just launched Influencer Fantasy League! 🎮

Draft creators, earn points, win prizes.
[Your URL here]
```

---

## 📊 Post-Deployment Monitoring

### Check These Regularly

1. **Vercel Dashboard**
   - Bandwidth usage
   - Function invocations
   - Error rate

2. **Cron Job Logs**
   - Should run every 15 min
   - Check for errors

3. **Redis Usage** (if using)
   - Daily command count
   - Storage used

---

## 🔧 Troubleshooting

### Build Failed

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Missing dependencies

# Fix locally first:
npm run build
npm run lint
```

### Environment Variables Not Working

```bash
# Make sure you set them for all environments
# Production, Preview, Development

# Redeploy after adding
vercel --prod
```

### Cron Not Running

```bash
# Check Vercel plan (cron requires Hobby or Pro)
# Verify cron secret is set
# Check logs for errors
vercel logs --follow
```

---

## 💰 Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| Vercel | Hobby plan | $0/month (then $20/month) |
| Upstash Redis | Free tier | $0/month (10k req/day) |
| Neynar API | Current usage | $0/month (free tier) |
| **Total** | | **$0-20/month** |

**Note:** Vercel free tier includes:
- 100GB bandwidth/month
- 100 hours serverless function time
- Should be enough for 100-200 daily users

---

## 🎯 Next Steps After Deployment

1. ✅ Share with beta testers
2. ✅ Monitor for 24 hours
3. ✅ Add Redis if you skipped it
4. ✅ Claim app ownership for notifications
5. ✅ Add custom domain (optional)
6. ✅ Set up analytics

---

## 📞 Need Help?

- Vercel Support: https://vercel.com/support
- Check logs: `vercel logs --follow`
- Test locally first: `npm run build && npm start`

---

Ready to deploy? Let's start! 🚀

