import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { AssessmentState } from '@/contexts/AssessmentContext';

export interface ReportData {
  userInfo: {
    name: string;
    businessName: string;
    email: string;
    assessmentDate: string;
  };
  scores: {
    overall: number;
    grade: string;
    categoryScores: Record<string, number>;
  };
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: string;
    estimatedImpact: string;
  }>;
  responses: Record<string, any>;
  totalQuestions: number;
}

export class ReportGenerator {
  // Generate comprehensive PDF report
  static async generatePDFReport(assessmentState: AssessmentState, userInfo: any): Promise<void> {
    try {
      // Create the report data
      const reportData = this.prepareReportData(assessmentState, userInfo);
      
      // Generate HTML content for the report
      const htmlContent = this.generateHTMLReport(reportData);
      
      // Create a temporary div to render the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '8.5in';
      tempDiv.style.background = 'white';
      tempDiv.style.padding = '1in';
      document.body.appendChild(tempDiv);

      // Convert to canvas and then PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary div
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `Fundability_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to simple text report
      this.generateSimpleTextReport(assessmentState, userInfo);
    }
  }

  // Prepare structured report data
  private static prepareReportData(assessmentState: AssessmentState, userInfo: any): ReportData {
    const getGrade = (score: number) => {
      if (score >= 90) return 'A - Excellent';
      if (score >= 80) return 'B - Good';
      if (score >= 70) return 'C - Fair';
      if (score >= 60) return 'D - Poor';
      return 'F - Very Poor';
    };

    const generateRecommendations = () => {
      const recommendations: Array<{
        category: string;
        title: string;
        description: string;
        priority: string;
        estimatedImpact: string;
      }> = [];
      
      Object.entries(assessmentState.categoryScores).forEach(([category, score]) => {
        if (score < 70) {
          switch (category) {
            case 'Business Foundation':
              recommendations.push({
                category,
                title: 'Strengthen Business Foundation',
                description: 'Complete business registration and establish core infrastructure',
                priority: 'High',
                estimatedImpact: '+15-25 points'
              });
              break;
            case 'Banking & Finance':
              recommendations.push({
                category,
                title: 'Improve Banking Relationships',
                description: 'Open business accounts and establish financial tracking',
                priority: 'Critical',
                estimatedImpact: '+20-30 points'
              });
              break;
            case 'Business Credit Profile':
              recommendations.push({
                category,
                title: 'Build Business Credit',
                description: 'Establish trade accounts and monitor credit reports',
                priority: 'High',
                estimatedImpact: '+25-35 points'
              });
              break;
            default:
              recommendations.push({
                category,
                title: `Improve ${category}`,
                description: `Focus on enhancing your ${category.toLowerCase()} practices`,
                priority: 'Medium',
                estimatedImpact: '+10-20 points'
              });
          }
        }
      });

      return recommendations.slice(0, 5);
    };

    return {
      userInfo: {
        name: userInfo?.name || 'Business Owner',
        businessName: userInfo?.business_name || 'Your Business',
        email: userInfo?.email || '',
        assessmentDate: new Date().toLocaleDateString()
      },
      scores: {
        overall: assessmentState.currentScore,
        grade: getGrade(assessmentState.currentScore),
        categoryScores: assessmentState.categoryScores
      },
      recommendations: generateRecommendations(),
      responses: assessmentState.responses,
      totalQuestions: assessmentState.questions.length
    };
  }

  // Generate HTML report content
  private static generateHTMLReport(data: ReportData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fundability Assessment Report</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .score-section {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
          }
          .score-large {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
          }
          .grade {
            font-size: 20px;
            opacity: 0.9;
          }
          .section {
            margin: 30px 0;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .section h3 {
            color: #1f2937;
            margin-top: 0;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .category-item:last-child {
            border-bottom: none;
          }
          .category-score {
            font-weight: bold;
            color: #2563eb;
          }
          .recommendation {
            background: #f9fafb;
            padding: 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
          }
          .recommendation-title {
            font-weight: bold;
            color: #1f2937;
          }
          .recommendation-meta {
            display: flex;
            gap: 10px;
            margin-top: 5px;
          }
          .priority {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .priority-critical {
            background: #fee2e2;
            color: #dc2626;
          }
          .priority-high {
            background: #fed7aa;
            color: #ea580c;
          }
          .priority-medium {
            background: #dbeafe;
            color: #2563eb;
          }
          .impact {
            background: #dcfce7;
            color: #16a34a;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">YBW Funds Platform</div>
          <div class="subtitle">Business Fundability Assessment Report</div>
        </div>

        <div style="margin-bottom: 30px;">
          <strong>Business:</strong> ${data.userInfo.businessName}<br>
          <strong>Owner:</strong> ${data.userInfo.name}<br>
          <strong>Assessment Date:</strong> ${data.userInfo.assessmentDate}<br>
          <strong>Questions Completed:</strong> ${data.totalQuestions}
        </div>

        <div class="score-section">
          <h2 style="margin: 0;">Your Fundability Score</h2>
          <div class="score-large">${data.scores.overall}</div>
          <div class="grade">${data.scores.grade}</div>
        </div>

        <div class="section">
          <h3>📊 Category Breakdown</h3>
          ${Object.entries(data.scores.categoryScores).map(([category, score]) => `
            <div class="category-item">
              <span>${category}</span>
              <span class="category-score">${Math.round(score)}</span>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <h3>🎯 Personalized Recommendations</h3>
          ${data.recommendations.length > 0 ? 
            data.recommendations.map(rec => `
              <div class="recommendation">
                <div class="recommendation-title">${rec.title}</div>
                <div style="color: #6b7280; margin: 5px 0;">${rec.description}</div>
                <div class="recommendation-meta">
                  <span class="priority priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
                  <span class="impact">${rec.estimatedImpact}</span>
                </div>
              </div>
            `).join('') :
            '<div style="text-align: center; padding: 20px; color: #6b7280;">🌟 Excellent work! Your business is in great shape across all categories.</div>'
          }
        </div>

        <div class="footer">
          <div>Generated by YBW Funds Platform</div>
          <div>This report is confidential and intended for business planning purposes.</div>
        </div>
      </body>
      </html>
    `;
  }

  // Fallback simple text report
  private static generateSimpleTextReport(assessmentState: AssessmentState, userInfo: any): void {
    const content = `
FUNDABILITY ASSESSMENT REPORT
============================

Business: ${userInfo?.business_name || 'Your Business'}
Owner: ${userInfo?.name || 'Business Owner'}
Date: ${new Date().toLocaleDateString()}

OVERALL SCORE: ${assessmentState.currentScore}/100

CATEGORY BREAKDOWN:
${Object.entries(assessmentState.categoryScores).map(([category, score]) => 
  `${category}: ${Math.round(score)}`
).join('\n')}

This report contains your comprehensive fundability analysis.
Visit https://ybwfunds.com for detailed recommendations.
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fundability_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
