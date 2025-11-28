'use client';
import ComponentResetPasswordForm from '@/components/(auth)/component-reset-password-form';
import AuthLayout from '@/components/layouts/AuthLayout';
import Alert from '@/components/ui/alert';
import { useState } from 'react';

export default function ResetPasswordPage() {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleError = (msg: string) => {
        setErrorMessage(msg);
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
    };

    return (
        <AuthLayout>
            <div className="mx-auto w-full max-w-[440px]">
                <div className="min-h-[56px] mb-5">
                    <Alert type="danger" message={errorMessage} show={showError} onClose={() => setShowError(false)} />
                </div>

                <div className="mb-7">
                    <h1 className="mb-3 text-2xl font-bold !leading-snug text-primary">Password Reset</h1>
                    <p>Enter your email or phone number to recover your account</p>
                </div>

                <ComponentResetPasswordForm onErrorMessage={handleError} />
            </div>
        </AuthLayout>
    );
}
