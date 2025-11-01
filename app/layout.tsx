import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import { MantineProvider } from '@mantine/core';
import AppCodeGuard from '@/components/guards/AppcodeGurad';

export const metadata: Metadata = {
    title: {
        template: 'CEO-DASHBOARD',
        default: 'CEO-DASHBOARD',
    },
};
const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <MantineProvider>
                    <ProviderComponent>
                        <AppCodeGuard>{children}</AppCodeGuard>
                    </ProviderComponent>
                </MantineProvider>
            </body>
        </html>
    );
}
