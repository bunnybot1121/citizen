-- RUN THIS IN SUPABASE SQL EDITOR TO FIX "AMBIGUOUS COLUMN" ERROR

-- 2. Fix the Login Functions (Renaming output columns to avoid conflict)
CREATE OR REPLACE FUNCTION public.generate_otp(p_phone TEXT)
RETURNS TABLE (res_otp_code TEXT, res_expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_otp TEXT;
    v_expires_at TIMESTAMPTZ;
    v_citizen_id UUID;
BEGIN
    -- Check if citizen exists
    SELECT id INTO v_citizen_id FROM public.citizens WHERE phone = p_phone;
    
    IF v_citizen_id IS NULL THEN
        INSERT INTO public.citizens (phone, name, role)
        VALUES (p_phone, 'New Citizen', 'citizen')
        RETURNING id INTO v_citizen_id;
    END IF;

    -- Generate OTP
    v_otp := floor(random() * (999999 - 100000 + 1) + 100000)::text;
    v_expires_at := now() + interval '5 minutes';

    -- Invalidate old
    UPDATE public.otp_codes 
    SET is_used = true 
    WHERE citizen_id = v_citizen_id AND is_used = false;

    -- Insert new
    INSERT INTO public.otp_codes (citizen_id, code, expires_at)
    VALUES (v_citizen_id, v_otp, v_expires_at);

    RETURN QUERY SELECT v_otp, v_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_otp(p_phone TEXT, p_otp TEXT)
RETURNS TABLE (res_is_valid BOOLEAN, res_citizen_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_citizen_id UUID;
    v_record_id UUID;
BEGIN
    SELECT id INTO v_citizen_id FROM public.citizens WHERE phone = p_phone;
    
    IF v_citizen_id IS NULL THEN
        RETURN QUERY SELECT false, NULL::uuid;
        RETURN;
    END IF;

    SELECT id INTO v_record_id
    FROM public.otp_codes
    WHERE citizen_id = v_citizen_id 
    AND code = p_otp 
    AND is_used = false 
    AND expires_at > now()
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_record_id IS NOT NULL THEN
        UPDATE public.otp_codes SET is_used = true WHERE id = v_record_id;
        RETURN QUERY SELECT true, v_citizen_id;
    ELSE
        RETURN QUERY SELECT false, v_citizen_id;
    END IF;
END;
$$;
