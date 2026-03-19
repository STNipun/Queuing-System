"use client"

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import * as React from "react";
import { DataTableFilter } from "./data-table-filter";
import { DataTablePagination } from "./data-table-pagination";
import { Button } from "../ui/button";
import { Loader2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";


interface DataTableProps<TData, TValue>
{
  columns: ColumnDef<TData, TValue>[]
  data?: TData[]
  filterColumn?: string
  dropdownColumn?: string
  dropdownOptions?: string[]
  onAdd?: () => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onView?: (row: TData) => void
  addButtonLabel?: string
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  isLoading?: boolean
  totalRows?: number
  tableClassName?: string
  children?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  dropdownColumn,
  dropdownOptions = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  addButtonLabel = "Add",
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  pageCount,
  pagination,
  onPaginationChange,
  isLoading,
  totalRows,
  tableClassName,
  children
}: DataTableProps<TData, TValue>)
{
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalPagination, setInternalPagination]
    = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10
    });

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: manualPagination ? pagination : internalPagination
    },
    meta: {
      onView,
      onEdit,
      onDelete,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) =>
    {
      const newPagination = typeof updater === 'function'
        ? updater(manualPagination ? pagination || internalPagination : internalPagination)
        : updater;

      if (manualPagination)
      {
        onPaginationChange?.(newPagination);
      } else
      {
        setInternalPagination(newPagination);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination,
    pageCount: manualPagination ? (pageCount ?? -1) : undefined,
    manualSorting,
    manualFiltering,
    autoResetPageIndex: false,
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-2">
          {(filterColumn || dropdownColumn) && (
            <DataTableFilter
              table={table}
              filterColumn={filterColumn}
              dropdownColumn={dropdownColumn}
              dropdownOptions={dropdownOptions}
            />
          )}
        </div>

        {onAdd && (
          <Button variant='outline' onClick={onAdd} className="flex items-center gap-1 bg-linear-to-br from-blue-600 to-indigo-500 text-white border-0 hover:bg-gradient-to-bl">
            <Plus className="h-4 w-4" />
            <span>{addButtonLabel}</span>
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table className={tableClassName ?? "h-[calc(100vh-200px)]"}>
          <TableHeader className="sticky top-0 z-10 bg-gradient-to-br from-blue-600 to-indigo-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-white">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className="bg-gray-50 border-2 border-gray-200">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border-b border-gray-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No Results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        totalRows={totalRows}
      />
    </div>
  )
}