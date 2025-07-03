// Chart utility functions and formatters
export const formatScore = (score: number): string => {
  return `${score}/100`;
};

export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

export const formatChange = (change: number): string => {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change}%`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getChangeColor = (change: number): string => {
  if (change > 0) return '#10b981'; // Green
  if (change < 0) return '#ef4444'; // Red
  return '#6b7280'; // Gray
};

export const getScoreColorByValue = (score: number): string => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Amber
  if (score >= 40) return '#ef4444'; // Red
  return '#6b7280'; // Gray
};

export const calculateTrend = (data: Array<{ score: number }>): number => {
  if (data.length < 2) return 0;
  
  const firstScore = data[0].score;
  const lastScore = data[data.length - 1].score;
  
  return ((lastScore - firstScore) / firstScore) * 100;
};

export const getScoreGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const c1 = hex(color1);
  const c2 = hex(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

