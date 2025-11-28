'use client';

import Link from 'next/link';
import { BarChart3, UserPlus, Megaphone, BookOpenText, School, BookA, ArrowUpRight } from 'lucide-react';
import Calendar from '@/components/widgets/calendar';

export default function HomeMenu() {
    // Define menu items with explicit icons and colors
    const menuItems = [
        {
            title: 'Finance',
            description: 'Manage financial records and transactions',
            href: '/dashboard/finance',
            icon: BarChart3,
            bgColor: 'bg-blue-100',
            iconBgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            hoverBg: 'hover:bg-blue-200',
            hoverIconBg: 'group-hover:bg-blue-200',
        },
        {
            title: 'Registration',
            description: 'Handle student enrollment and records',
            href: '/dashboard/registration',
            icon: UserPlus,
            bgColor: 'bg-teal-100',
            iconBgColor: 'bg-teal-100',
            iconColor: 'text-teal-600',
            hoverBg: 'hover:bg-teal-200',
            hoverIconBg: 'group-hover:bg-teal-200',
        },
        {
            title: 'Marketing',
            description: 'Promote and advertise your services',
            href: '/dashboard/marketing',
            icon: Megaphone,
            bgColor: 'bg-orange-100',
            iconBgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            hoverBg: 'hover:bg-orange-200',
            hoverIconBg: 'group-hover:bg-orange-200',
        },
        {
            title: 'Academic',
            description: 'Manage curriculum and learning materials',
            href: '/dashboard/academic',
            icon: BookOpenText,
            bgColor: 'bg-purple-100',
            iconBgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            hoverBg: 'hover:bg-purple-200',
            hoverIconBg: 'group-hover:bg-purple-200',
        },
        {
            title: 'School Zone',
            description: 'Access school facilities and services',
            href: '/dashboard/school-zone',
            icon: School,
            bgColor: 'bg-green-100',
            iconBgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            hoverBg: 'hover:bg-green-200',
            hoverIconBg: 'group-hover:bg-green-200',
        },
        {
            title: 'Subject',
            description: 'Organize and manage subject information',
            href: '/dashboard/subject',
            icon: BookA,
            bgColor: 'bg-pink-100',
            iconBgColor: 'bg-pink-100',
            iconColor: 'text-pink-600',
            hoverBg: 'hover:bg-pink-200',
            hoverIconBg: 'group-hover:bg-pink-200',
        },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Left Side - Menu Items */}
                <div className="flex-1">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-primary">Dashboard Overview</h1>
                        <p className="text-sm text-muted-foreground text-black/50">Quick access to all your management tools</p>
                    </div>
                    {/* First Row - 4 items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
                        {menuItems.slice(0, 4).map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link key={item.title} href={item.href} className="group">
                                    <div
                                        className={`relative rounded-xl p-5 md:p-6 
                                            ${item.bgColor}
                                            flex flex-col items-start justify-between
                                            min-h-[140px] md:min-h-[160px]
                                            transition-all duration-300 ease-out
                                            ${item.hoverBg}
                                            group-hover:shadow-md`}
                                    >
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ArrowUpRight className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className={`p-3 rounded-full ${item.iconBgColor} ${item.hoverIconBg} mb-3 transition-all duration-300 group-hover:scale-110`}>
                                            <IconComponent className={`w-6 h-6 md:w-7 md:h-7 ${item.iconColor}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Second Row - 2 items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {menuItems.slice(4, 6).map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link key={item.title} href={item.href} className="group">
                                    <div
                                        className={`relative rounded-xl p-5 md:p-6 
                                            ${item.bgColor}
                                            flex flex-col items-start justify-between
                                            min-h-[140px] md:min-h-[160px]
                                            transition-all duration-300 ease-out
                                            ${item.hoverBg}
                                            group-hover:shadow-md`}
                                    >
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <ArrowUpRight className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className={`p-3 rounded-full ${item.iconBgColor} ${item.hoverIconBg} mb-3 transition-all duration-300 group-hover:scale-110`}>
                                            <IconComponent className={`w-6 h-6 md:w-7 md:h-7 ${item.iconColor}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side - Calendar Widget */}
                <div className="lg:w-[400px]">
                    <Calendar />
                </div>
            </div>
        </div>
    );
}