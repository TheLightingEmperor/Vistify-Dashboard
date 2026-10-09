import { useMemo, useState } from "react";
import { AtSign, Building2, ChevronDown, Copy, Filter, Phone, Users, X } from "lucide-react";

import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { CopyButton } from "@/components/dashboard/copy-button";
import { FocusBanner } from "@/components/dashboard/focus-banner";
import { LinkButton } from "@/components/dashboard/link-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui/data-table";
import { DatatableToolbar } from "@/components/ui/datatable-toolbar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { companyKey, data, isRestaurant, type Contact } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { useNav } from "@/lib/nav";
import { copyText, useToast } from "@/lib/toast";

const H = data.headers.contacts;
const rowKey = (c: Contact) => `${c.company}|${c.name}`;
const companies = [...new Set(data.contacts.map((c) => c.company))];

export function ContactsTab({ active }: { active: boolean }) {
  const { focus, goTo, setTab } = useNav();
  const notify = useToast();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [emailOnly, setEmailOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.contacts.filter(
      (c) =>
        (!picked.length || picked.includes(c.company)) &&
        (!emailOnly || c.email) &&
        (!q || Object.values(c).join(" ").toLowerCase().includes(q)),
    );
  }, [query, picked, emailOnly]);

  const withEmail = data.contacts.filter((c) => c.email).length;
  const withPhone = data.contacts.filter((c) => c.phone).length;
  const filtered = query || picked.length || emailOnly;
  const selectedEmails = data.contacts.filter((c) => selected.includes(rowKey(c)) && c.email).map((c) => c.email);

  const clear = () => {
    setQuery("");
    setPicked([]);
    setEmailOnly(false);
  };

  const columns: Column<Contact>[] = [
    {
      id: "company",
      header: H[0],
      sortValue: (c) => c.company,
      className: "min-w-[220px]",
      cell: (c) =>
        isRestaurant(c.company) ? (
          <LinkButton onClick={() => goTo("restaurants", c.company)} title={`Open ${c.company} in Restaurants`} className="font-semibold">
            {c.company}
          </LinkButton>
        ) : (
          <span className="font-semibold">{c.company}</span>
        ),
    },
    {
      id: "name",
      header: H[1],
      sortValue: (c) => c.name,
      className: "min-w-[200px]",
      cell: (c) => (
        <div className="flex items-center gap-3">
          <CompanyAvatar name={c.name} className="size-9" />
          <span className="font-medium text-foreground">{c.name}</span>
        </div>
      ),
    },
    { id: "title", header: H[2], className: "min-w-[200px] text-sm text-muted-foreground", cell: (c) => c.title },
    {
      id: "email",
      header: H[3],
      className: "min-w-[270px]",
      cell: (c) =>
        c.email ? (
          <div className="flex items-center gap-1">
            <a href={`mailto:${c.email}`} className="text-sm font-medium text-primary-dark underline-offset-4 hover:underline">
              {c.email}
            </a>
            <CopyButton value={c.email} label="email" />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "phone",
      header: H[4],
      className: "whitespace-nowrap",
      cell: (c) =>
        c.phone ? (
          <div className="flex items-center gap-1">
            <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="text-sm font-medium tabular-nums hover:text-primary-dark hover:underline">
              {c.phone}
            </a>
            <CopyButton value={c.phone} label="phone" />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 cursor-pointer px-3 text-xs" aria-label={`Actions for ${c.name}`}>
              Actions
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer py-2" disabled={!isRestaurant(c.company)} onSelect={() => goTo("restaurants", c.company)}>
                <Building2 className="mr-2 h-4 w-4" /> View restaurant
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer py-2"
                disabled={!c.email}
                onSelect={async () => (await copyText(c.email)) && notify("Email copied")}
              >
                <AtSign className="mr-2 h-4 w-4" /> Copy email
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer py-2"
                disabled={!c.phone}
                onSelect={async () => (await copyText(c.phone)) && notify("Phone copied")}
              >
                <Phone className="mr-2 h-4 w-4" /> Copy phone
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const focusMatches = focus?.tab === "contacts" ? data.contacts.filter((c) => companyKey(c.company) === focus.key).length : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Contacts" value={data.contacts.length} hint="decision-makers listed" icon={<Users />} onClick={clear} active={!filtered} actionLabel="Show all contacts" />
        <StatCard
          label="Companies covered"
          value={
            <>
              {companies.length}
              <span className="text-lg font-semibold text-muted-foreground"> / {data.restaurants.length}</span>
            </>
          }
          hint="Open Restaurants →"
          icon={<Building2 />}
          onClick={() => setTab("restaurants")}
          actionLabel="Open restaurants"
        />
        <StatCard label="With email" value={withEmail} hint={`${data.contacts.length - withEmail} still missing`} icon={<AtSign />} onClick={() => setEmailOnly((v) => !v)} active={emailOnly} />
        <StatCard label="With phone" value={withPhone} hint="direct numbers on file" icon={<Phone />} />
      </div>

      <FocusBanner tab="contacts" matches={focusMatches} noun="contact" />

      <DataTable
        ariaLabel="Contact info"
        noun="contacts"
        rows={rows}
        columns={columns}
        getRowKey={rowKey}
        pageSize={10}
        minWidth={1050}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        active={active}
        isHighlighted={(c) => focus?.tab === "contacts" && companyKey(c.company) === focus.key}
        highlightNonce={focus?.tab === "contacts" ? focus.nonce : 0}
        emptyMessage="No contacts match these filters."
        toolbar={
          <DatatableToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search name, company, title…"
            onExport={() =>
              downloadCsv(
                "vistify-contacts.csv",
                H,
                rows.map((c) => [c.company, c.name, c.title, c.email, c.phone]),
              )
            }
            actions={
              selected.length > 0 ? (
                <>
                  <span className="text-sm text-muted-foreground">{selected.length} selected</span>
                  <Button
                    variant="secondary"
                    className="gap-2"
                    disabled={!selectedEmails.length}
                    onClick={async () => (await copyText(selectedEmails.join(", "))) && notify(`${selectedEmails.length} emails copied`)}
                  >
                    <Copy className="h-4 w-4" /> Copy emails
                  </Button>
                </>
              ) : null
            }
            filters={
              <>
                {filtered ? (
                  <Button variant="ghost" onClick={clear} className="gap-1.5 text-muted-foreground">
                    <X className="h-4 w-4" /> Clear
                  </Button>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {picked.length + (emailOnly ? 1 : 0) > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                          {picked.length + (emailOnly ? 1 : 0)}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-auto">
                    <DropdownMenuCheckboxItem checked={emailOnly} onSelect={(e) => e.preventDefault()} onCheckedChange={setEmailOnly}>
                      Has email address
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{H[0]}</DropdownMenuLabel>
                    {companies.map((co) => (
                      <DropdownMenuCheckboxItem
                        key={co}
                        checked={picked.includes(co)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(on) => setPicked((p) => (on ? [...p, co] : p.filter((x) => x !== co)))}
                      >
                        {co}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />
        }
      />
    </div>
  );
}

