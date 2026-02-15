import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="min-h-screen bg-surface-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
            <main className="pb-28 safe-bottom">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
