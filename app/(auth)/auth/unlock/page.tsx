'use client';
import ComponentsAuthUnlockForm from '@/components/(auth)/components-auth-unlock-form';
import React from 'react';
import AuthLayout from '@/components/layouts/AuthLayout';
import Alert from '@/components/ui/alert';
import { useState } from 'react';
import { useProfile } from '@/hook/user/useProfile';
import Image from 'next/image';

const BoxedLockScreen = () => {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleError = (msg: string) => {
        setErrorMessage(msg);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
    };

    const { data } = useProfile();
    return (
        <AuthLayout showBackButton={false}>
            <div className="mx-auto w-full max-w-[440px]">
                {/* Alerts */}
                <div className="min-h-[56px] mb-5">
                    <Alert type="danger" message={errorMessage} show={showError} onClose={() => setShowError(false)} />
                </div>

                {/* User Profile */}
                <div className="mb-10 flex items-center">
                    <div className="flex h-16 w-16 items-end justify-center overflow-hidden rounded-full bg-[#00AB55] ltr:mr-4 rtl:ml-4">
                        <Image
                            src={data?.personal.file_profile_url || `/assets/images/auth/user.png`}
                            alt="Profile picture"
                            width={150}
                            height={150}
                            className="h-20 w-20 rounded-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-2xl dark:text-white">
                            {data?.name}
                        </h4>
                        <p className="text-white-dark">Enter your password to unlock your ID</p>
                    </div>
                </div>

                {/* Form */}
                <ComponentsAuthUnlockForm onError={handleError} />
            </div>
        </AuthLayout>
    );
};

export default BoxedLockScreen;