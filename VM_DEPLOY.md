# 🚀 DEPLOY ON YOUR EXISTING GOOGLE CLOUD VM

## SUPER SIMPLE - 10 Minutes

### Step 1: Upload Your Code to VM
```bash
# From your local machine, copy files to VM
gcloud compute scp --recurse . your-vm-name:~/vibe-coach --zone=your-zone

# Or use rsync for better performance
rsync -avz --exclude node_modules . your-vm-name:~/vibe-coach
```

### Step 2: SSH into Your VM
```bash
gcloud compute ssh your-vm-name --zone=your-zone
```

### Step 3: Install Dependencies on VM
```bash
# Update system
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Go to your app directory
cd ~/vibe-coach

# Install app dependencies
npm install
```

### Step 4: Set Up Environment Variables
```bash
# Create .env.local file
nano .env.local

# Add these variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_BASE_URL=http://your-vm-external-ip:3000
```

### Step 5: Build and Start the App
```bash
# Build the app
npm run build

# Start with PM2 (keeps running after you disconnect)
pm2 start npm --name "vibe-coach" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 6: Open Firewall Port
```bash
# Allow traffic on port 3000
gcloud compute firewall-rules create allow-vibe-coach \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow Vibe Coach app"
```

### Step 7: Get Your App URL
```bash
# Get your VM's external IP
gcloud compute instances describe your-vm-name --zone=your-zone --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

**Your app will be available at: `http://YOUR-VM-IP:3000`**

---

## 🛑 SHUT DOWN (When Done)

### Stop the App
```bash
# SSH into VM
gcloud compute ssh your-vm-name --zone=your-zone

# Stop the app
pm2 stop vibe-coach
pm2 delete vibe-coach

# Or stop the VM entirely
gcloud compute instances stop your-vm-name --zone=your-zone
```

### Delete Firewall Rule
```bash
gcloud compute firewall-rules delete allow-vibe-coach
```

---

## 🔧 USEFUL COMMANDS

### Check App Status
```bash
pm2 status
pm2 logs vibe-coach
```

### Restart App
```bash
pm2 restart vibe-coach
```

### Update App
```bash
# Upload new code
gcloud compute scp --recurse . your-vm-name:~/vibe-coach --zone=your-zone

# SSH and restart
gcloud compute ssh your-vm-name --zone=your-zone
cd ~/vibe-coach
npm install
npm run build
pm2 restart vibe-coach
```

---

## 💰 COST
- **VM**: Whatever you're already paying
- **App**: $0 additional cost
- **Total**: Just your existing VM cost

---

## 🎯 QUICK SUMMARY
1. Upload code to VM
2. Install Node.js and dependencies
3. Set environment variables
4. Build and start with PM2
5. Open firewall port 3000
6. Access at `http://YOUR-VM-IP:3000`

**That's it! Your app is running on Google Cloud!** 🚀
