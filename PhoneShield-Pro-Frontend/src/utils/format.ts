export const currency = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const number = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? new Intl.NumberFormat("en-IN").format(num) : "0";
};

export const formatDate = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDateTime = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const relativeTime = (value: unknown) => {
  if (!value) return "";
  const date = new Date(value as string).getTime();
  if (Number.isNaN(date)) return "";
  const diff = Date.now() - date;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

export const initials = (name?: string) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const titleCase = (value?: string) =>
  (value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export const pick = <T,>(obj: any, keys: string[], fallback?: T): T | undefined => {
  for (const key of keys) {
    const value = key.split(".").reduce((acc: any, k) => (acc == null ? acc : acc[k]), obj);
    if (value !== undefined && value !== null && value !== "") return value as T;
  }
  return fallback;
};
