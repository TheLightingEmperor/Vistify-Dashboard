/** Colour language for verdicts and sale difficulty (Kamana green / amber / red). */
export interface Tone {
  badge: string;
  bar: string;
}

const strong: Tone = { badge: "border-transparent bg-primary text-primary-foreground", bar: "bg-primary" };
const soft: Tone = { badge: "border-primary/30 bg-accent text-primary-dark", bar: "bg-primary/45" };
const amber: Tone = { badge: "border-amber/40 bg-amber-soft text-amber-foreground", bar: "bg-amber" };
const red: Tone = { badge: "border-destructive/30 bg-destructive/10 text-destructive", bar: "bg-destructive/70" };
const redStrong: Tone = { badge: "border-transparent bg-destructive text-destructive-foreground", bar: "bg-destructive" };
const slate: Tone = { badge: "border-border-strong bg-muted text-muted-foreground", bar: "bg-muted-foreground/45" };
const neutral: Tone = { badge: "border-border bg-background text-muted-foreground", bar: "bg-border-strong" };

export function verdictTone(verdict: string): Tone {
  const v = verdict.toLowerCase();
  if (v === "static") return strong;
  if (v === "mostly static") return soft;
  if (v.startsWith("mixed")) return amber;
  if (v.includes("digital")) return slate;
  return neutral;
}

export function difficultyTone(difficulty: string): Tone {
  switch (difficulty.toLowerCase()) {
    case "easier":
      return strong;
    case "medium":
      return amber;
    case "hard":
      return red;
    case "very hard":
      return redStrong;
    default:
      return neutral;
  }
}

/** Display order for sorting / legends. */
export const VERDICT_ORDER = ["Static", "Mostly static", "Mixed"];
export const DIFFICULTY_ORDER = ["Easier", "Medium", "Hard", "Very hard"];
export const rank = (order: string[], value: string) => {
  const i = order.findIndex((o) => o.toLowerCase() === value.toLowerCase());
  return i === -1 ? order.length : i;
};
