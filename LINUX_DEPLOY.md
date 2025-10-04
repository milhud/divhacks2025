# 🐧 LINUX DEPLOYMENT COMMANDS - Run on Your VM

## ONE-TIME SETUP (Run these once)

### 1. Update System & Install Node.js
```bash
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 3. Install Python (for video processing)
```bash
sudo apt install -y python3 python3-pip
```

---

## DEPLOY YOUR APP (Every time you want to deploy)

### 1. Clone/Update Your Repository
```bash
# If first time cloning
git clone https://github.com/your-username/divhacks2025.git
cd divhacks2025

# If already cloned, just update
git pull origin main
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip3 install -r python/requirements.txt
```

### 3. Set Environment Variables
```bash
# Create environment file
nano .env.local

# Add these (replace with your actual values):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_BASE_URL=http://$(curl -s ifconfig.me):3000
```

### 4. Build and Start
```bash
# Build the app
npm run build

# Start with PM2 (keeps running after you disconnect)
pm2 start npm --name "vibe-coach" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Open Firewall (if needed)
```bash
# Allow port 3000
sudo ufw allow 3000
```

---

## GET YOUR APP URL
```bash
# Get your server's public IP
curl -s ifconfig.me

# Your app will be at: http://YOUR-IP:3000
```

---

## USEFUL COMMANDS

### Check App Status
```bash
pm2 status
pm2 logs vibe-coach
pm2 restart vibe-coach
```

### Stop App
```bash
pm2 stop vibe-coach
pm2 delete vibe-coach
```

### Update App (when you push new code)
```bash
git pull origin main
npm install
npm run build
pm2 restart vibe-coach
```

---

## QUICK DEPLOY SCRIPT
Create this file and run it:

```bash
# Create deploy script
nano deploy.sh

# Add this content:
#!/bin/bash
echo "🚀 Deploying Vibe Coach..."
git pull origin main
npm install
npm run build
pm2 restart vibe-coach
echo "✅ Deployed! Check status with: pm2 status"

# Make it executable
chmod +x deploy.sh

# Run it
./deploy.sh
```

---

## 🎯 SUMMARY - Just run these commands:

```bash
# One-time setup
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip
sudo npm install -g pm2

# Deploy
git clone https://github.com/your-username/divhacks2025.git
cd divhacks2025
npm install
pip3 install -r python/requirements.txt
nano .env.local  # Add your keys
npm run build
pm2 start npm --name "vibe-coach" -- start
sudo ufw allow 3000

# Get your URL
curl -s ifconfig.me
# Visit: http://YOUR-IP:3000
```

**That's it! Your app is running!** 🚀
