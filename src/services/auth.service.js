import { supabase } from './supabase';

const isSupabaseConfigured = () => {
    return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};

export async function sendOTP(phone) {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Using MOCK OTP service.');
        // Mock success response
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('MOCK OTP: 123456 for', phone);
                resolve({ success: true, expiresAt: new Date(Date.now() + 300000).toISOString() });
            }, 1000);
        });
    }

    try {
        // Call Supabase function to generate OTP
        const { data, error } = await supabase.rpc('generate_otp', {
            p_phone: phone
        });

        if (error) throw error;

        // In production, send OTP via SMS API (Twilio, etc.)
        // For development, just return it
        if (data && data[0]) {
            console.log('OTP:', data[0].res_otp_code); // Remove in production!
            return { success: true, expiresAt: data[0].res_expires_at };
        }

        throw new Error("No data returned from generate_otp");

    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
}

export async function verifyOTP(phone, otp) {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Using MOCK Verification.');
        if (otp === '123456') {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        citizen: {
                            id: 'mock-citizen-id',
                            name: 'Demo Citizen',
                            phone: phone,
                            role: 'citizen',
                            created_at: new Date().toISOString()
                        }
                    });
                }, 1000);
            });
        }
        throw new Error('Invalid OTP (Use 123456 for demo)');
    }

    try {
        const { data, error } = await supabase.rpc('verify_otp', {
            p_phone: phone,
            p_otp: otp
        });

        if (error) throw error;

        const result = data[0];

        if (!result.res_is_valid) {
            throw new Error('Invalid or expired OTP');
        }

        // Get citizen profile
        const { data: citizen, error: profileError } = await supabase
            .from('citizens')
            .select('*')
            .eq('id', result.res_citizen_id)
            .single();

        if (profileError) throw profileError;

        return { citizen };
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
}
