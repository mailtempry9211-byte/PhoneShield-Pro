import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PlusIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResource } from "@/hooks/useResource";
import { idOf, repairsService, type Identified } from "@/services/resources";
import { apiErrorMessage } from "@/services/api";
import { currency, formatDate, pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/repairs/")({
  head: () => ({
    meta: [
      { title: "Repairs — PhoneShield Pro" },
      { name: "description", content: "Track repair jobs, technicians, costs and delivery timelines." },
      { property: "og:title", content: "Repairs — PhoneShield Pro" },
      { property: "og:description", content: "Complete repair job management." },
    ],
  }),
  component: RepairsPage,
});

export const REPAIR_STATUSES = ["received", "in progress", "ready", "delivered", "cancelled"];
export const PRIORITIES = ["low", "medium", "high"];

interface RepairForm {
  customerName: string; customerPhone: string; device: string; imei: string; issue: string;
  estimatedCost: string; finalCost: string; advance: string; technician: string;
  deliveryDate: string; accessories: string; notes: string; status: string; priority: string;
}
const EMPTY: RepairForm = {
  customerName: "", customerPhone: "", device: "", imei: "", issue: "", estimatedCost: "",
  finalCost: "", advance: "", technician: "", deliveryDate: "", accessories: "", notes: "",
  status: "received", priority: "medium",
};

function RepairsPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useResource(() => repairsService.list(), []);
  const [creating, setCreating] = useState(false);
  const [target, setTarget] = useState<Identified | null>(null);
  const [status, setStatus] = useState("all");

  const rows = (data ?? []).filter((r) =>
    status === "all" ? true : String(pick<string>(r, ["status"], "")).toLowerCase() === status,
  );

  const remove = async () => {
    if (!target) return;
    try {
      await repairsService.remove(idOf(target));
      toast.success("Repair deleted");
      void refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete this repair"));
    }
  };

  const columns: Column<Identified>[] = [
    { key: "customerName", label: "Customer", render: (r) => <span className="font-medium">{pick(r, ["customerName", "customer.name"], "—") as any}</span> },
    { key: "customerPhone", label: "Phone", render: (r) => pick(r, ["customerPhone", "customer.phone"], "—") as any },
    { key: "device", label: "Device", render: (r) => pick(r, ["device", "deviceName", "model"], "—") as any },
    { key: "issue", label: "Issue", render: (r) => pick(r, ["issue", "problem"], "—") as any },
    { key: "priority", label: "Priority", render: (r) => <StatusBadge value={pick(r, ["priority"], "medium")} /> },
    { key: "estimatedCost", label: "Estimate", render: (r) => currency(pick(r, ["estimatedCost"], 0)) },
    { key: "deliveryDate", label: "Delivery", render: (r) => formatDate(pick(r, ["deliveryDate"])) },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={pick(r, ["status"], "received")} /> },
    {
      key: "actions", label: "Actions", sortable: false, className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link to="/repairs/$repairId" params={{ repairId: idOf(row) }} aria-label="View repair"
            onClick={(e) => e.stopPropagation()}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <EyeIcon className="h-4 w-4" />
          </Link>
          <button type="button" aria-label="Delete repair" onClick={(e) => { e.stopPropagation(); setTarget(row); }}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Repairs"
        description="Every job on the bench, from intake to delivery."
        actions={
          <Button className="rounded-xl gradient-brand shadow-glow" onClick={() => setCreating(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" /> Create Repair
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
        searchKeys={["customerName", "customerPhone", "device", "imei", "issue", "technician"]}
        searchPlaceholder="Search repairs…"
        onRowClick={(row) => navigate({ to: "/repairs/$repairId", params: { repairId: idOf(row) } })}
        emptyTitle="No repair jobs yet"
        filters={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-[170px] rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {REPAIR_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      <RepairDialog open={creating} onOpenChange={setCreating} onSaved={() => { setCreating(false); void refetch(); }} />
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete this repair job?"
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </>
  );
}

function RepairDialog({
  open, onOpenChange, onSaved,
}: { open: boolean; onOpenChange: (o: boolean) => void; onSaved: () => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<RepairForm>({ defaultValues: EMPTY });

  const submit = handleSubmit(async (values) => {
    const payload: Record<string, any> = {
      ...values,
      estimatedCost: values.estimatedCost ? Number(values.estimatedCost) : undefined,
      finalCost: values.finalCost ? Number(values.finalCost) : undefined,
      advance: values.advance ? Number(values.advance) : undefined,
    };
    Object.keys(payload).forEach((k) => { if (payload[k] === "" || payload[k] === undefined) delete payload[k]; });
    try {
      await repairsService.create(payload);
      toast.success("Repair job created");
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not create this repair"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader><DialogTitle>Create repair job</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Customer name" required error={errors.customerName?.message}>
            <Input className="h-11 rounded-xl" {...register("customerName", { required: "Customer is required" })} />
          </Field>
          <Field label="Phone number" required error={errors.customerPhone?.message}>
            <Input className="h-11 rounded-xl" {...register("customerPhone", { required: "Phone is required" })} />
          </Field>
          <Field label="Device" required error={errors.device?.message}>
            <Input className="h-11 rounded-xl" {...register("device", { required: "Device is required" })} />
          </Field>
          <Field label="IMEI"><Input className="h-11 rounded-xl font-mono" {...register("imei")} /></Field>
          <Field label="Issue" required error={errors.issue?.message} className="sm:col-span-2">
            <Textarea rows={2} className="rounded-xl" {...register("issue", { required: "Describe the issue" })} />
          </Field>
          <Field label="Estimated cost"><Input type="number" className="h-11 rounded-xl" {...register("estimatedCost")} /></Field>
          <Field label="Advance"><Input type="number" className="h-11 rounded-xl" {...register("advance")} /></Field>
          <Field label="Technician"><Input className="h-11 rounded-xl" {...register("technician")} /></Field>
          <Field label="Delivery date"><Input type="date" className="h-11 rounded-xl" {...register("deliveryDate")} /></Field>
          <Field label="Priority">
            <Select value={watch("priority")} onValueChange={(v) => setValue("priority", v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{REPAIR_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Accessories" className="sm:col-span-2"><Input className="h-11 rounded-xl" placeholder="Charger, case…" {...register("accessories")} /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea rows={3} className="rounded-xl" {...register("notes")} /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? "Saving…" : "Create repair"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
