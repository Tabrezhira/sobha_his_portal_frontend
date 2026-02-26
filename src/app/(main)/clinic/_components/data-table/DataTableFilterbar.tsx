"use client"

import { Button } from "@/components/Button"
import { Searchbar } from "@/components/Searchbar"
import { Table } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { ViewOptions } from "./DataTableViewOptions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Button as ShadcnButton } from "@/components/ui/button"
import { format, parse } from "date-fns"
import { RiCalendarEventLine } from "@remixicon/react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearchChange?: (value: string) => void
  searchValue?: string
  dateFilter?: string
  onDateChange?: (value: string) => void
}

/**
 * Filterbar component for the data table.
 * Provides search functionality and view options.
 *
 * @template TData - The type of data in the table.
 * @param {DataTableToolbarProps<TData>} props - The component props.
 * @returns {JSX.Element} The rendered Filterbar component.
 */
export function Filterbar<TData>({
  table,
  onSearchChange,
  searchValue,
  dateFilter,
  onDateChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(table.getState().globalFilter) ||
    Boolean(dateFilter)
  const [searchTerm, setSearchTerm] = useState<string>(
    (table.getState().globalFilter as string) ?? "",
  )

  useEffect(() => {
    if (typeof searchValue !== "string") return
    const upper = searchValue.toUpperCase()
    setSearchTerm(upper)
    table.setGlobalFilter(upper)
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
    const value = String(event.target.value ?? "").toUpperCase()
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
        {onDateChange && (
          <Popover>
            <PopoverTrigger asChild>
              <ShadcnButton
                variant="outline"
                className={`w-full justify-start text-left font-normal sm:w-[220px] sm:max-w-none sm:h-[30px] border-gray-300 dark:border-gray-800 ${!dateFilter ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-50"
                  }`}
              >
                <RiCalendarEventLine className="mr-2 size-4 shrink-0" />
                {dateFilter ? format(parse(dateFilter, "yyyy-MM-dd", new Date()), "PPP") : "Pick a date"}
              </ShadcnButton>
            </PopoverTrigger>
            <PopoverContent className="auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter ? parse(dateFilter, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={(date) => {
                  onDateChange(date ? format(date, "yyyy-MM-dd") : "")
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
              setSearchTerm("")
              onSearchChange?.("")
              onDateChange?.("")
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
