import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

export const AdminLayout: React.FC = () => {
    return (
        <div className="flex bg-[#050810] min-h-screen text-gray-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 md:pb-8">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    );
};
