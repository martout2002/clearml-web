'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MetricCard } from '@/components/charts/metric-card';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { Activity, CheckCircle, Clock, TrendingUp } from 'lucide-react';

// Sample data generators - in a real app, this would come from API
function generateTaskTrendData() {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: Math.floor(Math.random() * 20) + 10,
      failed: Math.floor(Math.random() * 5),
      running: Math.floor(Math.random() * 8) + 2,
    });
  }
  return data;
}

function generateStatusDistribution() {
  return [
    { name: 'Completed', value: 856, color: '#10b981' },
    { name: 'Running', value: 45, color: '#3b82f6' },
    { name: 'Queued', value: 23, color: '#f59e0b' },
    { name: 'Failed', value: 12, color: '#ef4444' },
  ];
}

function generateActivityData() {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const hour = 24 - i;
    data.push({
      name: `${hour}:00`,
      tasks: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
}

function generateSparklineData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({ value: Math.floor(Math.random() * 50) + 30 });
  }
  return data;
}

export default function DashboardPage() {
  const taskTrendData = generateTaskTrendData();
  const statusDistribution = generateStatusDistribution();
  const activityData = generateActivityData();
  const sparklineData = generateSparklineData();
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to ClearML - Your MLOps Platform
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={1234}
          previousValue={1028}
          data={sparklineData}
          icon={<Activity className="h-4 w-4" />}
          trendLabel="from last month"
          showSparkline
        />

        <MetricCard
          title="Active Tasks"
          value={45}
          previousValue={38}
          icon={<Clock className="h-4 w-4" />}
          description="Currently running"
          showTrend
          showSparkline={false}
        />

        <MetricCard
          title="Completed Today"
          value={87}
          previousValue={72}
          icon={<CheckCircle className="h-4 w-4" />}
          trendLabel="vs yesterday"
          showSparkline
        />

        <MetricCard
          title="Success Rate"
          value={94.2}
          previousValue={92.8}
          format="percentage"
          icon={<TrendingUp className="h-4 w-4" />}
          trendLabel="vs last week"
          showTrend
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart
          data={taskTrendData}
          series={[
            { dataKey: 'completed', name: 'Completed', color: '#10b981' },
            { dataKey: 'running', name: 'Running', color: '#3b82f6' },
            { dataKey: 'failed', name: 'Failed', color: '#ef4444' },
          ]}
          title="Task Completion Trends"
          description="Task status over the last 30 days"
          height={300}
          xAxisLabel="Date"
          yAxisLabel="Tasks"
        />

        <PieChart
          data={statusDistribution}
          title="Task Status Distribution"
          description="Current breakdown of all tasks by status"
          height={300}
          showPercentage
        />
      </div>

      {/* Activity Chart */}
      <AreaChart
        data={activityData}
        series={[
          { dataKey: 'tasks', name: 'Active Tasks', color: '#3b82f6' },
        ]}
        title="Recent Activity"
        description="Task activity over the last 24 hours"
        height={300}
        xAxisLabel="Time"
        yAxisLabel="Active Tasks"
        gradient
      />
    </div>
  );
}
