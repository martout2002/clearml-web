import {Component, inject, OnDestroy, OnInit, signal, computed} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentLineageService, LineageNode, NgxGraphData} from './experiment-lineage.service';
import * as shape from 'd3-shape';

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
  private destroy$ = new Subject<void>();

  public minimized = this.route.snapshot.routeConfig?.data?.minimized ?? false;
  public experiment$ = this.store.select(selectSelectedExperiment).pipe(
    filter(exp => !!exp)
  );

  // Signals for reactive state
  public loading = signal(false);
  public graphData = signal<NgxGraphData>({nodes: [], links: [], clusters: []});
  public selectedNode = signal<LineageNode | null>(null);
  public showMetrics = signal(false);
  public filterChangedOnly = signal(false);

  // ngx-graph configuration
  public curve = shape.curveBundle.beta(1);
  public layoutSettings = {
    orientation: 'TB', // Top to Bottom
    rankPadding: 100,
    nodePadding: 50,
    edgePadding: 20,
    multigraph: true,
    compound: true
  };

  ngOnInit(): void {
    this.experiment$
      .pipe(takeUntil(this.destroy$))
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
      const graphData = this.lineageService.toNgxGraphFormat(nodes);
      this.graphData.set(graphData);
    } catch (error) {
      console.error('Failed to load lineage:', error);
    } finally {
      this.loading.set(false);
    }
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

  public onNodeSelect(event: any): void {
    if (event?.data) {
      this.selectNode(event.data);
    }
  }
}
