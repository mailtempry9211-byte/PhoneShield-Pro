import { cn } from "@/lib/utils";
import { titleCase } from "@/utils/format";

const TONE: Record<string, string> = {
  available: "bg-success/12 text-success border-success/25",
  "in stock": "bg-success/12 text-success border-success/25",
  ready: "bg-success/12 text-success border-success/25",
  completed: "bg-success/12 text-success border-success/25",
  delivered: "bg-success/12 text-success border-success/25",
  paid: "bg-success/12 text-success border-success/25",
  active: "bg-success/12 text-success border-success/25",
  sold: "bg-info/12 text-info border-info/25",
  received: "bg-info/12 text-info border-info/25",
  "in progress": "bg-warning/15 text-warning border-warning/30",
  inprogress: "bg-warning/15 text-warning border-warning/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  reserved: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/12 text-destructive border-destructive/25",
  urgent: "bg-destructive/12 text-destructive border-destructive/25",
  cancelled: "bg-destructive/12 text-destructive border-destructive/25",
  canceled: "bg-destructive/12 text-destructive border-destructive/25",
  unpaid: "bg-destructive/12 text-destructive border-destructive/25",
  damaged: "bg-destructive/12 text-destructive border-destructive/25",
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/12 text-info border-info/25",
};

export function StatusBadge({ value, className }: { value?: string | null; className?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const tone = TONE[String(value).toLowerCase()] ?? "bg-secondary text-secondary-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {titleCase(String(value))}
    </span>
  );
}
