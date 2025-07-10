'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { LoanApplication } from '@/types/lender';

interface ApplicationTrackerProps {
  userId: string;
}

export function ApplicationTracker({ userId }: ApplicationTrackerProps) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications?userId=${userId}`);
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'funded':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'funded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Application Tracker
        </h1>
        <p className="text-gray-600">
          Track the status of your loan applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by exploring our lender marketplace
          </p>
          <a
            href="/marketplace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Lenders
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onView={() => setSelectedApplication(application)}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
}

function ApplicationCard({ 
  application, 
  onView, 
  getStatusIcon, 
  getStatusColor 
}: {
  application: LoanApplication;
  onView: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(application.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Application #{application.id.slice(0, 8)}
            </h3>
            <p className="text-gray-600">
              {application.application_data.loan_purpose || 'Business Loan'}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
          {application.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Requested Amount</div>
          <div className="font-semibold">
            ${application.application_data.requested_amount.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Submitted</div>
          <div className="font-semibold">
            {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Draft'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Last Updated</div>
          <div className="font-semibold">
            {new Date(application.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {application.tracking_id && (
            <span className="text-sm text-gray-500">
              Tracking: {application.tracking_id}
            </span>
          )}
        </div>
        <button
          onClick={onView}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <EyeIcon className="h-4 w-4" />
          <span>View Details</span>
        </button>
      </div>
    </motion.div>
  );
}

function ApplicationDetailsModal({
  application,
  onClose
}: {
  application: LoanApplication;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Application Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Application Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Application ID</div>
                  <div className="font-medium">{application.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-medium">{application.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Requested Amount</div>
                  <div className="font-medium">${application.application_data.requested_amount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Loan Purpose</div>
                  <div className="font-medium">{application.application_data.loan_purpose}</div>
                </div>
              </div>
            </div>

            {application.decision_notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Decision Notes
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{application.decision_notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}