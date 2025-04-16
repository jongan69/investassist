"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { ScreenerOptions } from "./screener-options"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./column-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleSelect = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      const SelectedValue = value.replace(/\s/g, "_").toLowerCase()

      if (SelectedValue) {
        params.set("screener", SelectedValue)
      } else {
        params.delete("screener")
      }
      replace(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, replace]
  )

  return (
    <TooltipProvider>
      <div className="w-full pt-4">
        <div className="flex items-center pb-4">
          <Select onValueChange={(value) => handleSelect(value)}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Most actives" />
            </SelectTrigger>
            <SelectContent>
              {/* Group screener options by their group */}
              {Object.entries(
                ScreenerOptions.reduce((groups, option) => {
                  const group = option.group || "Other";
                  if (!groups[group]) {
                    groups[group] = [];
                  }
                  groups[group].push(option);
                  return groups;
                }, {} as Record<string, typeof ScreenerOptions>)
              ).map(([group, options]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                    {group}
                  </div>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-2 flex items-center">
            <Input
              placeholder="Filter company..."
              value={
                (table.getColumn("shortName")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("shortName")?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-background caret-blue-500"
            />
          </div>
          <DataTableViewOptions table={table} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder ? null : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "flex items-center space-x-2 cursor-pointer",
                                    header.column.getCanSort() && "hover:text-foreground"
                                  )}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {header.column.getCanSort() && (
                                    <span className="ml-1">
                                      {header.column.getIsSorted() === "desc" ? (
                                        <ArrowDownIcon className="h-4 w-4" />
                                      ) : header.column.getIsSorted() === "asc" ? (
                                        <ArrowUpIcon className="h-4 w-4" />
                                      ) : (
                                        <CaretSortIcon className="h-4 w-4" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  {header.column.columnDef.meta as string || header.column.id}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "min-w-20 max-w-40 truncate px-2",
                            cell.column.id === "symbol" && "w-[100px]",
                            cell.column.id === "shortName" && "w-[200px]",
                            ["P/E", "EPS", "DPS", "regularMarketPrice", "regularMarketChange", "regularMarketChangePercent", "regularMarketVolume", "averageDailyVolume3Month", "marketCap"].includes(cell.column.id) && "w-[120px]"
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[15, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
