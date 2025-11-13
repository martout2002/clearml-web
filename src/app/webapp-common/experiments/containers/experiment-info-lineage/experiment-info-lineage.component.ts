import {Component, inject, OnDestroy, OnInit, signal, computed, viewChildren, viewChild, ElementRef, effect, DestroyRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subject} from 'rxjs';
import {filter, takeUntil, distinctUntilChanged} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentLineageService, LineageNode} from './experiment-lineage.service';
import {getBoxToBoxArrow} from 'curved-arrows';

@Component({
  selector: 'sm-experiment-info-lineage',
  templateUrl: './experiment-info-lineage.component.html',
  styleUrls: ['./experiment-info-lineage.component.scss'],
  standalone: false
})
export class ExperimentInfoLineageComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lineageService = inject(ExperimentLineageService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();

  // ViewChild references for arrow drawing
  nodeElements = viewChildren<ElementRef>('nodeEl');
  dagContainer = viewChild<ElementRef<HTMLDivElement>>('dagContainer');

  public minimized = this.route.snapshot.routeConfig?.data?.minimized ?? false;
  public experiment$ = this.store.select(selectSelectedExperiment).pipe(
    filter(exp => !!exp)
  );

  public diagramRect: DOMRect;

  // Signals for reactive state
  public loading = signal(false);
  public dagModel = signal<LineageNode[][]>([]);
  public selectedNode = signal<LineageNode | null>(null);
  public showMetrics = signal(false);
  public filterChangedOnly = signal(false);
  public chartWidth = signal(800);
  public chartHeight = computed(() => 50 + 132 * this.dagModel().length);

  public arrows = signal<Arrow[]>([]);
  public highlightedArrows = computed(() => {
    const selected = this.selectedNode();
    if (!selected) {
      return this.arrows();
    }
    // Highlight arrows connected to selected node
    return this.arrows().map(arrow => ({
      ...arrow,
      selected: arrow.sourceId === selected.id || arrow.targetId === selected.id
    }));
  });

  private drawingArrows = false;

  constructor() {
    // Effect to redraw arrows when dagModel changes
    effect(() => {
      const model = this.dagModel();
      if (model && model.length > 0 && !this.drawingArrows) {
        // Use setTimeout to ensure DOM has updated and Angular has rendered attributes
        setTimeout(() => this.drawArrows(), 300);
      }
    });
  }

  ngOnInit(): void {
    this.experiment$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
        takeUntil(this.destroy$)
      )
      .subscribe(experiment => {
        console.log('experiment$ emitted (after distinctUntilChanged):', experiment?.id);
        if (experiment) {
          this.loadLineage(experiment);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadLineage(experiment: IExperimentInfo): Promise<void> {
    this.loading.set(true);
    try {
      const nodes = await this.lineageService.buildLineageGraph(experiment.id);
      const dagLayout = this.lineageService.convertToDagModel(nodes);
      this.dagModel.set(dagLayout);
      // Effect will handle drawing arrows automatically
    } catch (error) {
      console.error('Failed to load lineage:', error);
    } finally {
      this.loading.set(false);
    }
  }

  private drawArrows(): void {
    if (this.drawingArrows) {
      return;
    }

    this.drawingArrows = true;
    const arrows: Arrow[] = [];
    const dagModel = this.dagModel();
    const nodeElements = this.nodeElements();

    // Return early if no nodes or no container
    if (!dagModel || dagModel.length === 0 || !nodeElements || nodeElements.length === 0) {
      this.arrows.set([]);
      this.drawingArrows = false;
      return;
    }

    // Get container rect for positioning
    const containerElement = this.dagContainer();
    if (!containerElement) {
      this.arrows.set([]);
      this.drawingArrows = false;
      return;
    }
    this.diagramRect = containerElement.nativeElement.getBoundingClientRect();

    // Flatten dag model to get all nodes
    const allNodes = dagModel.flat();
    
    // Build a map of node IDs to elements by querying the DOM directly
    const nodeElementsMap = new Map<string, HTMLElement>();
    const container = this.dagContainer()?.nativeElement;
    if (container) {
      const nodeElements = container.querySelectorAll('sm-lineage-node[data-node-id]');
      nodeElements.forEach((el: HTMLElement) => {
        const nodeId = el.getAttribute('data-node-id');
        if (nodeId) {
          nodeElementsMap.set(nodeId, el);
        }
      });
    }

    // Draw arrows for each node's parent connections
    allNodes.forEach(node => {
      if (!node.parentIds || node.parentIds.length === 0) {
        return;
      }

      node.parentIds.forEach(parentId => {
        // Find parent node
        const parentNode = allNodes.find(n => n.id === parentId);
        if (!parentNode) {
          return;
        }

        // Find DOM elements for parent and child nodes using the map
        const parentElement = nodeElementsMap.get(parentId);
        const childElement = nodeElementsMap.get(node.id);

        if (!parentElement || !childElement) {
          return;
        }

        // If both elements found, calculate arrow path
        if (parentElement && childElement) {
          const fromRect = parentElement.getBoundingClientRect();
          const toRect = childElement.getBoundingClientRect();

          // Calculate positions using offset properties
          const parentOffsetLeft = parentElement.offsetLeft;
          const parentOffsetTop = parentElement.offsetTop;
          const childOffsetLeft = childElement.offsetLeft;
          const childOffsetTop = childElement.offsetTop;

          // Use getBoxToBoxArrow to calculate arrow path
          // Note: getBoundingClientRect() returns actual rendered size, no need to adjust by ratio
          const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
            parentOffsetLeft,
            parentOffsetTop,
            fromRect.width,
            fromRect.height,
            childOffsetLeft,
            childOffsetTop,
            toRect.width,
            toRect.height,
            {padStart: 0, padEnd: 7}
          );

          arrows.push({
            path: `M${sx} ${sy} C${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,
            headTransform: `translate(${ex},${ey}) rotate(${ae})`,
            selected: false,
            sourceId: parentId,
            targetId: node.id,
          });
        }
      });
    });

    this.arrows.set(arrows);
    this.drawingArrows = false;
  }

  public selectNode(node: LineageNode): void {
    this.selectedNode.set(node);
  }

  public navigateToTask(taskId: string): void {
    this.router.navigate(['projects', '*', 'experiments', taskId]);
  }

  public toggleMetrics(): void {
    this.showMetrics.update(v => !v);
  }

  public toggleFilterChanged(): void {
    this.filterChangedOnly.update(v => !v);
  }
}

export interface Arrow {
  path: string;
  headTransform: string;
  selected: boolean;
  sourceId: string;
  targetId: string;
}
