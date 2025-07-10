'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Building, FileText, Calendar, MapPin } from 'lucide-react';

const businessFoundationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ein: z.string().min(9, 'EIN must be 9 digits').max(9, 'EIN must be 9 digits'),
  businessType: z.string().min(1, 'Business type is required'),
  stateOfIncorporation: z.string().min(1, 'State of incorporation is required'),
  yearEstablished: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Invalid year'),
  businessAddress: z.string().min(1, 'Business address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
});

type BusinessFoundationData = z.infer<typeof businessFoundationSchema>;

interface BusinessFoundationProps {
  data: Partial<BusinessFoundationData>;
  onUpdate: (data: Partial<BusinessFoundationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
}

const BUSINESS_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'LLC',
  'Corporation',
  'S-Corporation',
  'Non-Profit',
  'Other'
];

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export function BusinessFoundation({ 
  data, 
  onUpdate, 
  onNext, 
  onPrevious, 
  isFirst 
}: BusinessFoundationProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<BusinessFoundationData>({
    resolver: zodResolver(businessFoundationSchema),
    defaultValues: data,
    mode: 'onChange'
  });

  const watchedData = watch();

  useEffect(() => {
    onUpdate(watchedData);
  }, [watchedData, onUpdate]);

  const onSubmit = (formData: BusinessFoundationData) => {
    onUpdate(formData);
    onNext();
  };

  const formatEIN = (value: string) => {
    // Remove any non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XX-XXXXXXX
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
    }
    return digits;
  };

  const handleEINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEIN(e.target.value);
    setValue('ein', formatted.replace('-', ''), { shouldValidate: true });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Business Foundation
        </h2>
        <p className="text-gray-600">
          Let's start with your basic business information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="inline w-4 h-4 mr-1" />
            Business Name *
          </label>
          <input
            {...register('businessName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your business name"
          />
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
          )}
        </div>

        {/* EIN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-1" />
            Federal EIN (Employer Identification Number) *
          </label>
          <input
            {...register('ein')}
            onChange={handleEINChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="XX-XXXXXXX"
            maxLength={10}
          />
          {errors.ein && (
            <p className="mt-1 text-sm text-red-600">{errors.ein.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            9-digit number assigned by the IRS
          </p>
        </div>

        {/* Business Type & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Type *
            </label>
            <select
              {...register('businessType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select business type</option>
              {BUSINESS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Year Established *
            </label>
            <input
              {...register('yearEstablished', { valueAsNumber: true })}
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="YYYY"
            />
            {errors.yearEstablished && (
              <p className="mt-1 text-sm text-red-600">{errors.yearEstablished.message}</p>
            )}
          </div>
        </div>

        {/* State of Incorporation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State of Incorporation *
          </label>
          <select
            {...register('stateOfIncorporation')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select state</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.stateOfIncorporation && (
            <p className="mt-1 text-sm text-red-600">{errors.stateOfIncorporation.message}</p>
          )}
        </div>

        {/* Business Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            Business Address *
          </label>
          <input
            {...register('businessAddress')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Street address"
          />
          {errors.businessAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
          )}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              {...register('city')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              {...register('state')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select state</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              {...register('zipCode')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12345"
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              {...register('phoneNumber')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website (Optional)
            </label>
            <input
              {...register('website')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.yourwebsite.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirst}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            type="submit"
            disabled={!isValid}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Financial Health →
          </button>
        </div>
      </form>
    </div>
  );
}