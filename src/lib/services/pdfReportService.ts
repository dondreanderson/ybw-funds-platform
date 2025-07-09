import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  user: {
    name: string;
    businessName: string;
    email: string;
  };
  assessment: {
    score: number;
    categoryScores: Record<string, number>;
    completedAt: string;
    recommendations: string[];
    assessmentType: 'simple' | 'comprehensive';
  };
  reportType: 'executive' | 'comprehensive' | 'improvement' | 'benchmark';
}

export class PDFReportService {
  private static getScoreGrade(score: number): { grade: string; label: string; color: string } {
    if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#10b981' };
    if (score >= 80) return { grade: 'B', label: 'Good', color: '#3b82f6' };
    if (score >= 70) return { grade: 'C', label: 'Fair', color: '#f59e0b' };
    if (score >= 60) return { grade: 'D', label: 'Poor', color: '#f97316' };
    return { grade: 'F', label: 'Very Poor', color: '#ef4444' };
  }

  static async generateExecutiveReport(data: ReportData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Cover Page
    this.addCoverPage(pdf, data, pageWidth, pageHeight);
    
    // Page 2: Executive Summary
    pdf.addPage();
    this.addExecutiveSummary(pdf, data, pageWidth);
    
    // Page 3: Recommendations
    pdf.addPage();
    this.addRecommendations(pdf, data, pageWidth);
    
    return pdf.output('blob');
  }

  static async generateComprehensiveReport(data: ReportData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Cover Page
    this.addCoverPage(pdf, data, pageWidth, pageHeight);
    
    // Executive Summary
    pdf.addPage();
    this.addExecutiveSummary(pdf, data, pageWidth);
    
    // Category Breakdown
    pdf.addPage();
    this.addCategoryBreakdown(pdf, data, pageWidth);
    
    // Industry Benchmark
    pdf.addPage();
    this.addIndustryBenchmark(pdf, data, pageWidth);
    
    // Detailed Recommendations
    pdf.addPage();
    this.addDetailedRecommendations(pdf, data, pageWidth);
    
    // Action Plan
    pdf.addPage();
    this.addActionPlan(pdf, data, pageWidth);
    
    return pdf.output('blob');
  }

  private static addCoverPage(pdf: jsPDF, data: ReportData, pageWidth: number, pageHeight: number) {
    const gradeInfo = this.getScoreGrade(data.assessment.score);
    
    // Header with logo space
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    // YBW Funds branding
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('YBW FUNDS', 20, 25);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Business Fundability Platform', 20, 35);
    
    // Report title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fundability Assessment Report', 20, 85);
    
    // Business info
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Business: ${data.user.businessName}`, 20, 105);
    pdf.text(`Prepared for: ${data.user.name}`, 20, 120);
    pdf.text(`Date: ${new Date(data.assessment.completedAt).toLocaleDateString()}`, 20, 135);
    
    // Score circle (simplified)
    const centerX = pageWidth - 60;
    const centerY = 120;
    const radius = 25;
    
    pdf.setFillColor(240, 240, 240);
    pdf.circle(centerX, centerY, radius, 'F');
    
    pdf.setTextColor(gradeInfo.color);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.assessment.score.toString(), centerX - 8, centerY + 5);
    
    pdf.setFontSize(10);
    pdf.text('/ 100', centerX + 8, centerY + 8);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(`Grade: ${gradeInfo.grade}`, centerX - 15, centerY + 20);
    pdf.text(gradeInfo.label, centerX - 15, centerY + 30);
    
    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Confidential Business Assessment Report', 20, pageHeight - 20);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
  }

  private static addExecutiveSummary(pdf: jsPDF, data: ReportData, pageWidth: number) {
    const gradeInfo = this.getScoreGrade(data.assessment.score);
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', 20, 30);
    
    // Overall assessment
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const summaryText = [
      `${data.user.businessName} has achieved a fundability score of ${data.assessment.score}/100,`,
      `earning a grade of ${gradeInfo.grade} (${gradeInfo.label}). This assessment evaluates your`,
      `business across multiple critical funding criteria.`
    ];
    
    let yPos = 50;
    summaryText.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 8;
    });
    
    // Key findings
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Findings', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Top 3 categories
    const sortedCategories = Object.entries(data.assessment.categoryScores)
      .sort(([,a], [,b]) => b - a);
    
    pdf.text('Strengths:', 20, yPos);
    yPos += 8;
    sortedCategories.slice(0, 2).forEach(([category, score]) => {
      pdf.text(`• ${category}: ${Math.round(score)}/100`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 5;
    pdf.text('Areas for Improvement:', 20, yPos);
    yPos += 8;
    sortedCategories.slice(-2).forEach(([category, score]) => {
      pdf.text(`• ${category}: ${Math.round(score)}/100`, 25, yPos);
      yPos += 6;
    });
    
    // Next steps
    yPos += 15;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Immediate Next Steps', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    data.assessment.recommendations.slice(0, 3).forEach((rec, index) => {
      const wrappedText = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
      pdf.text(wrappedText, 20, yPos);
      yPos += wrappedText.length * 6 + 3;
    });
  }

  private static addRecommendations(pdf: jsPDF, data: ReportData, pageWidth: number) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Personalized Recommendations', 20, 30);
    
    let yPos = 50;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    data.assessment.recommendations.forEach((rec, index) => {
      if (yPos > 250) { // Start new page if needed
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}.`, 20, yPos);
      pdf.setFont('helvetica', 'normal');
      
