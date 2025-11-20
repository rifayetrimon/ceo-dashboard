'use client';
import ContentAnimation from '@/components/layouts/content-animation';
import Footer from '@/components/layouts/footer';
import Header from '@/components/layouts/header';
import MainContainer from '@/components/layouts/main-container';
import Overlay from '@/components/layouts/overlay';
import ScrollToTop from '@/components/layouts/scroll-to-top';
import Setting from '@/components/layouts/setting';
import Sidebar from '@/components/layouts/sidebar';
import Portals from '@/components/portals';
import LoginGuard from '@/components/guards/LoginGuard';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <LoginGuard>
            <div className="relative">
                <Overlay />
                <ScrollToTop />
                <Setting />

                <MainContainer>
                    {/* ALWAYS SHOW SIDEBAR */}
                    <Sidebar />

                    <div className="main-content flex min-h-screen flex-col">
                        <Header />
                        <ContentAnimation>{children}</ContentAnimation>
                        <Footer />
                        <Portals />
                    </div>
                </MainContainer>
            </div>
        </LoginGuard>
    );
}
