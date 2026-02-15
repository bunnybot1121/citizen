import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="min-h-screen bg-warm-100 font-body text-slate-800 selection:bg-brand-200 selection:text-brand-900">
            <main className="pb-28 safe-bottom">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
}
