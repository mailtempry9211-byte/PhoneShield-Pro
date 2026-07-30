import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/Cards";
import { DetailRow } from "@/components/common/Field";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useResource } from "@/hooks/useResource";
import { repairsService } from "@/services/resources";
import { apiErrorMessage } from "@/services/api";
import { currency, formatDate, formatDateTime, pick } from "@/utils/format";

const STATUS_FLOW = ["received", "in progress", "ready", "delivered", "cancelled"];

export const Route = createFileRoute("/_authenticated/repairs/$repairId")({
  head: () => ({
    meta: [
      { title: "Repair Details — PhoneShield Pro" },
      { name: "description", content: "Repair job timeline, costs, technician and delivery status." },
      { property: "og:title", content: "Repair Details — PhoneShield Pro" },
      { property: "og:description", content: "Track a single repair from intake to delivery." },
    ],
  }),
  component: RepairDetailsPage,
});

function RepairDetailsPage() {
  const { repairId } = Route.useParams();
  const { data, loading, error, refetch } = useResource(() => repairsService.get(repairId), [repairId]);

  if (loading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return <EmptyState title="Repair not found" />;

  const current = String(pick(data, ["status"], "received")).toLowerCase();
  const estimated = Number(pick(data, ["estimatedCost"], 0) ?? 0);
  const final = Number(pick(data, ["finalCost"], 0) ?? 0);
  const advance = Number(pick(data, ["advance"], 0) ?? 0);
  const balance = (final || estimated) - advance;

  const updateStatus = async (status: string) => {
    try {
      await repairsService.update(repairId, { status });
      toast.success(`Status set to ${status}`);
      void refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update status"));
    }
  };

  return (
    <>
      <PageHeader
        title={String(pick(data, ["device", "deviceName"], "Repair job"))}
        description={String(pick(data, ["issue", "problem"], "No issue recorded"))}
        actions={
          <Select value={current} onValueChange={updateStatus}>
            <SelectTrigger className="h-10 w-[180px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Job details" bodyClassName="px-5 py-1" className="lg:col-span-2">
          <DetailRow label="Customer" value={pick(data, ["customerName", "customer.name"], "—") as any} />
          <DetailRow label="Phone number" value={pick(data, ["customerPhone", "customer.phone"], "—") as any} />
          <DetailRow label="Device" value={pick(data, ["device", "deviceName"], "—") as any} />
          <DetailRow label="IMEI" value={pick(data, ["imei"], "—") as any} />
          <DetailRow label="Technician" value={pick(data, ["technician"], "—") as any} />
          <DetailRow label="Accessories" value={pick(data, ["accessories"], "—") as any} />
          <DetailRow label="Delivery date" value={formatDate(pick(data, ["deliveryDate"]))} />
          <DetailRow label="Priority" value={<StatusBadge value={pick(data, ["priority"], "medium")} />} />
          <DetailRow label="Status" value={<StatusBadge value={current} />} />
          <DetailRow label="Notes" value={pick(data, ["notes"], "—") as any} />
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Costs" bodyClassName="px-5 py-1">
            <DetailRow label="Estimated" value={currency(estimated)} />
            <DetailRow label="Final" value={currency(final)} />
            <DetailRow label="Advance" value={currency(advance)} />
            <DetailRow label="Balance" value={<span className="text-primary">{currency(balance)}</span>} />
          </SectionCard>

          <SectionCard title="Timeline">
            <ol className="relative space-y-4 pl-6">
              <span className="absolute top-2 bottom-2 left-[0.3rem] w-px bg-border" />
              {STATUS_FLOW.slice(0, 4).map((step) => {
                const reached = STATUS_FLOW.indexOf(current) >= STATUS_FLOW.indexOf(step);
                return (
                  <li key={step} className="relative">
                    <span
                      className={`absolute top-1.5 -left-[0.85rem] h-2.5 w-2.5 rounded-full ${
                        reached ? "gradient-brand" : "bg-border"
                      }`}
                    />
                    <p className={`text-sm ${reached ? "font-medium" : "text-muted-foreground"}`}>
                      {step}
                    </p>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Created {formatDateTime(pick(data, ["createdAt"]))}
            </p>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
