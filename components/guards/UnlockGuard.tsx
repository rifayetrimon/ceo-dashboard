'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSessionLocked, isLoggedIn } from '@/services/auth/authService';

type Props = {
    children: React.ReactNode;
};

const UnlockGuard = ({ children }: Props) => {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const checkSession = () => {
            const sessionLocked = isSessionLocked();
            const loggedIn = isLoggedIn();

            console.log('🔓 UnlockGuard check:', {
                sessionLocked,
                loggedIn
            });

            // If not logged in at all, redirect to login
            if (!loggedIn) {
                console.log('❌ UnlockGuard: Not logged in, redirecting to login');
                router.replace('/auth/login');
                return;
            }

            // If session is not locked, redirect to home
            if (!sessionLocked) {
                console.log('✅ UnlockGuard: Session not locked, redirecting to home');
                router.replace('/');
                return;
            }

            // Session is locked and user is logged in - allow unlock page
            console.log('🔒 UnlockGuard: Session locked, showing unlock page');
            setIsAllowed(true);
        };

        checkSession();

        // Listen for session unlock event
        const handleSessionUnlocked = () => {
            console.log('🔓 [UnlockGuard] Session unlocked event received, redirecting to home');
            router.replace('/');
        };

        window.addEventListener('sessionUnlocked', handleSessionUnlocked);

        // Prevent back button navigation while locked
        const preventBack = () => {
            window.history.pushState(null, '', window.location.href);
        };

        // Push initial state
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', preventBack);

        return () => {
            window.removeEventListener('sessionUnlocked', handleSessionUnlocked);
            window.removeEventListener('popstate', preventBack);
        };
    }, [router]);

    if (!isAllowed) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying session...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default UnlockGuard;