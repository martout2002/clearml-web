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

  public diagramRect: DOMRect | null = null;

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
        setTimeout(() => this.drawArrows(), 500);
      }
    });

    // Redraw arrows on window resize
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.onResize);
    });
    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (this.dagModel().length > 0) {
      setTimeout(() => this.drawArrows(), 100);
    }
  };

  ngOnInit(): void {
    this.experiment$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
        takeUntil(this.destroy$)
      )
      .subscribe(experiment => {
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

    // Return early if no nodes
    if (!dagModel || dagModel.length === 0) {
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
    
    // Get the .dag-content element for accurate positioning
    const dagContent = containerElement.nativeElement.querySelector('.dag-content') as HTMLElement;
    if (!dagContent) {
      this.arrows.set([]);
      this.drawingArrows = false;
      return;
    }
    
    const dagContainer = containerElement.nativeElement;
    this.diagramRect = dagContent.getBoundingClientRect();
    console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('DAG Content rect:', {
      left: this.diagramRect.left,
      top: this.diagramRect.top,
      width: this.diagramRect.width,
      height: this.diagramRect.height
    });
    console.log('Scroll position:', {
      scrollLeft: dagContainer.scrollLeft,
      scrollTop: dagContainer.scrollTop
    });
    console.log('Chart dimensions:', {
      chartWidth: this.chartWidth(),
      chartHeight: this.chartHeight()
    });

    // Flatten dag model to get all nodes
    const allNodes = dagModel.flat();
    
    // Build a map of node IDs to elements by querying the DOM directly
    const nodeElementsMap = new Map<string, HTMLElement>();
    const nodeComponentElements = dagContent.querySelectorAll('sm-lineage-node[data-node-id]');
    nodeComponentElements.forEach((el: HTMLElement) => {
      const nodeId = el.getAttribute('data-node-id');
      if (nodeId) {
        nodeElementsMap.set(nodeId, el);
      }
    });

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
        const parentComponent = nodeElementsMap.get(parentId);
        const childComponent = nodeElementsMap.get(node.id);

        if (!parentComponent || !childComponent) {
          return;
        }

        // Query for the actual .lineage-node div inside each component
        const parentElement = parentComponent.querySelector('.lineage-node') as HTMLElement;
        const childElement = childComponent.querySelector('.lineage-node') as HTMLElement;

        if (!parentElement || !childElement) {
          return;
        }

        // If both elements found, calculate arrow path
        if (parentElement && childElement) {
          const fromRect = parentElement.getBoundingClientRect();
          const toRect = childElement.getBoundingClientRect();
          const dagContentRect = dagContent.getBoundingClientRect();

          // Calculate positions relative to dag-content using getBoundingClientRect
          // Add scroll offset since the container is scrollable
          const parentOffsetLeft = (fromRect.left - dagContentRect.left) + dagContainer.scrollLeft;
          const parentOffsetTop = (fromRect.top - dagContentRect.top) + dagContainer.scrollTop;
          const childOffsetLeft = (toRect.left - dagContentRect.left) + dagContainer.scrollLeft;
          const childOffsetTop = (toRect.top - dagContentRect.top) + dagContainer.scrollTop;

          console.log(`Arrow from ${parentId} to ${node.id}:`, {
            parentRect: {left: fromRect.left, top: fromRect.top},
            childRect: {left: toRect.left, top: toRect.top},
            containerRect: {left: dagContentRect.left, top: dagContentRect.top},
            calculated: {
              parentX: parentOffsetLeft,
              parentY: parentOffsetTop,
              childX: childOffsetLeft,
              childY: childOffsetTop
            }
          });

          // Use getBoxToBoxArrow to calculate arrow path
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

          console.log('Arrow coordinates:', {start: {sx, sy}, end: {ex, ey}});

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
