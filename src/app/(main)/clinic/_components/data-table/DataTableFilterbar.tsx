"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { Table } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { ViewOptions } from "./DataTableViewOptions"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export function Filterbar<TData>({
  table,
  onSearchChange,
  searchValue,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(table.getState().globalFilter)
  const [searchTerm, setSearchTerm] = useState<string>(
    (table.getState().globalFilter as string) ?? "",
  )

  useEffect(() => {
    if (typeof searchValue !== "string") return
    setSearchTerm(searchValue)
    table.setGlobalFilter(searchValue)
  }, [searchValue, table])

  const debouncedSetFilterValue = useDebouncedCallback((value) => {
    table.setGlobalFilter(value)
    if (!onSearchChange) return
    const normalized = String(value ?? "")
    if (normalized.length === 0 || normalized.length >= 4) {
      onSearchChange(normalized)
    }
  }, 300)

  const handleSearchChange = (event: any) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
        <Searchbar
          type="search"
          placeholder="Search by employee or emp no..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full sm:max-w-[250px] sm:[&>input]:h-[30px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
              setSearchTerm("")
              onSearchChange?.("")
            }}
            className="border border-gray-200 px-2 font-semibold text-indigo-600 sm:border-none sm:py-1 dark:border-gray-800 dark:text-indigo-500"
          >
            Clear filters
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* <Button
          variant="secondary"
          className="hidden gap-x-2 px-2 py-1.5 text-sm sm:text-xs lg:flex"
        >
          <RiDownloadLine className="size-4 shrink-0" aria-hidden="true" />
          Export
        </Button> */}
        <ViewOptions table={table} />
      </div>
    </div>
  )
}