      const wrappedText = pdf.splitTextToSize(rec, pageWidth - 35);
      pdf.text(wrappedText, 28, yPos);
      yPos += wrappedText.length * 6 + 8;
    });
  }

  private static addCategoryBreakdown(pdf: jsPDF, data: ReportData, pageWidth: number) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category Performance Breakdown', 20, 30);
    
    let yPos = 55;
    
    Object.entries(data.assessment.categoryScores).forEach(([category, score]) => {
      if (yPos > 240) {
        pdf.addPage();
        yPos = 30;
      }
      
      // Category name
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(category, 20, yPos);
      
      // Score
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Score: ${Math.round(score)}/100`, pageWidth - 60, yPos);
      
      // Progress bar
      const barWidth = 100;
      const barHeight = 6;
      const barX = 20;
      const barY = yPos + 5;
      
      // Background
      pdf.setFillColor(230, 230, 230);
      pdf.rect(barX, barY, barWidth, barHeight, 'F');
      
      // Progress
      const progressWidth = (score / 100) * barWidth;
      const color = score >= 70 ? [34, 197, 94] : score >= 50 ? [251, 191, 36] : [239, 68, 68];
      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.rect(barX, barY, progressWidth, barHeight, 'F');
      
      yPos += 25;
    });
  }

  private static addIndustryBenchmark(pdf: jsPDF, data: ReportData, pageWidth: number) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Industry Benchmark Comparison', 20, 30);
    
    // Mock industry data
    const industryAvg = 68;
    const top25 = 82;
    const top10 = 91;
    
    let yPos = 60;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Your Score: ${data.assessment.score}`, 20, yPos);
    pdf.text(`Industry Average: ${industryAvg}`, 20, yPos + 15);
    pdf.text(`Top 25% Threshold: ${top25}`, 20, yPos + 30);
    pdf.text(`Top 10% Threshold: ${top10}`, 20, yPos + 45);
    
    // Performance indicator
    yPos += 70;
    let performance = 'Below Average';
    if (data.assessment.score >= top10) performance = 'Top 10%';
    else if (data.assessment.score >= top25) performance = 'Top 25%';
    else if (data.assessment.score >= industryAvg) performance = 'Above Average';
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Industry Performance: ${performance}`, 20, yPos);
  }

  private static addDetailedRecommendations(pdf: jsPDF, data: ReportData, pageWidth: number) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Action Plan', 20, 30);
    
    let yPos = 55;
    
    // Categorize recommendations by priority
    const highPriority = data.assessment.recommendations.slice(0, 3);
    const mediumPriority = data.assessment.recommendations.slice(3, 6);
    
    // High Priority
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(220, 38, 38);
    pdf.text('High Priority (Complete within 30 days)', 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    highPriority.forEach((rec, index) => {
      const wrappedText = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
      pdf.text(wrappedText, 25, yPos);
      yPos += wrappedText.length * 6 + 8;
    });
    
    if (mediumPriority.length > 0) {
      yPos += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(251, 146, 60);
      pdf.text('Medium Priority (Complete within 90 days)', 20, yPos);
      
      yPos += 15;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      mediumPriority.forEach((rec, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }
        const wrappedText = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        pdf.text(wrappedText, 25, yPos);
        yPos += wrappedText.length * 6 + 8;
      });
    }
  }

  private static addActionPlan(pdf: jsPDF, data: ReportData, pageWidth: number) {
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('90-Day Action Plan', 20, 30);
    
    const milestones = [
      {
        period: 'Week 1-2',
        tasks: ['Obtain EIN if needed', 'Open business bank account', 'Set up business phone'],
        impact: '+15-25 points'
      },
      {
        period: 'Month 1',
        tasks: ['Apply for DUNS number', 'Create business website', 'Establish trade credit'],
        impact: '+20-30 points'
      },
      {
        period: 'Month 2-3',
        tasks: ['Build credit history', 'Organize financial documents', 'Obtain business insurance'],
        impact: '+15-20 points'
      }
    ];
    
    let yPos = 55;
    
    milestones.forEach((milestone) => {
      if (yPos > 220) {
        pdf.addPage();
        yPos = 30;
      }
      
      // Period header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text(milestone.period, 20, yPos);
      
      pdf.setTextColor(34, 197, 94);
      pdf.text(`Potential Impact: ${milestone.impact}`, pageWidth - 80, yPos);
      
      yPos += 12;
      
      // Tasks
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      milestone.tasks.forEach((task) => {
        pdf.text(`• ${task}`, 25, yPos);
        yPos += 7;
      });
      
      yPos += 10;
    });
  }

  static async downloadReport(reportBlob: Blob, filename: string) {
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static generateFilename(data: ReportData): string {
    const date = new Date().toISOString().split('T')[0];
    const businessName = data.user.businessName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${businessName}_Fundability_Report_${date}`;
  }
}
