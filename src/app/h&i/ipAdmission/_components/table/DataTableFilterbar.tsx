"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { Table } from "@tanstack/react-table"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { ViewOptions } from "./DataTableViewOptions"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearch?: (value: string) => void
}

export function Filterbar<TData>({ table, onSearch }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [searchTerm, setSearchTerm] = useState<string>("")

  const debouncedSetFilterValue = useDebouncedCallback((value) => {
    if (onSearch) {
      onSearch(value)
      return
    }
    table.getColumn("employeeName")?.setFilterValue(value)
  }, 300)

  const handleSearchChange = (event: any) => {
    const value = event.target.value
    setSearchTerm(value)
    debouncedSetFilterValue(value)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-x-6">
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:items-center">
        {(onSearch || table.getColumn("employeeName")?.getIsVisible()) && (
          <Searchbar
            type="search"
            placeholder="Search by Employee No or Name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:max-w-[250px] sm:[&>input]:h-[30px]"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
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
