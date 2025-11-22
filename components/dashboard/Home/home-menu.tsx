'use client';

import Link from 'next/link';
// Assuming you have installed an icon library like 'lucide-react'
import { BarChart3, UserPlus, Megaphone, BookOpenText, School, BookA } from 'lucide-react';

export default function HomeMenu() {
    // Define menu items with explicit icons, no custom background colors
    const menuItems = [
        {
            title: 'Finance',
            href: '/dashboard/finance',
            icon: BarChart3,
        },
        {
            title: 'Registration',
            href: '/dashboard/registration',
            icon: UserPlus,
        },
        {
            title: 'Marketing',
            href: '/dashboard/marketing',
            icon: Megaphone,
        },
        {
            title: 'Academic',
            href: '/dashboard/academic',
            icon: BookOpenText,
        },
        {
            title: 'School Zone',
            href: '/dashboard/school-zone',
            icon: School,
        },
        {
            title: 'Subject',
            href: '/dashboard/subject',
            icon: BookA,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {menuItems.map((item) => {
                const IconComponent = item.icon;

                return (
                    <Link key={item.title} href={item.href} className="group">
                        <div
                            // Professional Card Styling:
                            // White background, rounded corners, subtle shadow
                            // Padding, flex layout for centering
                            className={`bg-white border border-gray-200 rounded-xl shadow-md p-6 
                                flex flex-col items-center text-center space-y-3 cursor-pointer 
                                transform transition-all duration-300 ease-in-out 
                                
                                // Hover Effects: Slight lift, stronger shadow, and primary color for icon/text
                                group-hover:scale-[1.03] group-hover:shadow-lg group-hover:border-blue-500`}
                        >
                            {/* Icon Styling: Use a neutral text color, make it stand out on hover */}
                            <IconComponent
                                className="w-10 h-10 mb-2 text-gray-500 transition-colors duration-300 
                                group-hover:text-blue-600"
                            />

                            {/* Title Styling: Dark text, strong on hover */}
                            <p
                                className="text-lg font-semibold text-gray-800 transition-colors duration-300 
                                group-hover:text-blue-600"
                            >
                                {item.title}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
