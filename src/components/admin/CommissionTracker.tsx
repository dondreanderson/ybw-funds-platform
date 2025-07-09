// src/components/admin/CommissionTracker.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface CommissionData {
  id: string;
  lenderName: string;
  opportunityType: 'funding' | 'tradeline';
  userId: string;
  userName: string;
  applicationDate: string;
  approvalDate?: string;
  fundingDate?: string;
  loanAmount?: number;
  creditLimit?: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'funded' | 'paid';
  paidDate?: string;
  referenceId: string;
}

interface CommissionMetrics {
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  conversionRate: number;
  averageCommission: number;
  totalApplications: number;
  totalApprovals: number;
  totalFundings: number;
}

export function CommissionTracker() {
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [metrics, setMetrics] = useState<CommissionMetrics>({
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    conversionRate: 0,
    averageCommission: 0,
    totalApplications: 0,
    totalApprovals: 0,
    totalFundings: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCommissionData();
  }, [dateRange]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/commissions?start=${dateRange.start}&end=${dateRange.end}`);
      const data = await response.json();
      
      if (data.success) {
        setCommissions(data.commissions);
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportCommissions = async () => {
    try {
      const response = await fetch(`/api/admin/commissions/export?start=${dateRange.start}&end=${dateRange.end}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `commissions_${dateRange.start}_to_${dateRange.end}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting commissions:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Commission Tracker</h2>
        <div className="flex gap-3">
          <button
            onClick={exportCommissions}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={loadCommissionData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Commissions</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCommissions)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending Commissions</h3>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(metrics.pendingCommissions)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Paid Commissions</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.paidCommissions)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{metrics.conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Average Commission</h3>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.averageCommission)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
          <p className="text-xl font-bold text-gray-900">{metrics.totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Fundings</h3>
          <p className="text-xl font-bold text-gray-900">{metrics.totalFundings}</p>
        </div>
      </div>

      {/* Commission Details Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Commission Details</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lender / User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{commission.lenderName}</div>
                        <div className="text-sm text-gray-500">{commission.userName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{commission.opportunityType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(commission.loanAmount || commission.creditLimit || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(commission.commissionAmount)}
                        </div>
                        <div className="text-sm text-gray-500">{commission.commissionRate}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(commission.status)}`}>
                        {commission.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(commission.applicationDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
