import {Injectable, inject} from '@angular/core';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {Task} from '~/business-logic/model/tasks/task';
import {Model} from '~/business-logic/model/models/model';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {TaskModelItem} from '~/business-logic/model/tasks/taskModelItem';
import {firstValueFrom} from 'rxjs';

export interface LineageNode {
  id: string;
  taskId: string;
  taskName: string;
  type: 'task' | 'model' | 'artifacts' | 'hyperparams' | 'input-models' | 'output-models';
  parentIds: string[];
  hyperparamsChanged?: string[];
  configChanged?: string[];
  modelId?: string;
  modelName?: string;
  metrics?: Record<string, any>;
  level: number;
  task?: Task;
  model?: Model;
  // Enhanced data for popover display
  artifacts?: Artifact[];
  inputModels?: TaskModelItem[];
  outputModels?: TaskModelItem[];
  hyperparams?: Record<string, any>;
  // Reference to parent task node
  parentTaskId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExperimentLineageService {
  private tasksApi = inject(ApiTasksService);
  private modelsApi = inject(ApiModelsService);

  /**
   * Build the complete lineage graph for a task (ancestors and descendants)
   */
  async buildLineageGraph(taskId: string): Promise<LineageNode[]> {
    const nodes = new Map<string, LineageNode>();
    const visited = new Set<string>();

    // Get the root task
    const rootTask = await this.fetchTask(taskId);
    if (!rootTask) {
      return [];
    }

    // Build graph by traversing parents and children
    await this.traverseAncestors(rootTask, nodes, visited);
    await this.traverseDescendants(rootTask, nodes, visited);

    // Add section nodes for each task
    const allNodes = Array.from(nodes.values());
    allNodes.forEach(taskNode => {
      if (taskNode.type === 'task') {
        this.addSectionNodes(taskNode, nodes);
      }
    });

    return Array.from(nodes.values());
  }

  /**
   * Add section nodes (artifacts, hyperparams, models) for a task node
   */
  private addSectionNodes(taskNode: LineageNode, nodes: Map<string, LineageNode>): void {
    const taskId = taskNode.taskId;

    // Add Artifacts node if task has artifacts
    if (taskNode.artifacts && taskNode.artifacts.length > 0) {
      const artifactsNode: LineageNode = {
        id: `${taskId}-artifacts`,
        taskId: taskId,
        taskName: `Artifacts (${taskNode.artifacts.length})`,
        type: 'artifacts',
        parentIds: [taskId],
        level: 0,
        artifacts: taskNode.artifacts,
        parentTaskId: taskId
      };
      nodes.set(artifactsNode.id, artifactsNode);
    }

    // Add Hyperparameters node if task has hyperparams
    if (taskNode.hyperparams && Object.keys(taskNode.hyperparams).length > 0) {
      const hyperparamsNode: LineageNode = {
        id: `${taskId}-hyperparams`,
        taskId: taskId,
        taskName: `Hyperparameters`,
        type: 'hyperparams',
        parentIds: [taskId],
        level: 0,
        hyperparams: taskNode.hyperparams,
        parentTaskId: taskId
      };
      nodes.set(hyperparamsNode.id, hyperparamsNode);
    }

    // Add Input Models node if task has input models
    if (taskNode.inputModels && taskNode.inputModels.length > 0) {
      const inputModelsNode: LineageNode = {
        id: `${taskId}-input-models`,
        taskId: taskId,
        taskName: `Input Models (${taskNode.inputModels.length})`,
        type: 'input-models',
        parentIds: [taskId],
        level: 0,
        inputModels: taskNode.inputModels,
        parentTaskId: taskId
      };
      nodes.set(inputModelsNode.id, inputModelsNode);
    }

    // Add Output Models node if task has output models
    if (taskNode.outputModels && taskNode.outputModels.length > 0) {
      const outputModelsNode: LineageNode = {
        id: `${taskId}-output-models`,
        taskId: taskId,
        taskName: `Output Models (${taskNode.outputModels.length})`,
        type: 'output-models',
        parentIds: [taskId],
        level: 0,
        outputModels: taskNode.outputModels,
        parentTaskId: taskId
      };
      nodes.set(outputModelsNode.id, outputModelsNode);
    }
  }

  /**
   * Traverse up the tree to find all ancestors
   */
  private async traverseAncestors(
    task: Task,
    nodes: Map<string, LineageNode>,
    visited: Set<string>
  ): Promise<void> {
    if (!task || visited.has(task.id)) {
      return;
    }

    visited.add(task.id);
    const node = await this.createLineageNode(task);
    nodes.set(task.id, node);

    // Traverse parent if exists
    if (task.parent?.id) {
      const parentTask = await this.fetchTask(task.parent.id);
      if (parentTask) {
        node.parentIds.push(parentTask.id);

        // Detect hyperparameter changes from parent to child
        const hyperparamChanges = this.detectHyperparamChanges(parentTask, task);
        if (hyperparamChanges.length > 0) {
          node.hyperparamsChanged = hyperparamChanges;
        }

        await this.traverseAncestors(parentTask, nodes, visited);
      }
    }
  }

  /**
   * Traverse down the tree to find all descendants
   */
  private async traverseDescendants(
    task: Task,
    nodes: Map<string, LineageNode>,
    visited: Set<string>
  ): Promise<void> {
    if (!task || visited.has(task.id)) {
      return;
    }

    visited.add(task.id);

    if (!nodes.has(task.id)) {
      const node = await this.createLineageNode(task);
      nodes.set(task.id, node);
    }

    // Find child tasks (tasks that have this task as parent)
    const children = await this.fetchChildTasks(task.id);

    for (const child of children) {
      const childNode = nodes.get(child.id) || await this.createLineageNode(child);
      childNode.parentIds.push(task.id);

      // Detect hyperparameter changes from parent to child
      const hyperparamChanges = this.detectHyperparamChanges(task, child);
      if (hyperparamChanges.length > 0) {
        childNode.hyperparamsChanged = hyperparamChanges;
      }

      nodes.set(child.id, childNode);
      await this.traverseDescendants(child, nodes, visited);
    }
  }

  /**
   * Create a lineage node from a task
   */
  private async createLineageNode(task: Task): Promise<LineageNode> {
    const node: LineageNode = {
      id: task.id,
      taskId: task.id,
      taskName: task.name,
      type: 'task',
      parentIds: [],
      level: 0,
      task
    };

    // Add model information if output model exists
    if (task.output?.model) {
      try {
        const model = await this.fetchModel(task.output.model);
        if (model) {
          node.modelId = model.id;
          node.modelName = model.name;
          node.metrics = model.last_metrics;
          node.model = model;
        }
      } catch (error) {
        console.warn('Failed to fetch model:', task.output.model, error);
      }
    }

    // Add enhanced data for popover display
    node.artifacts = task.execution?.artifacts || [];
    node.inputModels = task.models?.input || [];
    node.outputModels = task.models?.output || [];
    node.hyperparams = task.hyperparams || {};

    return node;
  }

  /**
   * Convert flat list of nodes to DAG model (2D array by levels)
   */
  convertToDagModel(nodes: LineageNode[]): LineageNode[][] {
    if (nodes.length === 0) {
      return [];
    }

    // Calculate levels using topological sorting
    const nodeLevels = this.calculateNodeLevels(nodes);

    // Group nodes by level
    const maxLevel = Math.max(...Array.from(nodeLevels.values()));
    const dagModel: LineageNode[][] = Array.from({length: maxLevel + 1}, () => []);

    nodes.forEach(node => {
      const level = nodeLevels.get(node.id) || 0;
      node.level = level;
      dagModel[level].push(node);
    });

    return dagModel.filter(level => level.length > 0);
  }

  /**
   * Calculate node levels using BFS from leaf nodes
   */
  private calculateNodeLevels(nodes: LineageNode[]): Map<string, number> {
    const levels = new Map<string, number>();
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Find leaf nodes (nodes with no children)
    const childrenCount = new Map<string, number>();
    nodes.forEach(node => {
      if (!childrenCount.has(node.id)) {
        childrenCount.set(node.id, 0);
      }
      node.parentIds.forEach(parentId => {
        childrenCount.set(parentId, (childrenCount.get(parentId) || 0) + 1);
      });
    });

    // Start from leaf nodes
    const queue: string[] = [];
    nodes.forEach(node => {
      if ((childrenCount.get(node.id) || 0) === 0) {
        levels.set(node.id, 0);
        queue.push(node.id);
      }
    });

    // BFS to assign levels
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const currentLevel = levels.get(nodeId) || 0;

      node.parentIds.forEach(parentId => {
        const parentLevel = levels.get(parentId) || 0;
        levels.set(parentId, Math.max(parentLevel, currentLevel + 1));

        if (!queue.includes(parentId)) {
          queue.push(parentId);
        }
      });
    }

    return levels;
  }

