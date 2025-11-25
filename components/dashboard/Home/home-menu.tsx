'use client';

import Link from 'next/link';
// Assuming you have installed an icon library like 'lucide-react'
import { BarChart3, UserPlus, Megaphone, BookOpenText, School, BookA } from 'lucide-react';

export default function HomeMenu() {
    // Define the primary brand color for accents
    const brandColor = 'text-indigo-600'; // Modern Indigo

    // Define menu items with explicit icons
    const menuItems = [
        {
            title: 'Finance',
            href: '/dashboard/finance',
            icon: BarChart3,
            iconBg: 'bg-indigo-100', // Light background for the icon
        },
        {
            title: 'Registration',
            href: '/dashboard/registration',
            icon: UserPlus,
            iconBg: 'bg-teal-100', // Different light background for variety
        },
        {
            title: 'Marketing',
            href: '/dashboard/marketing',
            icon: Megaphone,
            iconBg: 'bg-orange-100',
        },
        {
            title: 'Academic',
            href: '/dashboard/academic',
            icon: BookOpenText,
            iconBg: 'bg-purple-100',
        },
        {
            title: 'School Zone',
            href: '/dashboard/school-zone',
            icon: School,
            iconBg: 'bg-green-100',
        },
        {
            title: 'Subject',
            href: '/dashboard/subject',
            icon: BookA,
            iconBg: 'bg-pink-100',
        },
    ];

    return (
        // Added a subtle background color to the main container for contrast (e.g., bg-gray-50)
        // You can apply this background to your main page layout component instead of here.
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;

                    return (
                        <Link key={item.title} href={item.href} className="group">
                            <div
                                // Card Styling:
                                // Pure white background, slightly larger rounded corners (lg), more defined shadow
                                className={`bg-white rounded-xl shadow-lg p-8 
                                    flex flex-col items-center justify-center text-center space-y-4 cursor-pointer 
                                    min-h-[180px] // Ensure consistent card height
                                    transform transition-all duration-300 ease-in-out 
                                    
                                    // Hover Effects: Lift, stronger shadow, and primary color border
                                    group-hover:scale-[1.02] group-hover:shadow-2xl 
                                    group-hover:border-b-4 group-hover:border-indigo-500`} // Adding an accented bottom border
                            >
                                {/* Icon Container: Two-tone effect for visual interest */}
                                <div className={`p-4 rounded-full ${item.iconBg} transition-all duration-300 group-hover:shadow-md`}>
                                    <IconComponent
                                        // Icon Styling: Use the defined brand color
                                        className={`w-8 h-8 ${brandColor} transition-colors duration-300`}
                                    />
                                </div>

                                {/* Title Styling: Dark text, strong on hover */}
                                <p
                                    className={`text-xl font-bold text-gray-800 transition-colors duration-300 
                                    group-hover:text-indigo-600`} // Use the primary brand color on hover
                                >
                                    {item.title}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
