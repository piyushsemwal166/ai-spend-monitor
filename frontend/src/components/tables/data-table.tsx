import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  header: string;
  accessor?: keyof T | string;
  cell?: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  rowKey,
  emptyMessage = "No records found.",
}: {
  columns: Array<DataTableColumn<T>>;
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}) {
  return (
    <div className="glass-panel overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="min-w-[720px] divide-y divide-slate-200/70 dark:divide-white/10 md:min-w-full">
          <thead className="bg-white/50 dark:bg-white/5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={cn(
                    "whitespace-nowrap px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:px-5 sm:text-xs",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white/40 dark:divide-white/10 dark:bg-white/0">
            {data.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)} className="transition hover:bg-white/70 dark:hover:bg-white/5">
                  {columns.map((column) => (
                    <td key={column.header} className={cn("whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-300 sm:px-5", column.className)}>
                      {column.cell ? column.cell(row) : String(row[column.accessor as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}