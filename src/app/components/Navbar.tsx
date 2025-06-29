import React from 'react';
import Link from 'next/link';

const Navbar = () => (
  <nav className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-md">
    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Promptly</div>
    <div className="flex gap-4">
      {/* Placeholder for future nav links */}
      <Link href="/chat" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition">Chat</Link>
      <a href="/profile" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition">Profile</a>
    </div>
  </nav>
);

export default Navbar; 