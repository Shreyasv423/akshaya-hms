-- Enable Row Level Security (RLS) for the reported tables
ALTER TABLE public.billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opd_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_sales ENABLE ROW LEVEL SECURITY;

-- Disable public access by strictly granting access to authenticated users only.
-- The following policies ensure only logged-in users of your application can perform CRUD operations.

-- 1. Create SELECT policies
CREATE POLICY "Allow select for authenticated users" ON public.billing_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow select for authenticated users" ON public.lab_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow select for authenticated users" ON public.pharmacy_sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow select for authenticated users" ON public.opd_billing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow select for authenticated users" ON public.pharmacy_sales FOR SELECT TO authenticated USING (true);

-- 2. Create INSERT policies
CREATE POLICY "Allow insert for authenticated users" ON public.billing_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for authenticated users" ON public.lab_tests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for authenticated users" ON public.pharmacy_sale_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for authenticated users" ON public.opd_billing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow insert for authenticated users" ON public.pharmacy_sales FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Create UPDATE policies
CREATE POLICY "Allow update for authenticated users" ON public.billing_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow update for authenticated users" ON public.lab_tests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow update for authenticated users" ON public.pharmacy_sale_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow update for authenticated users" ON public.opd_billing FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow update for authenticated users" ON public.pharmacy_sales FOR UPDATE TO authenticated USING (true);

-- 4. Create DELETE policies
CREATE POLICY "Allow delete for authenticated users" ON public.billing_records FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.lab_tests FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.pharmacy_sale_items FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.opd_billing FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON public.pharmacy_sales FOR DELETE TO authenticated USING (true);
