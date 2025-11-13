import {Component, inject, OnDestroy, OnInit, signal, computed, viewChildren, viewChild, ElementRef, effect, DestroyRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {takeUntil, filter} from 'rxjs/operators';
import {Router} from '@angular/router';
import {selectRouterProjectId} from '@common/core/reducers/projects.reducer';
import {ExperimentLineageService, LineageNode} from '../experiment-info-lineage/experiment-lineage.service';
import {Arrow} from '../experiment-info-lineage/experiment-info-lineage.component';
import {getBoxToBoxArrow} from 'curved-arrows';

@Component({
  selector: 'sm-project-lineage-view',
  templateUrl: './project-lineage-view.component.html',
  styleUrls: ['./project-lineage-view.component.scss'],
  standalone: false
})
export class ProjectLineageViewComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private lineageService = inject(ExperimentLineageService);
  private destroyRef = inject(DestroyRef);
  private destroy$ = new Subject<void>();

  // ViewChild references for arrow drawing
  nodeElements = viewChildren<ElementRef>('nodeEl');
  dagContainers = viewChildren<ElementRef<HTMLDivElement>>('dagContainer');

  public diagramRect: DOMRect;

  // Signals for reactive state
  public loading = signal(false);
  public projectId = signal<string | null>(null);
  public allNodes = signal<LineageNode[]>([]);
  public lineageTrees = signal<LineageNode[][][]>([]); // Multiple DAG trees
  public selectedNode = signal<LineageNode | null>(null);
  public showMetrics = signal(false);
  public filterChangedOnly = signal(false);
  public chartWidth = signal(1200);
  public arrows = signal<Arrow[]>([]);

  // Computed values
  public hasLineage = computed(() => this.allNodes().length > 0);
  public treeCount = computed(() => this.lineageTrees().length);

  public highlightedArrows = computed(() => {
    const selected = this.selectedNode();
    if (!selected) {
      return this.arrows();
    }
    return this.arrows().map(arrow => ({
      ...arrow,
      selected: arrow.sourceId === selected.id || arrow.targetId === selected.id
    }));
  });

  private drawingArrows = false;

  constructor() {
    // Effect to redraw arrows when lineage trees change
    effect(() => {
      const trees = this.lineageTrees();
      if (trees && trees.length > 0 && !this.drawingArrows) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          this.drawArrows();
        }, 300);
      }
    });
  }

  ngOnInit(): void {
    this.store.select(selectRouterProjectId)
      .pipe(
        filter(projectId => !!projectId),
        takeUntil(this.destroy$)
      )
      .subscribe(projectId => {
        this.projectId.set(projectId);
        this.loadProjectLineage(projectId);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadProjectLineage(projectId: string): Promise<void> {
    this.loading.set(true);
    try {
      // Fetch all tasks in the project
      const allTasksInProject = await this.lineageService.fetchProjectTasks(projectId);

      if (allTasksInProject.length === 0) {
        this.loading.set(false);
        return;
      }

      // Build lineage for each task, then group into separate trees
      const allNodesMap = new Map<string, LineageNode>();
      const processedTasks = new Set<string>();

      // Process each task to build complete lineage trees
      for (const task of allTasksInProject) {
        if (!processedTasks.has(task.id)) {
          const lineageNodes = await this.lineageService.buildLineageGraph(task.id);
          lineageNodes.forEach(node => {
            allNodesMap.set(node.id, node);
            processedTasks.add(node.id);
          });
        }
      }

      const allNodes = Array.from(allNodesMap.values());
      this.allNodes.set(allNodes);

      // Separate into distinct lineage trees (nodes without cross-connections)
      const trees = this.separateIntoTrees(allNodes);
      this.lineageTrees.set(trees);
      
      // Manual fallback call with longer delay to ensure DOM is ready
      setTimeout(() => {
        this.drawArrows();
      }, 500);
    } catch (error) {
      console.error('Failed to load project lineage:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Separate nodes into distinct lineage trees (groups of connected nodes)
   */
  private separateIntoTrees(nodes: LineageNode[]): LineageNode[][][] {
    const trees: LineageNode[][][] = [];
    const visited = new Set<string>();

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        const treeNodes = this.getConnectedNodes(node, nodes, visited);
        if (treeNodes.length > 0) {
          const dagLayout = this.lineageService.convertToDagModel(treeNodes);
          trees.push(dagLayout);
        }
      }
    }

    return trees;
  }

  /**
   * Get all nodes connected to the given node (via parent-child relationships)
   */
  private getConnectedNodes(
    startNode: LineageNode,
    allNodes: LineageNode[],
    visited: Set<string>
  ): LineageNode[] {
    const connected: LineageNode[] = [];
    const queue = [startNode];

    while (queue.length > 0) {
      const node = queue.shift()!;

      if (visited.has(node.id)) {
        continue;
      }

      visited.add(node.id);
      connected.push(node);

      // Find parents
      for (const parentId of node.parentIds) {
        const parent = allNodes.find(n => n.id === parentId);
        if (parent && !visited.has(parent.id)) {
          queue.push(parent);
        }
      }

      // Find children
      const children = allNodes.filter(n => n.parentIds.includes(node.id));
      for (const child of children) {
        if (!visited.has(child.id)) {
          queue.push(child);
        }
      }
    }

    return connected;
  }

  private drawArrows(): void {
    if (this.drawingArrows) {
      return;
    }

    this.drawingArrows = true;
    const arrows: Arrow[] = [];
    const trees = this.lineageTrees();
    const nodeElements = this.nodeElements();
    const dagContainers = this.dagContainers();


    // Return early if no nodes or no containers
    if (!trees || trees.length === 0 || !nodeElements || nodeElements.length === 0 || !dagContainers || dagContainers.length === 0) {
      console.log('Early return - missing data');
      this.arrows.set([]);
      this.drawingArrows = false;
      return;
    }

    // Get the first container rect for positioning (all trees use same coordinate system)
    if (dagContainers.length > 0) {
      this.diagramRect = dagContainers[0].nativeElement.getBoundingClientRect();
    }

    // Process each tree
    trees.forEach((tree, treeIndex) => {
      const container = dagContainers[treeIndex]?.nativeElement;
      if (!container) {
        return;
      }

      // Get container position for relative calculations
      const containerRect = container.getBoundingClientRect();

      // Flatten tree to get all nodes
      const allNodes = tree.flat();

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

          // Find DOM elements for parent and child nodes within this specific tree container
          const parentComponent = Array.from(nodeElements).find((el: ElementRef) => {
            const nodeComponent = el.nativeElement;
            // Make sure the element is within this specific container
            if (!container.contains(nodeComponent)) {
              return false;
            }
            return nodeComponent.querySelector(`[data-node-id="${parentId}"]`) ||
                   nodeComponent.getAttribute('data-node-id') === parentId;
          });

          const childComponent = Array.from(nodeElements).find((el: ElementRef) => {
            const nodeComponent = el.nativeElement;
            // Make sure the element is within this specific container
            if (!container.contains(nodeComponent)) {
              return false;
            }
            return nodeComponent.querySelector(`[data-node-id="${node.id}"]`) ||
                   nodeComponent.getAttribute('data-node-id') === node.id;
          });

          // If both components found, get the actual .lineage-node div inside
          if (parentComponent?.nativeElement && childComponent?.nativeElement) {
            // Query for the actual visible .lineage-node div inside the component
            const parentElement = parentComponent.nativeElement.querySelector('.lineage-node') as HTMLElement;
            const childElement = childComponent.nativeElement.querySelector('.lineage-node') as HTMLElement;

            if (!parentElement || !childElement) {
              return;
            }

            const fromRect = parentElement.getBoundingClientRect();
            const toRect = childElement.getBoundingClientRect();

            // Use offsetLeft/offsetTop which are relative to the positioned parent (.dag-content)
            const parentOffsetLeft = parentElement.offsetLeft;
            const parentOffsetTop = parentElement.offsetTop;
            const childOffsetLeft = childElement.offsetLeft;
            const childOffsetTop = childElement.offsetTop;

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
    });

    this.arrows.set(arrows);
    this.drawingArrows = false;
  }

  public selectNode(node: LineageNode): void {
    this.selectedNode.set(node);
  }

  public navigateToTask(taskId: string): void {
    const projectId = this.projectId();
    if (projectId) {
      this.router.navigate(['projects', projectId, 'experiments', taskId]);
    }
  }

  public navigateToTable(): void {
    const projectId = this.projectId();
    if (projectId) {
      this.router.navigate(['projects', projectId, 'experiments']);
    }
  }

  public toggleMetrics(): void {
    this.showMetrics.update(v => !v);
  }

  public toggleFilterChanged(): void {
    this.filterChangedOnly.update(v => !v);
  }
}
