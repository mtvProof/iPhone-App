# Remote Access Setup Guide

## Problem
Your Pi API is on your local network (192.168.0.16) and can't be accessed from cellular networks or outside your home WiFi.

## Solution: Use Cloudflare Tunnel (Recommended - FREE)

Cloudflare Tunnel creates a secure HTTPS connection from the internet to your Pi without:
- ❌ Opening ports on your router
- ❌ Exposing your home IP
- ❌ Complex firewall configuration
- ✅ FREE and secure
- ✅ HTTPS automatically

### Quick Setup (5 minutes)

#### Option 1: Quick Tunnel (No Domain Needed)

1. **Install cloudflared:**
   ```bash
   chmod +x setup-tunnel.sh
   ./setup-tunnel.sh
   ```

2. **Start a quick tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```

3. **You'll get a URL like:**
   ```
   https://randomly-generated-name.trycloudflare.com
   ```

4. **Update monitor.js with this URL:**
   ```javascript
   const API_URL = 'https://randomly-generated-name.trycloudflare.com/api';
   ```

5. **Access from anywhere:**
   - GitHub Pages: `https://mtvproof.github.io/iPhone-App/`
   - Now it can reach your API via HTTPS tunnel!

**Note:** Quick tunnel URLs change each restart. For permanent URLs, use Option 2.

---

#### Option 2: Permanent Tunnel (With Domain - Recommended)

If you have a domain (or get a free one from Freenom):

1. **Login to Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```
   Opens browser - login with your Cloudflare account (free)

2. **Create named tunnel:**
   ```bash
   cloudflared tunnel create iphone-api
   ```

3. **Create config file:**
   ```bash
   nano ~/.cloudflared/config.yml
   ```

   Add:
   ```yaml
   tunnel: iphone-api
   credentials-file: /home/mtvproof/.cloudflared/YOUR-TUNNEL-ID.json
   
   ingress:
     - hostname: api.yourdomain.com
       service: http://localhost:3001
     - service: http_status:404
   ```

4. **Route DNS:**
   ```bash
   cloudflared tunnel route dns iphone-api api.yourdomain.com
   ```

5. **Run tunnel:**
   ```bash
   cloudflared tunnel run iphone-api
   ```

6. **Make it persistent with PM2:**
   ```bash
   pm2 start cloudflared --name "tunnel" -- tunnel run iphone-api
   pm2 save
   ```

7. **Update monitor.js:**
   ```javascript
   const API_URL = 'https://api.yourdomain.com/api';
   ```

---

## Alternative Options

### Option 2: Ngrok (Easy, Free Tier)

1. **Install:**
   ```bash
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
     sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
     echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
     sudo tee /etc/apt/sources.list.d/ngrok.list && \
     sudo apt update && sudo apt install ngrok
   ```

2. **Sign up at ngrok.com and get auth token**

3. **Add auth token:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

4. **Start tunnel:**
   ```bash
   ngrok http 3001
   ```

5. **Get your HTTPS URL** (looks like: `https://abc123.ngrok.io`)

6. **Update monitor.js:**
   ```javascript
   const API_URL = 'https://abc123.ngrok.io/api';
   ```

**Free tier limits:** Random URLs that change on restart, 40 connections/min

---

### Option 3: Port Forwarding (Manual)

If you control your router:

1. **Forward port 3001** to your Pi (192.168.0.16:3001)
2. **Get your public IP:** Visit whatismyipaddress.com
3. **Access via:** `http://YOUR-PUBLIC-IP:3001/api/status`

**Downsides:**
- ❌ Exposes your home IP
- ❌ HTTP only (not HTTPS - GitHub Pages won't work)
- ❌ Security risk
- ❌ May not work if ISP blocks ports

---

### Option 4: Tailscale VPN (Private Access)

For personal use only:

1. **Install Tailscale:** https://tailscale.com/download/linux
2. Connect your Pi and phone to Tailscale
3. Access Pi via Tailscale IP
4. No internet exposure - private network only

---

## Recommended Setup for You

**Use Cloudflare Quick Tunnel:**

```bash
# Start the tunnel
cloudflared tunnel --url http://localhost:3001
```

You'll get output like:
```
2025-11-17 Your quick tunnel is: https://xyz123.trycloudflare.com
```

Then update `monitor.js`:
```javascript
const API_URL = 'https://xyz123.trycloudflare.com/api';
```

Commit and push:
```bash
git add monitor.js
git commit -m "Update API URL for Cloudflare tunnel"
git push
```

Wait 1-2 minutes for GitHub Pages to update, then access from your phone:
`https://mtvproof.github.io/iPhone-App/`

---

## Making Tunnel Persistent

Keep tunnel running after reboot:

```bash
# With PM2
pm2 start "cloudflared tunnel --url http://localhost:3001" --name "cf-tunnel"
pm2 save
pm2 startup
```

**Note:** Quick tunnel URLs change on restart. For permanent URL, create a named tunnel (Option 2 above).

---

## Testing Your Tunnel

After setting up tunnel:

```bash
# Test from Pi
curl https://your-tunnel-url.com/api/status

# Should return JSON with bot and Pi status
```

Then test from your phone's browser (cellular data):
- Open Safari
- Go to: `https://mtvproof.github.io/iPhone-App/`
- Should see live data!

---

## Security Notes

✅ **Cloudflare Tunnel:**
- Encrypted connection
- DDoS protection
- No exposed ports
- Free SSL certificate

⚠️ **Add Authentication Later:**
Consider adding API key authentication to `api-server.js`:

```javascript
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});
```

---

## Quick Start (TL;DR)

```bash
# Install cloudflared
./setup-tunnel.sh

# Start quick tunnel
cloudflared tunnel --url http://localhost:3001

# Copy the https:// URL you get
# Update monitor.js with that URL
# Push to GitHub
# Access from anywhere!
```
