# 🚀 Deploying Game Night 

## Deployment Options

### 🎯 Quick Development (GitHub Codespaces)
Perfect for testing and development with friends.

### 🌐 Production with Custom Domain (Vercel)
Best for permanent hosting with your own URL.

## GitHub Codespaces Deployment (2 minutes)

### Step 1: Push to GitHub
```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "Initial game night platform implementation"
git remote add origin https://github.com/YOUR-USERNAME/game-night.git
git push -u origin main
```

### Step 2: Create Codespace
1. Go to your GitHub repository
2. Click the **green "Code" button**
3. Click **"Codespaces" tab**
4. Click **"Create codespace on main"**

### Step 3: Auto-Setup
- Codespace will automatically:
  - Install Node.js 22
  - Run `npm install` 
  - Forward port 3000
  - Notify when server is ready

### Step 4: Start Server
```bash
npm start
```

### Step 5: Access Game
- Codespace will show a popup: **"Your application running on port 3000 is available"**
- Click **"Open in Browser"**
- Share the public URL with friends!

## 🌐 Sharing Your Game

### Public URL Format
```
https://USERNAME-game-night-RANDOMID.github.dev/
```

### Share with Friends
1. Copy the Codespace URL from your browser
2. Send to friends via text/email/Discord
3. They can join games directly!

## 🔧 Advanced Configuration

### Environment Variables
Create `.env` file for custom settings:
```bash
PORT=3000
NODE_ENV=production
```

### Custom Domain (Optional)
- Codespaces provides automatic HTTPS URLs
- URLs remain active while Codespace is running
- Can purchase custom domain separately

### Performance Optimization
```bash
# For production builds
npm run build  # (if you add build script)

# Monitor performance
npm install -g pm2
pm2 start server.mjs --name poker-server
```

## 🎮 Multi-Player Testing

### Testing Locally
1. Open multiple browser tabs to the Codespace URL
2. One tab = Host (create room)
3. Other tabs = Players (join with room code)

### Testing with Friends
1. Share your Codespace URL
2. Host creates room, gets 6-digit code
3. Friends visit same URL, enter room code
4. Play games in real-time!

## 🛠 Troubleshooting

### Port Issues
```bash
# Check if port 3000 is available
netstat -tulpn | grep :3000

# Use different port if needed
PORT=3001 npm start
```

### Codespace Not Loading
1. Wait 2-3 minutes for full setup
2. Check "Ports" tab in VS Code
3. Ensure port 3000 is forwarded and public

### Connection Issues
1. Verify Codespace is running (`npm start`)
2. Check browser console for errors
3. Ensure Codespace URL is public/accessible

## 📊 Monitoring

### Server Logs
```bash
# View real-time logs
npm start

# View with timestamps
npm start | while IFS= read -r line; do echo "$(date): $line"; done
```

### Player Count
- Check terminal output for connection logs
- Each player join/leave is logged
- Monitor WebSocket connections

## 💰 Cost Management

### Codespace Pricing
- **Free tier**: 120 core-hours/month
- **Pro**: $4/month for 180 core-hours
- **Team**: More hours for organizations

### Optimization Tips
1. **Stop when not playing**: Codespace → Stop
2. **Use smallest machine**: 2-core is sufficient
3. **Delete unused codespaces**: Saves storage costs
4. **Sleep automatically**: Codespaces sleep after 30 min inactivity

## 🔄 Updates & Maintenance

### Updating the Game
```bash
git pull origin main
npm install  # If package.json changed
npm start
```

### Backup Save States
```bash
# Export player data (if you add persistence)
cp data/players.json backup/players-$(date +%Y%m%d).json
```

## 🎯 Production Deployment Options

### Alternative Platforms
1. **Heroku**: Easy deployment, auto-sleep on free tier
2. **Railway**: Simple, generous free tier
3. **Vercel**: Great for static + serverless
4. **DigitalOcean**: $5/month droplet
5. **AWS/GCP**: More complex, scalable

### For Permanent Hosting
Consider moving to dedicated hosting for:
- 24/7 availability
- Custom domains
- Persistent player data
- Multiple simultaneous games

---

---

## 🌐 Custom Domain Deployment

