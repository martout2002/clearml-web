'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { calculateTrend, formatNumber, formatPercentage } from '@/lib/utils/charts';

export interface MetricCardDataPoint {
  value: number;
}

export interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  data?: MetricCardDataPoint[];
  description?: string;
  icon?: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
  showTrend?: boolean;
  showSparkline?: boolean;
  trendLabel?: string;
  sparklineColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  data = [],
  description,
  icon,
  format = 'number',
  showTrend = true,
  showSparkline = true,
  trendLabel,
  sparklineColor = 'hsl(var(--primary))',
  className,
}: MetricCardProps) {
  // Calculate trend if previousValue is provided
  const trend = previousValue !== undefined ? calculateTrend(value, previousValue) : null;

  // Format the main value
  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return `$${formatNumber(val)}`;
      case 'percentage':
        return formatPercentage(val);
      default:
        return formatNumber(val);
    }
  };

  // Prepare sparkline data
  const sparklineData = data.length > 0 ? data : [{ value }];

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="text-2xl font-bold">{formatValue(value)}</div>

          {/* Trend Indicator */}
          {showTrend && trend && (
            <div className="flex items-center gap-2 text-xs">
              {trend.direction === 'up' && (
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5',
                    trend.isPositive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}
                >
                  <ArrowUp className="h-3 w-3" />
                  <span className="font-medium">{formatPercentage(trend.percentage)}</span>
                </div>
              )}
              {trend.direction === 'down' && (
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5',
                    !trend.isPositive
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  )}
                >
                  <ArrowDown className="h-3 w-3" />
                  <span className="font-medium">{formatPercentage(trend.percentage)}</span>
                </div>
              )}
              {trend.direction === 'neutral' && (
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <Minus className="h-3 w-3" />
                  <span className="font-medium">0%</span>
                </div>
              )}
              {trendLabel && (
                <span className="text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}

          {/* Description or Sparkline */}
          {showSparkline && data.length > 1 ? (
            <div className="h-[40px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColor}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
