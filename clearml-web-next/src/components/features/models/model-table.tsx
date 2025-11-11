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
  type RowSelectionState,
} from '@tanstack/react-table';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ModelStatusBadge } from './model-status-badge';
import { ModelActionsMenu } from './model-actions-menu';
import type { Model } from '@/types/api';
import { ArrowUpDown, ArrowUp, ArrowDown, Box } from 'lucide-react';

interface ModelTableProps {
  models: Model[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function ModelTable({ models, onSelectionChange }: ModelTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns: ColumnDef<Model>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
        <Link
          href={`/models/${row.original.id}`}
          className="font-medium hover:text-primary transition-colors"
        >
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'ready',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Status
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
        <ModelStatusBadge ready={row.getValue('ready') || false} />
      ),
    },
    {
      accessorKey: 'framework',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Framework
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
        const framework = row.getValue<string>('framework');
        return framework ? (
          <Badge variant="outline" className="capitalize">
            <Box className="mr-1 h-3 w-3" />
            {framework}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'project',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original.project;
        return project ? (
          <span className="text-sm">{project.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'task',
      header: 'Task',
      cell: ({ row }) => {
        const task = row.original.task;
        return task ? (
          <Link
            href={`/tasks/${task.id}`}
            className="text-sm hover:text-primary transition-colors"
          >
            {task.name}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? (
          <span className="text-sm">{user.name}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'last_update',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2"
          >
            Last Updated
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
        const lastUpdate = row.getValue<string>('last_update');
        if (!lastUpdate) return <span className="text-sm text-muted-foreground">-</span>;
        const date = new Date(lastUpdate);
        return (
          <span className="text-sm">
            {formatDistance(date, new Date(), { addSuffix: true })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <ModelActionsMenu model={row.original} />,
    },
  ];

  const table = useReactTable({
    data: models,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      const newSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;
      const selectedIds = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((index) => models[Number(index)].id);
      onSelectionChange?.(selectedIds);
    },
    state: {
      sorting,
      rowSelection,
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
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
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
                  No models found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Selection count */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.toggleAllPageRowsSelected(false)}
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}
