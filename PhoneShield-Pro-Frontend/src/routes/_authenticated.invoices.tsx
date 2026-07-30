import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/States";
import { Button } from "@/components/ui/button";
import { useResource } from "@/hooks/useResource";
import { phonesService, repairsService, idOf, type Identified } from "@/services/resources";
import { currency, formatDate, pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — PhoneShield Pro" },
      { name: "description", content: "GST invoices generated from sales and repairs." },
      { property: "og:title", content: "Invoices — PhoneShield Pro" },
      { property: "og:description", content: "View and generate invoices for sales and repairs." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const phones = useResource(() => phonesService.list().catch(() => []), []);
  const repairs = useResource(() => repairsService.list().catch(() => []), []);
  const [invoiceType, setInvoiceType] = useState<"sale" | "repair">("sale");

  const allItems = [...(phones.data ?? []), ...(repairs.data ?? [])];
  const loading = phones.loading || repairs.loading;
  const error = phones.error || repairs.error;

  const columns: Column<Identified>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (r) => <span className="font-mono text-xs">{pick(r, ["_id"], "—") as any}</span>,
    },
    { key: "customerName", label: "Customer", render: (r) => <span className="font-medium">{pick(r, ["customerName", "customer.name"], "—") as any}</span> },
    { key: "customerPhone", label: "Phone", render: (r) => pick(r, ["customerPhone", "customer.phone"], "—") as any },
    {
      key: "total",
      label: "Total",
      render: (r) => currency(pick(r, ["sellingPrice", "salePrice", "price"], 0)),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const status = String(pick(r, ["status"], "pending")).toLowerCase();
        const colors: Record<string, string> = {
          sold: "bg-success/12 text-success",
          delivered: "bg-success/12 text-success",
          available: "bg-info/12 text-info",
          received: "bg-warning/15 text-warning",
          "in progress": "bg-warning/15 text-warning",
          ready: "bg-info/12 text-info",
          cancelled: "bg-muted text-muted-foreground",
        };
        return (
          <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (r) => formatDate(pick(r, ["createdAt"])),
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="GST invoices generated from sales and repairs."
        actions={
          <div className="flex gap-2">
            <Button
              variant={invoiceType === "sale" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setInvoiceType("sale")}
            >
              Sales
            </Button>
            <Button
              variant={invoiceType === "repair" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setInvoiceType("repair")}
            >
              Repairs
            </Button>
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={allItems}
        rowKey={idOf}
        loading={loading}
        error={error}
        searchKeys={["customerName", "customerPhone", "status"]}
        searchPlaceholder="Search invoices…"
        emptyTitle="No invoices yet"
        emptyDescription="Invoices are generated from sales and repairs."
      />
    </>
  );
}