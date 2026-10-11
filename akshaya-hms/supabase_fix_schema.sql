-- ==============================================================================
-- 🏥 Akshaya HMS — Complete Database Fix & Seeding SQL Script
-- Run this in the Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1️⃣ Enable / Fix Hospital Settings Columns
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_name TEXT DEFAULT 'Akshaya Hospital',
    address TEXT DEFAULT 'Main Road, Bengaluru',
    phone TEXT DEFAULT '+91 98765 43210',
    website TEXT DEFAULT 'https://akshayahospital.in',
    consultation_fee NUMERIC DEFAULT 500,
    gst_percent NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    bed_charges JSONB DEFAULT '{"General Ward": 800, "Semi-Private": 1500, "Private": 3000, "ICU": 5000}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing hospital_settings table if it was created previously
DO $$
BEGIN
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS hospital_name TEXT DEFAULT 'Akshaya Hospital';
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Main Road, Bengaluru';
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '+91 98765 43210';
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS website TEXT DEFAULT 'https://akshayahospital.in';
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS gst_percent NUMERIC DEFAULT 0;
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
    ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS bed_charges JSONB DEFAULT '{"General Ward": 800, "Semi-Private": 1500, "Private": 3000, "ICU": 5000}'::jsonb;
    
    -- Ensure patients table has uhid column and index for fast lookup
    ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS uhid TEXT;
    CREATE INDEX IF NOT EXISTS idx_patients_uhid ON public.patients (uhid);
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 2️⃣ Seed 25 Hospital Beds (General, Semi-Private, Private, ICU)
CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bed_number TEXT NOT NULL UNIQUE,
    ward TEXT NOT NULL,
    is_occupied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.beds (bed_number, ward, is_occupied) VALUES
('G-1', 'General Ward', false),
('G-2', 'General Ward', false),
('G-3', 'General Ward', false),
('G-4', 'General Ward', false),
('G-5', 'General Ward', false),
('G-6', 'General Ward', false),
('G-7', 'General Ward', false),
('G-8', 'General Ward', false),
('G-9', 'General Ward', false),
('G-10', 'General Ward', false),
('SP-1', 'Semi-Private', false),
('SP-2', 'Semi-Private', false),
('SP-3', 'Semi-Private', false),
('SP-4', 'Semi-Private', false),
('SP-5', 'Semi-Private', false),
('P-1', 'Private', false),
('P-2', 'Private', false),
('P-3', 'Private', false),
('P-4', 'Private', false),
('P-5', 'Private', false),
('ICU-1', 'ICU', false),
('ICU-2', 'ICU', false),
('ICU-3', 'ICU', false),
('ICU-4', 'ICU', false),
('ICU-5', 'ICU', false)
ON CONFLICT (bed_number) DO NOTHING;

-- 3️⃣ Ensure Audit Logs Table Exists
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- 4️⃣ Row Level Security (RLS) Permissive Policies for Hospital Operations
-- Enables authenticated users and front-desk clients to read/update hospital records
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow all bed operations" ON public.beds;
    CREATE POLICY "Allow all bed operations" ON public.beds FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all hospital_settings operations" ON public.hospital_settings;
    CREATE POLICY "Allow all hospital_settings operations" ON public.hospital_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all audit_logs operations" ON public.audit_logs;
    CREATE POLICY "Allow all audit_logs operations" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
    WHEN others THEN NULL;
END $$;
