"use client"

import { ClinicVisit } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<ClinicVisit>()

/**
 * Helper function to format a date value.
 * @param {Date | string} [value] - The date value to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (value?: Date | string) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString()
}

/**
 * The column definitions for the Clinic Visit data table.
 */
export const columns = [
  // columnHelper.display({
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected()
  //           ? true
  //           : table.getIsSomeRowsSelected()
  //             ? "indeterminate"
  //             : false
  //       }
  //       onCheckedChange={() => table.toggleAllPageRowsSelected()}
  //       className="translate-y-0.5"
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={() => row.toggleSelected()}
  //       className="translate-y-0.5"
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  //   meta: {
  //     displayName: "Select",
  //   },
  // }),
  // columnHelper.accessor("slNo", {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Sl No" />
  //   ),
  //   enableSorting: true,
  //   enableHiding: false,
  //   meta: {
  //     className: "text-left",
  //     displayName: "Sl No",
  //   },
  // }),
  columnHelper.accessor("date", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left tabular-nums",
      displayName: "Date",
    },
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.accessor("time", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Time",
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
  columnHelper.accessor("trLocation", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Location",
    },
  }),
  columnHelper.accessor("mobileNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mobile" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Mobile",
    },
  }),
  columnHelper.accessor("natureOfCase", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nature" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Nature",
    },
  }),
  columnHelper.accessor("caseCategory", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Category",
    },
  }),
  columnHelper.accessor("tokenNo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Token" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Token",
    },
  }),
  columnHelper.accessor("visitStatus", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visit Status" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Visit Status",
    },
  }),
  // columnHelper.display({
  //   id: "edit",
  //   header: "Edit",
  //   enableSorting: false,
  //   enableHiding: false,
  //   meta: {
  //     className: "text-right",
  //     displayName: "Edit",
  //   },
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // }),
] as ColumnDef<ClinicVisit>[]
