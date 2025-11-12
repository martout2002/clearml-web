'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { generateColorPalette, CHART_CONFIG, formatNumber } from '@/lib/utils/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface BarChartSeries {
  dataKey: string;
  name: string;
  color?: string;
  stackId?: string;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  series: BarChartSeries[];
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
  horizontal?: boolean;
  animated?: boolean;
  barSize?: number;
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
              className="w-3 h-3 rounded"
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

export function BarChart({
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
  horizontal = false,
  animated = true,
  barSize,
}: BarChartProps) {
  // Generate colors for series that don't have them
  const colors = generateColorPalette(series.length);
  const seriesWithColors = series.map((s, i) => ({
    ...s,
    color: s.color || colors[i],
    stackId: stacked ? (s.stackId || 'stack') : undefined,
  }));

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={CHART_CONFIG.margin}
        layout={horizontal ? 'vertical' : 'horizontal'}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            style={CHART_CONFIG.gridStyle}
            horizontal={!horizontal}
            vertical={horizontal}
          />
        )}
        {!horizontal ? (
          <>
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
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tickFormatter={formatYAxis}
              style={CHART_CONFIG.axisStyle}
              label={yAxisLabel ? { value: yAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tickFormatter={formatXAxis}
              style={CHART_CONFIG.axisStyle}
              label={xAxisLabel ? { value: xAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        )}
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
          <Bar
            key={s.dataKey}
            dataKey={s.dataKey}
            name={s.name}
            fill={s.color}
            stackId={s.stackId}
            isAnimationActive={animated}
            barSize={barSize}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );

  if (title || description) {
    return (
      <Card>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {chartContent}
        </CardContent>
      </Card>
    );
  }

  return chartContent;
}
