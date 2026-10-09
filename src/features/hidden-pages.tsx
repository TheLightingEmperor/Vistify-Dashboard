import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Info, ListChecks, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { VerdictBadge } from "@/components/dashboard/tone-badge";
import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { DataTable, PANEL, type Column } from "@/components/ui/data-table";
import { DatatableToolbar } from "@/components/ui/datatable-toolbar";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { downloadCsv } from "@/lib/csv";
import { data, type DroppedChain } from "@/lib/data";
import { useNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Page = "readMe" | "dropped";

/** Bottom-right split button: "Read Me | Checked & Dropped" (label from the sheet). */
export function HiddenPagesButton() {
  const { openHidden } = useNav();
  const [left, right] = data.hiddenLabel.split("|").map((s) => s.trim());
  const seg =
    "flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";
  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-stretch overflow-hidden rounded-full border-[1.5px] border-primary bg-white text-primary-dark shadow-[0_12px_30px_rgb(16_72_74/0.25)] sm:bottom-6 sm:right-6">
      <button type="button" className={seg} onClick={() => openHidden("readMe")}>
        <BookOpen className="h-4 w-4" />
        {left}
      </button>
      <span aria-hidden className="my-2 w-px bg-border-strong" />
      <button type="button" className={seg} onClick={() => openHidden("dropped")}>
        <ListChecks className="h-4 w-4" />
        {right}
      </button>
    </div>
  );
}

export function HiddenPagesDrawer() {
  const { hiddenOpen, openHidden } = useNav();
  const [last, setLast] = useState<Page>("readMe");
  const page: Page = hiddenOpen ?? last;
  if (hiddenOpen && hiddenOpen !== last) setLast(hiddenOpen);

  const tabs: { id: Page; label: string }[] = [
    { id: "readMe", label: data.sheets.readMe },
    { id: "dropped", label: data.sheets.dropped },
  ];

  return (
    <Dialog open={!!hiddenOpen} onOpenChange={(o) => !o && openHidden(null)}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[920px] flex-col border-l-[1.5px] border-border-strong bg-canvas shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          aria-describedby="hidden-desc"
        >
          <div className="border-b border-border bg-white px-5 pt-4 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-extrabold tracking-tight">{tabs.find((t) => t.id === page)?.label}</DialogTitle>
                <DialogDescription id="hidden-desc" className="mt-0.5 text-xs">
                  Reference pages from the workbook
                </DialogDescription>
              </div>
              <DialogPrimitive.Close className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
            <div role="tablist" className="mt-3 flex gap-6">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={page === t.id}
                  onClick={() => openHidden(t.id)}
                  className={cn(
                    "-mb-px border-b-[3px] px-1 pb-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    page === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8">{page === "readMe" ? <ReadMePage /> : <DroppedPage />}</div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

const VERDICT_LINE = /^(.+?) — (.+)$/;

function ReadMePage() {
  const { title, byline, sections } = data.readMe;
  return (
    <div className="flex flex-col gap-5">
      <div className={cn(PANEL, "p-6 pt-7")}>
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{byline}</p>
      </div>
      {sections.map((s) => {
        const isVerdicts = s.lines.length > 0 && s.lines.every((l) => VERDICT_LINE.test(l));
        const isList = !isVerdicts && s.lines.length > 2 && s.lines.every((l) => l.length < 200);
        return (
          <section key={s.heading} className={cn(PANEL, "p-6 pt-7")}>
            <h3 className="mb-3 text-base font-extrabold tracking-tight">{s.heading}</h3>
            {isVerdicts ? (
              <dl className="flex flex-col gap-3">
                {s.lines.map((l) => {
                  const [, term, def] = l.match(VERDICT_LINE)!;
                  return (
                    <div key={term} className="grid gap-1.5 sm:grid-cols-[130px_1fr] sm:items-start sm:gap-4">
                      <dt>
                        <VerdictBadge verdict={term} />
                      </dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">{def}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : isList ? (
              <ul className="flex flex-col gap-2.5">
                {s.lines.map((l) => {
                  const next = /^next step:/i.test(l);
                  return (
                    <li
                      key={l}
                      className={cn(
                        "flex gap-3 text-sm leading-relaxed",
                        next ? "rounded-lg border border-primary/30 bg-accent p-3 font-medium text-primary-dark" : "text-muted-foreground",
                      )}
                    >
                      {next ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" /> : <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span>{l}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col gap-3">
                {s.lines.map((l) =>
                  /^note:/i.test(l) ? (
                    <p key={l} className="flex gap-3 rounded-lg border border-[#cce6e4] bg-accent p-3 text-xs leading-relaxed text-[#355456]">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {l}
                    </p>
                  ) : (
                    <p key={l} className="text-sm leading-relaxed text-muted-foreground">
                      {l}
                    </p>
                  ),
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function DroppedPage() {
  const H = data.headers.dropped;
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.dropped.filter((d) => !q || Object.values(d).join(" ").toLowerCase().includes(q));
  }, [query]);

  const columns: Column<DroppedChain>[] = [
    {
      id: "chain",
      header: H[0],
      sortValue: (d) => d.chain,
      className: "min-w-[220px]",
      cell: (d) => (
        <div className="flex items-center gap-3">
          <CompanyAvatar name={d.chain} />
          <span className="font-semibold">{d.chain}</span>
        </div>
      ),
    },
    { id: "verdict", header: H[1], sortValue: (d) => d.verdict, className: "min-w-[170px]", cell: (d) => <VerdictBadge verdict={d.verdict} /> },
    { id: "photos", header: H[2], className: "min-w-[260px] text-sm text-muted-foreground", cell: (d) => d.photos },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-[13px] border border-[#cce6e4] bg-accent px-4 py-2.5 text-xs leading-relaxed text-[#355456]">
        {data.dropped.length} chains were photo-checked and dropped from the prospect list.
      </p>
      <DataTable
        ariaLabel="Checked and dropped chains"
        noun="chains"
        rows={rows}
        columns={columns}
        getRowKey={(d) => d.chain}
        pageSize={10}
        minWidth={680}
        emptyMessage="No chains match this search."
        toolbar={
          <DatatableToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search chains…"
            onExport={() => downloadCsv("vistify-checked-and-dropped.csv", H, rows.map((d) => [d.chain, d.verdict, d.photos]))}
          />
        }
      />
    </div>
  );
}
