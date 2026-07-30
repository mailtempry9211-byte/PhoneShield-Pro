import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PlusIcon, EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResource } from "@/hooks/useResource";
import { idOf, phonesService, type Identified } from "@/services/resources";
import { apiErrorMessage } from "@/services/api";
import { currency, pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/inventory/")({
  head: () => ({
    meta: [
      { title: "Phone Inventory — PhoneShield Pro" },
      {
        name: "description",
        content: "Search, filter and manage every handset in stock with IMEI-level detail.",
      },
      { property: "og:title", content: "Phone Inventory — PhoneShield Pro" },
      { property: "og:description", content: "Full stock list with pricing, condition and status." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useResource(() => phonesService.list(), []);
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Identified | null>(null);

  const rows = (data ?? []).filter((row) =>
    status === "all"
      ? true
      : String(pick<string>(row, ["status"], "")).toLowerCase() === status,
  );

  const remove = async () => {
    if (!target) return;
    try {
      await phonesService.remove(idOf(target));
      toast.success("Phone deleted");
      void refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete this phone"));
    }
  };

  const columns: Column<Identified>[] = [
    {
      key: "brand",
      label: "Brand",
      render: (row) => <span className="font-medium">{pick(row, ["brand", "make"], "—")}</span>,
    },
    { key: "model", label: "Model" },
    {
      key: "imei",
      label: "IMEI",
      render: (row) => (
        <span className="font-mono text-xs">{pick(row, ["imei", "imei1"], "—")}</span>
      ),
    },
    { key: "storage", label: "Storage" },
    { key: "ram", label: "RAM" },
    {
      key: "batteryHealth",
      label: "Battery",
      render: (row) => {
        const value = pick(row, ["batteryHealth", "battery"]);
        return value ? `${value}%` : "—";
      },
    },
    {
      key: "condition",
      label: "Condition",
      render: (row) => <StatusBadge value={pick(row, ["condition"], "")} />,
    },
    {
      key: "purchasePrice",
      label: "Purchase",
      render: (row) => currency(pick(row, ["purchasePrice", "costPrice"], 0)),
    },
    {
      key: "sellingPrice",
      label: "Selling",
      render: (row) => (
        <span className="font-semibold">
          {currency(pick(row, ["sellingPrice", "salePrice", "price"], 0))}
        </span>
      ),
    },
    {
      key: "seller",
      label: "Seller",
      render: (row) => pick(row, ["seller.name", "sellerName", "seller"], "—") as any,
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => pick(row, ["customer.name", "customerName", "customer"], "—") as any,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge value={pick(row, ["status"], "available")} />,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            to="/inventory/$phoneId"
            params={{ phoneId: idOf(row) }}
            aria-label="View phone"
            onClick={(e) => e.stopPropagation()}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            to="/inventory/$phoneId/edit"
            params={{ phoneId: idOf(row) }}
            aria-label="Edit phone"
            onClick={(e) => e.stopPropagation()}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Delete phone"
            onClick={(e) => {
              e.stopPropagation();
              setTarget(row);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Phone Inventory"
        description="Every handset in stock, with pricing, condition and ownership."
        actions={
          <Button asChild className="rounded-xl gradient-brand shadow-glow">
            <Link to="/inventory/add">
              <PlusIcon className="mr-1.5 h-4 w-4" /> Add Phone
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={idOf}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchKeys={["brand", "model", "imei", "color", "seller.name", "customer.name", "status"]}
        searchPlaceholder="Search brand, model or IMEI…"
        onRowClick={(row) => navigate({ to: "/inventory/$phoneId", params: { phoneId: idOf(row) } })}
        emptyTitle="No phones yet"
        emptyDescription="Add your first handset to start tracking stock."
        emptyAction={
          <Button asChild className="rounded-xl">
            <Link to="/inventory/add">Add Phone</Link>
          </Button>
        }
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-[160px] rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete this phone?"
        description="This permanently removes the handset and its record from inventory."
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </>
  );
}