  /**
   * Detect changed hyperparameters between parent and child
   */
  detectHyperparamChanges(parent: Task, child: Task): string[] {
    const changes: string[] = [];

    if (!parent.hyperparams || !child.hyperparams) {
      return changes;
    }

    // Compare all hyperparameter sections
    Object.keys(child.hyperparams).forEach(section => {
      const parentSection = parent.hyperparams?.[section] || {};
      const childSection = child.hyperparams?.[section] || {};

      Object.keys(childSection).forEach(key => {
        const parentValue = JSON.stringify(parentSection[key]?.value);
        const childValue = JSON.stringify(childSection[key]?.value);

        if (parentValue !== childValue) {
          changes.push(`${section}.${key}`);
        }
      });
    });

    return changes;
  }

  /**
   * Fetch a single task by ID
   */
  private async fetchTask(taskId: string): Promise<Task | null> {
    try {
      const response = await firstValueFrom(
        this.tasksApi.tasksGetAllEx({
          id: [taskId],
          only_fields: [
            'id', 'name', 'parent', 'hyperparams', 'configuration',
            'script', 'models', 'output', 'last_metrics', 'status',
            'execution.artifacts'
          ]
        })
      );
      return response.tasks?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch task:', taskId, error);
      return null;
    }
  }

  /**
   * Fetch child tasks (tasks that have this task as parent)
   */
  private async fetchChildTasks(parentId: string): Promise<Task[]> {
    try {
      const response = await firstValueFrom(
        this.tasksApi.tasksGetAllEx({
          parent: parentId,
          only_fields: [
            'id', 'name', 'parent', 'hyperparams', 'configuration',
            'script', 'models', 'output', 'last_metrics', 'status',
            'execution.artifacts'
          ]
        })
      );
      return response.tasks || [];
    } catch (error) {
      console.error('Failed to fetch child tasks:', parentId, error);
      return [];
    }
  }

