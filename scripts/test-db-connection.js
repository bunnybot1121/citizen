import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
// Note: We can't use import.meta.env in node easily without setup, so we'll rely on hardcoded check or reading .env file manually if needed, 
// but for this script let's just use the values we know are in the file or pass them effectively.
// Actually, better to read the .env file.
import fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        // 1. Test basic connection (Read something built-in or public)
        console.log('1. Testing Public Connection...');
        const { data: health, error: healthError } = await supabase.from('citizens').select('count', { count: 'exact', head: true });

        if (healthError) {
            console.error('❌ Connection Failed:', healthError.message);
            // It might fail if table doesn't exist, which is also a valuable finding
            if (healthError.code === '42P01') {
                console.log('⚠️  Table "citizens" does not exist. SCHEMA IS MISSING.');
            }
        } else {
            console.log('✅ Connection Successful. "citizens" table exists.');
        }

        // 2. Test RPC (The Login Logic)
        console.log('\n2. Testing Login Logic (generate_otp RPC)...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('generate_otp', { p_phone: '9999999999' });

        if (rpcError) {
            console.error('❌ RPC Call Failed:', rpcError.message);
            if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
                console.error('🚨 CRITICAL: The "generate_otp" function is missing!');
                console.error('   You MUST run the "supabase_schema.sql" in your Supabase SQL Editor.');
            }
        } else {
            console.log('✅ RPC Function exists and works!');
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

testConnection();
