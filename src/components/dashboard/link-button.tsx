import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Inline text button used for the cross-tab links (chain → contacts, company → restaurant …). */
export function LinkButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-sm text-left font-medium text-primary-dark underline-offset-4 decoration-primary/40 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline",
        className,
      )}
      {...props}
    />
  );
}
