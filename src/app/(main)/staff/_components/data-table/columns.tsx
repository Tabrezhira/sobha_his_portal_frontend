"use client"

import { User } from "@/data/schema"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"

const columnHelper = createColumnHelper<User>()

export const columns = [
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
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    enableSorting: true,
    meta: {
      className: "text-left",
      displayName: "Name",
    },
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Email",
    },
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const role = getValue()
      return (
        <span className="capitalize">
          {role}
        </span>
      )
    },
    meta: {
      className: "text-left",
      displayName: "Role",
    },
  }),
  columnHelper.accessor("locationId", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Location ID" />
    ),
    enableSorting: false,
    meta: {
      className: "text-left",
      displayName: "Location ID",
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
] as ColumnDef<User>[]
