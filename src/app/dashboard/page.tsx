// src/app/dashboard/page.tsx

import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';


export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
       {/* Header with User Menu */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">YBW Funds</h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <EnhancedDashboard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />

      </div>
    </div>
  );
}
