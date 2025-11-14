import {Component, Input, Output, EventEmitter, signal} from '@angular/core';
import {LineageNode} from '../../containers/experiment-info-lineage/experiment-lineage.service';

@Component({
  selector: 'sm-lineage-node',
  templateUrl: './lineage-node.component.html',
  styleUrls: ['./lineage-node.component.scss'],
  standalone: false
})
export class LineageNodeComponent {
  @Input() node!: LineageNode;
  @Input() selected = false;
  @Input() showMetrics = false;
  @Input() highlightChanges = false;

  @Output() nodeClick = new EventEmitter<void>();
  @Output() navigateClick = new EventEmitter<void>();

  public showTooltip = signal(false);

  get hasChanges(): boolean {
    return (this.node.hyperparamsChanged?.length || 0) > 0 ||
           (this.node.configChanged?.length || 0) > 0;
  }

  get statusClass(): string {
    return this.node.task?.status?.toLowerCase() || 'unknown';
  }

  getNodeIcon(): string {
    switch (this.node.type) {
      case 'model':
        return 'model_training';
      case 'artifacts':
        return 'inventory_2';
      case 'hyperparams':
        return 'tune';
      case 'input-models':
        return 'input';
      case 'output-models':
        return 'output';
      case 'task':
      default:
        return 'science';
    }
  }

  get displayMetrics(): string[] {
    if (!this.node.metrics || !this.showMetrics) {
      return [];
    }

    // Show first 3 metrics
    return Object.entries(this.node.metrics)
      .slice(0, 3)
      .map(([key, value]) => {
        const displayValue = typeof value === 'object' && value !== null
          ? JSON.stringify(value)
          : String(value);
        return `${key}: ${this.truncate(displayValue, 15)}`;
      });
  }

  onClick(): void {
    this.nodeClick.emit();
  }

  onNavigate(event: Event): void {
    event.stopPropagation();
    this.navigateClick.emit();
  }

  onInfoClick(event: Event): void {
    event.stopPropagation();
    // MatMenu will handle opening the popover
  }

  onMouseEnter(): void {
    this.showTooltip.set(true);
  }

  onMouseLeave(): void {
    this.showTooltip.set(false);
  }

  private truncate(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
