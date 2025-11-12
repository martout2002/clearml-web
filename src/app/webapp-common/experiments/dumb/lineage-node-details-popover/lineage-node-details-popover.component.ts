import {Component, Input} from '@angular/core';
import {LineageNode} from '../../containers/experiment-info-lineage/experiment-lineage.service';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {TaskModelItem} from '~/business-logic/model/tasks/taskModelItem';

@Component({
  selector: 'sm-lineage-node-details-popover',
  templateUrl: './lineage-node-details-popover.component.html',
  styleUrls: ['./lineage-node-details-popover.component.scss'],
  standalone: false
})
export class LineageNodeDetailsPopoverComponent {
  @Input() node!: LineageNode;

  // Expose Object for template use
  protected readonly Object = Object;

  get hasArtifacts(): boolean {
    return (this.node.artifacts?.length || 0) > 0;
  }

  get hasInputModels(): boolean {
    return (this.node.inputModels?.length || 0) > 0;
  }

  get hasOutputModels(): boolean {
    return (this.node.outputModels?.length || 0) > 0;
  }

  get hasHyperparams(): boolean {
    return this.node.hyperparams && Object.keys(this.node.hyperparams).length > 0;
  }

  get hasAnyData(): boolean {
    return this.hasArtifacts || this.hasInputModels || this.hasOutputModels || this.hasHyperparams;
  }

  getHeaderIcon(): string {
    switch (this.node.type) {
      case 'artifacts':
        return 'inventory_2';
      case 'hyperparams':
        return 'tune';
      case 'input-models':
        return 'input';
      case 'output-models':
        return 'output';
      case 'model':
        return 'model_training';
      case 'task':
      default:
        return 'info';
    }
  }

  getHeaderTitle(): string {
    switch (this.node.type) {
      case 'artifacts':
        return `Artifacts (${this.node.artifacts?.length || 0})`;
      case 'hyperparams':
        return 'Hyperparameters';
      case 'input-models':
        return `Input Models (${this.node.inputModels?.length || 0})`;
      case 'output-models':
        return `Output Models (${this.node.outputModels?.length || 0})`;
      case 'model':
        return 'Model Details';
      case 'task':
      default:
        return 'Task Details';
    }
  }

  get hyperparamSections(): string[] {
    if (!this.node.hyperparams) {
      return [];
    }
    return Object.keys(this.node.hyperparams).slice(0, 5); // Show max 5 sections
  }

  getHyperparamKeys(section: string): string[] {
    if (!this.node.hyperparams?.[section]) {
      return [];
    }
    return Object.keys(this.node.hyperparams[section]).slice(0, 5); // Show max 5 params per section
  }

  getAllHyperparamSections(): string[] {
    if (!this.node.hyperparams) {
      return [];
    }
    return Object.keys(this.node.hyperparams);
  }

  getAllHyperparamKeys(section: string): string[] {
    if (!this.node.hyperparams?.[section]) {
      return [];
    }
    return Object.keys(this.node.hyperparams[section]);
  }

  getHyperparamValue(section: string, key: string): string {
    const param = this.node.hyperparams?.[section]?.[key];
    if (!param || param.value === undefined) {
      return 'N/A';
    }
    const value = typeof param.value === 'object' ? JSON.stringify(param.value) : String(param.value);
    return this.truncate(value, 50);
  }

  getArtifactsList(): Artifact[] {
    return this.node.artifacts?.slice(0, 10) || []; // Show max 10 artifacts
  }

  getInputModelsList(): TaskModelItem[] {
    return this.node.inputModels?.slice(0, 5) || []; // Show max 5 input models
  }

  getOutputModelsList(): TaskModelItem[] {
    return this.node.outputModels?.slice(0, 5) || []; // Show max 5 output models
  }

  getArtifactIcon(artifact: Artifact): string {
    if (!artifact.type) {
      return 'description';
    }
    const type = artifact.type.toLowerCase();
    if (type.includes('image') || type.includes('img')) {
      return 'image';
    }
    if (type.includes('video')) {
      return 'videocam';
    }
    if (type.includes('audio')) {
      return 'audiotrack';
    }
    if (type.includes('table') || type.includes('data')) {
      return 'table_chart';
    }
    if (type.includes('json')) {
      return 'code';
    }
    return 'description';
  }

  truncate(text: string, maxLength: number): string {
    return text && text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text || '';
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) {
      return 'Unknown';
    }
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
