'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Lender } from '@/types/lender';

const lenderSchema = z.object({
  name: z.string().min(1, 'Lender name is required'),
  description: z.string().min(1, 'Description is required'),
  lender_type: z.enum(['bank', 'credit_union', 'online_lender', 'sba_preferred', 'alternative', 'equipment', 'factoring']),
  min_loan_amount: z.number().min(0, 'Minimum loan amount must be positive'),
  max_loan_amount: z.number().min(0, 'Maximum loan amount must be positive'),
  min_credit_score: z.number().min(300, 'Minimum credit score must be at least 300').max(850, 'Maximum credit score cannot exceed 850'),
  min_time_in_business: z.number().min(0, 'Minimum time in business must be positive'),
  interest_rate_min: z.number().min(0, 'Minimum interest rate must be positive'),
  interest_rate_max: z.number().min(0, 'Maximum interest rate must be positive'),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  application_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  processing_time: z.string().min(1, 'Processing time is required'),
  approval_rate: z.number().min(0, 'Approval rate must be positive').max(100, 'Approval rate cannot exceed 100'),
  rating: z.number().min(0, 'Rating must be positive').max(5, 'Rating cannot exceed 5'),
  reviews_count: z.number().min(0, 'Reviews count must be positive'),
  commission_rate: z.number().min(0, 'Commission rate must be positive').max(100, 'Commission rate cannot exceed 100'),
  industries_served: z.array(z.string()),
  states_served: z.array(z.string()),
  loan_products: z.array(z.object({
    name: z.string().min(1, 'Product name is required'),
    product_type: z.enum(['term_loan', 'line_of_credit', 'equipment_financing', 'working_capital', 'sba_loan', 'merchant_cash_advance', 'invoice_factoring', 'real_estate']),
    min_amount: z.number().min(0, 'Minimum amount must be positive'),
    max_amount: z.number().min(0, 'Maximum amount must be positive'),
    min_term_months: z.number().min(1, 'Minimum term must be at least 1 month'),
    max_term_months: z.number().min(1, 'Maximum term must be at least 1 month'),
    interest_rate_min: z.number().min(0, 'Minimum rate must be positive'),
    interest_rate_max: z.number().min(0, 'Maximum rate must be positive'),
    origination_fee: z.number().min(0, 'Origination fee must be positive').optional(),
    collateral_required: z.boolean(),
    personal_guarantee_required: z.boolean(),
  }))
});

type LenderFormData = z.infer<typeof lenderSchema>;

interface LenderModalProps {
  lender?: Lender | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LENDER_TYPES = [
  { value: 'bank', label: 'Traditional Bank' },
  { value: 'credit_union', label: 'Credit Union' },
  { value: 'online_lender', label: 'Online Lender' },
  { value: 'sba_preferred', label: 'SBA Preferred Lender' },
  { value: 'alternative', label: 'Alternative Lender' },
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'factoring', label: 'Factoring Company' },
];

const PRODUCT_TYPES = [
  { value: 'term_loan', label: 'Term Loan' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'equipment_financing', label: 'Equipment Financing' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'sba_loan', label: 'SBA Loan' },
  { value: 'merchant_cash_advance', label: 'Merchant Cash Advance' },
  { value: 'invoice_factoring', label: 'Invoice Factoring' },
  { value: 'real_estate', label: 'Real Estate Loan' },
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 
  'VA', 'WA', 'WV', 'WI', 'WY'
];

const INDUSTRIES = [
  'All Industries',
  'Agriculture',
  'Construction',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Technology',
  'Transportation',
  'Professional Services',
  'Food Service',
  'Real Estate',
  'Finance',
  'Education',
  'Entertainment'
];

