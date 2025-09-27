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

        const token = localStorage.getItem('x-encrypted-key');

        // If NO token → only allow /auth/appcode
        if (!token && pathname !== '/auth/appcode') {
            router.replace('/auth/appcode');
            return;
        }

        // ✅ Allow /auth/appcode even if token exists
    }, [router, pathname]);

    // Prevent render while redirecting
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('x-encrypted-key');

        // No token, not on /auth/appcode → block rendering
        if (!token && pathname !== '/auth/appcode') {
            return null;
        }
    }

    return <>{children}</>;
};

export default AppCodeGuard;
