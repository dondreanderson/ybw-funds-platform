// Chart configuration and themes
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  gray: '#6b7280'
};

export const chartTheme = {
  background: '#ffffff',
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    muted: '#9ca3af'
  },
  grid: '#e5e7eb',
  tooltip: {
    background: '#1f2937',
    text: '#ffffff',
    border: 'none',
    borderRadius: '8px'
  }
};

export const defaultChartConfig = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  fontSize: 12,
  strokeWidth: 2,
  animationDuration: 500
};

export const radarChartConfig = {
  polarGrid: {
    gridType: 'polygon' as const,
    strokeDasharray: '3 3'
  },
  polarAngleAxis: {
    tick: { fontSize: 12, fill: chartTheme.text.secondary }
  },
  polarRadiusAxis: {
    angle: 90,
    domain: [0, 100],
    tick: { fontSize: 10, fill: chartTheme.text.muted }
  }
};

export const lineChartConfig = {
  strokeWidth: 3,
  strokeDasharray: '5 5',
  gradient: {
    id: 'scoreGradient',
    stops: [
      { offset: '5%', stopColor: chartColors.primary, stopOpacity: 0.8 },
      { offset: '95%', stopColor: chartColors.primary, stopOpacity: 0.1 }
    ]
  }
};

export const barChartConfig = {
  layout: 'horizontal' as const,
  barSize: 20,
  radius: [0, 4, 4, 0] as [number, number, number, number]
};

