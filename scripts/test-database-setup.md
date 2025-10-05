# Test Database Setup Guide

## 🎯 Goal
Set up test data in Supabase to test the Provider API with real database

---

## 📋 Prerequisites
- Supabase project running
- Access to Supabase dashboard
- Your app can sign up users

---

## 🔧 Setup Steps

### Step 1: Create Test Provider User

1. **Sign up a provider account:**
   - Go to your app: `http://localhost:3000`
   - Click "Sign In" or "Sign Up"
   - Create account with:
     - Email: `provider@test.com`
     - Password: `Test123!`
   
2. **Get the provider's auth UUID:**
   - Go to Supabase Dashboard → Authentication → Users
   - Find `provider@test.com`
   - Copy their UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

3. **Create provider record:**
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO providers (id, profile_id, license_number, specialization, years_experience, is_verified)
   VALUES (
     gen_random_uuid(),  -- Generates a new provider ID
     'PASTE-AUTH-UUID-HERE'::uuid,  -- The UUID from step 2
     'PT-TEST-001',
     'Physical Therapy',
     5,
     true
   )
   RETURNING id;  -- Copy this provider_id for API testing!
   ```

### Step 2: Create Test Patient Users

1. **Sign up 3 patient accounts:**
   - Use incognito/private browsing or logout
   - Create 3 accounts:
     - `patient1@test.com` / `Test123!`
     - `patient2@test.com` / `Test123!`
     - `patient3@test.com` / `Test123!`

2. **Get patient UUIDs:**
   - Supabase Dashboard → Authentication → Users
   - Copy all 3 UUIDs

### Step 3: Create Patient-Provider Relationships

```sql
-- Run in Supabase SQL Editor
-- Replace UUIDs with your actual values

INSERT INTO patient_provider_relationships (
  patient_id, 
  provider_id, 
  status, 
  notes
)
VALUES 
  (
    'PATIENT-1-UUID'::uuid,  -- From Step 2
    'PROVIDER-ID'::uuid,     -- From Step 1 RETURNING id
    'active',
    'Lower back pain - post-surgery rehabilitation'
  ),
  (
    'PATIENT-2-UUID'::uuid,
    'PROVIDER-ID'::uuid,
    'active',
    'Knee rehabilitation - ACL recovery'
  ),
  (
    'PATIENT-3-UUID'::uuid,
    'PROVIDER-ID'::uuid,
    'active',
    'Shoulder impingement - rotator cuff strengthening'
  );
```

### Step 4: Verify Setup

```sql
-- Check patient-provider relationships
SELECT 
  r.id as relationship_id,
  r.status,
  r.notes,
  p.email as patient_email,
  p.full_name as patient_name
FROM patient_provider_relationships r
JOIN profiles p ON p.id = r.patient_id
WHERE r.provider_id = 'YOUR-PROVIDER-ID'::uuid;

-- Should return 3 rows
```

---

## 🧪 Test the API

### Option 1: Using Test Page
1. Go to: `http://localhost:3000/test-provider`
2. Switch to "Database Version" tab
3. Enter your `provider_id` from Step 1
4. Click "Test Database API"
5. Should see your 3 test patients!

### Option 2: Using cURL
```bash
curl "http://localhost:3000/api/providers/patients/db-version?providerId=YOUR-PROVIDER-ID"
```

---

## ✅ Expected Result

```json
{
  "success": true,
  "patients": [
    {
      "id": "uuid",
      "name": "Patient Name",
      "email": "patient1@test.com",
      "condition": "Lower back pain - post-surgery rehabilitation",
      "assignedExercises": [],
      "progress": 0,
      "painLevel": 0,
      "status": "active",
      "providerCode": "PRVABCD12"
    }
    // ... 2 more patients
  ],
  "source": "database"
}
```

---

## 🐛 Troubleshooting

### Error: "Provider not found"
- Make sure you inserted the provider record
- Verify the provider_id UUID is correct
- Check: `SELECT * FROM providers;`

### Error: "No patients found"
- Check relationships exist: `SELECT * FROM patient_provider_relationships;`
- Verify patient profiles exist: `SELECT * FROM profiles WHERE role = 'patient';`
- Make sure provider_id matches in relationships

### Empty patient names
- Profiles might not have `full_name` set
- Update: `UPDATE profiles SET full_name = 'Test Patient' WHERE id = 'UUID';`

---

## 🔐 Security Note

**These are TEST accounts only!**
- Use fake emails ending in `@test.com`
- Use simple test passwords
- Delete this data before production
- Never commit real user data to git

---

## 🎯 Next Steps After Setup Works

1. Test demo API vs database API
2. Verify both return patient data
3. Add more fields (exercises, progress)
4. Build POST endpoint to add patients
5. Build exercise assignment features

---

## 📝 Quick Reference

### Your Test Credentials

```
Provider:
- Email: provider@test.com
- Provider ID: _________________ (fill in after Step 1)

Patients:
1. patient1@test.com - UUID: _________________
2. patient2@test.com - UUID: _________________
3. patient3@test.com - UUID: _________________
```

Save these IDs for testing!