export function LenderModal({ lender, onClose, onSuccess }: LenderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'products' | 'requirements'>('basic');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<LenderFormData>({
    resolver: zodResolver(lenderSchema),
    defaultValues: {
      name: lender?.name || '',
      description: lender?.description || '',
      lender_type: lender?.lender_type || 'bank',
      min_loan_amount: lender?.min_loan_amount || 10000,
      max_loan_amount: lender?.max_loan_amount || 1000000,
      min_credit_score: lender?.min_credit_score || 600,
      min_time_in_business: lender?.min_time_in_business || 12,
      interest_rate_min: lender?.interest_rate_range?.min || 6.0,
      interest_rate_max: lender?.interest_rate_range?.max || 15.0,
      logo_url: lender?.logo_url || '',
      website_url: lender?.contact_info?.website || '',
      application_url: lender?.contact_info?.application_url || '',
      contact_phone: lender?.contact_info?.phone || '',
      contact_email: lender?.contact_info?.email || '',
      processing_time: lender?.processing_time || '3-5 business days',
      approval_rate: lender?.approval_rate || 75,
      rating: lender?.rating || 4.0,
      reviews_count: lender?.reviews_count || 0,
      commission_rate: lender?.commission_rate || 1.5,
      industries_served: lender?.industries_served || ['All Industries'],
      states_served: lender?.states_served || ['All'],
      loan_products: lender?.loan_products || [{
        name: 'Business Term Loan',
        product_type: 'term_loan',
        min_amount: 10000,
        max_amount: 500000,
        min_term_months: 12,
        max_term_months: 60,
        interest_rate_min: 6.0,
        interest_rate_max: 15.0,
        origination_fee: 2.5,
        collateral_required: false,
        personal_guarantee_required: true,
      }]
    }
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: 'loan_products'
  });

  const onSubmit = async (data: LenderFormData) => {
    setIsSubmitting(true);
    try {
      const url = lender ? `/api/admin/lenders/${lender.id}` : '/api/admin/lenders';
      const method = lender ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        onSuccess();
      } else {
        throw new Error('Failed to save lender');
      }
    } catch (error) {
      console.error('Error saving lender:', error);
      alert('Failed to save lender. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = () => {
    appendProduct({
      name: 'New Product',
      product_type: 'term_loan',
      min_amount: 10000,
      max_amount: 100000,
      min_term_months: 12,
      max_term_months: 36,
      interest_rate_min: 8.0,
      interest_rate_max: 18.0,
      origination_fee: 2.0,
      collateral_required: false,
      personal_guarantee_required: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {lender ? 'Edit Lender' : 'Add New Lender'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', name: 'Basic Info' },
              { id: 'products', name: 'Loan Products' },
              { id: 'requirements', name: 'Requirements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Name *
                    </label>
                    <input
                      {...register('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chase Business Banking"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lender Type *
                    </label>
                    <select
                      {...register('lender_type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {LENDER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.lender_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.lender_type.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the lender and their services..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Loan Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Loan Amount *
                    </label>
                    <input
                      {...register('min_loan_amount', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10000"
                    />
                    {errors.min_loan_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.min_loan_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Loan Amount *
                    </label>
                    <input
                      {...register('max_loan_amount', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000000"
                    />
                    {errors.max_loan_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.max_loan_amount.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Credit Score *
                    </label>
                    <input
                      {...register('min_credit_score', { valueAsNumber: true })}
                      type="number"
                      min="300"
                      max="850"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="600"
                    />
                    {errors.min_credit_score && (
                      <p className="mt-1 text-sm text-red-600">{errors.min_credit_score.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Time in Business (months) *
                    </label>
                    <input
                      {...register('min_time_in_business', { valueAsNumber: true })}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                    />
                    {errors.min_time_in_business && (
                      <p className="mt-1 text-sm text-red-600">{errors.min_time_in_business.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%) *
                    </label>
                    <input
                      {...register('commission_rate', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.5"
                    />
                    {errors.commission_rate && (
                      <p className="mt-1 text-sm text-red-600">{errors.commission_rate.message}</p>
                    )}
                  </div>
                </div>

                {/* Interest Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Interest Rate (%) *
                    </label>
                    <input
                      {...register('interest_rate_min', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6.0"
                    />
                    {errors.interest_rate_min && (
                      <p className="mt-1 text-sm text-red-600">{errors.interest_rate_min.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Interest Rate (%) *
                    </label>
                    <input
                      {...register('interest_rate_max', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15.0"
                    />
                    {errors.interest_rate_max && (
                      <p className="mt-1 text-sm text-red-600">{errors.interest_rate_max.message}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <input
                      {...register('logo_url')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                    {errors.logo_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      {...register('website_url')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.lender.com"
                    />
                    {errors.website_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application URL
                    </label>
                    <input
                      {...register('application_url')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.lender.com/apply"
                    />
                    {errors.application_url && (
                      <p className="mt-1 text-sm text-red-600">{errors.application_url.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      {...register('contact_phone')}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1-800-555-0123"
                    />
                    {errors.contact_phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loan Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Loan Products</h3>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex items-center space-x-1"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                {productFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Product #{index + 1}
                      </h4>
                      {productFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          {...register(`loan_products.${index}.name`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Business Term Loan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Type *
                        </label>
                        <select
                          {...register(`loan_products.${index}.product_type`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {PRODUCT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Amount *
                        </label>
                        <input
                          {...register(`loan_products.${index}.min_amount`, { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="10000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Amount *
                        </label>
                        <input
                          {...register(`loan_products.${index}.max_amount`, { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Term (months) *
                        </label>
                        <input
                          {...register(`loan_products.${index}.min_term_months`, { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Term (months) *
                        </label>
                        <input
                          {...register(`loan_products.${index}.max_term_months`, { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="60"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Rate (%) *
                        </label>
                        <input
                          {...register(`loan_products.${index}.interest_rate_min`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="6.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Rate (%) *
                        </label>
                        <input
                          {...register(`loan_products.${index}.interest_rate_max`, { valueAsNumber: true })}
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="15.0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center">
                        <input
                          {...register(`loan_products.${index}.collateral_required`)}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Collateral Required
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          {...register(`loan_products.${index}.personal_guarantee_required`)}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Personal Guarantee Required
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Geographic & Industry Coverage</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industries Served
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {INDUSTRIES.map(industry => (
                      <label key={industry} className="flex items-center">
                        <input
                          type="checkbox"
                          value={industry}
                          {...register('industries_served')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    States Served
                  </label>
                  <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                    <label className="flex items-center col-span-2">
                      <input
                        type="checkbox"
                        value="All"
                        {...register('states_served')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium">All States</span>
                    </label>
                    {US_STATES.map(state => (
                      <label key={state} className="flex items-center">
                        <input
                          type="checkbox"
                          value={state}
                          {...register('states_served')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-sm text-gray-700">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Time *
                    </label>
                    <input
                      {...register('processing_time')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3-5 business days"
                    />
                    {errors.processing_time && (
                      <p className="mt-1 text-sm text-red-600">{errors.processing_time.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Rate (%) *
                    </label>
                    <input
                      {...register('approval_rate', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="75"
                    />
                    {errors.approval_rate && (
                      <p className="mt-1 text-sm text-red-600">{errors.approval_rate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating (1-5) *
                    </label>
                    <input
                      {...register('rating', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4.0"
                    />
                    {errors.rating && (
                      <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
 {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{lender ? 'Update Lender' : 'Add Lender'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}