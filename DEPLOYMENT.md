# 🚀 Deploying Poker Party to GitHub Codespaces

## Quick Start (2 minutes)

### Step 1: Push to GitHub
```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "Initial poker party implementation"
git remote add origin https://github.com/YOUR-USERNAME/poker-party.git
git push -u origin main
```

### Step 2: Create Codespace
1. Go to your GitHub repository
2. Click the **green "Code" button**
3. Click **"Codespaces" tab**
4. Click **"Create codespace on main"**

### Step 3: Auto-Setup
- Codespace will automatically:
  - Install Node.js 18
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
https://USERNAME-REPONAME-RANDOMID.github.dev/
```

### Share with Friends
1. Copy the Codespace URL from your browser
2. Send to friends via text/email/Discord
3. They can join as players directly!

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
4. Play poker in real-time!

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

**🎉 That's it! Your poker game is now live and accessible to friends worldwide via GitHub Codespaces!**