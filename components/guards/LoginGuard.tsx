'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSessionLocked } from '@/services/auth/authService';

type Props = {
    children: React.ReactNode;
};

const LoginGuard = ({ children }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        // DEV OVERRIDE: skip login check
        if (process.env.NEXT_PUBLIC_SKIP_LOGIN === 'true') {
            setIsAllowed(true);
            return;
        }

        // Don't check on auth pages or unlock page
        const isAuthPage = pathname?.startsWith('/auth/') || pathname === '/unlock';
        if (isAuthPage) {
            setIsAllowed(true);
            return;
        }

        // CRITICAL: Check if session is locked first
        const sessionLocked = isSessionLocked();
        if (sessionLocked) {
            console.log('🔒 LoginGuard: Session is LOCKED, redirecting to unlock');
            router.replace('/auth/unlock');
            return;
        }

        // Changed from localStorage to sessionStorage
        const token = sessionStorage.getItem('userToken');

        console.log('🛡️ LoginGuard check:', {
            pathname,
            hasToken: !!token,
            isAuthPage,
            sessionLocked
        });

        if (!token) {
            console.log('❌ LoginGuard: No token, redirecting to login');
            router.replace('/auth/login');
        } else {
            console.log('✅ LoginGuard: Token found, allowing access');
            setIsAllowed(true);
        }
    }, [router, pathname]);

    if (!isAllowed) {
        console.log('🚫 LoginGuard: Blocking render');
        return null;
    }

    return <>{children}</>;
};

export default LoginGuard;