#!/bin/bash
# ==============================================================
# BN NEWS GUJARATI - UBUNTU HOSTINGER VPS DEPLOYMENT SCRIPT
# ==============================================================
set -e

echo "🚀 Starting BN News Gujarati Deployment on Ubuntu VPS..."

# 1. Update OS packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS & PM2
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
sudo npm install -g pm2

# 3. Create Project Directory if needed
APP_DIR="/var/www/bn-news"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 4. Install Dependencies & Build
echo "📦 Installing backend packages & building..."
cd $APP_DIR/backend
npm install --production=false
npx prisma generate
npx prisma db push
npm run build

echo "📦 Installing frontend packages & building..."
cd $APP_DIR/frontend
npm install --production=false
npm run build

# 5. Start / Reload with PM2
echo "⚡ Starting application with PM2..."
cd $APP_DIR
pm2 startOrReload ecosystem.config.cjs

# 6. Save PM2 state to launch on server reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER

# 7. Configure Nginx
echo "🌐 Configuring Nginx reverse proxy..."
sudo cp $APP_DIR/nginx/bnnews.conf /etc/nginx/sites-available/bnnews.conf
sudo ln -sf /etc/nginx/sites-available/bnnews.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "🎉 Deployment successfully completed!"
echo "➡️ Configure SSL with: sudo certbot --nginx -d bnnews.in -d www.bnnews.in -d api.bnnews.in -d admin.bnnews.in"
