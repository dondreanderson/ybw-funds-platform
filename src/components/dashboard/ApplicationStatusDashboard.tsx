'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Application {
  id: string;
  opportunityId: string;
  opportunityName: string;
  opportunityType: 'funding' | 'tradeline';
  status: 'applied' | 'under_review' | 'approved' | 'rejected' | 'funded';
  appliedAt: string;
  lastUpdated: string;
  lenderName: string;
  amount?: number;
  creditLimit?: number;
  notes?: string;
  nextSteps?: string[];
  documentsRequired?: string[];
  estimatedDecision?: string;
}

interface StatusCounts {
  applied: number;
  under_review: number;
  approved: number;
  rejected: number;
  funded: number;
}

export function ApplicationStatusDashboard() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    applied: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    funded: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (session?.user?.id) {
      loadApplications();
    }
  }, [session]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/status?userId=${session?.user?.id}`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.applications);
        setStatusCounts(data.statusCounts);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return '📋';
      case 'under_review': return '🔍';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'funded': return '💰';
      default: return '📄';
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredApplications = selectedStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Application Status</h2>
        <button
          onClick={loadApplications}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedStatus === status 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedStatus(status)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {status.replace('_', ' ')}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div className="text-2xl">
                {getStatusIcon(status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Applications ({applications.length})
        </button>
        {Object.entries(statusCounts).map(([status, count]) => (
          count > 0 && (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')} ({count})
            </button>
          )
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all' 
                ? "You haven't applied to any opportunities yet" 
                : `No applications with status "${selectedStatus.replace('_', ' ')}"`
              }
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.lenderName}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)} {application.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500 capitalize">
                      {application.opportunityType}
                    </span>
                  </div>
                  <p className="text-gray-600">{application.opportunityName}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Applied</p>
                  <p className="font-medium">{formatDate(application.appliedAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Amount/Limit</p>
                  <p className="font-medium">
                    {formatAmount(application.amount || application.creditLimit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(application.lastUpdated)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Decision</p>
                  <p className="font-medium">{application.estimatedDecision || 'Pending'}</p>
                </div>
              </div>

             {application.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">{application.notes}</p>
                </div>
              )}

              {application.documentsRequired && application.documentsRequired.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Documents Required</p>
                  <div className="flex flex-wrap gap-2">
                    {application.documentsRequired.map((doc, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        📄 {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {application.nextSteps && application.nextSteps.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Next Steps</p>
                  <ul className="space-y-1">
                    {application.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2 mt-0.5 bg-blue-100 text-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300">
                  View Details
                </button>
                {application.status === 'approved' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Accept Offer
                  </button>
                )}
                {application.documentsRequired && application.documentsRequired.length > 0 && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Upload Documents
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}