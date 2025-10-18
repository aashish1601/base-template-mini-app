# 🚀 Deploy to Render

## Why Render?

✅ **Free cron jobs** (every 15 minutes!)  
✅ **Free tier** (no credit card required)  
✅ **Auto-deploy** from GitHub  
✅ **Environment variables** built-in  
✅ **Better for hobby projects**

---

## 📋 Prerequisites

1. ✅ GitHub repository (already done!)
2. ✅ Code committed and pushed (already done!)
3. 🆕 Render account (free)

---

## 🎯 Deployment Steps

### **Step 1: Create Render Account**

1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

---

### **Step 2: Create New Web Service**

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Search for: `base-template-mini-app`
   - Click **"Connect"**

4. Configure the service:
   ```
   Name: influencer-fantasy-league
   Region: Oregon (US West) or closest to you
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

5. Click **"Create Web Service"**

---

### **Step 3: Add Environment Variables**

In your web service settings, go to **"Environment"** tab and add these variables:

#### **Required Variables:**

```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_URL=https://influencer-fantasy-league.onrender.com
NEXT_PUBLIC_FRAME_NAME=Influencer Fantasy League

# Neynar API (you already have this!)
NEYNAR_API_KEY=9CB40C40-F4DF-4C1A-BC0A-252B84E3B73D
NEYNAR_CLIENT_ID=your_neynar_client_id
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id

# Security (click "Generate" for random values)
JWT_SECRET=<click Generate button>
ENCRYPTION_KEY=<click Generate button>
CRON_SECRET=<click Generate button>
```

#### **Optional (for production):**

```bash
# Upstash Redis (for persistent storage)
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```

6. Click **"Save Changes"**
7. Render will **automatically redeploy** with new env vars

---

### **Step 4: Set Up Cron Job** (Optional but Recommended)

1. From Render Dashboard, click **"New +"**
2. Select **"Cron Job"**
3. Configure:
   ```
   Name: update-scores-cron
   Schedule: */15 * * * *
   Command: curl -X POST https://influencer-fantasy-league.onrender.com/api/cron/update-scores -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
   
   Replace `YOUR_CRON_SECRET` with the value you generated in Step 3

4. Click **"Create Cron Job"**

---

## ✅ Verify Deployment

### **1. Check Build Logs**

- Go to your web service
- Click **"Logs"** tab
- Wait for build to complete (~2-3 minutes)
- Look for: `✓ Compiled successfully`

### **2. Test Your App**

```bash
# Your app URL (replace with your actual URL)
https://influencer-fantasy-league.onrender.com
```

Visit the URL in your browser. You should see your Fantasy League app!

### **3. Test Cron Job** (if set up)

```bash
# Manually trigger cron
curl -X POST https://influencer-fantasy-league.onrender.com/api/cron/update-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🎨 Custom Domain (Optional)

1. Go to your web service settings
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `fantasyleague.yourdomain.com`)
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_URL` env var to your custom domain

---

## 🔄 Auto-Deploy on Push

Render automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update app"
git push

# Render will auto-deploy! ✨
```

---

## 📊 Monitoring

### **View Logs:**
```
Dashboard → Your Service → Logs
```

### **Check Metrics:**
```
Dashboard → Your Service → Metrics
```

### **Restart Service:**
```
Dashboard → Your Service → Manual Deploy → "Clear build cache & deploy"
```

---

## 🆓 Free Tier Limits

| Feature | Limit |
|---------|-------|
| Web Services | 750 hours/month |
| Cron Jobs | ✅ Unlimited |
| Bandwidth | 100 GB/month |
| Build Minutes | 500 min/month |

**Perfect for your Fantasy League app!**

---

## 🐛 Troubleshooting

### **Build Failed?**

1. Check logs for errors
2. Verify all env vars are set
3. Try: "Clear build cache & deploy"

### **App Not Loading?**

1. Check if deployment succeeded
2. Verify `NEXT_PUBLIC_URL` matches your Render URL
3. Check browser console for errors

### **Cron Not Working?**

1. Verify cron job is created
2. Check `CRON_SECRET` matches in both places
3. View cron job logs for errors

---

## 🎯 Next Steps

After deployment:

1. ✅ Test the app
2. ✅ Verify cron job runs
3. ✅ Set up Redis (Upstash) for persistence
4. ✅ Share your app URL!

---

## 🆚 Render vs Vercel

| Feature | Render (Free) | Vercel (Free) |
|---------|---------------|---------------|
| Cron Jobs | ✅ Every 15 min | ❌ Daily only |
| Build Time | 2-3 min | 2-3 min |
| Cold Start | ~30 sec | ~instant |
| Custom Domain | ✅ Free | ✅ Free |
| Best For | Backend-heavy | Frontend-heavy |

**For your Fantasy League: Render is better!**

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **Discord:** https://render.com/community
- **Support:** support@render.com

---

**Your app will be live at:**
```
https://influencer-fantasy-league.onrender.com
```

(URL will be available after deployment completes)

