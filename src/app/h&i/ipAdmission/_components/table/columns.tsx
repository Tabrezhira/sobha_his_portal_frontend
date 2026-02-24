"use client"

import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"

type IpAdmissionTableRow = {
  _id?: string
  empNo?: string
  employeeName?: string
  name?: string
  trLocation?: string
  hospitalName?: string
  dateOfAdmission?: string | Date
  doa?: string | Date
}

const columnHelper = createColumnHelper<IpAdmissionTableRow>()

export const columns = [
  columnHelper.accessor("empNo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMP NO" />
    ),
    enableSorting: true,
    enableHiding: false,
    meta: {
      className: "text-left",
      displayName: "EMP NO",
    },
  }),
  columnHelper.accessor((row) => row.employeeName || row.name, {
    id: "employeeName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EMPLOYEE NAME" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "EMPLOYEE NAME",
    },
  }),
  columnHelper.accessor("trLocation", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TR LOCATION" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue()
      return value || "-"
    },
    meta: {
      className: "text-left",
      displayName: "TR LOCATION",
    },
  }),
  columnHelper.accessor("hospitalName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="HOSPITAL NAME" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const value = getValue()
      return value || "-"
    },
    meta: {
      className: "text-left",
      displayName: "HOSPITAL NAME",
    },
  }),
  columnHelper.accessor((row) => row.dateOfAdmission || row.doa, {
    id: "dateOfAdmission",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATE OF ADMISSION" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue()
      if (!date) return "-"
      return new Date(date as string | number | Date).toLocaleDateString()
    },
    meta: {
      className: "text-left",
      displayName: "DATE OF ADMISSION",
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: "text-right",
      displayName: "Actions",
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  }),
] as ColumnDef<IpAdmissionTableRow>[]
