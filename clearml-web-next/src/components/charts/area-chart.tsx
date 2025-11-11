'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { generateColorPalette, CHART_CONFIG, formatNumber, getGradientId } from '@/lib/utils/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface AreaChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface AreaChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  series: AreaChartSeries[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisKey?: string;
  formatYAxis?: (value: number) => string;
  formatXAxis?: (value: string) => string;
  stacked?: boolean;
  gradient?: boolean;
  curved?: boolean;
  animated?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className="rounded-lg border bg-background p-3 shadow-lg"
      style={{ ...CHART_CONFIG.tooltipStyle }}
    >
      <p className="text-sm font-medium mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{formatNumber(entry.value as number)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function AreaChart({
  data,
  series,
  title,
  description,
  height = 350,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  xAxisKey = 'name',
  formatYAxis = formatNumber,
  formatXAxis = (value) => value,
  stacked = false,
  gradient = true,
  curved = true,
  animated = true,
}: AreaChartProps) {
  // Generate colors for series that don't have them
  const colors = generateColorPalette(series.length);
  const seriesWithColors = series.map((s, i) => ({
    ...s,
    color: s.color || colors[i],
    stackId: stacked ? (s.stackId || 'stack') : undefined,
  }));

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={CHART_CONFIG.margin}
      >
        <defs>
          {gradient && seriesWithColors.map((s) => {
            const gradientId = getGradientId(s.name);
            return (
              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0.1} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            style={CHART_CONFIG.gridStyle}
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={formatXAxis}
          style={CHART_CONFIG.axisStyle}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          tickFormatter={formatYAxis}
          style={CHART_CONFIG.axisStyle}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
        )}
        {seriesWithColors.map((s) => (
          <Area
            key={s.dataKey}
            type={curved ? 'monotone' : 'linear'}
            dataKey={s.dataKey}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={gradient ? `url(#${getGradientId(s.name)})` : s.color}
            fillOpacity={gradient ? 1 : 0.6}
            stackId={s.stackId}
            isAnimationActive={animated}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );

  if (title || description) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent style={{ minHeight: height }}>
          {chartContent}
        </CardContent>
      </Card>
    );
  }

  return <div style={{ minHeight: height }}>{chartContent}</div>;
}
