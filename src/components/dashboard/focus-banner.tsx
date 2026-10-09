import { ArrowLeft, Crosshair, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TABS, useNav, type TabId } from "@/lib/nav";

interface Props {
  tab: TabId;
  /** How many rows were highlighted for the current company. */
  matches: number;
  noun: string;
}

/** Explains why rows are highlighted after following a link, and offers a way back. */
export function FocusBanner({ tab, matches, noun }: Props) {
  const { focus, goTo, clearFocus } = useNav();
  if (!focus || focus.tab !== tab) return null;
  const back = TABS.find((t) => t.id === focus.from)?.label;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 rounded-[13px] border border-primary/30 bg-accent px-4 py-2.5 text-sm text-primary-dark animate-in fade-in-0 slide-in-from-top-1"
    >
      <Crosshair className="h-4 w-4 shrink-0" />
      <p className="min-w-0 flex-1">
        {matches > 0 ? (
          <>
            Showing <b>{matches}</b> {matches === 1 ? noun : `${noun}s`} for <b>{focus.label}</b>
          </>
        ) : (
          <>
            No {noun}s are listed for <b>{focus.label}</b> yet.
          </>
        )}
      </p>
      {focus.from !== tab && (
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary-dark" onClick={() => goTo(focus.from, focus.label)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {back}
        </Button>
      )}
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-primary-dark" onClick={clearFocus}>
        <X className="h-3.5 w-3.5" />
        Clear
      </Button>
    </div>
  );
}
