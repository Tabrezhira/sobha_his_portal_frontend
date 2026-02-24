import { Column } from "@tanstack/react-table"

import { cx } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cx(className)}>{title}</div>
  }

  return (
    <div
      className={cx(
        column.columnDef.enableSorting === true
          ? "-mx-2 inline-flex select-none items-center gap-2 rounded-md px-2 py-1"
          : "",
      )}
    >
      <span>{title}</span>
    </div>
  )
}
