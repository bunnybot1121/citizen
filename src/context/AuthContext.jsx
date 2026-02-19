import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [citizen, setCitizen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session from localStorage
        const storedCitizen = localStorage.getItem('nagarsevak_citizen');
        if (storedCitizen) {
            try {
                const parsed = JSON.parse(storedCitizen);
                if (parsed && parsed.id) {
                    setCitizen(parsed);
                } else {
                    localStorage.removeItem('nagarsevak_citizen');
                }
            } catch (e) {
                console.error('Failed to parse stored user', e);
                localStorage.removeItem('nagarsevak_citizen');
            }
        }
        setLoading(false);
    }, []);

    const login = async (user) => {
        setCitizen(user);
        try {
            localStorage.setItem('nagarsevak_citizen', JSON.stringify(user));
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
    };

    // Auto-creates a real citizen row in Supabase so citizen_id is always a valid UUID
    const loginDemo = async () => {
        try {
            const DEMO_PHONE = '0000000000';

            // Upsert the demo citizen — returns the real UUID every time
            const { data, error } = await supabase
                .from('citizens')
                .upsert(
                    { phone: DEMO_PHONE, name: 'Demo Citizen', role: 'citizen' },
                    { onConflict: 'phone' }
                )
                .select()
                .single();

            if (error) throw error;
            await login(data);
        } catch (err) {
            console.error('Demo login failed, falling back to local demo:', err);
            // Fallback: submissions will have citizen_id = null
            await login({
                id: null,
                name: 'Demo Citizen',
                phone: '0000000000',
                role: 'citizen',
                created_at: new Date().toISOString()
            });
        }
    };

    const logout = () => {
        setCitizen(null);
        try {
            localStorage.removeItem('nagarsevak_citizen');
        } catch (e) {
            console.error('Failed to remove from localStorage', e);
        }
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ citizen, login, logout, loginDemo, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
