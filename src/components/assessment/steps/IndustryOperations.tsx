'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Factory, Users, Shield, FileText, Package } from 'lucide-react';

const industryOperationsSchema = z.object({
  industry: z.string().min(1, 'Industry is required'),
  naicsCode: z.string().min(1, 'NAICS code is required'),
  numberOfEmployees: z.number().min(0, 'Number of employees must be positive'),
  hasPhysicalLocation: z.boolean(),
  businessLicenses: z.array(z.string()),
  hasInsurance: z.boolean(),
  hasContracts: z.boolean(),
  hasInventory: z.boolean(),
  inventoryValue: z.number().min(0, 'Inventory value must be positive'),
  hasEquipment: z.boolean(),
  equipmentValue: z.number().min(0, 'Equipment value must be positive'),
});

type IndustryOperationsData = z.infer<typeof industryOperationsSchema>;

interface IndustryOperationsProps {
  data: Partial<IndustryOperationsData>;
  onUpdate: (data: Partial<IndustryOperationsData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const INDUSTRIES = [
  'Agriculture, Forestry, Fishing',
  'Mining',
  'Construction',
  'Manufacturing',
  'Transportation and Warehousing',
  'Information Technology',
  'Finance and Insurance',
  'Real Estate',
  'Professional Services',
  'Management Services',
  'Educational Services',
  'Health Care',
  'Arts and Entertainment',
  'Accommodation and Food Services',
  'Retail Trade',
  'Wholesale Trade',
  'Other Services',
  'Public Administration'
];

const LICENSE_TYPES = [
  'Business License',
  'Professional License',
  'Occupational License',
  'Health Department Permit',
  'Fire Department Permit',
  'Building Permit',
  'Zoning Permit',
  'Environmental Permit',
  'Import/Export License',
  'Sales Tax Permit',
  'Employer Identification',
  'Workers Compensation',
  'Other'
];

export function IndustryOperations({ data, onUpdate, onNext, onPrevious }: IndustryOperationsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<IndustryOperationsData>({
    resolver: zodResolver(industryOperationsSchema),
    defaultValues: {
      ...data,
      businessLicenses: data.businessLicenses || []
    },
    mode: 'onChange'
  });

  const watchedData = watch();
  const hasInventory = watch('hasInventory');
  const hasEquipment = watch('hasEquipment');
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    data.businessLicenses || []
  );

  useEffect(() => {
    onUpdate(watchedData);
  }, [watchedData, onUpdate]);

  useEffect(() => {
    setValue('businessLicenses', selectedLicenses);
  }, [selectedLicenses, setValue]);

  const onSubmit = (formData: IndustryOperationsData) => {
    onUpdate(formData);
    onNext();
  };

  const handleLicenseChange = (license: string, checked: boolean) => {
    if (checked) {
      setSelectedLicenses([...selectedLicenses, license]);
    } else {
      setSelectedLicenses(selectedLicenses.filter(l => l !== license));
    }
  };

  const getOperationalScore = () => {
    let score = 0;
    if (watchedData.hasPhysicalLocation) score += 15;
    if (watchedData.hasInsurance) score += 20;
    if (watchedData.hasContracts) score += 15;
    if (watchedData.numberOfEmployees && watchedData.numberOfEmployees > 0) score += 10;
    if (selectedLicenses.length > 0) score += 20;
    if (watchedData.hasInventory && watchedData.inventoryValue && watchedData.inventoryValue > 0) score += 10;
    if (watchedData.hasEquipment && watchedData.equipmentValue && watchedData.equipmentValue > 0) score += 10;
    return Math.min(score, 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Industry & Operations
        </h2>
        <p className="text-gray-600">
          Tell us about your industry classification and business operations
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Industry Classification */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Factory className="inline w-5 h-5 mr-2" />
            Industry Classification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Industry *
              </label>
              <select
                {...register('industry')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NAICS Code *
              </label>
              <input
                {...register('naicsCode')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 541511"
              />
              {errors.naicsCode && (
                <p className="mt-1 text-sm text-red-600">{errors.naicsCode.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                <a href="https://www.naics.com/search/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Find your NAICS code here
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Business Operations */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Users className="inline w-5 h-5 mr-2" />
            Business Operations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees *
              </label>
              <input
                {...register('numberOfEmployees', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.numberOfEmployees && (
                <p className="mt-1 text-sm text-red-600">{errors.numberOfEmployees.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Include full-time, part-time, and contractors
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  {...register('hasPhysicalLocation')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I have a physical business location
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('hasContracts')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I have ongoing contracts or agreements
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Business Licenses */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FileText className="inline w-5 h-5 mr-2" />
            Business Licenses & Permits
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What licenses and permits do you have? (Select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {LICENSE_TYPES.map(license => (
                <div key={license} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLicenses.includes(license)}
                    onChange={(e) => handleLicenseChange(license, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    {license}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Shield className="inline w-5 h-5 mr-2" />
            Business Insurance
          </h3>
          
          <div className="flex items-center">
            <input
              {...register('hasInsurance')}
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              I have business insurance (General Liability, Professional Liability, etc.)
            </label>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Package className="inline w-5 h-5 mr-2" />
            Business Assets
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <input
                    {...register('hasInventory')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I maintain business inventory
                  </label>
                </div>
                
                {hasInventory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Inventory Value
                    </label>
                    <input
                      {...register('inventoryValue', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {errors.inventoryValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.inventoryValue.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <input
                    {...register('hasEquipment')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I have business equipment
                  </label>
                </div>
                
                {hasEquipment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Equipment Value
                    </label>
                    <input
                      {...register('equipmentValue', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    {errors.equipmentValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.equipmentValue.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Strength Score */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Operational Strength Score
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {getOperationalScore()}/100
              </div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {watchedData.numberOfEmployees || 0}
              </div>
              <div className="text-gray-600">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {selectedLicenses.length}
              </div>
              <div className="text-gray-600">Licenses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                ${((watchedData.inventoryValue || 0) + (watchedData.equipmentValue || 0)).toLocaleString()}
              </div>
              <div className="text-gray-600">Asset Value</div>
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
            Next: Review & Submit →
          </button>
        </div>
      </form>
    </div>
  );
}