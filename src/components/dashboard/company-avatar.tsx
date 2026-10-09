import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CompanyAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn("size-10 bg-muted", className)}>
      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary-dark">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
