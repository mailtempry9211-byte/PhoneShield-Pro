import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PencilSquareIcon, TrashIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/common/Cards";
import { DetailRow } from "@/components/common/Field";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useResource } from "@/hooks/useResource";
import { phonesService } from "@/services/resources";
import { apiErrorMessage } from "@/services/api";
import { currency, formatDate, pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/inventory/$phoneId/")({
  head: () => ({
    meta: [
      { title: "Phone Details — PhoneShield Pro" },
      { name: "description", content: "Full specifications, pricing, profit and ownership for this device." },
      { property: "og:title", content: "Phone Details — PhoneShield Pro" },
      { property: "og:description", content: "Device specs, gallery and profit breakdown." },
    ],
  }),
  component: PhoneDetailsPage,
});

function PhoneDetailsPage() {
  const { phoneId } = Route.useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useResource(() => phonesService.get(phoneId), [phoneId]);
  const [confirm, setConfirm] = useState(false);

  if (loading) return <Skeleton className="h-[520px] w-full rounded-2xl" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return <EmptyState title="Phone not found" />;

  const images: string[] = (pick<any[]>(data, ["images", "photos"], []) ?? [])
    .map((img: any) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);
  const purchase = Number(pick(data, ["purchasePrice", "costPrice"], 0) ?? 0);
  const selling = Number(pick(data, ["sellingPrice", "salePrice"], 0) ?? 0);

  const remove = async () => {
    try {
      await phonesService.remove(phoneId);
      toast.success("Phone deleted");
      navigate({ to: "/inventory" });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete this phone"));
    }
  };

  return (
    <>
      <PageHeader
        title={`${pick(data, ["brand"], "")} ${pick(data, ["model"], "Device")}`}
        description={`IMEI ${pick(data, ["imei", "imei1"], "—")}`}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/inventory/$phoneId/edit" params={{ phoneId }}>
                <PencilSquareIcon className="mr-1.5 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="outline" className="rounded-xl text-destructive" onClick={() => setConfirm(true)}>
              <TrashIcon className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <SectionCard title="Gallery" bodyClassName="p-4">
          {images.length === 0 ? (
            <div className="grid aspect-[4/3] w-full place-items-center rounded-xl bg-muted text-muted-foreground">
              <div className="text-center">
                <DevicePhoneMobileIcon className="mx-auto h-10 w-10" />
                <p className="mt-2 text-sm">No images uploaded</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <img src={images[0]} alt="Device" className="aspect-[4/3] w-full rounded-xl object-cover" />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((src, i) => (
                    <img key={i} src={src} alt={`Device ${i + 2}`} className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Specifications" bodyClassName="px-5 py-1">
            <DetailRow label="Brand" value={pick(data, ["brand"], "—") as any} />
            <DetailRow label="Model" value={pick(data, ["model"], "—") as any} />
            <DetailRow label="Storage" value={pick(data, ["storage"], "—") as any} />
            <DetailRow label="RAM" value={pick(data, ["ram"], "—") as any} />
            <DetailRow label="Color" value={pick(data, ["color"], "—") as any} />
            <DetailRow label="Battery health" value={`${pick(data, ["batteryHealth", "battery"], "—")}`} />
            <DetailRow label="Condition" value={<StatusBadge value={pick(data, ["condition"], "")} />} />
            <DetailRow label="Status" value={<StatusBadge value={pick(data, ["status"], "available")} />} />
            <DetailRow label="Added on" value={formatDate(pick(data, ["createdAt"]))} />
          </SectionCard>

          <SectionCard title="Pricing" bodyClassName="px-5 py-1">
            <DetailRow label="Purchase price" value={currency(purchase)} />
            <DetailRow label="Selling price" value={currency(selling)} />
            <DetailRow
              label="Profit"
              value={
                <span className={selling - purchase >= 0 ? "text-success" : "text-destructive"}>
                  {currency(selling - purchase)}
                </span>
              }
            />
            <DetailRow label="Invoice number" value={pick(data, ["invoiceNumber"], "—") as any} />
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Seller" bodyClassName="px-5 py-1">
          <DetailRow label="Name" value={pick(data, ["seller.name", "sellerName"], "—") as any} />
          <DetailRow label="Phone" value={pick(data, ["seller.phone", "sellerPhone"], "—") as any} />
          <DetailRow label="City" value={pick(data, ["seller.city"], "—") as any} />
        </SectionCard>
        <SectionCard title="Customer" bodyClassName="px-5 py-1">
          <DetailRow label="Name" value={pick(data, ["customer.name", "customerName"], "—") as any} />
          <DetailRow label="Phone" value={pick(data, ["customer.phone", "customerPhone"], "—") as any} />
          <DetailRow label="City" value={pick(data, ["customer.city"], "—") as any} />
        </SectionCard>
        <SectionCard title="Notes">
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {String(pick(data, ["notes"], "") || "No notes recorded for this device.")}
          </p>
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this phone?"
        description="This permanently removes the device record."
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </>
  );
}
