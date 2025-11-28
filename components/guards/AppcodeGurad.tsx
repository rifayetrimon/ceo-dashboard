'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Props = {
    children: React.ReactNode;
};

const AppCodeGuard = ({ children }: Props) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Changed from localStorage to sessionStorage
        const token = sessionStorage.getItem('x-encrypted-key');

        console.log('🔑 AppCodeGuard check:', {
            pathname,
            hasToken: !!token
        });

        // If NO token → only allow /auth/appcode
        if (!token && pathname !== '/auth/appcode') {
            console.log('❌ AppCodeGuard: No encrypted key, redirecting to appcode');
            router.replace('/auth/appcode');
            return;
        }

        console.log('✅ AppCodeGuard: Allowing access');
    }, [router, pathname]);

    // Prevent render while redirecting
    if (typeof window !== 'undefined') {
        // Changed from localStorage to sessionStorage
        const token = sessionStorage.getItem('x-encrypted-key');

        // No token, not on /auth/appcode → block rendering
        if (!token && pathname !== '/auth/appcode') {
            console.log('🚫 AppCodeGuard: Blocking render');
            return null;
        }
    }

    return <>{children}</>;
};

export default AppCodeGuard;