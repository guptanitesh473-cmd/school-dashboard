#!/bin/bash
# Run this on your VPS server (Ubuntu/Debian) as root or sudo user
# Usage: bash deploy.sh
set -e

DOMAIN="expndb.online"
APP_DIR="/var/www/school-dashboard"

echo "=============================="
echo " OIS Dashboard Deployment"
echo " Domain: $DOMAIN"
echo "=============================="

# 1. Install Node.js 20
echo "[1/7] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. Install Nginx, PM2, Certbot
echo "[2/7] Installing Nginx, PM2, Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx
npm install -g pm2

# 3. Copy project to /var/www
echo "[3/7] Setting up app directory..."
mkdir -p "$APP_DIR"
cp -r . "$APP_DIR/"
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# 4. Install deps and build
echo "[4/7] Building app..."
cd "$APP_DIR"
chmod +x build.sh
bash build.sh

# 5. Configure Nginx
echo "[5/7] Configuring Nginx..."
cp "$APP_DIR/nginx.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 6. SSL Certificate (Let's Encrypt)
echo "[6/7] Getting SSL certificate..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" --redirect

# 7. Start app with PM2
echo "[7/7] Starting app with PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "=============================="
echo "Deployment complete!"
echo "Site: https://$DOMAIN"
echo "PM2 status: pm2 status"
echo "Logs: pm2 logs school-dashboard"
echo "=============================="
