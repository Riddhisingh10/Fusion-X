-- Migration: Create wallet and related tables for Smart Campus RFID Ecosystem

-- 1. Wallets table: stores each student's wallet balance
CREATE TABLE IF NOT EXISTS public.wallets (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Wallet transactions table: logs every debit/credit
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.wallets(student_id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RFID scans table: each scan event for location tracking and payments
CREATE TABLE IF NOT EXISTS public.rfid_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('payment', 'attendance', 'location')),
    metadata JSONB
);

-- 4. Borrowed items table (books & equipment)
CREATE TABLE IF NOT EXISTS public.borrowed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,                     -- references a library book or equipment record
    item_type TEXT NOT NULL CHECK (item_type IN ('book', 'equipment')),
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    due_date DATE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue'))
);

-- 5. Indexes for quick look‑ups
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_student ON public.wallet_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_rfid_scans_student ON public.rfid_scans(student_id);
CREATE INDEX IF NOT EXISTS idx_borrowed_items_student ON public.borrowed_items(student_id);

-- ------------------------------------------------------------
-- Row Level Security (RLS) policies – students can only see/modify their own rows
-- ------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfid_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowed_items ENABLE ROW LEVEL SECURITY;

-- Helper function: is_student (used in policies)
CREATE OR REPLACE FUNCTION public.is_student() RETURNS boolean SECURITY DEFINER AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.wallets WHERE student_id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- Wallets policies
DROP POLICY IF EXISTS select_own_wallet ON public.wallets;
CREATE POLICY select_own_wallet ON public.wallets FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS update_own_wallet ON public.wallets;
CREATE POLICY update_own_wallet ON public.wallets FOR UPDATE USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Wallet transactions policies (read‑only for owner, admin can see all)
DROP POLICY IF EXISTS select_own_tx ON public.wallet_transactions;
CREATE POLICY select_own_tx ON public.wallet_transactions FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS admin_select_tx ON public.wallet_transactions;
CREATE POLICY admin_select_tx ON public.wallet_transactions FOR SELECT USING (public.is_admin());

-- RFID scans policies (owner can read/write own scans; teachers can read all for location tracking)
DROP POLICY IF EXISTS select_own_scan ON public.rfid_scans;
CREATE POLICY select_own_scan ON public.rfid_scans FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS insert_own_scan ON public.rfid_scans;
CREATE POLICY insert_own_scan ON public.rfid_scans FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS teacher_read_all_scans ON public.rfid_scans;
CREATE POLICY teacher_read_all_scans ON public.rfid_scans FOR SELECT USING (public.is_teacher() OR public.is_admin());

-- Borrowed items policies (owner can manage own borrows, admin can manage all)
DROP POLICY IF EXISTS select_own_borrow ON public.borrowed_items;
CREATE POLICY select_own_borrow ON public.borrowed_items FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS insert_own_borrow ON public.borrowed_items;
CREATE POLICY insert_own_borrow ON public.borrowed_items FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS update_own_borrow ON public.borrowed_items;
CREATE POLICY update_own_borrow ON public.borrowed_items FOR UPDATE USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS admin_manage_borrow ON public.borrowed_items;
CREATE POLICY admin_manage_borrow ON public.borrowed_items FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------
-- Stored procedures for core business logic
-- ------------------------------------------------------------

-- Process RFID payment (deduct from wallet, log transaction & scan)
CREATE OR REPLACE FUNCTION public.process_rfid_payment(p_student_id UUID, p_amount NUMERIC, p_location TEXT) RETURNS VOID AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    -- Acquire row lock on wallet
    SELECT balance INTO v_balance FROM public.wallets WHERE student_id = p_student_id FOR UPDATE;
    IF v_balance IS NULL THEN
        RAISE EXCEPTION 'Wallet not found for student %', p_student_id;
    END IF;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance (%.2f) for payment of %.2f', v_balance, p_amount;
    END IF;
    -- Update wallet balance
    UPDATE public.wallets SET balance = balance - p_amount, updated_at = timezone('utc'::text, now()) WHERE student_id = p_student_id;
    -- Log transaction
    INSERT INTO public.wallet_transactions(student_id, amount, transaction_type, description)
    VALUES (p_student_id, p_amount, 'debit', CONCAT('RFID payment at ', p_location));
    -- Log scan event
    INSERT INTO public.rfid_scans(student_id, location, event_type, metadata)
    VALUES (p_student_id, p_location, 'payment', jsonb_build_object('amount', p_amount));
END;
$$ LANGUAGE plpgsql;

-- Recharge wallet (credit)
CREATE OR REPLACE FUNCTION public.recharge_wallet(p_student_id UUID, p_amount NUMERIC, p_source TEXT) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.wallets(student_id, balance) VALUES (p_student_id, p_amount)
    ON CONFLICT (student_id) DO UPDATE SET balance = public.wallets.balance + EXCLUDED.balance, updated_at = timezone('utc'::text, now());
    INSERT INTO public.wallet_transactions(student_id, amount, transaction_type, description)
    VALUES (p_student_id, p_amount, 'credit', CONCAT('Wallet recharge via ', p_source));
END;
$$ LANGUAGE plpgsql;

-- Borrow item (book or equipment)
CREATE OR REPLACE FUNCTION public.borrow_item(p_student_id UUID, p_item_id UUID, p_item_type TEXT, p_due_date DATE) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.borrowed_items(student_id, item_id, item_type, due_date)
    VALUES (p_student_id, p_item_id, p_item_type, p_due_date);
    -- Also log a scan for location tracking (optional)
    INSERT INTO public.rfid_scans(student_id, location, event_type, metadata)
    VALUES (p_student_id, 'Library', 'borrow', jsonb_build_object('item_id', p_item_id, 'type', p_item_type));
END;
$$ LANGUAGE plpgsql;

-- Return borrowed item
CREATE OR REPLACE FUNCTION public.return_borrowed_item(p_borrow_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE public.borrowed_items
    SET status = 'returned', returned_at = timezone('utc'::text, now())
    WHERE id = p_borrow_id;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- End of migration
-- ------------------------------------------------------------
