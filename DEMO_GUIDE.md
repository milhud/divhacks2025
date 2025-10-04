# Vibe Coach - Demo Guide for Judges

## 🎯 **Complete Demo System Ready for Presentation**

This guide will help you demonstrate the full Vibe Coach platform to judges, showcasing both user and provider experiences with working functionality.

---

## 🚀 **Quick Setup (5 minutes)**

### 1. **Database Setup**
```bash
# Run the complete schema with demo data
# Copy and paste the contents of supabase/schema.sql into your Supabase SQL editor
# This will create all tables and populate with demo data
```

### 2. **Python Backend Setup**
```bash
# Windows
setup-python-demo.bat

# Or manually:
python -m venv venv
venv\Scripts\activate.bat
pip install -r python\requirements.txt
```

### 3. **Start the Application**
```bash
npm run dev
# Open http://localhost:3000
```

---

## 👥 **Demo Accounts**

### **Provider Account**
- **Email:** `sarah.wilson@demorehab.com`
- **Password:** `DemoProvider123!`
- **Access:** Provider Dashboard with full patient management

### **User Accounts**
- **Email:** `john.smith@email.com` / **Password:** `DemoUser123!`
- **Email:** `sarah.johnson@email.com` / **Password:** `DemoUser123!`
- **Email:** `mike.davis@email.com` / **Password:** `DemoUser123!`

