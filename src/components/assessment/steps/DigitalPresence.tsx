'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Globe, Star, Share2, ShoppingCart, Mail } from 'lucide-react';

const digitalPresenceSchema = z.object({
  hasWebsite: z.boolean(),
  websiteAge: z.number().min(0, 'Website age must be positive'),
  hasGoogleBusiness: z.boolean(),
  hasSocialMedia: z.boolean(),
  socialMediaPlatforms: z.array(z.string()),
  onlineReviews: z.number().min(0, 'Online reviews must be positive'),
  averageRating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  hasOnlineStore: z.boolean(),
  digitalMarketingBudget: z.number().min(0, 'Digital marketing budget must be positive'),
  hasEmailMarketing: z.boolean(),
});

type DigitalPresenceData = z.infer<typeof digitalPresenceSchema>;

interface DigitalPresenceProps {
  data: Partial<DigitalPresenceData>;
  onUpdate: (data: Partial<DigitalPresenceData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SOCIAL_PLATFORMS = [
  'Facebook',
  'Instagram',
  'Twitter/X',
  'LinkedIn',
  'YouTube',
  'TikTok',
  'Pinterest',
  'Google Business',
  'Yelp',
  'Other'
];

export function DigitalPresence({ data, onUpdate, onNext, onPrevious }: DigitalPresenceProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<DigitalPresenceData>({
    resolver: zodResolver(digitalPresenceSchema),
    defaultValues: {
      ...data,
      socialMediaPlatforms: data.socialMediaPlatforms || []
    },
    mode: 'onChange'
  });

  const watchedData = watch();
  const hasWebsite = watch('hasWebsite');
  const hasSocialMedia = watch('hasSocialMedia');
  const hasOnlineStore = watch('hasOnlineStore');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    data.socialMediaPlatforms || []
  );

  useEffect(() => {
    onUpdate(watchedData);
  }, [watchedData, onUpdate]);

  useEffect(() => {
    setValue('socialMediaPlatforms', selectedPlatforms);
  }, [selectedPlatforms, setValue]);

  const onSubmit = (formData: DigitalPresenceData) => {
    onUpdate(formData);
    onNext();
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const getDigitalScore = () => {
    let score = 0;
    if (watchedData.hasWebsite) score += 20;
    if (watchedData.hasGoogleBusiness) score += 15;
    if (watchedData.hasSocialMedia) score += 10;
    if (watchedData.hasOnlineStore) score += 15;
    if (watchedData.hasEmailMarketing) score += 10;
    if (watchedData.onlineReviews && watchedData.onlineReviews > 10) score += 10;
    if (watchedData.averageRating && watchedData.averageRating >= 4) score += 10;
    if (watchedData.digitalMarketingBudget && watchedData.digitalMarketingBudget > 500) score += 10;
    return Math.min(score, 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Digital Presence
        </h2>
        <p className="text-gray-600">
          Tell us about your online presence and digital marketing efforts
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Website Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Globe className="inline w-5 h-5 mr-2" />
            Website & Online Presence
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('hasWebsite')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have a business website
              </label>
            </div>

            {hasWebsite && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long has your website been active? (years)
                </label>
                <input
                  {...register('websiteAge', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {errors.websiteAge && (
                  <p className="mt-1 text-sm text-red-600">{errors.websiteAge.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center">
              <input
                {...register('hasGoogleBusiness')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have a Google Business Profile (Google My Business)
              </label>
            </div>

            <div className="flex items-center">
              <input
                {...register('hasOnlineStore')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have an online store or e-commerce functionality
              </label>
            </div>
          </div>
        </div>

        {/* Social Media Presence */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Share2 className="inline w-5 h-5 mr-2" />
            Social Media Presence
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register('hasSocialMedia')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have active social media accounts for my business
              </label>
            </div>

            {hasSocialMedia && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which social media platforms do you use? (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SOCIAL_PLATFORMS.map(platform => (
                    <div key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform)}
                        onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Online Reviews */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Star className="inline w-5 h-5 mr-2" />
            Online Reviews & Reputation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Online Reviews *
              </label>
              <input
                {...register('onlineReviews', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.onlineReviews && (
                <p className="mt-1 text-sm text-red-600">{errors.onlineReviews.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Google, Yelp, Facebook, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Rating *
              </label>
              <select
                {...register('averageRating', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select average rating</option>
                <option value="5">5 Stars (Excellent)</option>
                <option value="4.5">4.5 Stars</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3.5">3.5 Stars</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2.5">2.5 Stars</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1.5">1.5 Stars</option>
                <option value="1">1 Star (Very Poor)</option>
              </select>
              {errors.averageRating && (
                <p className="mt-1 text-sm text-red-600">{errors.averageRating.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Digital Marketing */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <Mail className="inline w-5 h-5 mr-2" />
            Digital Marketing
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Digital Marketing Budget *
              </label>
              <input
                {...register('digitalMarketingBudget', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.digitalMarketingBudget && (
                <p className="mt-1 text-sm text-red-600">{errors.digitalMarketingBudget.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Include ads, social media, email marketing, SEO, etc.
              </p>
            </div>

            <div className="flex items-center">
              <input
                {...register('hasEmailMarketing')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have an email marketing system (newsletters, campaigns)
              </label>
            </div>
          </div>
        </div>

        {/* Digital Presence Score */}
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-2">
            Digital Presence Score
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-indigo-600">
              {getDigitalScore()}/100
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {getDigitalScore() >= 80 ? 'Strong Digital Presence' : 
                 getDigitalScore() >= 60 ? 'Good Digital Presence' : 
                 getDigitalScore() >= 40 ? 'Moderate Digital Presence' : 
                 'Limited Digital Presence'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {selectedPlatforms.length > 0 && `Active on ${selectedPlatforms.length} platform(s)`}
              </div>
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
            Next: Industry & Operations →
          </button>
        </div>
      </form>
    </div>
  );
}