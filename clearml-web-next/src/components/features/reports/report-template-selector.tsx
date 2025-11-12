import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  FileText,
  TrendingUp,
  Zap,
  Settings,
  CheckCircle2,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

interface ReportTemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
}

const templates: Template[] = [
  {
    id: 'task-comparison',
    name: 'Task Comparison',
    description: 'Compare performance metrics across multiple tasks',
    icon: <BarChart3 className="h-8 w-8" />,
    features: [
      'Side-by-side task metrics',
      'Performance charts',
      'Statistical analysis',
      'Customizable filters',
    ],
    recommended: true,
  },
  {
    id: 'project-summary',
    name: 'Project Summary',
    description: 'Comprehensive overview of project activities and progress',
    icon: <FileText className="h-8 w-8" />,
    features: [
      'Project timeline',
      'Task distribution',
      'Resource utilization',
      'Team collaboration stats',
    ],
    recommended: true,
  },
  {
    id: 'performance-trends',
    name: 'Performance Trends',
    description: 'Track model performance over time',
    icon: <TrendingUp className="h-8 w-8" />,
    features: [
      'Time-series analysis',
      'Metric trends',
      'Anomaly detection',
      'Predictive insights',
    ],
  },
  {
    id: 'resource-optimization',
    name: 'Resource Optimization',
    description: 'Analyze and optimize resource usage',
    icon: <Zap className="h-8 w-8" />,
    features: [
      'CPU/GPU utilization',
      'Memory analysis',
      'Cost tracking',
      'Efficiency recommendations',
    ],
  },
  {
    id: 'custom',
    name: 'Custom Report',
    description: 'Build a completely custom report from scratch',
    icon: <Settings className="h-8 w-8" />,
    features: [
      'Flexible layout',
      'Custom metrics',
      'Advanced filtering',
      'Full customization',
    ],
  },
];

export function ReportTemplateSelector({ onSelectTemplate }: ReportTemplateSelectorProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
          onClick={() => onSelectTemplate(template.id)}
        >
          {template.recommended && (
            <Badge className="absolute top-4 right-4">Recommended</Badge>
          )}

          <div className="space-y-4">
            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {template.icon}
            </div>

            {/* Title and Description */}
            <div>
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2">
              {template.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            <Button
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate(template.id);
              }}
            >
              Select Template
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
