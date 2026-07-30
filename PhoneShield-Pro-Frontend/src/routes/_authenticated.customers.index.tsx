import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PlusIcon, PencilSquareIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Field } from "@/components/common/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useResource } from "@/hooks/useResource";
import { customersService, idOf, type Identified } from "@/services/resources";
import { apiErrorMessage } from "@/services/api";
import { pick } from "@/utils/format";

export const Route = createFileRoute("/_authenticated/customers/")({
  head: () => ({
    meta: [
      { title: "Customers — PhoneShield Pro" },
      { name: "description", content: "Customer directory with contact details and purchase history." },
      { property: "og:title", content: "Customers — PhoneShield Pro" },
      { property: "og:description", content: "Know every buyer walking into your shop." },
    ],
  }),
  component: CustomersPage,
});

interface CustomerForm {
  name: string; phone: string; email: string; address: string; city: string; notes: string;
}
const EMPTY: CustomerForm = { name: "", phone: "", email: "", address: "", city: "", notes: "" };

function CustomersPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useResource(() => customersService.list(), []);
  const [editing, setEditing] = useState<Identified | null | undefined>(undefined);
  const [target, setTarget] = useState<Identified | null>(null);

  const remove = async () => {
    if (!target) return;
    try {
      await customersService.remove(idOf(target));
      toast.success("Customer deleted");
      void refetch();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not delete this customer"));
    }
  };

  const columns: Column<Identified>[] = [
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{pick(r, ["name"], "—") as any}</span> },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    {
      key: "actions", label: "Actions", sortable: false, className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link to="/customers/$customerId" params={{ customerId: idOf(row) }} aria-label="View customer"
            onClick={(e) => e.stopPropagation()}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <EyeIcon className="h-4 w-4" />
          </Link>
          <button type="button" aria-label="Edit customer"
            onClick={(e) => { e.stopPropagation(); setEditing(row); }}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Delete customer"
            onClick={(e) => { e.stopPropagation(); setTarget(row); }}
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
        title="Customers"
        description="Everyone who has bought or repaired a device with you."
        actions={
          <Button className="rounded-xl gradient-brand shadow-glow" onClick={() => setEditing(null)}>
            <PlusIcon className="mr-1.5 h-4 w-4" /> Add Customer
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={idOf}
        loading={loading}
        error={error}
        onRetry={refetch}
        searchKeys={["name", "phone", "email", "city"]}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate({ to: "/customers/$customerId", params: { customerId: idOf(row) } })}
        emptyTitle="No customers yet"
      />
      <CustomerDialog
        open={editing !== undefined}
        customer={editing ?? null}
        onOpenChange={(open) => !open && setEditing(undefined)}
        onSaved={() => { setEditing(undefined); void refetch(); }}
      />
      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => !open && setTarget(null)}
        title="Delete this customer?"
        confirmLabel="Delete"
        onConfirm={remove}
      />
    </>
  );
}

function CustomerDialog({
  open, customer, onOpenChange, onSaved,
}: {
  open: boolean; customer: Identified | null; onOpenChange: (o: boolean) => void; onSaved: () => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
    values: customer
      ? ({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String(customer[k] ?? "")])) } as CustomerForm)
      : EMPTY,
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (customer) await customersService.update(idOf(customer), values);
      else await customersService.create(values);
      toast.success(customer ? "Customer updated" : "Customer added");
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save this customer"));
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader><DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Name" required error={errors.name?.message}>
            <Input className="h-11 rounded-xl" {...register("name", { required: "Name is required" })} />
          </Field>
          <Field label="Phone" required error={errors.phone?.message}>
            <Input className="h-11 rounded-xl" {...register("phone", { required: "Phone is required" })} />
          </Field>
          <Field label="Email"><Input type="email" className="h-11 rounded-xl" {...register("email")} /></Field>
          <Field label="City"><Input className="h-11 rounded-xl" {...register("city")} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input className="h-11 rounded-xl" {...register("address")} /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea rows={3} className="rounded-xl" {...register("notes")} /></Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? "Saving…" : "Save customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
