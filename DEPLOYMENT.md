# 🚀 Deployment Guide

Complete guide to deploying the Lazorkit Starter Kit to production.

## Table of Contents

1. [Vercel Deployment](#vercel-deployment) - Recommended
2. [Self-Hosted Deployment](#self-hosted)
3. [Docker Deployment](#docker)
4. [Troubleshooting](#troubleshooting)

## Vercel Deployment

### Recommended: Easiest and fastest way to deploy

**Why Vercel?**
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Free tier available
- ✅ 1-click rollbacks
- ✅ Preview deployments

### Step 1: Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. Visit [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### Step 3: Deploy Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Click "Import"
4. Vercel auto-detects Next.js configuration ✅
5. Click "Deploy"

**First deployment takes ~2-3 minutes**

### Step 4: Configure Environment Variables

**In Vercel Dashboard:**

1. Go to your project settings
2. Click "Environment Variables"
3. Add these variables:

```
NEXT_PUBLIC_SOLANA_RPC_URL: https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK: devnet
NEXT_PUBLIC_LAZORKIT_PORTAL_URL: https://portal.lazor.sh
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL: https://kora.devnet.lazorkit.com
NEXT_PUBLIC_USDC_MINT_ADDRESS: EPjFWaLb3oda64sMtS1wixpg5B7z5SAnqDFW4Ady
NEXT_PUBLIC_APP_NAME: Lazorkit Starter Kit
NEXT_PUBLIC_APP_VERSION: 1.0.0
```

**⚠️ Important:** All variables starting with `NEXT_PUBLIC_` are public (safe to expose)

### Step 5: Trigger Deployment

1. Click "Redeploy" to apply environment variables
2. Wait for build to complete (~2-3 minutes)
3. Your app is live! 🎉

**Your URL:** `https://your-project.vercel.app`

### Automatic Deployments

Vercel auto-deploys on every git push to `main`:

```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main

# Vercel automatically:
# 1. Builds the project
# 2. Runs tests (if configured)
# 3. Deploys to production
# 4. Updates your live URL
```

**Deploy time:** 2-3 minutes

## Self-Hosted Deployment

### Option: VPS (DigitalOcean, Linode, AWS)

**Requirements:**
- Ubuntu 20.04+ or similar Linux
- Node.js 18+
- 2GB RAM (minimum)
- 10GB storage (minimum)

### Step 1: Provision Server

**DigitalOcean Example:**

1. Create droplet with Ubuntu 20.04
2. Select $5/month plan (sufficient)
3. Enable SSH key authentication
4. Create droplet

### Step 2: Install Dependencies

```bash
# SSH into your server
ssh root@your.server.ip

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Verify installations
node --version  # v18+
npm --version   # 9+
```

### Step 3: Clone Repository

```bash
# Clone your repo
git clone https://github.com/your-username/lazorkit-nextjs-starter.git
cd lazorkit-nextjs-starter

# Install dependencies
npm install
```

### Step 4: Setup Environment

```bash
# Copy example to actual file
cp .env.example .env.local

# Edit environment variables
nano .env.local

# Add your values:
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# etc.
```

### Step 5: Build and Run

```bash
# Build the production bundle
npm run build

# Start with PM2
pm2 start "npm start" --name "lazorkit-app"

# Make it auto-restart on reboot
pm2 startup
pm2 save
```

### Step 6: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
apt-get install -y nginx

# Create config file
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Step 7: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d your-domain.com

# Auto-renews every 60 days ✅
```

**Your site is now live at `https://your-domain.com`**

## Docker Deployment

### Containerize Your App

**Create Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files
COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install runtime dependencies only
RUN npm ci --production

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

**Create .dockerignore:**

```
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env.example
.env.local
```

### Build and Push to Registry

```bash
# Build image
docker build -t your-username/lazorkit-app:latest .

# Login to Docker Hub
docker login

# Push to registry
docker push your-username/lazorkit-app:latest
```

### Deploy on Docker Host

```bash
# Pull image
docker pull your-username/lazorkit-app:latest

# Run container
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com \
  -e NEXT_PUBLIC_LAZORKIT_PORTAL_URL=https://portal.lazor.sh \
  -e NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com \
  --name lazorkit-app \
  your-username/lazorkit-app:latest
```

**Docker Compose (optional):**

```yaml
version: '3'
services:
  lazorkit:
    image: your-username/lazorkit-app:latest
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SOLANA_RPC_URL: https://api.devnet.solana.com
      NEXT_PUBLIC_LAZORKIT_PORTAL_URL: https://portal.lazor.sh
      NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL: https://kora.devnet.lazorkit.com
    restart: unless-stopped
```

Start with: `docker-compose up -d`

## Post-Deployment Checklist

- [ ] App loads at your URL
- [ ] Passkey registration works
- [ ] Passkey login works
- [ ] Wallet displays correct address
- [ ] SOL balance displays
- [ ] USDC balance displays
- [ ] Transfer form accepts input
- [ ] Transaction history shows transfers
- [ ] Mobile responsive
- [ ] HTTPS working
- [ ] No console errors

## Monitoring & Maintenance

### Vercel (Automatic)

- ✅ Uptime monitoring included
- ✅ Error tracking
- ✅ Performance analytics
- ✅ Deployment logs

### Self-Hosted

```bash
# Check app status
pm2 status

# View logs
pm2 logs lazorkit-app

# Monitor CPU/Memory
pm2 monit

# Restart if needed
pm2 restart lazorkit-app
```

## Scaling

### Vercel
- Automatically scales with traffic ✅
- No configuration needed

### Self-Hosted
- Add load balancer (Nginx, HAProxy)
- Run multiple app instances
- Use database for session persistence
- Monitor performance metrics

## Cost Comparison

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| **Vercel** | Free-$150/month | Easiest, auto-scaling, fast | Less control |
| **DigitalOcean** | $5-60/month | More control, cheaper | Manual maintenance |
| **Docker (self) | Variable | Flexible | Complex setup |

## Troubleshooting

### App Won't Build

```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

```bash
# Ensure variables are set in Vercel dashboard
# Must redeploy after adding variables
# NEXT_PUBLIC_ prefix is required for client-side

# Verify variables are loaded
npm start  # Should not error about missing vars
```

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### SSL Certificate Issues

```bash
# Vercel: Automatic ✅
# Self-hosted: Use Let's Encrypt

# Renew certificate
certbot renew --dry-run

# If renewal fails, manually renew
certbot certonly --standalone -d your-domain.com
```

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment/vercel)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Guide](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Support

- **Vercel Issues**: [vercel.com/support](https://vercel.com/support)
- **Deployment Help**: Check troubleshooting above
- **Lazorkit SDK**: [docs.lazorkit.com](https://docs.lazorkit.com/)

---

**Recommended Next Steps:**

1. ✅ Deploy to Vercel (recommended)
2. ✅ Test all features
3. ✅ Monitor logs for issues
4. ✅ Share your live URL!

Happy deploying! 🚀
