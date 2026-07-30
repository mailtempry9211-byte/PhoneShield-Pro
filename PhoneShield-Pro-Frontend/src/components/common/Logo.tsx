import { cn } from "@/lib/utils";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

export function Logo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-glow",
          box,
        )}
      >
        <ShieldCheckIcon className={icon} />
      </div>
      {showText && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold tracking-tight">PhoneShield Pro</p>
          <p className="truncate text-[11px] text-muted-foreground">Mobile Shop Management</p>
        </div>
      )}
    </div>
  );
}
