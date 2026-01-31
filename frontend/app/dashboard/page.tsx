'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">HMS</h1>
                    <p className="text-gray-500">Hospital Management System</p>
                </div>

                {/* Dashboard Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                    {/* Welcome Message */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome, {user.email.split('@')[0]}!
                    </h2>

                    {/* Role Badge */}
                    <div className="inline-block bg-gray-100 text-gray-900 px-4 py-1 rounded-lg text-sm font-medium mb-8">
                        {user.role}
                    </div>

                    {/* Email */}
                    <p className="text-gray-600 mb-8">
                        {user.email}
                    </p>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                    >
                        Logout
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2025 Hospital Management System</p>
                </div>
            </div>
        </div>
    );
}
