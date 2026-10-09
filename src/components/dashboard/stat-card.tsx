import type { ReactNode } from "react";

import { PANEL } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
  actionLabel?: string;
}

/** KPI tile. Clickable tiles either filter the table below or jump to another tab. */
export function StatCard({ label, value, hint, icon, onClick, active, actionLabel }: Props) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-primary text-primary-foreground shadow-[0_5px_12px_hsl(var(--primary-dark)/0.2)] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs font-medium text-primary-dark">{hint}</div>}
    </>
  );

  const base = cn(PANEL, "block w-full p-4 pt-5 text-left", active && "border-primary ring-2 ring-primary/20");
  if (!onClick) return <div className={base}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={actionLabel ?? label}
      className={cn(
        base,
        "transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_16px_34px_rgb(16_72_74/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {body}
    </button>
  );
}
