'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useUnlock } from '@/hook/auth/useUnlock';

interface Props {
    onError?: (msg: string) => void;
}

const ComponentsAuthUnlockForm = ({ onError }: Props) => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const { mutate: unlock, isPending } = useUnlock();

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('🔐 Attempting to unlock with password...');

        unlock(password, {
            onSuccess: () => {
                console.log('✅ Unlock successful, navigating to home...');
                // The useUnlock hook will handle navigation
            },
            onError: (error: any) => {
                console.error('❌ Unlock failed:', error);
                const errorMessage = error?.response?.data?.message || error?.message || 'Incorrect password. Please try again.';
                if (onError) {
                    onError(errorMessage);
                }
            }
        });
    };

    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="Password" className="dark:text-white">
                    Password
                </label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isPending}
                        autoFocus
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <button
                type="submit"
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending || !password}
            >
                {isPending ? (
                    <span className="flex items-center justify-center">
                        <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        UNLOCKING...
                    </span>
                ) : (
                    'UNLOCK'
                )}
            </button>
        </form>
    );
};

export default ComponentsAuthUnlockForm;