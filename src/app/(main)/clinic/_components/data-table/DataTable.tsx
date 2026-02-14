"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/Table"
import { cx } from "@/lib/utils"
import * as React from "react"

import { Filterbar } from "./DataTableFilterbar"
import { DataTablePagination } from "./DataTablePagination"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  onSearchChange?: (value: string) => void
  pageIndex?: number
  pageSize?: number
  pageCount?: number
  totalRows?: number
  onPageChange?: (pageIndex: number) => void
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  onSearchChange,
  pageIndex,
  pageSize = 20,
  pageCount,
  totalRows,
  onPageChange,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter,
      pagination:
        pageIndex !== undefined
          ? {
              pageIndex,
              pageSize,
            }
          : undefined,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pageSize,
      },
    },
    manualPagination: pageIndex !== undefined,
    pageCount,
    onPaginationChange: (updater) => {
      if (!onPageChange) return
      const next =
        typeof updater === "function"
          ? updater({
              pageIndex: pageIndex ?? 0,
              pageSize,
            })
          : updater
      onPageChange(next.pageIndex)
    },
    enableRowSelection: true,
    enableGlobalFilter: true,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue ?? "").toLowerCase().trim()
      if (!search) return true
      const original = row.original as { empNo?: string | number; employeeName?: string }
      const empNo = String(original?.empNo ?? "").toLowerCase()
      const employeeName = String(original?.employeeName ?? "").toLowerCase()
      return empNo.includes(search) || employeeName.includes(search)
    },
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <div className="space-y-3">
        <Filterbar table={table} onSearchChange={onSearchChange} />
        <div className="relative overflow-hidden overflow-x-auto">
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-y border-gray-200 dark:border-gray-800"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHeaderCell
                      key={header.id}
                      className={cx(
                        "whitespace-nowrap py-1 text-sm sm:text-xs",
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHeaderCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row.original)
                        return
                      }
                      row.toggleSelected(!row.getIsSelected())
                    }}
                    className={cx(
                      "group select-none hover:bg-gray-50 hover:dark:bg-gray-900",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cx(
                          row.getIsSelected()
                            ? "bg-gray-50 dark:bg-gray-900"
                            : "",
                          "relative whitespace-nowrap py-1 text-gray-600 first:w-10 dark:text-gray-400",
                          cell.column.columnDef.meta?.className,
                        )}
                      >
                        {index === 0 && row.getIsSelected() && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600 dark:bg-indigo-500" />
                        )}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {/* <DataTableBulkEditor table={table} rowSelection={rowSelection} /> */}
        </div>
        <DataTablePagination
          table={table}
          pageSize={pageSize}
          totalRows={totalRows}
        />
      </div>
    </>
  )
}
