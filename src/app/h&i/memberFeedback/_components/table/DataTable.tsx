"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
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
  onSearch?: (value: string) => void
  hideFilterbar?: boolean
  onRowClick?: (row: TData) => void
  pagination?: {
    pageIndex: number
    pageSize: number
    pageCount: number
    totalRows: number
    onPaginationChange: (updater: any) => void
  }
}

export function DataTable<TData>({
  columns,
  data,
  onSearch,
  hideFilterbar,
  onRowClick,
  pagination,
}: DataTableProps<TData>) {
  const defaultPageSize = 20
  const [rowSelection, setRowSelection] = React.useState({})
  const isServerSide = Boolean(pagination)
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      ...(pagination ? { pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize } } : {}),
    },
    initialState: isServerSide
      ? undefined
      : {
        pagination: {
          pageIndex: 0,
          pageSize: defaultPageSize,
        },
      },
    enableRowSelection: true,
    manualPagination: isServerSide,
    pageCount: pagination?.pageCount,
    onPaginationChange: pagination?.onPaginationChange,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(isServerSide ? {} : { getPaginationRowModel: getPaginationRowModel() }),
  })

  return (
    <div className="space-y-3">
      {!hideFilterbar && <Filterbar table={table} onSearch={onSearch} />}
      <TableRoot>
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
                    row.toggleSelected(!row.getIsSelected())
                    onRowClick?.(row.original)
                  }}
                  className="group select-none hover:bg-gray-50 hover:dark:bg-gray-900"
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
      </TableRoot>
      <DataTablePagination
        table={table}
        pageSize={pagination?.pageSize ?? defaultPageSize}
        totalRows={pagination?.totalRows}
      />
    </div>
  )
}
