-- Seed Provider System Test Data
-- Run this in your Supabase SQL editor to create test data

-- Step 1: Create a test provider profile
-- First, you need to create a user in Supabase Auth, then use that UUID
-- For now, we'll create a provider with a placeholder UUID
-- Replace 'YOUR-USER-UUID-HERE' with an actual auth user ID

-- Example provider (you'll need to replace the UUID)
INSERT INTO providers (id, profile_id, license_number, specialization, years_experience, is_verified)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,  -- Provider ID (use this in API tests)
    NULL,  -- Replace with your actual auth user UUID after creating a user
    'PT-12345',
    'Physical Therapy',
    5,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create test patient profiles
-- Again, these should reference real auth users
-- For testing, we'll create placeholder data

-- You need to:
-- 1. Create 3 users in Supabase Auth (via your app signup or Auth dashboard)
-- 2. Get their UUIDs
-- 3. Replace the UUIDs below

-- Example test patients (replace with real auth user UUIDs)
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES 
--   ('YOUR-PATIENT-1-UUID'::uuid, 'john.smith@test.com', 'John Smith', 'patient'),
--   ('YOUR-PATIENT-2-UUID'::uuid, 'sarah.johnson@test.com', 'Sarah Johnson', 'patient'),
--   ('YOUR-PATIENT-3-UUID'::uuid, 'mike.davis@test.com', 'Mike Davis', 'patient');

-- Step 3: Create patient-provider relationships
-- Link patients to the provider
-- INSERT INTO patient_provider_relationships (patient_id, provider_id, status, notes)
-- VALUES 
--   ('YOUR-PATIENT-1-UUID'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'active', 'Lower back pain'),
--   ('YOUR-PATIENT-2-UUID'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'active', 'Knee rehabilitation'),
--   ('YOUR-PATIENT-3-UUID'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'active', 'Shoulder impingement');

-- To use this script:
-- 1. Sign up 3 test users in your app (or via Supabase Auth)
-- 2. Get their UUIDs from the auth.users table
-- 3. Replace the UUIDs above
-- 4. Run this SQL in Supabase SQL Editor
-- 5. Test the API with providerId: 550e8400-e29b-41d4-a716-446655440001

-- Quick query to check if it worked:
-- SELECT 
--   r.*,
--   p.full_name as patient_name,
--   p.email as patient_email
-- FROM patient_provider_relationships r
-- JOIN profiles p ON p.id = r.patient_id
-- WHERE r.provider_id = '550e8400-e29b-41d4-a716-446655440001'::uuid;
