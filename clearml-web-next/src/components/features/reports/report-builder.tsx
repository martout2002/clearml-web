'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import type { Report } from '@/app/(dashboard)/reports/page';
import {
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Activity,
  Filter,
  Save,
} from 'lucide-react';

const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  description: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportBuilderProps {
  template: string;
  onSave: (report: Partial<Report>) => void;
  onCancel: () => void;
}

interface ChartOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const availableCharts: ChartOption[] = [
  {
    id: 'status-distribution',
    name: 'Status Distribution',
    description: 'Pie chart showing task status breakdown',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    id: 'completion-timeline',
    name: 'Completion Timeline',
    description: 'Timeline of task completions over time',
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Bar chart comparing key metrics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'accuracy-trend',
    name: 'Accuracy Trend',
    description: 'Line chart showing accuracy over iterations',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 'loss-curve',
    name: 'Loss Curve',
    description: 'Training and validation loss curves',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    id: 'resource-usage',
    name: 'Resource Usage',
    description: 'CPU, GPU, and memory utilization',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const statusOptions = ['queued', 'in_progress', 'completed', 'failed', 'stopped'];
const typeOptions = ['training', 'testing', 'inference', 'data_processing', 'optimization'];

export function ReportBuilder({ template, onSave, onCancel }: ReportBuilderProps) {
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: '',
      description: '',
      dateFrom: '',
      dateTo: '',
    },
  });

  const handleChartToggle = (chartId: string) => {
    setSelectedCharts((prev) =>
      prev.includes(chartId)
        ? prev.filter((id) => id !== chartId)
        : [...prev, chartId]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = (data: ReportFormData) => {
    const report: Partial<Report> = {
      name: data.name,
      description: data.description,
      template,
      config: {
        dateRange: data.dateFrom && data.dateTo
          ? { from: data.dateFrom, to: data.dateTo }
          : undefined,
        filters: {
          status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
          type: selectedTypes.length > 0 ? selectedTypes : undefined,
        },
        charts: selectedCharts,
      },
    };

    onSave(report);
  };

  const getTemplateDefaults = () => {
    switch (template) {
      case 'task-comparison':
        return {
          suggestedCharts: ['status-distribution', 'completion-timeline', 'performance-metrics'],
          description: 'Compare tasks and analyze their performance metrics',
        };
      case 'project-summary':
        return {
          suggestedCharts: ['status-distribution', 'completion-timeline'],
          description: 'Comprehensive overview of project activities',
        };
      case 'performance-trends':
        return {
          suggestedCharts: ['accuracy-trend', 'loss-curve'],
          description: 'Track model performance trends over time',
        };
      case 'resource-optimization':
        return {
          suggestedCharts: ['resource-usage', 'performance-metrics'],
          description: 'Analyze and optimize resource utilization',
        };
      default:
        return {
          suggestedCharts: [],
          description: '',
        };
    }
  };

  const templateDefaults = getTemplateDefaults();

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Q4 2024 Performance Report"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder={templateDefaults.description || 'Describe what this report analyzes...'}
              {...form.register('description')}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Date Range */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Date Range</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dateFrom">From</Label>
            <Input
              id="dateFrom"
              type="date"
              {...form.register('dateFrom')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateTo">To</Label>
            <Input
              id="dateTo"
              type="date"
              {...form.register('dateTo')}
            />
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>

        <div className="space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label>Task Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Badge
                  key={status}
                  variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleStatusToggle(status)}
                >
                  {status.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Type Filter */}
          <div className="space-y-3">
            <Label>Task Type</Label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleTypeToggle(type)}
                >
                  {type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Visualizations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Visualizations</h3>
        </div>

        {templateDefaults.suggestedCharts.length > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Suggested charts for this template:
            </p>
            <div className="flex flex-wrap gap-2">
              {templateDefaults.suggestedCharts.map((chartId) => {
                const chart = availableCharts.find((c) => c.id === chartId);
                return chart ? (
                  <Badge key={chartId} variant="secondary">
                    {chart.name}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {availableCharts.map((chart) => (
            <div
              key={chart.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCharts.includes(chart.id)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleChartToggle(chart.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedCharts.includes(chart.id)}
                  onCheckedChange={() => handleChartToggle(chart.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {chart.icon}
                    <h4 className="font-semibold text-sm">{chart.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chart.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCharts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Select at least one chart to include in your report
          </p>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={!form.formState.isValid || selectedCharts.length === 0}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || selectedCharts.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>
    </form>
  );
}
