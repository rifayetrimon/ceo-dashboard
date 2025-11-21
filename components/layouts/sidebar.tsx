'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMinus from '@/components/icon/icon-minus';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';
import { basePath } from '@/lib/basePath';
import { IconAcademic, IconFinance, IconMarketing, IconRegistration, IconSchoolZone, IconSubject } from '../icon/icon';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const hideNavItems = pathname === '/'; // HIDE NAV ITEMS ONLY ON HOME

    // Check if a link is active
    const isActiveLink = (href: string) => {
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <Image src={`${basePath}/assets/images/logo2.svg`} alt="logo" width={32} height={32} className="ml-[5px] flex-none" priority />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">EBOSS</span>
                        </Link>

                        {/* SIDEBAR TOGGLE BUTTON */}
                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li className="menu nav-item">
                                <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                    <IconMinus className="hidden h-5 w-4 flex-none" />
                                    <span>{t('CEO Dashboard')}</span>
                                </h2>

                                <li className="nav-item">
                                    {!hideNavItems && (
                                        <ul>
                                            <li className="nav-item">
                                                <Link href="/dashboard/finance" className="group">
                                                    <div className="flex items-center">
                                                        <IconFinance className={`shrink-0 ${isActiveLink('/dashboard/finance') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/finance') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('finance')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link href="/dashboard/registration" className="group">
                                                    <div className="flex items-center">
                                                        <IconRegistration className={`shrink-0 ${isActiveLink('/dashboard/registration') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/registration') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('registration')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link href="/dashboard/marketing" className="group">
                                                    <div className="flex items-center">
                                                        <IconMarketing className={`shrink-0 ${isActiveLink('/dashboard/marketing') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/marketing') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('marketing')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link href="/dashboard/academic" className="group">
                                                    <div className="flex items-center">
                                                        <IconAcademic className={`shrink-0 ${isActiveLink('/dashboard/academic') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/academic') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('academic')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link href="/dashboard/school-zone" className="group">
                                                    <div className="flex items-center">
                                                        <IconSchoolZone className={`shrink-0 ${isActiveLink('/dashboard/school-zone') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/school-zone') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('school_zone')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>

                                            <li className="nav-item">
                                                <Link href="/dashboard/subject" className="group">
                                                    <div className="flex items-center">
                                                        <IconSubject className={`shrink-0 ${isActiveLink('/dashboard/subject') ? 'text-primary' : ''} group-hover:!text-primary`} />
                                                        <span
                                                            className={`text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark ${isActiveLink('/dashboard/subject') ? 'text-primary' : ''} group-hover:text-primary transition-colors`}
                                                        >
                                                            {t('subject')}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
