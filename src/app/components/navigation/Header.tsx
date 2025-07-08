'use client';

import Link from 'next/link'; // ✅ Add this import
import { useRouter } from 'next/navigation';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              YBW Funds
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/assessment" className="text-gray-700 hover:text-blue-600">
              Assessment
            </Link>
            <Link href="/calculator" className="text-blue-600 hover:text-blue-800 font-medium">
              🆓 Free Calculator
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
