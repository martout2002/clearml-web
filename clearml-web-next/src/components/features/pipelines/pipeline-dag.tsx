'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Pipeline, PipelineStep } from '@/types/api';
import { Database, Box, Brain, Code, CheckCircle2, Circle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PipelineDAGProps {
  pipeline: Pipeline;
  onNodeClick?: (node: Node) => void;
}

// Custom node component
function CustomNode({ data }: { data: PipelineStep & { selected?: boolean } }) {
  const iconMap = {
    task: Box,
    dataset: Database,
    model: Brain,
    code: Code,
  };

  const Icon = iconMap[data.type] || Box;

  const statusConfig = {
    pending: { icon: Circle, className: 'text-slate-500' },
    running: { icon: Loader2, className: 'text-purple-500 animate-spin' },
    completed: { icon: CheckCircle2, className: 'text-green-500' },
    failed: { icon: XCircle, className: 'text-red-500' },
  };

  const statusInfo = data.status ? statusConfig[data.status] : statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Card
      className={cn(
        'min-w-[200px] px-4 py-3 shadow-md transition-all',
        data.selected && 'ring-2 ring-primary',
        data.status === 'running' && 'border-purple-300',
        data.status === 'completed' && 'border-green-300',
        data.status === 'failed' && 'border-red-300'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{data.name}</h4>
            <StatusIcon className={cn('h-4 w-4 flex-shrink-0', statusInfo.className)} />
          </div>
          <Badge variant="secondary" className="mt-1 text-xs">
            {data.type}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function PipelineDAG({ pipeline, onNodeClick }: PipelineDAGProps) {
  // Convert pipeline steps to React Flow nodes
  const initialNodes: Node[] = useMemo(
    () =>
      pipeline.steps.map((step) => ({
        id: step.id,
        type: 'custom',
        position: step.position,
        data: step,
      })),
    [pipeline.steps]
  );

  // Convert pipeline edges to React Flow edges
  const initialEdges: Edge[] = useMemo(
    () =>
      pipeline.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: pipeline.status === 'running',
        style: {
          stroke: pipeline.status === 'running' ? '#8b5cf6' : '#94a3b8',
          strokeWidth: 2,
        },
      })),
    [pipeline.edges, pipeline.status]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-[600px] border rounded-lg bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const step = node.data as PipelineStep;
            if (step.status === 'running') return '#8b5cf6';
            if (step.status === 'completed') return '#22c55e';
            if (step.status === 'failed') return '#ef4444';
            return '#94a3b8';
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Background gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}
