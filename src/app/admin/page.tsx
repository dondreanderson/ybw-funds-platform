import { requireAdmin } from '@/lib/auth/adminAuth'
import MarketplaceAdmin from '@/components/admin/MarketplaceAdmin'

export default async function AdminDashboard() {
  // This will redirect if user is not admin
  await requireAdmin()
  
  return (
    <div>
      <MarketplaceAdmin />
    </div>
  )
}
