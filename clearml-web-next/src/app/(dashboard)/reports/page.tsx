'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportCard } from '@/components/features/reports/report-card';
import { ReportBuilder } from '@/components/features/reports/report-builder';
import { ReportTemplateSelector } from '@/components/features/reports/report-template-selector';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Plus,
  FileText,
  Download,
  Share2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export interface Report {
  id: string;
  name: string;
  description?: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'published';
  config: {
    dateRange?: { from: string; to: string };
    filters?: Record<string, any>;
    charts?: string[];
  };
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'my-reports' | 'create'>('my-reports');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Mock reports data
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Task Performance',
      description: 'Overview of all tasks completed in the last month',
      template: 'task-comparison',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-10',
      createdBy: 'John Doe',
      status: 'published',
      config: {
        dateRange: {
          from: '2024-10-01',
          to: '2024-10-31',
        },
        charts: ['status-distribution', 'completion-timeline'],
      },
    },
    {
      id: '2',
      name: 'Project Summary Q4 2024',
      description: 'Comprehensive summary of all projects in Q4',
      template: 'project-summary',
      createdAt: '2024-10-15',
      updatedAt: '2024-11-05',
      createdBy: 'Jane Smith',
      status: 'published',
      config: {
        dateRange: {
          from: '2024-10-01',
          to: '2024-12-31',
        },
        filters: {
          status: ['active', 'completed'],
        },
      },
    },
    {
      id: '3',
      name: 'Model Training Metrics',
      description: 'Analysis of model training performance',
      template: 'custom',
      createdAt: '2024-11-08',
      updatedAt: '2024-11-08',
      createdBy: 'John Doe',
      status: 'draft',
      config: {
        charts: ['accuracy-trend', 'loss-curve', 'resource-usage'],
      },
    },
  ]);

  const handleExportReport = (reportId: string, format: 'pdf' | 'csv') => {
    const report = reports.find((r) => r.id === reportId);
    toast({
      title: `Exporting ${format.toUpperCase()}`,
      description: `"${report?.name}" is being exported as ${format.toUpperCase()}...`,
    });
    // TODO: Implement actual export logic
  };

  const handleShareReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    toast({
      title: 'Share link copied',
      description: `Share link for "${report?.name}" has been copied to clipboard.`,
    });
    // TODO: Implement actual share logic
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    setReports(reports.filter((r) => r.id !== reportId));
    toast({
      title: 'Report deleted',
      description: `"${report?.name}" has been deleted.`,
      variant: 'destructive',
    });
  };

  const handleCreateReport = (template: string) => {
    setSelectedTemplate(template);
    setActiveTab('create');
  };

  const handleSaveReport = (reportData: Partial<Report>) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newReport: Report = {
      id: Date.now().toString(),
      name: reportData.name || 'Untitled Report',
      description: reportData.description,
      template: reportData.template || selectedTemplate || 'custom',
      createdAt: currentDate as string,
      updatedAt: currentDate as string,
      createdBy: 'Current User',
      status: 'draft',
      config: reportData.config || {},
    };

    setReports([newReport, ...reports]);
    setActiveTab('my-reports');
    setSelectedTemplate(null);

    toast({
      title: 'Report created',
      description: `"${newReport.name}" has been created successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Create and manage custom reports for your experiments and projects
          </p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">
                {reports.filter((r) => r.status === 'published').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drafts</p>
              <p className="text-2xl font-bold">
                {reports.filter((r) => r.status === 'draft').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">
                {
                  reports.filter((r) => {
                    const reportDate = new Date(r.createdAt);
                    const now = new Date();
                    return (
                      reportDate.getMonth() === now.getMonth() &&
                      reportDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="my-reports">
            <FileText className="mr-2 h-4 w-4" />
            My Reports
          </TabsTrigger>
          <TabsTrigger value="create">
            <BarChart3 className="mr-2 h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        {/* My Reports Tab */}
        <TabsContent value="my-reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first report to get started with analytics and insights
              </p>
              <Button onClick={() => setActiveTab('create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Report
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onExport={(format) => handleExportReport(report.id, format)}
                  onShare={() => handleShareReport(report.id)}
                  onDelete={() => handleDeleteReport(report.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Create Report Tab */}
        <TabsContent value="create" className="space-y-6">
          {!selectedTemplate ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Choose a Template</h2>
                <p className="text-muted-foreground">
                  Select a template to get started quickly, or create a custom report from scratch
                </p>
              </div>

              <ReportTemplateSelector onSelectTemplate={handleCreateReport} />
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Build Your Report</h2>
                  <p className="text-muted-foreground">
                    Configure your report settings and visualization options
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setActiveTab('my-reports');
                  }}
                >
                  Cancel
                </Button>
              </div>

              <ReportBuilder
                template={selectedTemplate}
                onSave={handleSaveReport}
                onCancel={() => {
                  setSelectedTemplate(null);
                  setActiveTab('my-reports');
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
