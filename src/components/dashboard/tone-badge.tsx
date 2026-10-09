import { Badge } from "@/components/ui/badge";
import { difficultyTone, verdictTone } from "@/lib/tones";
import { cn } from "@/lib/utils";

const base = "whitespace-nowrap px-2.5 py-0.5 font-semibold";

export function VerdictBadge({ verdict, className }: { verdict: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(base, verdictTone(verdict).badge, className)}>
      {verdict}
    </Badge>
  );
}

export function DifficultyBadge({ difficulty, className }: { difficulty: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn(base, difficultyTone(difficulty).badge, className)}>
      {difficulty}
    </Badge>
  );
}
