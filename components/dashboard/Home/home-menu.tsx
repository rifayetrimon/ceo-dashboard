'use client';

import Link from 'next/link';

export default function HomeMenu() {
    // Define menu items
    const menuItems = [
        { title: 'Finance', href: '/dashboard/finance', color: 'bg-blue-500' },
        { title: 'Registration', href: '/dashboard/registration', color: 'bg-green-500' },
        { title: 'Marketing', href: '/dashboard/marketing', color: 'bg-yellow-500' },
        { title: 'Academic', href: '/dashboard/academic', color: 'bg-red-500' },
        { title: 'School Zone', href: '/dashboard/school-zone', color: 'bg-purple-500' },
        { title: 'Subject', href: '/dashboard/subject', color: 'bg-purple-500' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {menuItems.map((item) => (
                <Link key={item.title} href={item.href}>
                    <div className={`${item.color} rounded-xl shadow-lg p-8 text-white flex items-center justify-center text-2xl font-bold cursor-pointer hover:scale-105 transform transition`}>
                        {item.title}
                    </div>
                </Link>
            ))}
        </div>
    );
}
