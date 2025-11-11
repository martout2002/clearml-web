'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { generateColorPalette, CHART_CONFIG, formatNumber, formatPercentage } from '@/lib/utils/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  animated?: boolean;
  colors?: string[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const total = payload[0].payload.percent ? 100 / payload[0].payload.percent * data.value! : data.value!;
  const percentage = payload[0].payload.percent || (data.value! / total) * 100;

  return (
    <div
      className="rounded-lg border bg-background p-3 shadow-lg"
      style={{ ...CHART_CONFIG.tooltipStyle }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="font-medium">{data.name}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Value:</span>{' '}
          <span className="font-medium">{formatNumber(data.value as number)}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Percentage:</span>{' '}
          <span className="font-medium">{formatPercentage(percentage)}</span>
        </div>
      </div>
    </div>
  );
};

const renderCustomLabel = (entry: any, showPercentage: boolean) => {
  if (showPercentage) {
    return `${formatPercentage(entry.percent * 100)}`;
  }
  return entry.name;
};

export function PieChart({
  data,
  title,
  description,
  height = 350,
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  showPercentage = true,
  innerRadius = 0,
  outerRadius = 80,
  animated = true,
  colors,
}: PieChartProps) {
  // Generate colors if not provided
  const defaultColors = colors || generateColorPalette(data.length);
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index],
  }));

  const chartContent = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          labelLine={showLabels}
          label={showLabels ? (entry) => renderCustomLabel(entry, showPercentage) : false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
          isAnimationActive={animated}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
        )}
      </RechartsPieChart>
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
