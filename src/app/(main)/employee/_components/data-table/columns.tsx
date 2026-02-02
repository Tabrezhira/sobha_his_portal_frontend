"use client"

import { Patient } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"

const columnHelper = createColumnHelper<Patient>()

export const columns = [
  columnHelper.display({
    id: "srNo",
    header: "Sr. No",
    cell: ({ row }) => <span className="tabular-nums">{row.index + 1}</span>,
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Sr. No",
    },
  }),
  columnHelper.accessor("empId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emp ID" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "Emp ID",
    },
  }),
  columnHelper.accessor("PatientName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patient Name" />
    ),
    enableSorting: true,
    meta: {
      className: "max-w-[160px] truncate text-left",
      displayName: "Patient Name",
    },
  }),
  columnHelper.accessor("emiratesId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Emirates ID" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Emirates ID",
    },
  }),
  columnHelper.accessor("insuranceId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Insurance ID" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Insurance ID",
    },
  }),
  columnHelper.accessor("trLocation", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TR Location" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "TR Location",
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
  columnHelper.display({
    id: "edit",
    header: "Edit",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right",
      displayName: "Edit",
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }),
] as ColumnDef<Patient>[]
