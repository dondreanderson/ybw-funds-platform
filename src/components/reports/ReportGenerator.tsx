'use client';

import { useState } from 'react';
import { PDFReportService, ReportData } from '@/lib/services/pdfReportService';

interface ReportGeneratorProps {
  assessmentData: {
    score: number;
    categoryScores: Record<string, number>;
    recommendations: string[];
    completedAt: string;
  };
  userData: {
    name: string;
    businessName: string;
    email: string;
  };
  onClose?: () => void;
}

export function ReportGenerator({ assessmentData, userData, onClose }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'executive' | 'comprehensive'>('executive');

  const reportTypes = [
    {
      id: 'executive' as const,
      name: 'Executive Summary',
      description: 'Concise 3-page overview with key findings and recommendations',
      pages: '3 pages',
      features: ['Overall score and grade', 'Key strengths and weaknesses', 'Top priority recommendations', 'Next steps'],
      popular: true
    },
    {
      id: 'comprehensive' as const,
      name: 'Comprehensive Report',
      description: 'Detailed 8-12 page analysis with full breakdown and action plan',
      pages: '8-12 pages',
      features: ['Complete category breakdown', 'Industry benchmarking', 'Detailed recommendations', '90-day action plan', 'Progress tracking framework'],
      popular: false
    }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportData: ReportData = {
        user: userData,
        assessment: {
          score: assessmentData.score,
          categoryScores: assessmentData.categoryScores,
          completedAt: assessmentData.completedAt,
          recommendations: assessmentData.recommendations,
          assessmentType: 'comprehensive'
        },
        reportType: selectedReportType
      };

      const reportBlob = selectedReportType === 'executive' 
        ? await PDFReportService.generateExecutiveReport(reportData)
        : await PDFReportService.generateComprehensiveReport(reportData);

      const filename = PDFReportService.generateFilename(reportData);
      await PDFReportService.downloadReport(reportBlob, filename);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📄 Generate Professional Report</h2>
              <p className="text-blue-100 mt-1">Download your fundability assessment as a professional PDF</p>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Assessment Preview */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{userData.businessName}</h3>
              <p className="text-gray-600">Assessment completed on {new Date(assessmentData.completedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{assessmentData.score}</div>
              <div className="text-sm text-gray-500">Fundability Score</div>
            </div>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Choose Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((type) => (
              <div
                key={type.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedReportType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedReportType(type.id)}
              >
                {type.popular && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Popular
                  </div>
                )}
                
                <div className="flex items-center mb-3">
                  <input
                    type="radio"
                    checked={selectedReportType === type.id}
                    onChange={() => setSelectedReportType(type.id)}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{type.name}</h4>
                    <p className="text-sm text-blue-600">{type.pages}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Includes:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div className="p-6 bg-gray-50 border-t">
          <h4 className="font-semibold mb-4">Report Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Business</div>
              <div className="text-gray-600">{userData.businessName}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Score</div>
              <div className="text-gray-600">{assessmentData.score}/100</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Categories</div>
              <div className="text-gray-600">{Object.keys(assessmentData.categoryScores).length}</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-gray-900">Recommendations</div>
              <div className="text-gray-600">{assessmentData.recommendations.length}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  📄 Download {selectedReportType === 'executive' ? 'Executive' : 'Comprehensive'} Report
                </>
              )}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">📋 Report Features</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Professional YBW Funds branding</li>
              <li>• Secure and confidential formatting</li>
              <li>• Ready to share with investors or lenders</li>
              <li>• Includes actionable improvement plan</li>
              <li>• Industry benchmark comparisons</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
