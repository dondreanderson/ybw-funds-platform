'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, TrendingUp, Calculator, FileCheck } from 'lucide-react';

const financialHealthSchema = z.object({
  annualRevenue: z.number().min(0, 'Annual revenue must be positive'),
  monthlyRevenue: z.number().min(0, 'Monthly revenue must be positive'),
  monthlyExpenses: z.number().min(0, 'Monthly expenses must be positive'),
  creditScore: z.number().min(300, 'Credit score must be at least 300').max(850, 'Credit score cannot exceed 850'),
  existingDebt: z.number().min(0, 'Existing debt must be positive'),
  cashFlow: z.enum(['positive', 'negative', 'breakeven']),
  profitMargin: z.number().min(0, 'Profit margin must be positive').max(100, 'Profit margin cannot exceed 100%'),
  accountsReceivable: z.number().min(0, 'Accounts receivable must be positive'),
  hasAccountant: z.boolean(),
  taxesUpToDate: z.boolean(),
  hasFinancialStatements: z.boolean(),
});

type FinancialHealthData = z.infer<typeof financialHealthSchema>;

interface FinancialHealthProps {
  data: Partial<FinancialHealthData>;
  onUpdate: (data: Partial<FinancialHealthData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function FinancialHealth({ data, onUpdate, onNext, onPrevious }: FinancialHealthProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<FinancialHealthData>({
    resolver: zodResolver(financialHealthSchema),
    defaultValues: data,
    mode: 'onChange'
  });

  const watchedData = watch();

  useEffect(() => {
    onUpdate(watchedData);
  }, [watchedData, onUpdate]);

  const onSubmit = (formData: FinancialHealthData) => {
    onUpdate(formData);
    onNext();
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(number) ? 0 : number;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Financial Health
        </h2>
        <p className="text-gray-600">
          Tell us about your business's financial situation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Revenue Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <DollarSign className="inline w-5 h-5 mr-2" />
            Revenue Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue *
              </label>
              <input
                {...register('annualRevenue', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.annualRevenue && (
                <p className="mt-1 text-sm text-red-600">{errors.annualRevenue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Revenue *
              </label>
              <input
                {...register('monthlyRevenue', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.monthlyRevenue && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyRevenue.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Expenses and Profit */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <TrendingUp className="inline w-5 h-5 mr-2" />
            Expenses and Profitability
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Expenses *
              </label>
              <input
                {...register('monthlyExpenses', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.monthlyExpenses && (
                <p className="mt-1 text-sm text-red-600">{errors.monthlyExpenses.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profit Margin (%) *
              </label>
              <input
                {...register('profitMargin', { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.profitMargin && (
                <p className="mt-1 text-sm text-red-600">{errors.profitMargin.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Flow Status *
            </label>
            <select
              {...register('cashFlow')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select cash flow status</option>
              <option value="positive">Positive (More money coming in than going out)</option>
              <option value="breakeven">Break-even (Money in equals money out)</option>
              <option value="negative">Negative (More money going out than coming in)</option>
            </select>
            {errors.cashFlow && (
              <p className="mt-1 text-sm text-red-600">{errors.cashFlow.message}</p>
            )}
          </div>
        </div>

        {/* Credit and Debt */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Calculator className="inline w-5 h-5 mr-2" />
            Credit and Debt
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Credit Score *
              </label>
              <input
                {...register('creditScore', { valueAsNumber: true })}
                type="number"
                min="300"
                max="850"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="700"
              />
              {errors.creditScore && (
                <p className="mt-1 text-sm text-red-600">{errors.creditScore.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Range: 300-850
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Existing Debt *
              </label>
              <input
                {...register('existingDebt', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.existingDebt && (
                <p className="mt-1 text-sm text-red-600">{errors.existingDebt.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accounts Receivable *
            </label>
            <input
              {...register('accountsReceivable', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            {errors.accountsReceivable && (
              <p className="mt-1 text-sm text-red-600">{errors.accountsReceivable.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Money owed to you by customers
            </p>
          </div>
        </div>

        {/* Financial Management */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FileCheck className="inline w-5 h-5 mr-2" />
            Financial Management
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('hasAccountant')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have a professional accountant or bookkeeper
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('taxesUpToDate')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                All business taxes are up to date
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('hasFinancialStatements')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have current financial statements (P&L, Balance Sheet)
              </label>
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
            Next: Banking Relationships →
          </button>
        </div>
      </form>
    </div>
  );
}