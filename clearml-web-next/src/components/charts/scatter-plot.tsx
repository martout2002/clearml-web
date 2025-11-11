'use client';

import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
  TooltipProps,
} from 'recharts';
import { generateColorPalette, CHART_CONFIG, formatNumber } from '@/lib/utils/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ScatterPlotDataPoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

export interface ScatterPlotSeries {
  data: ScatterPlotDataPoint[];
  name: string;
  color?: string;
}

export interface ScatterPlotProps {
  series: ScatterPlotSeries[];
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatXAxis?: (value: number) => string;
  formatYAxis?: (value: number) => string;
  animated?: boolean;
  zoomEnabled?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div
      className="rounded-lg border bg-background p-3 shadow-lg"
      style={{ ...CHART_CONFIG.tooltipStyle }}
    >
      {data.name && <p className="text-sm font-medium mb-2">{data.name}</p>}
      <div className="space-y-1">
        <div className="text-sm">
          <span className="text-muted-foreground">X:</span>{' '}
          <span className="font-medium">{formatNumber(data.x)}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Y:</span>{' '}
          <span className="font-medium">{formatNumber(data.y)}</span>
        </div>
        {data.z !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Size:</span>{' '}
            <span className="font-medium">{formatNumber(data.z)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export function ScatterPlot({
  series,
  title,
  description,
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  formatXAxis = formatNumber,
  formatYAxis = formatNumber,
  animated = true,
  zoomEnabled = false,
}: ScatterPlotProps) {
  // Generate colors for series that don't have them
  const colors = generateColorPalette(series.length);
  const seriesWithColors = series.map((s, i) => ({
    ...s,
    color: s.color || colors[i],
  }));

  // Calculate axis domains
  const allPoints = seriesWithColors.flatMap((s) => s.data);
  const xValues = allPoints.map((p) => p.x);
  const yValues = allPoints.map((p) => p.y);
  const xDomain: [number, number] = [Math.min(...xValues), Math.max(...xValues)];
  const yDomain: [number, number] = [Math.min(...yValues), Math.max(...yValues)];

  // Add padding to domains
  const xPadding = (xDomain[1] - xDomain[0]) * 0.1;
  const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
  const paddedXDomain: [number, number] = [xDomain[0] - xPadding, xDomain[1] + xPadding];
  const paddedYDomain: [number, number] = [yDomain[0] - yPadding, yDomain[1] + yPadding];

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsScatterChart
        margin={CHART_CONFIG.margin}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            style={CHART_CONFIG.gridStyle}
          />
        )}
        <XAxis
          type="number"
          dataKey="x"
          name={xAxisLabel || 'X'}
          tickFormatter={formatXAxis}
          style={CHART_CONFIG.axisStyle}
          domain={paddedXDomain}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yAxisLabel || 'Y'}
          tickFormatter={formatYAxis}
          style={CHART_CONFIG.axisStyle}
          domain={paddedYDomain}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Size" />
        {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />}
        {showLegend && (
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
        )}
        {seriesWithColors.map((s, index) => (
          <Scatter
            key={index}
            name={s.name}
            data={s.data}
            fill={s.color}
            isAnimationActive={animated}
          />
        ))}
      </RechartsScatterChart>
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
