#!/bin/bash
set -e
cd /var/www/dokagen-web
echo ">>> [web] git pull..."
git pull
echo ">>> [web] npm run build..."
npm run build
echo ">>> [web] copy static assets..."
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public
echo ">>> [web] pm2 restart..."
pm2 restart dokagen-web
echo "✓ Deploy dokagen-web selesai"
