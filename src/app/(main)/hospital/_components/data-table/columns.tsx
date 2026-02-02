"use client"

import { Hospital } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

const columnHelper = createColumnHelper<Hospital>()

const formatDate = (value?: Date | string) => {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString()
}

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
  columnHelper.accessor("sno", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="S No" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "S No",
    },
  }),
  columnHelper.accessor("dateOfAdmission", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admission" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left tabular-nums",
      displayName: "Admission",
    },
    cell: ({ getValue }) => formatDate(getValue()),
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
  columnHelper.accessor("hospitalName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hospital" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Hospital",
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
  columnHelper.accessor("status", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Status",
    },
  }),
  columnHelper.accessor("dischargeSummaryReceived", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discharge Summary" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Discharge Summary",
    },
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  }),
  columnHelper.accessor("dateOfDischarge", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discharge" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left tabular-nums",
      displayName: "Discharge",
    },
    cell: ({ getValue }) => formatDate(getValue()),
  }),
  columnHelper.accessor("daysHospitalized", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Days" />
    ),
    enableSorting: false,
    meta: {
      className: "text-right",
      displayName: "Days",
    },
  }),
  columnHelper.accessor("fitnessStatus", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fitness" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Fitness",
    },
  }),
  columnHelper.accessor("isolationRequired", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Isolation" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Isolation",
    },
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
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
] as ColumnDef<Hospital>[]
