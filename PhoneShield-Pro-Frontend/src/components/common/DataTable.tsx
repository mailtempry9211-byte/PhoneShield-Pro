import type { ReactNode } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDataTable } from "@/hooks/useResource";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/common/States";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  rows: T[];
  searchKeys: string[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  searchKeys,
  loading,
  error,
  onRetry,
  searchPlaceholder = "Search…",
  filters,
  actions,
  emptyTitle,
  emptyDescription,
  emptyAction,
  rowKey,
  onRowClick,
  pageSize = 10,
}: DataTableProps<T>) {
  const table = useDataTable<T>(rows, { searchKeys, pageSize });

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={table.query}
            onChange={(e) => table.setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search table"
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          {actions}
        </div>
      </div>

      {loading ? (
        <TableSkeleton cols={Math.min(columns.length, 6)} />
      ) : error ? (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : table.total === 0 ? (
        <div className="p-4">
          <EmptyState
            title={emptyTitle ?? "No records found"}
            description={emptyDescription ?? "Try adjusting your search or filters."}
            action={emptyAction}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/70 backdrop-blur">
              <tr>
                {columns.map((col) => {
                  const active = table.sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                        col.className,
                      )}
                    >
                      {col.sortable === false ? (
                        col.label
                      ) : (
                        <button
                          type="button"
                          onClick={() => table.toggleSort(col.key)}
                          className="inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {col.label}
                          {!active ? (
                            <ChevronUpDownIcon className="h-3.5 w-3.5 opacity-60" />
                          ) : table.sortDir === "asc" ? (
                            <ChevronUpIcon className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDownIcon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-t border-border transition-colors hover:bg-accent/40",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.render
                        ? col.render(row)
                        : (String(
                            col.key
                              .split(".")
                              .reduce((acc: any, k) => (acc == null ? acc : acc[k]), row) ?? "",
                          ) || "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && table.total > 0 && (
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(table.page - 1) * table.size + 1}–
            {Math.min(table.page * table.size, table.total)} of {table.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={table.page <= 1}
              onClick={() => table.setPage(table.page - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" /> Prev
            </Button>
            <span className="text-xs font-medium">
              {table.page} / {table.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={table.page >= table.totalPages}
              onClick={() => table.setPage(table.page + 1)}
            >
              Next <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
