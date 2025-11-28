'use client';
import IconMail from '@/components/icon/icon-mail';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

type Props = {
    onErrorMessage?: (message: string) => void;
};

const ComponentResetPasswordForm = ({ onErrorMessage }: Props) => {
    const router = useRouter();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [isPending, setIsPending] = useState(false);

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailOrPhone.trim()) {
            onErrorMessage?.('Please enter your email or phone number');
            return;
        }

        setIsPending(true);
        // Simulate API call
        setTimeout(() => {
            setIsPending(false);
            router.push('/auth/otp');
        }, 1000);
    };

    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="Email" className="dark:text-white">
                    Email or Phone Number
                </label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        type="text"
                        placeholder="Enter Email or Phone Number"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        disabled={isPending}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <button type="submit" disabled={isPending} className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                {isPending ? 'PROCESSING...' : 'RECOVER'}
            </button>
        </form>
    );
};

export default ComponentResetPasswordForm;
