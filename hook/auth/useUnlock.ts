import { useMutation } from '@tanstack/react-query';
import { unlockSession } from '@/services/auth/authService';
import { useRouter } from 'next/navigation';

export const useUnlock = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (password: string) => unlockSession(password),
        onSuccess: (data) => {
            console.log('✅ Session unlocked successfully:', data);

            // The unlockSession function already dispatches 'sessionUnlocked' event
            // Now navigate to home page
            setTimeout(() => {
                router.replace('/');
            }, 100); // Small delay to ensure event is processed
        },
        onError: (error: any) => {
            console.error('❌ Unlock failed:', error.response?.data || error.message);
        },
    });
};