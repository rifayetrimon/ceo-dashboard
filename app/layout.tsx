// app/layout.tsx
'use client';
import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Nunito } from 'next/font/google';
import { MantineProvider } from '@mantine/core';
import AppCodeGuard from '@/components/guards/AppcodeGurad';
import { useSessionMonitor } from '@/hook/auth/useSessionMonitor';

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    // Add session monitoring for auto-lock functionality
    useSessionMonitor();

    return (
        <html lang="en">
            <body className={nunito.variable}>
                <MantineProvider>
                    <ProviderComponent>
                        <AppCodeGuard>
                            {children}
                        </AppCodeGuard>
                    </ProviderComponent>
                </MantineProvider>
            </body>
        </html>
    );
}