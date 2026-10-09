import type { ReactNode } from "react";
import { Download, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder: string;
  /** Filter dropdowns etc., rendered between search and Export. */
  filters?: ReactNode;
  onExport?: () => void;
  exportLabel?: string;
  /** Extra actions (e.g. bulk actions for selected rows). */
  actions?: ReactNode;
}

export function DatatableToolbar({ query, onQueryChange, placeholder, filters, onExport, exportLabel = "Export", actions }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <InputGroup className="h-10 sm:max-w-sm">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-full"
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" onClick={() => onQueryChange("")} aria-label="Clear search">
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {actions}
        {filters}
        {onExport && (
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            {exportLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
