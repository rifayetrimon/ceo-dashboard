// components/layouts/AuthLayout.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FaArrowLeftLong } from 'react-icons/fa6';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
    children: React.ReactNode;
    showBackButton?: boolean;
    backToAppCode?: boolean;
}

const BACKGROUND_IMAGES = ['/assets/images/auth/bg.avif', '/assets/images/auth/bg2.jpeg', '/assets/images/auth/bg6.jpeg', '/assets/images/auth/img2.png'];

export default function AuthLayout({ children, showBackButton = true, backToAppCode = false }: AuthLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [currentBg, setCurrentBg] = useState(BACKGROUND_IMAGES[0]);

    const shouldShowBackButton = showBackButton && pathname !== '/auth/appcode';

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * BACKGROUND_IMAGES.length);
        setCurrentBg(BACKGROUND_IMAGES[randomIndex]);
    }, []);

    return (
        <div className="relative">
            {/* Background Layer */}
            <div className="absolute inset-0">
                <Image src={currentBg} alt="background" fill sizes="100vw" priority className="h-full w-full object-cover transition-opacity duration-500" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {/* Main Card */}
                <div className="relative w-full max-w-[870px] rounded-md bg-[linear-gradient(45deg,#fff9f9_0%,rgba(255,255,255,0)_25%,rgba(255,255,255,0)_75%,_#fff9f9_100%)] p-2 dark:bg-[linear-gradient(52.22deg,#0E1726_0%,rgba(14,23,38,0)_18.66%,rgba(14,23,38,0)_51.04%,rgba(14,23,38,0)_80.07%,#0E1726_100%)]">
                    <div className="relative flex flex-col justify-center rounded-md bg-white/60 px-6 py-20 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px]">
                        {/* Top Bar (Back Button) */}
                        <div className="absolute top-6 left-6 right-6 flex items-center">
                            {shouldShowBackButton && (
                                <button type="button" onClick={() => (backToAppCode ? router.push('/auth/appcode') : router.back())} className="text-white hover:text-gray-300">
                                    <FaArrowLeftLong className="text-xl text-white-dark" />
                                </button>
                            )}
                        </div>

                        {/* Title Section */}
                        <div className="mx-auto text-center w-full max-w-[440px]">
                            <h1 className="text-2xl font-extrabold uppercase tracking-widest text-primary md:text-4xl">CEO DASHBOARD</h1>
                        </div>

                        {/* Page Content */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