### **Provider Code**
- **Code:** `DEMO001` (for user signup to join provider's patient program)

---

## 🎬 **Demo Script for Judges**

### **Part 1: User Experience (3 minutes)**

#### **1.1 User Sign Up with Provider Code**
1. Go to homepage: `http://localhost:3000`
2. Click "User Sign In" → "Don't have an account? Sign up"
3. Fill out form:
   - **Name:** Demo User
   - **Email:** demo@example.com
   - **Password:** DemoUser123!
   - **Provider Code:** DEMO001
4. Click "Create Account"
5. **Show:** Success message and automatic provider connection

#### **1.2 Video Upload & Analysis**
1. On homepage, select "Upload Video" mode
2. Upload a workout video (or use demo video)
3. **Show:** AI analysis with form score, pain level, compensations
4. **Highlight:** Detailed feedback and movement analysis

#### **1.3 Live Camera Feed**
1. Switch to "Live Camera Feed" mode
2. Click "Start Camera" (allow camera access)
3. **Show:** Real-time AI analysis with live feedback
4. **Demonstrate:** Pain level input and exercise counting
5. **Highlight:** Immediate corrections and recommendations

#### **1.4 Pain Assessment**
1. Switch to "Pain Assessment" mode
2. **Show:** Comprehensive pain input system
3. **Demonstrate:** Body part selection, pain triggers, movement hurt tracking
4. **Highlight:** Detailed pain data collection for providers

### **Part 2: Provider Experience (4 minutes)**

#### **2.1 Provider Login**
1. Click "Provider Sign In" on homepage
2. Login with: `sarah.wilson@demorehab.com` / `DemoProvider123!`
3. **Show:** Complete provider dashboard

#### **2.2 Patient Management**
1. Go to "Patients" tab
2. **Show:** 3 demo patients with progress bars and pain levels
3. **Demonstrate:** Patient code system
   - Enter "DEMO001" in any patient's code input
   - **Show:** Progress updates in real-time
4. **Highlight:** Patient progress tracking and status management

#### **2.3 Exercise Prescription**
1. Go to "Exercise Library" tab
2. **Show:** 4 rehabilitation exercises with detailed instructions
3. **Demonstrate:** Exercise assignment
   - Select a patient first
   - Click "Assign to Patient" on any exercise
   - **Show:** Success message and patient updates

#### **2.4 Live Patient Monitoring**
1. Go to "Live Monitoring" tab
2. Select a patient from dropdown
3. **Show:** Pain input system for providers
4. **Demonstrate:** Live camera feed monitoring
   - Start camera feed
   - **Show:** Real-time patient exercise analysis
   - **Highlight:** Provider can see patient's live session

#### **2.5 Reports & Analytics**
1. Go to "Reports" tab
2. **Show:** Key metrics dashboard
   - Active patients count
   - Average progress percentage
   - Average pain levels
3. **Show:** Recent activity feed
4. **Highlight:** Comprehensive analytics for healthcare providers

### **Part 3: Technical Features (2 minutes)**

#### **3.1 Python Backend Integration**
1. **Show:** Live camera feed sending data to Python backend
2. **Demonstrate:** Real-time pose detection and analysis
3. **Highlight:** Advanced AI movement analysis

#### **3.2 Database Integration**
1. **Show:** All data persisting in Supabase
2. **Demonstrate:** Real-time updates across user/provider views
3. **Highlight:** HIPAA-compliant data structure

#### **3.3 Pricing & Business Model**
1. Go to "Pricing" page
2. **Show:** 4-tier pricing structure
3. **Highlight:** Affordable pricing vs competitors
4. **Demonstrate:** Clear value proposition for different user types

---

## 🔥 **Key Features to Highlight**

### **For Judges - Technical Innovation**
- **Real-time AI Analysis:** Live camera feed with Python backend
- **Dual Platform:** Separate user and provider experiences
- **Working Buttons:** All functionality actually works
- **Data Persistence:** Real database integration with Supabase
- **Pain Integration:** Comprehensive pain assessment system

### **For Judges - Business Value**
- **Affordable Pricing:** $29-499/month vs competitors at $200-800/month
- **Provider Focus:** Complete healthcare provider management system
- **Patient Engagement:** Real-time monitoring and feedback
- **Scalable Architecture:** Built for enterprise healthcare systems

### **For Judges - User Experience**
- **Seamless Integration:** All features work together
- **Mobile-First:** Optimized for phone cameras
- **Real-Time Feedback:** Immediate corrections and guidance
- **Provider-Patient Connection:** Direct communication and monitoring

---

## 🎯 **Demo Success Tips**

### **Before the Demo**
1. **Test Everything:** Make sure all buttons work
2. **Prepare Videos:** Have sample workout videos ready
3. **Check Camera:** Ensure camera access works
4. **Verify Data:** Confirm demo data is loaded

### **During the Demo**
1. **Start with User Experience:** Show the consumer-facing features first
2. **Highlight Real-Time:** Emphasize the live camera feed and instant feedback
3. **Show Provider Value:** Demonstrate the healthcare provider dashboard
4. **Emphasize Affordability:** Compare pricing to competitors
5. **Demonstrate Working Features:** Click buttons, show real updates

### **Key Talking Points**
- **"This is a complete rehabilitation platform, not just a fitness app"**
- **"We're 60% cheaper than competitors like Hinge Health"**
- **"Real-time AI analysis with Python backend for accurate movement detection"**
- **"Complete provider dashboard for healthcare professionals"**
- **"Live patient monitoring with pain assessment integration"**

---

## 🚨 **Troubleshooting**

### **If Camera Doesn't Work**
- Check browser permissions
- Try different browser (Chrome recommended)
- Use HTTPS if possible

### **If Python Backend Fails**
- Check if virtual environment is activated
- Verify Python dependencies are installed
- Fallback to mock analysis (built-in)

### **If Database Issues**
- Verify Supabase connection
- Check environment variables
- Re-run schema.sql if needed

---

## 📊 **Demo Data Overview**

### **Provider Profile**
- **Name:** Dr. Sarah Wilson, PT
- **Clinic:** Demo Rehabilitation Clinic
- **Specialization:** Orthopedic Physical Therapy
- **Patients:** 3 active patients

### **Patient Data**
- **John Smith:** Lower back pain, 75% progress, Pain level 3/10
- **Sarah Johnson:** Knee rehabilitation, 60% progress, Pain level 2/10
- **Mike Davis:** Shoulder impingement, 40% progress, Pain level 5/10

### **Exercise Library**
- **Quad Sets:** Knee rehabilitation
- **Straight Leg Raises:** Hip and quad strengthening
- **Wall Slides:** Shoulder mobility
- **Cat-Cow Stretch:** Spinal mobility

---

## 🎉 **Ready to Demo!**

The Vibe Coach platform is now fully functional with:
- ✅ Working user and provider logins
- ✅ Real-time camera feed with Python backend
- ✅ Complete provider dashboard with working buttons
- ✅ Pain assessment and movement tracking
- ✅ Provider code system for patient enrollment
- ✅ Database integration with demo data
- ✅ Affordable pricing structure

**Good luck with your presentation!** 🚀
