import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [citizen, setCitizen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session (simple implementation)
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
                console.error("Failed to parse stored user", e);
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
            console.error("Failed to save to localStorage", e);
        }
    };

    const loginDemo = () => {
        const demoUser = {
            id: 'demo-citizen-id',
            name: 'Demo Citizen',
            phone: '9999999999',
            role: 'citizen',
            created_at: new Date().toISOString()
        };
        login(demoUser);
    };

    const logout = () => {
        setCitizen(null);
        try {
            localStorage.removeItem('nagarsevak_citizen');
        } catch (e) {
            console.error("Failed to remove from localStorage", e);
        }
        // Force reload to clear any component state
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
