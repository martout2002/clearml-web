/**
 * Chart utilities for data visualization
 * Provides color palettes, formatters, and configuration helpers
 */

/**
 * Default color palette for charts
 * Based on a professional, accessible color scheme
 */
export const CHART_COLORS = {
  primary: [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ],
  categorical: [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#84cc16', // lime
    '#6366f1', // indigo
  ],
  sequential: [
    '#dbeafe',
    '#bfdbfe',
    '#93c5fd',
    '#60a5fa',
    '#3b82f6',
    '#2563eb',
    '#1d4ed8',
    '#1e40af',
    '#1e3a8a',
  ],
  diverging: [
    '#ef4444',
    '#f87171',
    '#fca5a5',
    '#fecaca',
    '#f3f4f6',
    '#a5f3fc',
    '#67e8f9',
    '#22d3ee',
    '#06b6d4',
  ],
};

/**
 * Generate a color palette with specified number of colors
 */
export function generateColorPalette(count: number): string[] {
  const colors = CHART_COLORS.categorical;
  if (count <= colors.length) {
    return colors.slice(0, count);
  }

  // If we need more colors, cycle through with opacity variations
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const colorIndex = i % colors.length;
    const opacity = 1 - Math.floor(i / colors.length) * 0.2;
    const color = colors[colorIndex]!;
    result.push(opacity === 1 ? color : `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
  }
  return result;
}

/**
 * Format large numbers with suffixes (K, M, B)
 */
export function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format decimal values with specified precision
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format timestamp for chart axis
 */
export function formatChartDate(timestamp: string | number | Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = new Date(timestamp);

  switch (format) {
    case 'short':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case 'medium':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Common chart configuration options
 */
export const CHART_CONFIG = {
  margin: {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5,
  },
  gridStyle: {
    stroke: 'hsl(var(--border))',
    strokeOpacity: 0.2,
  },
  axisStyle: {
    stroke: 'hsl(var(--border))',
    fontSize: 12,
    fill: 'hsl(var(--muted-foreground))',
  },
  tooltipStyle: {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    padding: '12px',
  },
};

/**
 * Get gradient ID for area charts
 */
export function getGradientId(name?: string): string {
  if (!name) return 'gradient-default';
  return `gradient-${name.replace(/\s+/g, '-').toLowerCase()}`;
}

/**
 * Calculate trend direction and percentage change
 */
export function calculateTrend(current: number, previous: number): {
  direction: 'up' | 'down' | 'neutral';
  percentage: number;
  isPositive: boolean;
} {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'up' : 'neutral',
      percentage: 0,
      isPositive: current > 0,
    };
  }

  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const isPositive = change > 0;

  return {
    direction,
    percentage: Math.abs(change),
    isPositive,
  };
}

/**
 * Aggregate data by time period
 */
export function aggregateByPeriod<T extends { timestamp: string | number | Date }>(
  data: T[],
  period: 'hour' | 'day' | 'week' | 'month',
  aggregateFn: (items: T[]) => number
): { timestamp: Date; value: number }[] {
  const groups = new Map<string, T[]>();

  data.forEach((item) => {
    const date = new Date(item.timestamp);
    let key: string;

    switch (period) {
      case 'hour':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        break;
      case 'week':
        const weekNumber = Math.floor(date.getDate() / 7);
        key = `${date.getFullYear()}-${date.getMonth()}-${weekNumber}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${date.getMonth()}`;
        break;
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    const group = groups.get(key);
    if (group) {
      group.push(item);
    }
  });

  return Array.from(groups.entries())
    .filter(([_, items]) => items.length > 0)
    .map(([_, items]) => ({
      timestamp: new Date(items[0]!.timestamp),
      value: aggregateFn(items),
    }));
}

/**
 * Smooth data using moving average
 */
export function smoothData(data: number[], windowSize: number = 5): number[] {
  if (data.length < windowSize) {
    return data;
  }

  const smoothed: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const average = window.reduce((sum, val) => sum + val, 0) / window.length;
    smoothed.push(average);
  }

  return smoothed;
}

/**
 * Generate tick values for axis
 */
export function generateTicks(min: number, max: number, count: number = 5): number[] {
  const range = max - min;
  const step = range / (count - 1);
  const ticks: number[] = [];

  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i);
  }

  return ticks;
}
