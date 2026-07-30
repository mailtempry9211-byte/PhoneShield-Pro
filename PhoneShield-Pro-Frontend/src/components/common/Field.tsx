import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  error,
  required,
  hint,
  className,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-border/70 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium break-words">{value ?? "—"}</span>
    </div>
  );
}
