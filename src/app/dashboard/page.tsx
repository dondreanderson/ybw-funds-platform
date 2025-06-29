'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/header'
import { FundabilityScore } from '@/components/dashboard/fundability-score'
import { FundingExplorer } from '@/components/dashboard/funding-explorer'
import { BusinessCreditBuilder } from '@/components/dashboard/business-credit-builder'
import { TransactionHistory } from '@/components/dashboard/transaction-history'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { Sidebar } from '@/components/dashboard/sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [userStats, setUserStats] = useState({
    fundabilityScore: 75,
    totalFunds: 45000,
    recentTransactions: [],
    creditReports: []
  })

  useEffect(() => {
    if (session?.user) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/stats')
      const data = await response.json()
      setUserStats(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  if (status === 'loading') {
    return 
  }

  if (status === 'unauthenticated') {
    return (
      

    )
  }

  return (
    

      

        
        
        

          
          
          

            {activeTab === 'overview' && (
              

                

                  

                    
                  

                  

                    
                  

                

                
                

                  
                  
                

              

            )}
            
            {activeTab === 'credit-builder' && (
              
            )}
            
            {activeTab === 'funding-explorer' && (
              

                
              

            )}
          

        

      

    

  )
}