import { PoweredByKamana, VisitifyLogo } from "@/components/visitify-logo";
import { data } from "@/lib/data";
import { TABS, useNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const counts = {
  restaurants: data.restaurants.length,
  contacts: data.contacts.length,
  emails: data.emails.length,
} as const;


/** Mirrors the Layout sheet: logo top-left, "Powered by Kamana" tucked under it,
 *  and the three page tabs sitting to its right on the second row. */
export function SiteHeader() {
  const { tab, setTab } = useNav();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white shadow-[0_4px_18px_rgb(12_45_47/0.055)] backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-end gap-x-6 gap-y-1 px-4 pt-3 sm:px-6 lg:gap-x-24 lg:px-8">
        <div className="flex flex-col items-end pb-1.5">
          <VisitifyLogo />
          <PoweredByKamana className="mt-0.5" />
        </div>
        <nav aria-label="Pages" role="tablist" className="-mb-px flex w-full min-w-0 justify-between gap-1 overflow-x-auto sm:w-auto sm:justify-start sm:gap-6 lg:gap-10">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={cn(
                  "group relative flex items-center gap-2 whitespace-nowrap border-b-[3px] px-1.5 pb-2 pt-2 text-sm sm:px-2 sm:text-[15px] font-bold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  on ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "hidden rounded-full px-2 py-0.5 text-[11px] min-[420px]:inline font-bold tabular-nums transition-colors",
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-accent",
                  )}
                >
                  {counts[t.id]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
