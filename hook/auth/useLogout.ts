'use client';
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth/authService';

export function useLogout() {
    const router = useRouter();

    return () => {
        // Use the logout function from authService
        // This clears sessionStorage and stops monitoring
        logout();

        // Redirect to login
        router.push('/auth/login');
    };
}
// 'use client';
// import { useRouter } from 'next/navigation';

// export function useLogout() {
//     const router = useRouter();

//     return () => {
//         // Clear localStorage
//         localStorage.removeItem('user_id');
//         localStorage.removeItem('encrypted_user');
//         localStorage.removeItem('userToken');
//         // localStorage.removeItem('x-encrypted-key');s

//         // Redirect to login
//         router.push('/auth/login');
//     };
// }
