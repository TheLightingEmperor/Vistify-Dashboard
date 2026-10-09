import { useMemo, useState } from "react";
import { Building2, ChevronDown, ContactRound, Copy, FileText, Mail, Maximize2, Send } from "lucide-react";

import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { FocusBanner } from "@/components/dashboard/focus-banner";
import { LinkButton } from "@/components/dashboard/link-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DatatableToolbar } from "@/components/ui/datatable-toolbar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companyKey, contactCount, data, isRestaurant, type SampleEmail } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { useNav } from "@/lib/nav";
import { copyText, useToast } from "@/lib/toast";

export function EmailsTab({ active }: { active: boolean }) {
  const { focus, goTo, setTab } = useNav();
  const notify = useToast();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<SampleEmail | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.emails.filter((e) => !q || `${e.brand} ${e.body}`.toLowerCase().includes(q));
  }, [query]);

  const brandSpecific = data.emails.filter((e) => isRestaurant(e.brand)).length;
  const without = data.restaurants.filter((r) => !data.emails.some((e) => companyKey(e.brand) === companyKey(r.chain))).length;

  const columns: Column<SampleEmail>[] = [
    {
      id: "brand",
      header: "Brand",
      sortValue: (e) => e.brand,
      className: "min-w-[260px]",
      cell: (e) => (
        <div className="flex items-center gap-3">
          <CompanyAvatar name={e.brand} />
          <div className="min-w-0">
            {isRestaurant(e.brand) ? (
              <LinkButton onClick={() => goTo("restaurants", e.brand)} className="font-semibold text-foreground decoration-primary" title={`Open ${e.brand} in Restaurants`}>
                {e.brand}
              </LinkButton>
            ) : (
              <span className="font-semibold">{e.brand}</span>
            )}
            {isRestaurant(e.brand) && (
              <div className="mt-0.5 text-xs">
                {contactCount(e.brand) > 0 ? (
                  <LinkButton className="text-xs" onClick={() => goTo("contacts", e.brand)}>
                    {contactCount(e.brand)} contacts →
                  </LinkButton>
                ) : (
                  <span className="text-muted-foreground">No contacts yet</span>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      className: "min-w-[460px] max-w-[640px]",
      cell: (e) => (
        <div>
          <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{e.body}</p>
          <LinkButton className="mt-1.5 inline-flex items-center gap-1 text-xs" onClick={() => setOpen(e)}>
            <Maximize2 className="h-3 w-3" /> Read full email
          </LinkButton>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (e) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 cursor-pointer px-3 text-xs" aria-label={`Actions for ${e.brand}`}>
              Actions
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer py-2" onSelect={() => setOpen(e)}>
                <FileText className="mr-2 h-4 w-4" /> Read full email
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2" onSelect={async () => (await copyText(e.body)) && notify("Email copied")}>
                <Copy className="mr-2 h-4 w-4" /> Copy email
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2" disabled={!isRestaurant(e.brand)} onSelect={() => goTo("restaurants", e.brand)}>
                <Building2 className="mr-2 h-4 w-4" /> View restaurant
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2" disabled={!contactCount(e.brand)} onSelect={() => goTo("contacts", e.brand)}>
                <ContactRound className="mr-2 h-4 w-4" /> View contacts
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const focusMatches = focus?.tab === "emails" ? data.emails.filter((e) => companyKey(e.brand) === focus.key).length : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sample emails" value={data.emails.length} hint="ready to adapt" icon={<Mail />} />
        <StatCard label="Brand-specific" value={brandSpecific} hint="written for a listed restaurant" icon={<Send />} />
        <StatCard label="Chains without one" value={without} hint="Open Restaurants →" icon={<Building2 />} onClick={() => setTab("restaurants")} actionLabel="Open restaurants" />
      </div>

      <FocusBanner tab="emails" matches={focusMatches} noun="sample email" />

      <DataTable
        ariaLabel="Sample emails"
        noun="emails"
        rows={rows}
        columns={columns}
        getRowKey={(e) => e.brand}
        pageSize={8}
        minWidth={900}
        active={active}
        isHighlighted={(e) => focus?.tab === "emails" && companyKey(e.brand) === focus.key}
        highlightNonce={focus?.tab === "emails" ? focus.nonce : 0}
        emptyMessage="No emails match this search."
        toolbar={
          <DatatableToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search brand or email text…"
            onExport={() => downloadCsv("vistify-sample-emails.csv", ["Brand", "Email"], rows.map((e) => [e.brand, e.body]))}
          />
        }
      />

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[13px] border-[1.5px] border-border-strong">
          {open && (
            <>
              <DialogHeader className="pr-8">
                <DialogTitle className="flex items-center gap-3">
                  <CompanyAvatar name={open.brand} className="size-9" />
                  {open.brand}
                </DialogTitle>
                <DialogDescription>Sample outreach email · edit the [First Name] placeholder before sending.</DialogDescription>
              </DialogHeader>
              <div className="overflow-auto rounded-md border border-border bg-canvas p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{open.body}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button onClick={async () => (await copyText(open.body)) && notify("Email copied")} className="gap-2">
                  <Copy className="h-4 w-4" /> Copy email
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
