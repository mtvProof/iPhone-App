# Server Monitoring Dashboard Setup

## Overview
Your iPhone app now includes a real-time monitoring dashboard for:
- RUST++ Bot status
- RCON Bot status
- Raspberry Pi resource monitoring (CPU, Memory, Disk, Temperature)
- RCON console interfaces for both bots

## Setup Instructions

### 1. Install Backend Dependencies

On your Raspberry Pi, run:

```bash
cd "/home/mtvproof/Desktop/iPhone App"
npm install
```

### 2. Configure the API URL

Edit `monitor.js` and update line 4 with your Pi's IP address:

```javascript
const API_URL = 'http://192.168.1.XXX:3001/api';
```

To find your Pi's IP address:
```bash
hostname -I | awk '{print $1}'
```

### 3. Update Process Names

Edit `api-server.js` lines 57-58 to match your actual bot process names:

```javascript
checkProcessStatus('rust'),  // Replace 'rust' with your RUST++ bot process name
checkProcessStatus('rcon'),  // Replace 'rcon' with your RCON bot process name
```

To find your process names:
```bash
ps aux | grep -i bot
```

### 4. Start the API Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 5. Keep API Running (Production)

Use PM2 to keep the server running:

```bash
# Install PM2
sudo npm install -g pm2

# Start API server
pm2 start api-server.js --name "iphone-api"

# Save PM2 config
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 6. Deploy to GitHub

```bash
git add .
git commit -m "Add monitoring dashboard"
git push
```

**Note:** Don't commit `node_modules/` (it's already in .gitignore)

## API Endpoints

- `GET /api/status` - Returns bot and Pi status
- `POST /api/rcon` - Sends RCON command
  ```json
  {
    "bot": "rustpp",
    "command": "status"
  }
  ```
- `GET /api/console/:bot` - Gets console history

## Integrating with RATS-DiscordBot

To connect RCON commands to your Discord bot, modify the `/api/rcon` endpoint in `api-server.js`:

```javascript
// Example integration
const response = await fetch('http://localhost:YOUR_BOT_PORT/rcon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
});
```

Or use IPC/Redis/database to communicate between processes.

## Troubleshooting

### Dashboard shows "Cannot connect to API server"
- Check if API server is running: `pm2 status` or `netstat -tuln | grep 3001`
- Verify firewall allows port 3001
- Confirm API_URL in `monitor.js` is correct

### Bot status shows offline
- Verify process names in `api-server.js` match actual running processes
- Check with: `ps aux | grep -i [your-bot-name]`

### CORS errors when testing locally
- The API uses CORS middleware to allow cross-origin requests
- If issues persist, check browser console for specific errors

## Security Notes

⚠️ **Important:** This API has no authentication. For production:

1. Add API key authentication
2. Use HTTPS with SSL certificate
3. Restrict CORS to your domain only
4. Consider using a reverse proxy (nginx)
5. Don't expose sensitive commands

## Mobile Access

Once deployed:
1. Visit your GitHub Pages URL on iPhone
2. Add to home screen
3. The app will connect to your Pi's API server
4. Monitor your bots from anywhere!

**Note:** Your Pi must be accessible from your phone's network (same WiFi or port forwarded if remote).
