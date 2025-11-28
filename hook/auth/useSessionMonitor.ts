'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSessionLocked, isLoggedIn, startInactivityMonitoring, checkInactivity } from '@/services/auth/authService';

export const useSessionMonitor = () => {
    const [locked, setLocked] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't monitor on auth pages (except unlock)
        const isAuthPage = pathname?.startsWith('/auth') && pathname !== '/auth/unlock';

        if (isAuthPage) {
            console.log('🔍 SessionMonitor: On auth page, skipping');
            return;
        }

        console.log('🔍 SessionMonitor: Starting check for:', pathname);

        // CRITICAL: Check IMMEDIATELY when component mounts
        checkInactivity();

        // Check if session is locked AFTER checking inactivity
        const sessionLocked = isSessionLocked();
        const loggedIn = isLoggedIn();

        console.log('📊 Session Status:', {
            pathname,
            loggedIn,
            sessionLocked,
            userToken: !!sessionStorage.getItem('userToken'),
            username: sessionStorage.getItem('username')
        });

        // If not logged in, redirect to login
        if (!loggedIn) {
            console.log('❌ Not logged in, redirecting to login...');
            router.replace('/auth/login');
            return;
        }

        // If session is locked and not on unlock page, force redirect
        if (sessionLocked && pathname !== '/auth/unlock') {
            console.log('🔒 Session is LOCKED, forcing redirect to unlock page');
            setLocked(true);
            router.replace('/auth/unlock');
            return;
        }

        // If on unlock page and session is NOT locked, redirect to home
        if (pathname === '/auth/unlock' && !sessionLocked) {
            console.log('✅ Session is unlocked, redirecting to home page');
            setLocked(false);
            router.replace('/');
            return;
        }

        console.log('✅ Session is valid, starting monitoring');
        setLocked(false);

        // Start monitoring if logged in and not locked
        if (loggedIn && !sessionLocked) {
            startInactivityMonitoring();
        }

        // Listen for lock events
        const handleSessionLocked = () => {
            console.log('🔒 [EVENT] Session locked due to inactivity');
            setLocked(true);
            router.replace('/auth/unlock');
        };

        const handleSessionUnlocked = () => {
            console.log('🔓 [EVENT] Session unlocked successfully');
            setLocked(false);
            router.replace('/');
        };

        const handleUserLoggedOut = () => {
            console.log('👋 [EVENT] User logged out');
            router.replace('/auth/login');
        };

        window.addEventListener('sessionLocked', handleSessionLocked);
        window.addEventListener('sessionUnlocked', handleSessionUnlocked);
        window.addEventListener('userLoggedOut', handleUserLoggedOut);

        return () => {
            window.removeEventListener('sessionLocked', handleSessionLocked);
            window.removeEventListener('sessionUnlocked', handleSessionUnlocked);
            window.removeEventListener('userLoggedOut', handleUserLoggedOut);
        };
    }, [router, pathname]);

    return { locked };
};