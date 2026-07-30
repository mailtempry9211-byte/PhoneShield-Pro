import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/Cards";
import { Button } from "@/components/ui/button";
import { useResource } from "@/hooks/useResource";
import { reportsService } from "@/services/resources";
import { currency, formatDate, pick } from "@/utils/format";
import {
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

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — PhoneShield Pro" },
      { name: "description", content: "Sales, repairs and inventory analytics and reports." },
      { property: "og:title", content: "Reports — PhoneShield Pro" },
      { property: "og:description", content: "Business insights and analytics." },
    ],
  }),
  component: ReportsPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function ReportsPage() {
  const daily = useResource(() => reportsService.daily().catch(() => null), []);
  const repairs = useResource(() => reportsService.repairs().catch(() => null), []);
  const inventory = useResource(() => reportsService.inventory().catch(() => null), []);

  const dailyData = Array.isArray(daily.data) ? daily.data : [];
  const repairsData = Array.isArray(repairs.data) ? repairs.data : [];
  const inventoryData = Array.isArray(inventory.data) ? inventory.data : [];

  const repairPie = (() => {
    const map = new Map<string, number>();
    repairsData.forEach((r: any) => {
      const status = String(pick(r, ["status"], "unknown")).toLowerCase();
      map.set(status, (map.get(status) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  })();

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales, repairs and inventory analytics."
        actions={
          <Button variant="outline" className="rounded-xl">
            Export CSV
          </Button>
        }
      />

      {(daily.loading || repairs.loading || inventory.loading) && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {!daily.loading && !repairs.loading && !inventory.loading && (
        <>
          <div className="grid gap-5 xl:grid-cols-3">
            <SectionCard title="Daily sales" description="Revenue over time" className="xl:col-span-2" bodyClassName="p-2 sm:p-4">
              {dailyData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No sales data available
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
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
                      <Bar dataKey="sales" name="Sales" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="var(--color-chart-3)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Repair status" description="Current workload" bodyClassName="p-2 sm:p-4">
              {repairPie.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No repair data available
                </div>
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

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <SectionCard title="Inventory by brand" description="Units in stock">
              {inventoryData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No inventory data available
                </div>
              ) : (
                <div className="h-64 w-full p-2 sm:p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
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

            <SectionCard title="Summary" description="Key metrics">
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Sales Revenue</span>
                  <span className="text-lg font-semibold">
                    {currency(dailyData.reduce((sum: number, item: any) => sum + (Number(pick(item, ["sales"], 0)) || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Profit</span>
                  <span className="text-lg font-semibold text-success">
                    {currency(dailyData.reduce((sum: number, item: any) => sum + (Number(pick(item, ["profit"], 0)) || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Repairs</span>
                  <span className="text-lg font-semibold">{repairsData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Inventory Items</span>
                  <span className="text-lg font-semibold">
                    {inventoryData.reduce((sum: number, item: any) => sum + (Number(pick(item, ["count"], 0)) || 0), 0)}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}