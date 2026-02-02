"use client"

import { Isolation } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<Isolation>()

const formatDate = (value?: Date | string) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString()
}

export const columns = [
//   columnHelper.display({
//     id: "select",
//     header: ({ table }) => (
//       <Checkbox
//         checked={
//           table.getIsAllPageRowsSelected()
//             ? true
//             : table.getIsSomeRowsSelected()
//               ? "indeterminate"
//               : false
//         }
//         onCheckedChange={() => table.toggleAllPageRowsSelected()}
//         className="translate-y-0.5"
//         aria-label="Select all"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={() => row.toggleSelected()}
//         className="translate-y-0.5"
//         aria-label="Select row"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//     meta: {
//       displayName: "Select",
//     },
//   }),
  columnHelper.accessor("siNo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SI No" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "SI No",
    },
  }),
  columnHelper.accessor("empNo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emp No" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Emp No",
    },
  }),
  columnHelper.accessor("employeeName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Employee" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Employee",
    },
  }),
  columnHelper.accessor("emiratesId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emirates ID" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Emirates ID",
    },
  }),
  columnHelper.accessor("type", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Type",
    },
  }),
  columnHelper.accessor("isolatedIn", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Isolated In" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Isolated In",
    },
  }),
  columnHelper.accessor("isolationReason", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reason" />
    ),
    enableSorting: false,
    meta: {
      className: "max-w-[200px] truncate text-left",
      displayName: "Reason",
    },
  }),
  columnHelper.accessor("dateFrom", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date From" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left tabular-nums",
      displayName: "Date From",
    },
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.accessor("dateTo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date To" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left tabular-nums",
      displayName: "Date To",
    },
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.accessor("currentStatus", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Status",
    },
  }),
//   columnHelper.display({
//     id: "actions",
//     header: "Actions",
//     cell: ({ row }) => <DataTableRowActions row={row} />,
//     meta: {
//       className: "text-right",
//       displayName: "Actions",
//     },
//   }),
] as ColumnDef<Isolation>[]
