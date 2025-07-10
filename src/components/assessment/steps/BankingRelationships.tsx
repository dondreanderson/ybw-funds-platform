'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote, CreditCard, Building2, TrendingUp } from 'lucide-react';

const bankingRelationshipsSchema = z.object({
  primaryBank: z.string().min(1, 'Primary bank is required'),
  accountsOpen: z.number().min(1, 'Must have at least 1 account'),
  bankingYears: z.number().min(0, 'Banking years must be positive'),
  averageBalance: z.number().min(0, 'Average balance must be positive'),
  hasBusinessChecking: z.boolean(),
  hasBusinessSavings: z.boolean(),
  hasBusinessCreditCard: z.boolean(),
  hasLineOfCredit: z.boolean(),
  creditCardLimit: z.number().min(0, 'Credit card limit must be positive'),
  monthlyDeposits: z.number().min(0, 'Monthly deposits must be positive'),
  nsfIncidents: z.number().min(0, 'NSF incidents must be positive'),
  hasLoanHistory: z.boolean(),
});

type BankingRelationshipsData = z.infer<typeof bankingRelationshipsSchema>;

interface BankingRelationshipsProps {
  data: Partial<BankingRelationshipsData>;
  onUpdate: (data: Partial<BankingRelationshipsData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const MAJOR_BANKS = [
  'JPMorgan Chase',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'U.S. Bank',
  'Truist Bank',
  'PNC Bank',
  'Capital One',
  'TD Bank',
  'Fifth Third Bank',
  'Local Community Bank',
  'Credit Union',
  'Online Bank',
  'Other'
];

export function BankingRelationships({ data, onUpdate, onNext, onPrevious }: BankingRelationshipsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<BankingRelationshipsData>({
    resolver: zodResolver(bankingRelationshipsSchema),
    defaultValues: data,
    mode: 'onChange'
  });

  const watchedData = watch();
  const hasBusinessCreditCard = watch('hasBusinessCreditCard');
  const hasLineOfCredit = watch('hasLineOfCredit');

  useEffect(() => {
    onUpdate(watchedData);
  }, [watchedData, onUpdate]);

  const onSubmit = (formData: BankingRelationshipsData) => {
    onUpdate(formData);
    onNext();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Banking Relationships
        </h2>
        <p className="text-gray-600">
          Tell us about your business banking history and relationships
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Banking Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Building2 className="inline w-5 h-5 mr-2" />
            Primary Banking Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Bank *
              </label>
              <select
                {...register('primaryBank')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your primary bank</option>
                {MAJOR_BANKS.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
              {errors.primaryBank && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryBank.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years Banking with Primary Bank *
              </label>
              <input
                {...register('bankingYears', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.bankingYears && (
                <p className="mt-1 text-sm text-red-600">{errors.bankingYears.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Number of Business Accounts *
              </label>
              <input
                {...register('accountsOpen', { valueAsNumber: true })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
              {errors.accountsOpen && (
                <p className="mt-1 text-sm text-red-600">{errors.accountsOpen.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Monthly Balance *
              </label>
              <input
                {...register('averageBalance', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.averageBalance && (
                <p className="mt-1 text-sm text-red-600">{errors.averageBalance.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Types */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Banknote className="inline w-5 h-5 mr-2" />
            Business Account Types
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('hasBusinessChecking')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Business Checking Account
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('hasBusinessSavings')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Business Savings Account
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('hasBusinessCreditCard')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Business Credit Card
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('hasLineOfCredit')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Business Line of Credit
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Information */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <CreditCard className="inline w-5 h-5 mr-2" />
            Credit Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Credit Card Limit *
              </label>
              <input
                {...register('creditCardLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                disabled={!hasBusinessCreditCard}
              />
              {errors.creditCardLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.creditCardLimit.message}</p>
              )}
              {!hasBusinessCreditCard && (
                <p className="mt-1 text-sm text-gray-500">
                  Enable "Business Credit Card" to enter limit
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NSF (Insufficient Funds) Incidents (Last 12 Months) *
              </label>
              <input
                {...register('nsfIncidents', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.nsfIncidents && (
                <p className="mt-1 text-sm text-red-600">{errors.nsfIncidents.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Banking Activity */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <TrendingUp className="inline w-5 h-5 mr-2" />
            Banking Activity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Monthly Deposits *
              </label>
              <input
                {...register('monthlyDeposits', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.monthlyDeposits && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyDeposits.message}</p>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center">
                <input
                  {...register('hasLoanHistory')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I have a history of business loans with good payment record
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Banking Health Indicator */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Banking Health Indicator
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {watchedData.bankingYears || 0} Years
              </div>
              <div className="text-gray-600">Banking History</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {watchedData.accountsOpen || 0} Accounts
              </div>
              <div className="text-gray-600">Business Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                ${(watchedData.averageBalance || 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Average Balance</div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            ← Previous
          </button>
          
          <button
            type="submit"
            disabled={!isValid}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Digital Presence →
          </button>
        </div>
      </form>
    </div>
  );
}