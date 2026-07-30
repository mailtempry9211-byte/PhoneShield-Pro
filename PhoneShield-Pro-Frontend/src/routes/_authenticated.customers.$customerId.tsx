import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/Cards";
import { DetailRow } from "@/components/common/Field";
import { EmptyState, ErrorState } from "@/components/common/States";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useResource } from "@/hooks/useResource";
import { customersService, idOf, phonesService } from "@/services/resources";
import { currency, formatDate, initials, pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/customers/$customerId")({
  head: () => ({
    meta: [
      { title: "Customer Profile — PhoneShield Pro" },
      { name: "description", content: "Customer contact details and complete purchase history." },
      { property: "og:title", content: "Customer Profile — PhoneShield Pro" },
      { property: "og:description", content: "Contact details and purchase history." },
    ],
  }),
  component: CustomerProfilePage,
});

function CustomerProfilePage() {
  const { customerId } = Route.useParams();
  const customer = useResource(() => customersService.get(customerId), [customerId]);
  const phones = useResource(() => phonesService.list().catch(() => []), []);

  if (customer.loading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (customer.error) return <ErrorState message={customer.error} onRetry={customer.refetch} />;
  if (!customer.data) return <EmptyState title="Customer not found" />;

  const purchases = (phones.data ?? []).filter((phone) => {
    const cust = phone.customer;
    const id = typeof cust === "string" ? cust : idOf(cust);
    return id === customerId;
  });

  return (
    <>
      <PageHeader
        title={String(pick(customer.data, ["name"], "Customer"))}
        description={String(pick(customer.data, ["phone"], ""))}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <SectionCard title="Profile" bodyClassName="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-brand text-lg font-semibold text-primary-foreground">
              {initials(String(pick(customer.data, ["name"], "?")))}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{pick(customer.data, ["name"], "—") as any}</p>
              <p className="truncate text-sm text-muted-foreground">
                {pick(customer.data, ["email"], "No email") as any}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <DetailRow label="Phone" value={pick(customer.data, ["phone"], "—") as any} />
            <DetailRow label="City" value={pick(customer.data, ["city"], "—") as any} />
            <DetailRow label="Address" value={pick(customer.data, ["address"], "—") as any} />
            <DetailRow label="Added" value={formatDate(pick(customer.data, ["createdAt"]))} />
            <DetailRow label="Notes" value={pick(customer.data, ["notes"], "—") as any} />
          </div>
        </SectionCard>

        <SectionCard title="Purchase history" bodyClassName="p-0">
          {phones.loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-5"><EmptyState title="No purchases recorded" /></div>
          ) : (
            <ul className="divide-y divide-border">
              {purchases.map((phone) => (
                <li key={idOf(phone)}>
                  <Link to="/inventory/$phoneId" params={{ phoneId: idOf(phone) }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-accent/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {pick(phone, ["brand"], "")} {pick(phone, ["model"], "")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        IMEI {pick(phone, ["imei"], "—")} · {formatDate(pick(phone, ["soldDate", "updatedAt"]))}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold">
                        {currency(pick(phone, ["sellingPrice", "salePrice"], 0))}
                      </span>
                      <StatusBadge value={pick(phone, ["status"], "sold")} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
