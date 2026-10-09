import { useMemo, useState } from "react";
import { Building2, ChevronDown, ContactRound, Filter, Mail, MonitorOff, Sparkles, X } from "lucide-react";

import { CompanyAvatar } from "@/components/dashboard/company-avatar";
import { DistributionCard } from "@/components/dashboard/distribution-card";
import { FocusBanner } from "@/components/dashboard/focus-banner";
import { LinkButton } from "@/components/dashboard/link-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { DifficultyBadge, VerdictBadge } from "@/components/dashboard/tone-badge";
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
import { companyKey, contactCount, data, hasEmail, unitsValue, type Restaurant } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { useNav } from "@/lib/nav";
import { DIFFICULTY_ORDER, VERDICT_ORDER, difficultyTone, rank, verdictTone } from "@/lib/tones";

const H = data.headers.restaurants;
const STATIC_VERDICTS = ["Static", "Mostly static"];

const countBy = (key: "verdict" | "difficulty", order: string[]) => {
  const labels = [...new Set(data.restaurants.map((r) => r[key]))].sort((a, b) => rank(order, a) - rank(order, b));
  return labels.map((label) => ({ label, count: data.restaurants.filter((r) => r[key] === label).length }));
};

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function RestaurantsTab({ active }: { active: boolean }) {
  const { focus, goTo, setTab } = useNav();
  const [query, setQuery] = useState("");
  const [verdicts, setVerdicts] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  const verdictCounts = useMemo(() => countBy("verdict", VERDICT_ORDER), []);
  const difficultyCounts = useMemo(() => countBy("difficulty", DIFFICULTY_ORDER), []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.restaurants.filter(
      (r) =>
        (!verdicts.length || verdicts.includes(r.verdict)) &&
        (!difficulties.length || difficulties.includes(r.difficulty)) &&
        (!q || Object.values(r).join(" ").toLowerCase().includes(q)),
    );
  }, [query, verdicts, difficulties]);

  const staticCount = data.restaurants.filter((r) => STATIC_VERDICTS.includes(r.verdict)).length;
  const easierCount = data.restaurants.filter((r) => r.difficulty === "Easier").length;
  const mapped = data.restaurants.filter((r) => contactCount(r.chain) > 0).length;
  const staticActive = verdicts.length === STATIC_VERDICTS.length && STATIC_VERDICTS.every((v) => verdicts.includes(v));
  const easierActive = difficulties.length === 1 && difficulties[0] === "Easier";
  const filtered = query || verdicts.length || difficulties.length;

  const clear = () => {
    setQuery("");
    setVerdicts([]);
    setDifficulties([]);
  };

  const columns: Column<Restaurant>[] = [
    {
      id: "chain",
      header: H[0],
      sticky: true,
      sortValue: (r) => r.chain,
      className: "min-w-[250px]",
      cell: (r) => {
        const n = contactCount(r.chain);
        return (
          <div className="flex items-center gap-3">
            <CompanyAvatar name={r.chain} />
            <div className="min-w-0">
              <LinkButton
                onClick={() => goTo("contacts", r.chain)}
                className="font-semibold text-foreground decoration-primary"
                title={`See contacts at ${r.chain}`}
              >
                {r.chain}
              </LinkButton>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {n > 0 ? (
                  <LinkButton className="text-xs" onClick={() => goTo("contacts", r.chain)}>
                    {n} {n === 1 ? "contact" : "contacts"} →
                  </LinkButton>
                ) : (
                  <span>No contacts yet</span>
                )}
                {hasEmail(r.chain) && (
                  <LinkButton className="text-xs" onClick={() => goTo("emails", r.chain)}>
                    Sample email →
                  </LinkButton>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "verdict",
      header: H[1],
      sortValue: (r) => rank(VERDICT_ORDER, r.verdict),
      cell: (r) => <VerdictBadge verdict={r.verdict} />,
    },
    {
      id: "difficulty",
      header: H[2],
      sortValue: (r) => rank(DIFFICULTY_ORDER, r.difficulty),
      cell: (r) => <DifficultyBadge difficulty={r.difficulty} />,
    },
    { id: "photos", header: H[3], className: "min-w-[280px] text-sm text-muted-foreground", cell: (r) => r.photos },
    {
      id: "units",
      header: H[4],
      sortValue: (r) => unitsValue(r.units),
      className: "whitespace-nowrap text-sm font-semibold tabular-nums",
      cell: (r) => r.units,
    },
    { id: "segment", header: H[5], className: "min-w-[170px] text-sm", cell: (r) => r.segment },
    { id: "angle", header: H[6], className: "min-w-[340px] text-sm", cell: (r) => r.angle },
    { id: "source", header: H[7], className: "min-w-[220px] text-sm text-muted-foreground", cell: (r) => r.source || "—" },
    {
      id: "actions",
      header: "Actions",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 cursor-pointer px-3 text-xs" aria-label={`Actions for ${r.chain}`}>
              Actions
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer py-2" disabled={!contactCount(r.chain)} onSelect={() => goTo("contacts", r.chain)}>
                <ContactRound className="mr-2 h-4 w-4" /> View contacts
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2" disabled={!hasEmail(r.chain)} onSelect={() => goTo("emails", r.chain)}>
                <Mail className="mr-2 h-4 w-4" /> View sample email
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Prospects" value={data.restaurants.length} hint="photo-checked chains" icon={<Building2 />} onClick={clear} active={!filtered} actionLabel="Show all prospects" />
        <StatCard
          label="Printed boards"
          value={staticCount}
          hint="Static or mostly static"
          icon={<MonitorOff />}
          onClick={() => setVerdicts(staticActive ? [] : STATIC_VERDICTS)}
          active={staticActive}
        />
        <StatCard
          label="Easier sales"
          value={easierCount}
          hint="Sale difficulty: Easier"
          icon={<Sparkles />}
          onClick={() => setDifficulties(easierActive ? [] : ["Easier"])}
          active={easierActive}
        />
        <StatCard
          label="Contacts mapped"
          value={
            <>
              {mapped}
              <span className="text-lg font-semibold text-muted-foreground"> / {data.restaurants.length}</span>
            </>
          }
          hint="Open Contact Info →"
          icon={<ContactRound />}
          onClick={() => setTab("contacts")}
          actionLabel="Open contact info"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DistributionCard
          title={H[1]}
          slices={verdictCounts.map((v) => ({ ...v, tone: verdictTone(v.label) }))}
          selected={verdicts}
          onToggle={(l) => setVerdicts((s) => toggle(s, l))}
        />
        <DistributionCard
          title={H[2]}
          slices={difficultyCounts.map((v) => ({ ...v, tone: difficultyTone(v.label) }))}
          selected={difficulties}
          onToggle={(l) => setDifficulties((s) => toggle(s, l))}
        />
      </div>

      <FocusBanner tab="restaurants" matches={focus?.tab === "restaurants" ? data.restaurants.filter((r) => companyKey(r.chain) === focus.key).length : 0} noun="restaurant" />

      <DataTable
        ariaLabel="Restaurants"
        noun="restaurants"
        rows={rows}
        columns={columns}
        getRowKey={(r) => r.chain}
        pageSize={8}
        minWidth={1700}
        active={active}
        isHighlighted={(r) => focus?.tab === "restaurants" && companyKey(r.chain) === focus.key}
        highlightNonce={focus?.tab === "restaurants" ? focus.nonce : 0}
        emptyMessage="No restaurants match these filters."
        toolbar={
          <DatatableToolbar
            query={query}
            onQueryChange={setQuery}
            placeholder="Search restaurants, segments, notes…"
            onExport={() =>
              downloadCsv(
                "vistify-restaurants.csv",
                H,
                rows.map((r) => [r.chain, r.verdict, r.difficulty, r.photos, r.units, r.segment, r.angle, r.source]),
              )
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
                      {verdicts.length + difficulties.length > 0 && (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                          {verdicts.length + difficulties.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>{H[1]}</DropdownMenuLabel>
                    {verdictCounts.map((v) => (
                      <DropdownMenuCheckboxItem
                        key={v.label}
                        checked={verdicts.includes(v.label)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => setVerdicts((s) => toggle(s, v.label))}
                      >
                        {v.label}
                        <span className="ml-auto pl-3 text-xs text-muted-foreground">{v.count}</span>
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>{H[2]}</DropdownMenuLabel>
                    {difficultyCounts.map((v) => (
                      <DropdownMenuCheckboxItem
                        key={v.label}
                        checked={difficulties.includes(v.label)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => setDifficulties((s) => toggle(s, v.label))}
                      >
                        {v.label}
                        <span className="ml-auto pl-3 text-xs text-muted-foreground">{v.count}</span>
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
