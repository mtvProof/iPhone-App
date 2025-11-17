# Troubleshooting Connection Issues

## The Problem
When accessing the app from GitHub Pages (HTTPS), browsers block HTTP requests to your local API server due to **Mixed Content Security**. Additionally, GitHub Pages can't access devices on your local network.

## Solutions

### Option 1: Test Locally (Easiest for Testing)

1. **Open the local test page** on your Pi's browser:
   ```
   http://localhost:8080/test-local.html
   ```

2. Or from another device on the same network:
   ```
   http://192.168.0.16:8080/test-local.html
   ```

This should show live data since both the webpage and API are on the same network using HTTP.

### Option 2: Access from iPhone (Same WiFi Network)

If you want to use your iPhone while on the same WiFi as your Pi:

1. **Open Safari** on your iPhone
2. Go to: `http://192.168.0.16:8080/test-local.html`
3. This will work because:
   - Both use HTTP (no mixed content)
   - Both on same network

**To add to home screen:**
- Safari → Share → Add to Home Screen
- Note: Use the IP address URL, not GitHub Pages

### Option 3: Use HTTPS with Tunnel (Remote Access)

To access from anywhere, you need to:

1. **Use a tunnel service** (ngrok, Cloudflare Tunnel, etc.):
   ```bash
   # Install ngrok
   sudo snap install ngrok
   
   # Tunnel your API
   ngrok http 3001
   ```

2. **Update monitor.js** with the HTTPS ngrok URL:
   ```javascript
   const API_URL = 'https://your-ngrok-url.ngrok.io/api';
   ```

3. Now GitHub Pages (HTTPS) can talk to your API (also HTTPS)

### Option 4: VPN Access

Set up a VPN to your home network (WireGuard, OpenVPN, etc.), then access via local IP while connected.

## Current Setup Status

✅ **API Server:** Running on `http://192.168.0.16:3001`  
✅ **Test Server:** Running on `http://192.168.0.16:8080`  
❌ **GitHub Pages:** Cannot access local network (by design)

## Quick Test Commands

```bash
# Check if API is responding
curl http://localhost:3001/api/status

# Check from another device on network
curl http://192.168.0.16:3001/api/status

# View PM2 status
pm2 status

# View API logs
pm2 logs iphone-api

# Restart API
pm2 restart iphone-api
```

## What Works Where

| Access Method | GitHub Pages | Local Test | Notes |
|--------------|--------------|------------|-------|
| Desktop browser (on Pi) | ❌ | ✅ | Use localhost:8080 |
| Phone (same WiFi) | ❌ | ✅ | Use 192.168.0.16:8080 |
| Phone (anywhere) | ❌ | ❌ | Need tunnel/VPN |
| Phone + ngrok | ✅ | ✅ | API via HTTPS tunnel |

## Recommended Setup

**For Development/Home Use:**
- Access via: `http://192.168.0.16:8080/test-local.html`
- Add this to your iPhone home screen
- Works perfectly on your home network

**For Remote Access:**
- Set up Cloudflare Tunnel or ngrok (free tier works)
- Updates API URL to HTTPS endpoint
- Deploy to GitHub Pages
- Access from anywhere

## Next Steps

1. **Test locally first:** Open `http://192.168.0.16:8080/test-local.html` in your phone's browser
2. **Verify it works:** You should see live data updating
3. **Add to home screen:** Use the IP address version, not GitHub Pages
4. **If you need remote access:** Set up a tunnel service

The dashboard is working perfectly - it's just a network/security limitation preventing GitHub Pages from accessing your local API!
