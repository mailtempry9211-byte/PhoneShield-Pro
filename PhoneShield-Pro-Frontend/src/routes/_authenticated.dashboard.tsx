import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DevicePhoneMobileIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard, StatCard } from "@/components/common/Cards";
import { CardsSkeleton, EmptyState, ErrorState } from "@/components/common/States";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResource } from "@/hooks/useResource";
import { dashboardService, idOf, phonesService, repairsService } from "@/services/resources";
import { currency, formatDate, number, pick, relativeTime } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PhoneShield Pro" },
      {
        name: "description",
        content: "Live sales, profit, inventory and repair analytics for your mobile shop.",
      },
      { property: "og:title", content: "Dashboard — PhoneShield Pro" },
      { property: "og:description", content: "Live shop analytics at a glance." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const isSameDay = (value: unknown) => {
  if (!value) return false;
  const d = new Date(value as string);
  const now = new Date();
  return d.toDateString() === now.toDateString();
};

const isSameMonth = (value: unknown) => {
  if (!value) return false;
  const d = new Date(value as string);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

function DashboardPage() {
  const stats = useResource(() => dashboardService.stats().catch(() => null), []);
  const phones = useResource(() => phonesService.list(), []);
  const repairs = useResource(() => repairsService.list(), []);

  const phoneRows = phones.data ?? [];
  const repairRows = repairs.data ?? [];
  const s = stats.data ?? {};

  const statusOf = (phone: any) => String(pick<string>(phone, ["status"], "available")).toLowerCase();
  const sold = phoneRows.filter((p) => statusOf(p) === "sold");
  const available = phoneRows.filter((p) => statusOf(p) === "available" || statusOf(p) === "in stock");

  const priceOf = (p: any, keys: string[]) => Number(pick<number>(p, keys, 0) ?? 0);
  const soldAt = (p: any) => pick(p, ["soldDate", "soldAt", "updatedAt", "createdAt"]);

  const monthlySales = sold
    .filter((p) => isSameMonth(soldAt(p)))
    .reduce((sum, p) => sum + priceOf(p, ["sellingPrice", "salePrice", "price"]), 0);
  const monthlyProfit = sold
    .filter((p) => isSameMonth(soldAt(p)))
    .reduce(
      (sum, p) =>
        sum +
        (priceOf(p, ["sellingPrice", "salePrice", "price"]) -
          priceOf(p, ["purchasePrice", "costPrice", "buyPrice"])),
      0,
    );
  const todaySales = sold
    .filter((p) => isSameDay(soldAt(p)))
    .reduce((sum, p) => sum + priceOf(p, ["sellingPrice", "salePrice", "price"]), 0);

  const repairStatus = (r: any) => String(pick<string>(r, ["status"], "received")).toLowerCase();
  const todayRepairs = repairRows.filter((r) => isSameDay(pick(r, ["createdAt", "receivedDate"])));
  const pendingRepairs = repairRows.filter((r) =>
    ["received", "in progress", "inprogress", "pending"].includes(repairStatus(r)),
  );
  const completedRepairs = repairRows.filter((r) =>
    ["ready", "delivered", "completed"].includes(repairStatus(r)),
  );

  const num = (key: string, fallback: number) => {
    const value = s?.[key];
    return typeof value === "number" ? value : fallback;
  };

  const loading = phones.loading || repairs.loading;

  const cards = [
    {
      label: "Total Phones",
      value: number(num("totalPhones", phoneRows.length)),
      icon: DevicePhoneMobileIcon,
      tone: "default" as const,
    },
    {
      label: "Available Phones",
      value: number(num("availablePhones", available.length)),
      icon: CheckBadgeIcon,
      tone: "success" as const,
    },
    {
      label: "Sold Phones",
      value: number(num("soldPhones", sold.length)),
      icon: ShoppingBagIcon,
      tone: "info" as const,
    },
    {
      label: "Monthly Sales",
      value: currency(num("monthlySales", monthlySales)),
      icon: BanknotesIcon,
      tone: "default" as const,
    },
    {
      label: "Monthly Profit",
      value: currency(num("monthlyProfit", monthlyProfit)),
      icon: ArrowTrendingUpIcon,
      tone: "success" as const,
    },
    {
      label: "Today's Sales",
      value: currency(num("todaySales", todaySales)),
      icon: CurrencyRupeeIcon,
      tone: "info" as const,
    },
    {
      label: "Today's Repairs",
      value: number(num("todayRepairs", todayRepairs.length)),
      icon: WrenchScrewdriverIcon,
      tone: "warning" as const,
    },
    {
      label: "Pending Repairs",
      value: number(num("pendingRepairs", pendingRepairs.length)),
      icon: ClockIcon,
      tone: "destructive" as const,
    },
    {
      label: "Completed Repairs",
      value: number(num("completedRepairs", completedRepairs.length)),
      icon: CheckCircleIcon,
      tone: "success" as const,
    },
  ];

  // Sales trend over the last 6 months, derived from sold inventory.
  const salesTrend = (() => {
    const months: { key: string; label: string; sales: number; profit: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        sales: 0,
        profit: 0,
      });
    }
    sold.forEach((p) => {
      const date = new Date(soldAt(p) as string);
      if (Number.isNaN(date.getTime())) return;
      const bucket = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (!bucket) return;
      const sell = priceOf(p, ["sellingPrice", "salePrice", "price"]);
      const cost = priceOf(p, ["purchasePrice", "costPrice", "buyPrice"]);
      bucket.sales += sell;
      bucket.profit += sell - cost;
    });
    return months;
  })();

  const inventoryByBrand = (() => {
    const map = new Map<string, number>();
    phoneRows.forEach((p) => {
      const brand = String(pick<string>(p, ["brand", "make"], "Other"));
      map.set(brand, (map.get(brand) ?? 0) + 1);
    });
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();

  const repairPie = (() => {
    const map = new Map<string, number>();
    repairRows.forEach((r) => {
      const status = String(pick<string>(r, ["status"], "received"));
      map.set(status, (map.get(status) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  })();

  const latestPhones = [...phoneRows]
    .sort(
      (a, b) =>
        new Date(pick(b, ["createdAt"]) as string).getTime() -
        new Date(pick(a, ["createdAt"]) as string).getTime(),
    )
    .slice(0, 5);
  const latestRepairs = [...repairRows]
    .sort(
      (a, b) =>
        new Date(pick(b, ["createdAt"]) as string).getTime() -
        new Date(pick(a, ["createdAt"]) as string).getTime(),
    )
    .slice(0, 5);

  const activity = [...latestPhones.map((p) => ({ type: "phone" as const, item: p })), ...latestRepairs.map((r) => ({ type: "repair" as const, item: r }))]
    .sort(
      (a, b) =>
        new Date(pick(b.item, ["createdAt"]) as string).getTime() -
        new Date(pick(a.item, ["createdAt"]) as string).getTime(),
    )
    .slice(0, 8);

  const error = phones.error || repairs.error;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything happening across your shop, live from the counter."
      />

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            void phones.refetch();
            void repairs.refetch();
          }}
        />
      )}

      {loading ? (
        <CardsSkeleton count={8} />
      ) : (
        !error && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card, index) => (
              <StatCard key={card.label} index={index} {...card} />
            ))}
          </div>
        )
      )}

      {!error && (
        <>
          <div className="grid gap-5 xl:grid-cols-3">
            <SectionCard
              title="Sales & profit"
              description="Last 6 months"
              className="xl:col-span-2"
              bodyClassName="p-2 sm:p-4"
            >
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} width={70} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        formatter={(value: any) => currency(value)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        name="Sales"
                        stroke="var(--color-chart-1)"
                        fill="url(#salesFill)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name="Profit"
                        stroke="var(--color-chart-3)"
                        fill="url(#profitFill)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Repair status" description="Current workload" bodyClassName="p-2 sm:p-4">
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : repairPie.length === 0 ? (
                <EmptyState title="No repairs yet" />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={repairPie}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {repairPie.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <SectionCard
              title="Inventory by brand"
              description="Units in stock"
              className="xl:col-span-2"
              bodyClassName="p-2 sm:p-4"
            >
              {loading ? (
                <Skeleton className="h-64 w-full rounded-xl" />
              ) : inventoryByBrand.length === 0 ? (
                <EmptyState title="No inventory yet" />
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryByBrand} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="brand" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "var(--color-accent)", opacity: 0.4 }}
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" name="Units" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Recent activity" bodyClassName="p-0">
              {loading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No recent activity" />
                </div>
              ) : (
                <ol className="relative space-y-4 p-5 pl-8">
                  <span className="absolute top-6 bottom-6 left-[1.35rem] w-px bg-border" />
                  {activity.map((entry, index) => (
                    <li key={index} className="relative">
                      <span className="absolute top-1.5 -left-[0.85rem] h-2.5 w-2.5 rounded-full gradient-brand" />
                      <p className="text-sm font-medium">
                        {entry.type === "phone"
                          ? `${pick(entry.item, ["brand"], "Phone")} ${pick(entry.item, ["model"], "")} added to inventory`
                          : `Repair for ${pick(entry.item, ["customerName", "customer.name", "device"], "customer")}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {relativeTime(pick(entry.item, ["createdAt"]))}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              title="Latest phones"
              actions={
                <Link to="/inventory" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              }
              bodyClassName="p-0"
            >
              {loading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : latestPhones.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No phones in inventory" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {latestPhones.map((phone) => (
                    <li key={idOf(phone)}>
                      <Link
                        to="/inventory/$phoneId"
                        params={{ phoneId: idOf(phone) }}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {pick(phone, ["brand"], "")} {pick(phone, ["model"], "Unnamed")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            IMEI {pick(phone, ["imei", "imei1"], "—")} ·{" "}
                            {formatDate(pick(phone, ["createdAt"]))}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-sm font-semibold">
                            {currency(pick(phone, ["sellingPrice", "salePrice", "price"], 0))}
                          </span>
                          <StatusBadge value={pick(phone, ["status"], "available")} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              title="Latest repairs"
              actions={
                <Link to="/repairs" className="text-xs font-medium text-primary hover:underline">
                  View all
                </Link>
              }
              bodyClassName="p-0"
            >
              {loading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : latestRepairs.length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No repair jobs yet" />
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {latestRepairs.map((repair) => (
                    <li key={idOf(repair)}>
                      <Link
                        to="/repairs/$repairId"
                        params={{ repairId: idOf(repair) }}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {pick(repair, ["device", "deviceName", "model"], "Device")} ·{" "}
                            {pick(repair, ["customerName", "customer.name"], "Customer")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {pick(repair, ["issue", "problem"], "Issue not specified")}
                          </p>
                        </div>
                        <StatusBadge value={pick(repair, ["status"], "received")} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}