### Why Custom Domain?
- **Professional URL**: `https://game-night.online` instead of long Codespace URLs
- **Always Available**: 24/7 hosting, doesn't sleep
- **Better Performance**: Global CDN, faster loading
- **Easy Sharing**: Memorable URLs for friends

### Option A: Render (Easiest - No CLI)

#### 1. Deploy to Render (Free)
1. Go to **render.com**
2. Click **"New Web Service"**
3. Connect your GitHub account
4. Select your `game-night` repository
5. Use these settings:
   ```
   Name: game-night
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. Click **"Create Web Service"**

#### 2. Add Custom Domain (render.com)
1. Go to your service dashboard
2. Click **"Settings" → "Custom Domains"**
3. Add `game-night.online`
4. Follow their DNS instructions

### Option B: Vercel (Requires CLI)

#### 1. Deploy to Vercel (Free)
```bash
# Install Vercel CLI (one-time setup)
npm install -g vercel

# Deploy your game
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: game-night
# - Deploy? Yes
```

#### 2. Get Custom Domain
Popular options:
- **Namecheap**: $8-12/year for `.com`
- **Google Domains**: $12/year for `.com`  
- **Cloudflare**: $8/year for `.com`

Perfect gaming domain example:
- `game-night.online` ⭐ **Recommended!**

Other fun options:
- `gamenight.fun`
- `playnight.app`  
- `cardnight.co`

#### 3. Connect Custom Domain
```bash
# Add domain to Vercel project
vercel domains add game-night.online
```

Vercel will provide DNS records. Add these to your domain registrar:

**DNS Records to Add:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

#### 4. Configure DNS at Your Registrar

**Namecheap:**
1. Go to Domain List → Manage → Advanced DNS
2. Delete existing A/CNAME records for @ and www
3. Add new CNAME records:
   - Host: `@`, Value: `cname.vercel-dns.com`
   - Host: `www`, Value: `cname.vercel-dns.com`

**GoDaddy:**
1. Go to My Products → Domain → DNS Management
2. Edit/Add CNAME records:
   - Name: `@`, Value: `cname.vercel-dns.com`
   - Name: `www`, Value: `cname.vercel-dns.com`

**Cloudflare:**
1. Go to DNS → Records
2. Add CNAME records:
   - Name: `game-night.online`, Value: `cname.vercel-dns.com`
   - Name: `www`, Value: `cname.vercel-dns.com`

**Google Domains:**
1. Go to DNS → Custom records
2. Add CNAME records:
   - Host name: `@`, Data: `cname.vercel-dns.com`
   - Host name: `www`, Data: `cname.vercel-dns.com`

#### 5. Wait for DNS Propagation
- DNS changes take 5-60 minutes to propagate
- Check status: `nslookup game-night.online`
- Vercel will show "Domain Active" when ready

#### 6. Automatic Deployments  
- Every `git push` automatically deploys
- Instant updates for your friends
- Built-in SSL certificates (https://)

### Example with game-night.online
```
Production:  https://game-night.online
Staging:     https://dev-game-night.vercel.app
```

### Comparison: Codespaces vs Hosting Platforms

| Feature | Codespaces | Render/Vercel |
|---------|------------|---------------|
| **Custom Domain** | ❌ Auto-generated | ✅ Your domain |
| **Always Online** | ❌ Sleeps after 30min | ✅ 24/7 hosting |
| **Setup Time** | 2 minutes | 5-10 minutes |
| **Cost** | Free (120 hours/month) | Free tier available |
| **Best For** | Development & testing | Production sharing |
| **CLI Required** | ❌ Browser only | Render: ❌ / Vercel: ✅ |

### 🔧 DNS Troubleshooting

#### Common Issues:
- **"Domain not found"**: DNS not propagated yet (wait 30-60 mins)
- **"SSL certificate pending"**: Vercel is generating certificate (wait 5-10 mins)  
- **"Invalid DNS"**: Double-check CNAME values exactly match Vercel's

#### Verify DNS Setup:
```bash
# Check if DNS is working
nslookup game-night.online

# Should return something like:
# game-night.online  CNAME  cname.vercel-dns.com
```

#### Test Your Setup:
```bash
# Check if domain resolves to Vercel
curl -I https://game-night.online

# Should return 200 OK with Vercel headers
```

**🎉 Now your friends can play at https://game-night.online!**