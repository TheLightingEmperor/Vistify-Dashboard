"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatatablePagination } from "@/components/ui/datatable-pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** Adapted from the shadcn "datatable-1" block: same card / toolbar / table / pagination
 *  anatomy, made generic so every Vistify tab can reuse it. */

export const PANEL =
  "relative overflow-hidden rounded-[13px] border-[1.5px] border-border-strong bg-card shadow-card " +
  "before:absolute before:inset-x-3.5 before:top-0 before:z-10 before:h-[3px] before:rounded-b-[5px] " +
  "before:bg-gradient-to-r before:from-primary before:via-[#42c4ba] before:to-transparent";

const HEAD_CLASS = "p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Provide to make the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Keep this column pinned while the table scrolls sideways. */
  sticky?: boolean;
}

interface Props<T> {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  toolbar?: ReactNode;
  noun?: string;
  pageSize?: number;
  minWidth?: number;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (keys: string[]) => void;
  /** Rows reached by following a link from another tab. */
  isHighlighted?: (row: T) => boolean;
  /** Changes every time a new jump happens, so the table re-scrolls and re-pulses. */
  highlightNonce?: number;
  active?: boolean;
  emptyMessage?: string;
  ariaLabel: string;
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  toolbar,
  noun = "rows",
  pageSize = 8,
  minWidth,
  selectable,
  selected = [],
  onSelectedChange,
  isHighlighted,
  highlightNonce = 0,
  active = true,
  emptyMessage = "No matching rows.",
  ariaLabel,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sort?.id);
    if (!col?.sortValue || !sort) return rows;
    const sv = col.sortValue;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = sv(a);
      const y = sv(b);
      return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [rows, columns, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const current = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Filtering can shrink the list below the current page.
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  // A cross-tab jump: show the page holding the first highlighted row, then scroll to it.
  useEffect(() => {
    if (!highlightNonce || !active || !isHighlighted) return;
    const idx = sorted.findIndex(isHighlighted);
    if (idx >= 0) setPage(Math.floor(idx / pageSize) + 1);
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        cardRef.current
          ?.querySelector('tr[data-highlighted="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightNonce, active]);

  const pageKeys = current.map(getRowKey);
  const allSelected = pageKeys.length > 0 && pageKeys.every((k) => selected.includes(k));
  const toggleAll = () =>
    onSelectedChange?.(
      allSelected ? selected.filter((k) => !pageKeys.includes(k)) : [...new Set([...selected, ...pageKeys])],
    );
  const toggleOne = (key: string) =>
    onSelectedChange?.(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);

  const cycleSort = (id: string) =>
    setSort((s) => (s?.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : null));

  return (
    <Card ref={cardRef} className={cn(PANEL, "gap-0 pb-0")}>
      {toolbar && <CardHeader className="border-b border-border p-4 pt-5">{toolbar}</CardHeader>}
      <CardContent className="p-0">
        <Table aria-label={ariaLabel} style={minWidth ? { minWidth } : undefined}>
          <TableHeader>
            <TableRow className="bg-canvas hover:bg-canvas">
              {selectable && (
                <TableHead className="w-12 p-4">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label={`Select all ${noun} on this page`} />
                </TableHead>
              )}
              {columns.map((col) => {
                const isSorted = sort?.id === col.id;
                return (
                  <TableHead
                    key={col.id}
                    className={cn(HEAD_CLASS, col.sticky && "sticky left-0 z-[2] bg-canvas")}
                    aria-sort={isSorted ? (sort?.dir === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => cycleSort(col.id)}
                        className="-ml-1 inline-flex items-center gap-1 rounded px-1 uppercase tracking-wider hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {col.header}
                        {isSorted ? (
                          sort?.dir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {current.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="py-16 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {current.map((row) => {
              const key = getRowKey(row);
              const highlighted = !!isHighlighted?.(row);
              return (
                <TableRow
                  // Re-mount highlighted rows on every jump so the pulse animation replays.
                  key={highlighted ? `${key}:${highlightNonce}` : key}
                  data-highlighted={highlighted || undefined}
                  data-pulse={highlighted && highlightNonce > 0 ? true : undefined}
                  data-state={selected.includes(key) ? "selected" : undefined}
                  className="bg-card align-top hover:bg-canvas"
                >
                  {selectable && (
                    <TableCell className="p-4">
                      <Checkbox
                        checked={selected.includes(key)}
                        onCheckedChange={() => toggleOne(key)}
                        aria-label={`Select row ${key}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.id} className={cn("p-4", col.sticky && "sticky left-0 z-[1] bg-inherit", col.className)}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <DatatablePagination page={safePage} pageSize={pageSize} total={sorted.length} onPageChange={setPage} noun={noun} />
      </CardContent>
    </Card>
  );
}
