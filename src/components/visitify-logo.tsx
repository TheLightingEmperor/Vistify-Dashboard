import visitifyLogo from "@/assets/visitify-logo.png";
import kamanaLogo from "@/assets/kamana-logo.png";
import { cn } from "@/lib/utils";

export function VisitifyLogo({ className }: { className?: string }) {
  return <img src={visitifyLogo} alt="Visitify" className={cn("h-12 w-auto select-none sm:h-14", className)} draggable={false} />;
}

/** "Powered by Kamana" lockup shown under the Visitify logo (per the Layout sheet). */
export function PoweredByKamana({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground">Powered by</span>
      <img src={kamanaLogo} alt="Kamana" className="h-7 w-auto select-none" draggable={false} />
    </div>
  );
}
