'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconSettings from '@/components/icon/icon-settings';
import IconX from '@/components/icon/icon-x';

const Setting = () => {

    const [showCustomizer, setShowCustomizer] = useState(false);

    return (
        <div>
            <div className={`${(showCustomizer && '!block') || ''} fixed inset-0 z-[51] hidden bg-[black]/60 px-4 transition-[display]`} onClick={() => setShowCustomizer(false)}></div>

            <nav
                className={`${(showCustomizer && 'ltr:!right-0 rtl:!left-0') || ''
                    } fixed bottom-0 top-0 z-[51] w-full max-w-[500px] bg-white p-4 shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 ltr:-right-[500px] rtl:-left-[500px] dark:bg-black`}
            >
                <button
                    type="button"
                    className="absolute bottom-0 top-0 my-auto flex h-10 w-12 cursor-pointer items-center justify-center bg-primary text-white ltr:-left-12 ltr:rounded-bl-full ltr:rounded-tl-full rtl:-right-12 rtl:rounded-br-full rtl:rounded-tr-full"
                    onClick={() => setShowCustomizer(!showCustomizer)}
                >
                    <IconSettings className="h-5 w-5 animate-[spin_3s_linear_infinite]" />
                </button>

                <div className="perfect-scrollbar h-full overflow-y-auto overflow-x-hidden">
                    <div className="relative pb-5 text-center">
                        <button type="button" className="absolute top-0 opacity-30 hover:opacity-100 ltr:right-0 rtl:left-0 dark:text-white" onClick={() => setShowCustomizer(false)}>
                            <IconX className="h-5 w-5" />
                        </button>

                        <h4 className="mb-1 dark:text-white">EBOSS AI</h4>
                        <p className="text-white-dark">AI Powered Assistant</p>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Setting;
