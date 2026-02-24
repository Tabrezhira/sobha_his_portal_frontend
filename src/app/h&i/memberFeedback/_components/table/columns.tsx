"use client"

import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"

export type MemberFeedbackTableRow = {
  _id?: string
  date?: string | Date
  time?: string
  empNo?: string
  name?: string
  trLocation?: string
  mobileNumber?: string
  natureOfCase?: string
  caseCategory?: string
  nurseAssessment?: string[] | string
  sentTo?: string
  providerName?: string
  sickLeaveStatus?: string
  totalSickLeaveDays?: string | number
  referral?: boolean | string
  referredTo?: string
  visitStatus?: string
}

const columnHelper = createColumnHelper<MemberFeedbackTableRow>()

export const columns = [
  columnHelper.accessor("date", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const date = getValue()
      if (!date) return "-"
      return new Date(date as string | number | Date).toLocaleDateString()
    },
    meta: {
      className: "text-left",
      displayName: "Date",
    },
  }),
  columnHelper.accessor("time", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
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
  columnHelper.accessor("trLocation", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TR LOCATION" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "TR LOCATION",
    },
  }),
  columnHelper.accessor("mobileNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MOBILE NUMBER" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "MOBILE NUMBER",
    },
  }),
  columnHelper.accessor("natureOfCase", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NATURE OF CASE" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "NATURE OF CASE",
    },
  }),
  columnHelper.accessor("caseCategory", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CASE CATEGORY" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "CASE CATEGORY",
    },
  }),
  columnHelper.accessor("nurseAssessment", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NURSE ASSESMENT" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const val = getValue()
      if (Array.isArray(val)) return val.join(", ")
      return val || "-"
    },
    meta: {
      className: "text-left",
      displayName: "NURSE ASSESMENT",
    },
  }),
  columnHelper.accessor("sentTo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SENT TO" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "SENT TO",
    },
  }),
  columnHelper.accessor("providerName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PROVIDER NAME" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "PROVIDER NAME",
    },
  }),
  columnHelper.accessor("sickLeaveStatus", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SICK LEAVE STATUS" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "SICK LEAVE STATUS",
    },
  }),
  columnHelper.accessor("totalSickLeaveDays", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TOTAL SICK LEAVE DAYS" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "TOTAL SICK LEAVE DAYS",
    },
  }),
  columnHelper.accessor("referral", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="REFERRAL" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => {
      const val = getValue()
      if (typeof val === "boolean") return val ? "Yes" : "No"
      return val || "-"
    },
    meta: {
      className: "text-left",
      displayName: "REFERRAL",
    },
  }),
  columnHelper.accessor("referredTo", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="REFFERED TO - CLINIC/HOS NAME" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "REFFERED TO - CLINIC/HOS NAME",
    },
  }),
  columnHelper.accessor("visitStatus", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="VISIT STATUS" />
    ),
    enableSorting: true,
    cell: ({ getValue }) => getValue() || "-",
    meta: {
      className: "text-left",
      displayName: "VISIT STATUS",
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
] as ColumnDef<MemberFeedbackTableRow>[]
