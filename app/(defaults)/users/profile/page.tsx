'use client';

import IconCalendar from '@/components/icon/icon-calendar';
import IconDribbble from '@/components/icon/icon-dribbble';
import IconGithub from '@/components/icon/icon-github';
import IconMail from '@/components/icon/icon-mail';
import IconMapPin from '@/components/icon/icon-map-pin';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconPhone from '@/components/icon/icon-phone';
import IconTwitter from '@/components/icon/icon-twitter';
import Link from 'next/link';
import React from 'react';
import { useProfile } from '@/hook/user/useProfile';
import Image from 'next/image';
import PaymentHistory from './_components/payment-history';

const Profile = () => {
    const { data } = useProfile();

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse">
                <li>
                    <Link href="/" className="text-primary hover:underline">
                        Home
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Profile</span>
                </li>
            </ul>
            <div className="pt-5">
                <div className="mb-5">
                    <div className="panel">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">Profile</h5>
                            <Link href="/users/user-account-settings" className="btn btn-primary rounded-full p-2 ltr:ml-auto rtl:mr-auto">
                                <IconPencilPaper />
                            </Link>
                        </div>
                        <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-10">
                            <div className="flex-none">
                                <Image
                                    src={data?.personal.file_profile_url || `/assets/images/user-profile.jpeg`}
                                    alt="Profile picture"
                                    width={150}
                                    height={150}
                                    className="h-32 w-32 rounded-full object-cover lg:h-40 lg:w-40"
                                />
                            </div>
                            <div className="flex-1 w-full mt-5 lg:mt-0">
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                                    <div className="text-center lg:text-left">
                                        <h5 className="text-2xl font-bold text-primary mb-1">{data?.name}</h5>
                                        <p className="text-white-dark font-semibold text-lg">{data?.job.designation || 'No data'}</p>
                                    </div>
                                </div>

                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-semibold text-white-dark">
                                    <li className="flex items-center gap-2">
                                        <IconMail className="h-5 w-5 shrink-0" />
                                        <span className="truncate text-primary">{data?.email}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconPhone />
                                        <span className="whitespace-nowrap" dir="ltr">
                                            {data?.phone || 'No phone number available'}
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconCalendar className="shrink-0" />
                                        {data?.personal.birth_date || 'No data'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconMapPin className="shrink-0" />
                                        {data?.address.main.line1 || 'No data'}
                                    </li>
                                </ul>
                                <ul className="mt-12 flex items-center justify-center lg:justify-start gap-3">
                                    <li>
                                        <button className="btn btn-info flex h-10 w-10 items-center justify-center rounded-full p-0">
                                            <IconTwitter className="h-5 w-5" />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-danger flex h-10 w-10 items-center justify-center rounded-full p-0">
                                            <IconDribbble />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="btn btn-dark flex h-10 w-10 items-center justify-center rounded-full p-0">
                                            <IconGithub />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <PaymentHistory />
                    <div className="panel">
                        <div className="mb-5 flex items-center justify-between">
                            <h5 className="text-lg font-semibold dark:text-white-light">Card Details</h5>
                        </div>
                        <div>
                            <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex-none">
                                        <Image src={`/assets/images/card-americanexpress.svg`} alt="American Express" width={40} height={25} unoptimized />
                                    </div>
                                    <div className="flex flex-auto items-center justify-between ltr:ml-4 rtl:mr-4">
                                        <h6 className="font-semibold text-[#515365] dark:text-white-dark">
                                            American Express
                                            <span className="block text-white-dark dark:text-white-light">Expires on 12/2025</span>
                                        </h6>
                                        <span className="badge bg-success ltr:ml-auto rtl:mr-auto">Primary</span>
                                    </div>
                                </div>
                            </div>
                            <div className="border-b border-[#ebedf2] dark:border-[#1b2e4b]">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex-none">
                                        <Image src={`/assets/images/card-mastercard.svg`} alt="Mastercard" width={40} height={25} unoptimized />
                                    </div>
                                    <div className="flex flex-auto items-center justify-between ltr:ml-4 rtl:mr-4">
                                        <h6 className="font-semibold text-[#515365] dark:text-white-dark">
                                            Mastercard
                                            <span className="block text-white-dark dark:text-white-light">Expires on 03/2025</span>
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
