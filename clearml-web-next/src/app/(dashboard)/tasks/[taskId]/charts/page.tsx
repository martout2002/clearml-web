'use client';

import { use, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart } from '@/components/charts/line-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { ScatterPlot } from '@/components/charts/scatter-plot';
import { useTask } from '@/lib/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, LineChart as LineChartIcon, TrendingUp, Activity } from 'lucide-react';

interface TaskChartsPageProps {
  params: Promise<{ taskId: string }>;
}

// Sample data generator for demonstration
// In a real app, this would come from the API
function generateScalarMetricsData() {
  const data = [];
  const baseValue = 0.5;

  for (let i = 0; i < 100; i++) {
    const epoch = i;
    const trainLoss = baseValue * Math.exp(-i / 30) + Math.random() * 0.1;
    const valLoss = baseValue * Math.exp(-i / 25) + Math.random() * 0.15 + 0.05;
    const trainAcc = Math.min(0.95, (1 - baseValue * Math.exp(-i / 30)) + Math.random() * 0.05);
    const valAcc = Math.min(0.92, (1 - baseValue * Math.exp(-i / 25)) + Math.random() * 0.05 - 0.03);

    data.push({
      name: `${epoch}`,
      epoch,
      trainLoss: Number(trainLoss.toFixed(4)),
      valLoss: Number(valLoss.toFixed(4)),
      trainAcc: Number(trainAcc.toFixed(4)),
      valAcc: Number(valAcc.toFixed(4)),
    });
  }

  return data;
}

function generateLearningRateData() {
  const data = [];

  for (let i = 0; i < 100; i++) {
    const epoch = i;
    let lr;

    // Simulate learning rate schedule
    if (i < 20) {
      lr = 0.001; // Warm up
    } else if (i < 60) {
      lr = 0.01; // Main training
    } else if (i < 80) {
      lr = 0.001; // First decay
    } else {
      lr = 0.0001; // Final decay
    }

    data.push({
      name: `${epoch}`,
      epoch,
      learningRate: lr,
    });
  }

  return data;
}

function generateGradientData() {
  const data = [];

  for (let i = 0; i < 50; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 1000,
      name: `Batch ${i}`,
    });
  }

  return data;
}

function generateMetricComparisonData() {
  return [
    { name: 'Epoch 0-20', trainLoss: 0.45, valLoss: 0.52 },
    { name: 'Epoch 21-40', trainLoss: 0.28, valLoss: 0.35 },
    { name: 'Epoch 41-60', trainLoss: 0.15, valLoss: 0.22 },
    { name: 'Epoch 61-80', trainLoss: 0.08, valLoss: 0.18 },
    { name: 'Epoch 81-100', trainLoss: 0.04, valLoss: 0.15 },
  ];
}

export default function TaskChartsPage({ params }: TaskChartsPageProps) {
  const resolvedParams = use(params);
  const { data: task, isLoading } = useTask(resolvedParams.taskId);
  const [selectedMetric, setSelectedMetric] = useState('loss');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  // Generate sample data
  const metricsData = generateScalarMetricsData();
  const learningRateData = generateLearningRateData();
  const gradientData = generateGradientData();
  const comparisonData = generateMetricComparisonData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">Task not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scalar Plots & Metrics</h2>
          <p className="text-muted-foreground">
            Visualize training metrics and performance over time
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="scalars" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scalars">
            <TrendingUp className="mr-2 h-4 w-4" />
            Scalars
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <BarChart3 className="mr-2 h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Activity className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* Scalars Tab */}
        <TabsContent value="scalars" className="space-y-6">
          {/* Loss Chart */}
          {chartType === 'line' ? (
            <LineChart
              data={metricsData}
              series={[
                { dataKey: 'trainLoss', name: 'Training Loss', color: '#3b82f6' },
                { dataKey: 'valLoss', name: 'Validation Loss', color: '#ef4444' },
              ]}
              title="Loss Over Time"
              description="Training and validation loss during model training"
              height={400}
              xAxisLabel="Epoch"
              yAxisLabel="Loss"
              formatYAxis={(value) => value.toFixed(3)}
            />
          ) : (
            <AreaChart
              data={metricsData}
              series={[
                { dataKey: 'trainLoss', name: 'Training Loss', color: '#3b82f6' },
                { dataKey: 'valLoss', name: 'Validation Loss', color: '#ef4444' },
              ]}
              title="Loss Over Time"
              description="Training and validation loss during model training"
              height={400}
              xAxisLabel="Epoch"
              yAxisLabel="Loss"
              formatYAxis={(value) => value.toFixed(3)}
            />
          )}

          {/* Accuracy Chart */}
          {chartType === 'line' ? (
            <LineChart
              data={metricsData}
              series={[
                { dataKey: 'trainAcc', name: 'Training Accuracy', color: '#10b981' },
                { dataKey: 'valAcc', name: 'Validation Accuracy', color: '#f59e0b' },
              ]}
              title="Accuracy Over Time"
              description="Training and validation accuracy during model training"
              height={400}
              xAxisLabel="Epoch"
              yAxisLabel="Accuracy"
              formatYAxis={(value) => value.toFixed(3)}
            />
          ) : (
            <AreaChart
              data={metricsData}
              series={[
                { dataKey: 'trainAcc', name: 'Training Accuracy', color: '#10b981' },
                { dataKey: 'valAcc', name: 'Validation Accuracy', color: '#f59e0b' },
              ]}
              title="Accuracy Over Time"
              description="Training and validation accuracy during model training"
              height={400}
              xAxisLabel="Epoch"
              yAxisLabel="Accuracy"
              formatYAxis={(value) => value.toFixed(3)}
            />
          )}

          {/* Learning Rate */}
          <LineChart
            data={learningRateData}
            series={[
              { dataKey: 'learningRate', name: 'Learning Rate', color: '#8b5cf6' },
            ]}
            title="Learning Rate Schedule"
            description="Learning rate changes during training"
            height={300}
            xAxisLabel="Epoch"
            yAxisLabel="Learning Rate"
            formatYAxis={(value) => value.toFixed(5)}
          />
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <BarChart
            data={comparisonData}
            series={[
              { dataKey: 'trainLoss', name: 'Training Loss', color: '#3b82f6' },
              { dataKey: 'valLoss', name: 'Validation Loss', color: '#ef4444' },
            ]}
            title="Loss Comparison by Phase"
            description="Average loss values across training phases"
            height={400}
            xAxisLabel="Training Phase"
            yAxisLabel="Average Loss"
          />

          <Card>
            <CardHeader>
              <CardTitle>Metric Summary</CardTitle>
              <CardDescription>
                Overview of model performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Final Train Loss</p>
                    <p className="text-2xl font-bold">0.04</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Final Val Loss</p>
                    <p className="text-2xl font-bold">0.15</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Final Train Acc</p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Final Val Acc</p>
                    <p className="text-2xl font-bold">91.8%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <ScatterPlot
            series={[
              {
                data: gradientData,
                name: 'Gradient Norm',
                color: '#06b6d4',
              },
            ]}
            title="Gradient Distribution"
            description="Scatter plot showing gradient norm distribution across batches"
            height={400}
            xAxisLabel="Iteration"
            yAxisLabel="Gradient Norm"
          />

          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
              <CardDescription>
                Additional training insights and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                More advanced metrics and visualizations will be available here, including:
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  <li>Gradient flow visualization</li>
                  <li>Weight distribution histograms</li>
                  <li>Activation patterns</li>
                  <li>Custom metric plots</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
