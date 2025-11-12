import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Report } from '@/app/(dashboard)/reports/page';
import {
  FileText,
  MoreVertical,
  Download,
  Share2,
  Edit,
  Trash2,
  Calendar,
  User,
  Eye,
} from 'lucide-react';
import { useState } from 'react';

interface ReportCardProps {
  report: Report;
  onExport: (format: 'pdf' | 'csv') => void;
  onShare: () => void;
  onDelete: () => void;
}

export function ReportCard({ report, onExport, onShare, onDelete }: ReportCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTemplateIcon = (template: string) => {
    switch (template) {
      case 'task-comparison':
        return '📊';
      case 'project-summary':
        return '📈';
      case 'custom':
        return '🔧';
      default:
        return '📄';
    }
  };

  const getTemplateLabel = (template: string) => {
    switch (template) {
      case 'task-comparison':
        return 'Task Comparison';
      case 'project-summary':
        return 'Project Summary';
      case 'custom':
        return 'Custom Report';
      default:
        return 'Report';
    }
  };

  return (
    <Card
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTemplateIcon(report.template)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg leading-none">{report.name}</h3>
                <Badge variant={report.status === 'published' ? 'default' : 'secondary'}>
                  {report.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getTemplateLabel(report.template)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {report.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>
        )}

        {/* Date Range */}
        {report.config.dateRange && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(report.config.dateRange.from).toLocaleDateString()} -{' '}
              {new Date(report.config.dateRange.to).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Charts Preview */}
        {report.config.charts && report.config.charts.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {report.config.charts.slice(0, 3).map((chart) => (
              <Badge key={chart} variant="outline" className="text-xs">
                {chart.replace(/-/g, ' ')}
              </Badge>
            ))}
            {report.config.charts.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{report.config.charts.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{report.createdBy}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Updated {new Date(report.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {/* Quick Actions (shown on hover) */}
        {isHovered && (
          <div className="flex gap-2 pt-2 border-t animate-in fade-in-0 slide-in-from-bottom-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onExport('pdf');
              }}
            >
              <Download className="mr-2 h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="mr-2 h-3 w-3" />
              Share
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
