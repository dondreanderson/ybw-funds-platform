'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { checkAdminAccess } from '@/lib/auth/adminAuth'
import { 
  CogIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ChartBarIcon,
  UsersIcon 
} from '@heroicons/react/24/outline'

export default function AdminMenu() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkUserAdminStatus()
  }, [])

  const checkUserAdminStatus = async () => {
    try {
      const { isAdmin } = await checkAdminAccess()
      setIsAdmin(isAdmin)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  if (!isAdmin) return null

  const adminMenuItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: CogIcon },
    { href: '/admin/lenders', label: 'Manage Lenders', icon: BuildingOfficeIcon },
    { href: '/admin/tradelines', label: 'Manage Tradelines', icon: CreditCardIcon },
    { href: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
    { href: '/admin/users', label: 'User Management', icon: UsersIcon }
  ]

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CogIcon className="w-5 h-5 text-red-600" />
        <h3 className="text-red-800 font-semibold">Admin Panel</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {adminMenuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-100 rounded-md transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
