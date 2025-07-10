// src/app/dashboard/page.tsx
<<<<<<< HEAD
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { UserMenu } from '@/components/layout/UserMenu';
=======
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
<<<<<<< HEAD
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
=======
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />
>>>>>>> 9027a76eb338fbaa421c2127d2ecdad194f2bf16
      </div>
    </div>
  );
}
