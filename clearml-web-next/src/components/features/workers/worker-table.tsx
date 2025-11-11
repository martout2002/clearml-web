'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkerStatusBadge } from './worker-status-badge';
import type { Worker } from '@/types/api';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface WorkerTableProps {
  workers: Worker[];
}

export function WorkerTable({ workers }: WorkerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns: ColumnDef<Worker>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Name
            {isSorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.name || row.original.id}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <WorkerStatusBadge worker={row.original} />,
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
      cell: ({ row }) => {
        const ip = row.getValue<string>('ip');
        return ip ? (
          <span className="text-sm font-mono">{ip}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'queues',
      header: 'Queues',
      cell: ({ row }) => {
        const queues = row.original.queues;
        return queues && queues.length > 0 ? (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {queues.length}
            </Badge>
            {queues.slice(0, 2).map((queue) => (
              <Badge key={queue} variant="secondary" className="text-xs">
                {queue}
              </Badge>
            ))}
            {queues.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{queues.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'task',
      header: 'Current Task',
      cell: ({ row }) => {
        const task = row.original.task;
        return task ? (
          <Link
            href={`/tasks/${task.id}`}
            className="text-sm hover:text-primary transition-colors truncate block max-w-[200px]"
          >
            {task.name}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">Idle</span>
        );
      },
    },
    {
      accessorKey: 'last_activity_time',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Last Activity
            {isSorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastActivity = row.getValue<string>('last_activity_time');
        if (!lastActivity) return <span className="text-sm text-muted-foreground">-</span>;
        const date = new Date(lastActivity);
        return (
          <span className="text-sm">
            {formatDistance(date, new Date(), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      accessorKey: 'register_time',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Registered
            {isSorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : isSorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : (
              <ArrowUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const registerTime = row.getValue<string>('register_time');
        if (!registerTime) return <span className="text-sm text-muted-foreground">-</span>;
        const date = new Date(registerTime);
        return (
          <span className="text-sm">
            {formatDistance(date, new Date(), { addSuffix: true })}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: workers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No workers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