  /**
   * Fetch a model by ID
   */
  private async fetchModel(modelId: string): Promise<Model | null> {
    try {
      const response = await firstValueFrom(
        this.modelsApi.modelsGetAllEx({
          id: [modelId],
          only_fields: ['id', 'name', 'task', 'parent', 'last_metrics', 'uri', 'framework']
        })
      );
      return response.models?.[0] || null;
    } catch (error) {
      console.error('Failed to fetch model:', modelId, error);
      return null;
    }
  }

  /**
   * Fetch all tasks in a project (for project-level lineage view)
   */
  async fetchProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const response = await firstValueFrom(
        this.tasksApi.tasksGetAllEx({
          project: [projectId],
          only_fields: [
            'id', 'name', 'parent', 'hyperparams', 'configuration',
            'script', 'models', 'output', 'last_metrics', 'status',
            'execution.artifacts'
          ],
          size: 500 // Limit to 500 tasks for performance
        })
      );
      return response.tasks || [];
    } catch (error) {
      console.error('Failed to fetch project tasks:', projectId, error);
      return [];
    }
  }

  /**
   * Transform LineageNode array to ngx-graph format
   */
  toNgxGraphFormat(nodes: LineageNode[]): NgxGraphData {
    const graphNodes: NgxGraphNode[] = [];
    const graphLinks: NgxGraphLink[] = [];
    const graphClusters: NgxGraphCluster[] = [];

    // Track section nodes for each task (for clustering)
    const taskSectionNodes = new Map<string, string[]>();

    nodes.forEach(node => {
      // Create graph node
      graphNodes.push({
        id: node.id,
        label: node.taskName,
        data: node // Store original LineageNode for custom template
      });

      // Track section nodes belonging to tasks
      if (node.type !== 'task' && node.parentTaskId) {
        const sections = taskSectionNodes.get(node.parentTaskId) || [];
        sections.push(node.id);
        taskSectionNodes.set(node.parentTaskId, sections);
      }

      // Create edges from parent nodes to this node
      node.parentIds.forEach((parentId, index) => {
        graphLinks.push({
          id: `${parentId}-${node.id}-${index}`,
          source: parentId,
          target: node.id,
          label: node.hyperparamsChanged && node.hyperparamsChanged.length > 0
            ? `${node.hyperparamsChanged.length} changes`
            : undefined
        });
      });
    });

    // Create clusters for tasks with their section nodes
    taskSectionNodes.forEach((sectionNodeIds, taskId) => {
      if (sectionNodeIds.length > 0) {
        const taskNode = nodes.find(n => n.id === taskId);
        graphClusters.push({
          id: `cluster-${taskId}`,
          label: taskNode?.taskName || 'Task',
          childNodeIds: [taskId, ...sectionNodeIds]
        });
      }
    });

    return {
      nodes: graphNodes,
      links: graphLinks,
      clusters: graphClusters
    };
  }
}

export interface NgxGraphNode {
  id: string;
  label: string;
  data?: LineageNode;
}

export interface NgxGraphLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface NgxGraphCluster {
  id: string;
  label: string;
  childNodeIds: string[];
}

export interface NgxGraphData {
  nodes: NgxGraphNode[];
  links: NgxGraphLink[];
  clusters: NgxGraphCluster[];
}
