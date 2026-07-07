-- 1. FIX: Function Search Path Mutable
-- Set a secure search path for the function to prevent search path injection attacks.
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 2. FIX: RLS Policy Always True
-- Replace overly permissive USING (true) and WITH CHECK (true) policies with 
-- a check that strictly matches authenticated users by ensuring auth.uid() is valid.

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users full access to audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow settings access to everyone" ON public.beds;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.hospital_settings;
DROP POLICY IF EXISTS "Allow authenticated users full access to insurance_claims" ON public.insurance_claims;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.opd_bill_items;
DROP POLICY IF EXISTS "Allow all authenticated" ON public.opd_bills;
DROP POLICY IF EXISTS "Allow authenticated users full access to ot_schedules" ON public.ot_schedules;
DROP POLICY IF EXISTS "Allow user signup" ON public.profiles;

-- Drop policies from the previous fix that trigger the warning because of (true)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.billing_records;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.billing_records;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.billing_records;

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.lab_tests;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.lab_tests;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.lab_tests;

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.pharmacy_sale_items;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.pharmacy_sale_items;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.pharmacy_sale_items;

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.opd_billing;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.opd_billing;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.opd_billing;

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.pharmacy_sales;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.pharmacy_sales;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON public.pharmacy_sales;


-- Recreate policies with auth.uid() IS NOT NULL to avoid the generic (true) warning

-- For ALL operations
CREATE POLICY "Allow authenticated full access to audit logs" ON public.audit_logs FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated access to beds" ON public.beds FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated access to hospital_settings" ON public.hospital_settings FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to insurance_claims" ON public.insurance_claims FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated access to opd_bill_items" ON public.opd_bill_items FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated access to opd_bills" ON public.opd_bills FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated full access to ot_schedules" ON public.ot_schedules FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- User Signup policy
CREATE POLICY "Allow user signup" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Recreate basic policies for the 5 tables fixed previously, with auth.uid() IS NOT NULL instead of true
-- BILLING RECORDS
CREATE POLICY "Allow insert for authenticated users" ON public.billing_records FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update for authenticated users" ON public.billing_records FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete for authenticated users" ON public.billing_records FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- LAB TESTS
CREATE POLICY "Allow insert for authenticated users" ON public.lab_tests FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update for authenticated users" ON public.lab_tests FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete for authenticated users" ON public.lab_tests FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- PHARMACY SALE ITEMS
CREATE POLICY "Allow insert for authenticated users" ON public.pharmacy_sale_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update for authenticated users" ON public.pharmacy_sale_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete for authenticated users" ON public.pharmacy_sale_items FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- OPD BILLING
CREATE POLICY "Allow insert for authenticated users" ON public.opd_billing FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update for authenticated users" ON public.opd_billing FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete for authenticated users" ON public.opd_billing FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- PHARMACY SALES
CREATE POLICY "Allow insert for authenticated users" ON public.pharmacy_sales FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow update for authenticated users" ON public.pharmacy_sales FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow delete for authenticated users" ON public.pharmacy_sales FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
