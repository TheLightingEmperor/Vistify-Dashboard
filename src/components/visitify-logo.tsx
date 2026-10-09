import { cn } from "@/lib/utils";

/** Placeholder for the "Visitify Logo" cell in the Layout sheet.
 *  Swap this component's contents for the real logo asset when it is available. */
export function VisitifyLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} role="img" aria-label="Visitify">
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="vf-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#42c4ba" />
            <stop offset="1" stopColor="#007b7d" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#vf-g)" />
        <rect x="8" y="9" width="24" height="16" rx="3" fill="none" stroke="#fff" strokeWidth="2.4" />
        <path d="M14 15.5l3.2 5 3.2-5M24 15.5v5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 30h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="text-[32px] font-extrabold leading-none tracking-tight text-foreground">
        Visit<span className="text-primary">ify</span>
      </span>
    </div>
  );
}
