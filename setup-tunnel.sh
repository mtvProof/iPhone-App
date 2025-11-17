#!/bin/bash
# Cloudflare Tunnel Setup Script for iPhone App API

echo "Installing Cloudflare Tunnel (cloudflared)..."

# Download and install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
rm cloudflared-linux-arm64.deb

echo ""
echo "✅ Cloudflared installed!"
echo ""
echo "Next steps:"
echo "1. Login to Cloudflare:"
echo "   cloudflared tunnel login"
echo ""
echo "2. Create a tunnel:"
echo "   cloudflared tunnel create iphone-api"
echo ""
echo "3. Route your tunnel to localhost:3001:"
echo "   cloudflared tunnel route dns iphone-api api.yourdomain.com"
echo ""
echo "4. Start the tunnel:"
echo "   cloudflared tunnel run iphone-api"
echo ""
echo "OR use the quick tunnel (no domain needed):"
echo "   cloudflared tunnel --url http://localhost:3001"
echo ""
echo "See REMOTE-ACCESS.md for detailed instructions!"
