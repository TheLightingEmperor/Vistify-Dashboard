import { PANEL } from "@/components/ui/data-table";
import type { Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

export interface Slice {
  label: string;
  count: number;
  tone: Tone;
}

interface Props {
  title: string;
  slices: Slice[];
  selected: string[];
  onToggle: (label: string) => void;
}

/** Segmented bar + legend; clicking a slice filters the table (click again to clear). */
export function DistributionCard({ title, slices, selected, onToggle }: Props) {
  const total = slices.reduce((n, s) => n + s.count, 0) || 1;
  const filtering = selected.length > 0;
  return (
    <div className={cn(PANEL, "p-4 pt-5")}>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-bold tracking-tight">{title}</h3>
        <span className="text-xs text-muted-foreground">{filtering ? "Filtered · click to clear" : "Click to filter"}</span>
      </div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${title} distribution`}>
        {slices.map((s) => (
          <div
            key={s.label}
            className={cn("transition-opacity", s.tone.bar, filtering && !selected.includes(s.label) && "opacity-25")}
            style={{ width: `${(s.count / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        {slices.map((s) => {
          const on = selected.includes(s.label);
          return (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => onToggle(s.label)}
                aria-pressed={on}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on && "bg-accent font-semibold text-primary-dark",
                )}
              >
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.tone.bar)} />
                <span className="truncate">{s.label}</span>
                <span className="ml-auto tabular-nums text-muted-foreground">{s.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
