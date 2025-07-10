'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import { Lender, LoanProduct } from '@/types/lender';
import { LenderModal } from './LenderModal';

export function LenderOnboarding() {
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'pending' | 'analytics'>('list');

  useEffect(() => {
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/lenders');
      const data = await response.json();
      setLenders(data.lenders || []);
    } catch (error) {
      console.error('Error fetching lenders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (lenderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/lenders/${lenderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnership_status: status })
      });

      if (response.ok) {
        fetchLenders();
      }
    } catch (error) {
      console.error('Error updating lender status:', error);
    }
  };

  const tabs = [
    { id: 'list', name: 'All Lenders', count: lenders.length },
    { id: 'pending', name: 'Pending Approval', count: lenders.filter(l => l.partnership_status === 'pending').length },
    { id: 'analytics', name: 'Analytics', count: 0 }
  ];

  const filteredLenders = activeTab === 'pending' 
    ? lenders.filter(l => l.partnership_status === 'pending')
    : lenders;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lender Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage marketplace lenders and partnership applications
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Lender</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'analytics' ? (
        <LenderAnalytics lenders={lenders} />
      ) : (
        <LenderList
          lenders={filteredLenders}
          loading={loading}
          onEdit={setEditingLender}
          onStatusChange={handleStatusChange}
          isPendingView={activeTab === 'pending'}
        />
      )}

      {/* Add/Edit Lender Modal */}
      {(showAddModal || editingLender) && (
        <LenderModal
          lender={editingLender}
          onClose={() => {
            setShowAddModal(false);
            setEditingLender(null);
          }}
          onSuccess={() => {
            fetchLenders();
            setShowAddModal(false);
            setEditingLender(null);
          }}
        />
      )}
    </div>
  );
}

// Lender List Component
function LenderList({ 
  lenders, 
  loading, 
  onEdit, 
  onStatusChange, 
  isPendingView 
}: {
  lenders: Lender[];
  loading: boolean;
  onEdit: (lender: Lender) => void;
  onStatusChange: (lenderId: string, status: string) => void;
  isPendingView: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading lenders...</p>
      </div>
    );
  }

  if (lenders.length === 0) {
    return (
      <div className="text-center py-12">
        <BuildingLibraryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isPendingView ? 'No pending applications' : 'No lenders yet'}
        </h3>
        <p className="text-gray-600">
          {isPendingView 
            ? 'All partnership applications have been reviewed'
            : 'Start by adding your first lender partner'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loan Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lenders.map((lender) => (
              <tr key={lender.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {lender.logo_url && (
                      <img 
                        src={lender.logo_url} 
                        alt={lender.name}
                        className="w-10 h-10 object-contain mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lender.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Rating: {lender.rating}/5 ({lender.reviews_count} reviews)
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">
                    {lender.lender_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${lender.min_loan_amount.toLocaleString()} - ${lender.max_loan_amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={lender.partnership_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lender.commission_rate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(lender)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  {lender.partnership_status === 'pending' && (
                    <>
                      <button
                        onClick={() => onStatusChange(lender.id, 'active')}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onStatusChange(lender.id, 'inactive')}
                        className="text-red-600 hover:text-red-900"
                        title="Reject"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  {lender.partnership_status === 'active' && (
                    <button
                      onClick={() => onStatusChange(lender.id, 'inactive')}
                      className="text-red-600 hover:text-red-900"
                      title="Deactivate"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Lender Analytics Component
function LenderAnalytics({ lenders }: { lenders: Lender[] }) {
  const activeCount = lenders.filter(l => l.partnership_status === 'active').length;
  const pendingCount = lenders.filter(l => l.partnership_status === 'pending').length;
  const totalCommission = lenders.reduce((sum, l) => sum + (l.commission_rate || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Total Lenders</div>
          <div className="text-2xl font-bold text-gray-900">{lenders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Active Partners</div>
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Avg Commission</div>
          <div className="text-2xl font-bold text-blue-600">
            {activeCount > 0 ? (totalCommission / activeCount).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Lender Performance Chart would go here */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lender Performance Overview
        </h3>
        <p className="text-gray-600">
          Analytics dashboard coming soon...
        </p>
      </div>
    </div>
  );
}