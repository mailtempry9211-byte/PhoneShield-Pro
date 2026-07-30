import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "@tanstack/react-router";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/common/Field";
import { SectionCard } from "@/components/common/Cards";
import { customersService, idOf, phonesService, sellersService } from "@/services/resources";
import { useResource } from "@/hooks/useResource";
import { apiErrorMessage } from "@/services/api";
import { pick } from "@/utils/format";

export interface PhoneForm {
  brand: string;
  model: string;
  imei: string;
  storage: string;
  ram: string;
  color: string;
  batteryHealth: string;
  condition: string;
  purchasePrice: string;
  sellingPrice: string;
  seller: string;
  customer: string;
  invoiceNumber: string;
  status: string;
  notes: string;
}

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair", "Damaged"];
const STATUSES = ["available", "reserved", "sold"];

export function PhoneFormView({
  initial,
  phoneId,
}: {
  initial?: Record<string, any>;
  phoneId?: string;
}) {
  const navigate = useNavigate();
  const sellers = useResource(() => sellersService.list().catch(() => []), []);
  const customers = useResource(() => customersService.list().catch(() => []), []);
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PhoneForm>({
    defaultValues: {
      brand: "",
      model: "",
      imei: "",
      storage: "",
      ram: "",
      color: "",
      batteryHealth: "",
      condition: "Good",
      purchasePrice: "",
      sellingPrice: "",
      seller: "",
      customer: "",
      invoiceNumber: "",
      status: "available",
      notes: "",
    },
  });

  useEffect(() => {
    if (!initial) return;
    reset({
      brand: String(pick(initial, ["brand", "make"], "") ?? ""),
      model: String(pick(initial, ["model"], "") ?? ""),
      imei: String(pick(initial, ["imei", "imei1"], "") ?? ""),
      storage: String(pick(initial, ["storage"], "") ?? ""),
      ram: String(pick(initial, ["ram"], "") ?? ""),
      color: String(pick(initial, ["color"], "") ?? ""),
      batteryHealth: String(pick(initial, ["batteryHealth", "battery"], "") ?? ""),
      condition: String(pick(initial, ["condition"], "Good") ?? "Good"),
      purchasePrice: String(pick(initial, ["purchasePrice", "costPrice"], "") ?? ""),
      sellingPrice: String(pick(initial, ["sellingPrice", "salePrice"], "") ?? ""),
      seller: String(pick(initial, ["seller._id", "seller.id", "seller"], "") ?? ""),
      customer: String(pick(initial, ["customer._id", "customer.id", "customer"], "") ?? ""),
      invoiceNumber: String(pick(initial, ["invoiceNumber"], "") ?? ""),
      status: String(pick(initial, ["status"], "available") ?? "available"),
      notes: String(pick(initial, ["notes"], "") ?? ""),
    });
  }, [initial, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload: Record<string, any> = {
      ...values,
      batteryHealth: values.batteryHealth ? Number(values.batteryHealth) : undefined,
      purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : undefined,
      sellingPrice: values.sellingPrice ? Number(values.sellingPrice) : undefined,
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) delete payload[key];
    });

    try {
      if (phoneId) {
        await phonesService.update(phoneId, payload);
        toast.success("Phone updated");
        navigate({ to: "/inventory/$phoneId", params: { phoneId } });
      } else {
        const created = await phonesService.create(payload);
        toast.success("Phone added to inventory");
        const newId = idOf(created);
        navigate(newId ? { to: "/inventory/$phoneId", params: { phoneId: newId } } : { to: "/inventory" });
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save this phone"));
    }
  });

  const onPickImages = (files: FileList | null) => {
    if (!files) return;
    setImages((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    ]);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <SectionCard title="Device details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Brand" required error={errors.brand?.message} htmlFor="brand">
            <Input id="brand" className="h-11 rounded-xl" placeholder="Apple"
              {...register("brand", { required: "Brand is required" })} />
          </Field>
          <Field label="Model" required error={errors.model?.message} htmlFor="model">
            <Input id="model" className="h-11 rounded-xl" placeholder="iPhone 13"
              {...register("model", { required: "Model is required" })} />
          </Field>
          <Field label="IMEI" required error={errors.imei?.message} htmlFor="imei">
            <Input id="imei" className="h-11 rounded-xl font-mono" placeholder="15 digit IMEI"
              {...register("imei", {
                required: "IMEI is required",
                minLength: { value: 6, message: "IMEI looks too short" },
                maxLength: { value: 20, message: "IMEI looks too long" },
              })} />
          </Field>
          <Field label="Storage" htmlFor="storage">
            <Input id="storage" className="h-11 rounded-xl" placeholder="128GB" {...register("storage")} />
          </Field>
          <Field label="RAM" htmlFor="ram">
            <Input id="ram" className="h-11 rounded-xl" placeholder="6GB" {...register("ram")} />
          </Field>
          <Field label="Color" htmlFor="color">
            <Input id="color" className="h-11 rounded-xl" placeholder="Midnight" {...register("color")} />
          </Field>
          <Field label="Battery health (%)" error={errors.batteryHealth?.message} htmlFor="battery">
            <Input id="battery" type="number" className="h-11 rounded-xl" placeholder="92"
              {...register("batteryHealth", {
                min: { value: 0, message: "Must be 0–100" },
                max: { value: 100, message: "Must be 0–100" },
              })} />
          </Field>
          <Field label="Condition">
            <Select value={watch("condition")} onValueChange={(v) => setValue("condition", v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Pricing & parties">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Purchase price" required error={errors.purchasePrice?.message} htmlFor="purchase">
            <Input id="purchase" type="number" className="h-11 rounded-xl" placeholder="0"
              {...register("purchasePrice", { required: "Purchase price is required" })} />
          </Field>
          <Field label="Selling price" required error={errors.sellingPrice?.message} htmlFor="selling">
            <Input id="selling" type="number" className="h-11 rounded-xl" placeholder="0"
              {...register("sellingPrice", { required: "Selling price is required" })} />
          </Field>
          <Field label="Invoice number" htmlFor="invoiceNumber">
            <Input id="invoiceNumber" className="h-11 rounded-xl" {...register("invoiceNumber")} />
          </Field>
          <Field label="Seller">
            <Select value={watch("seller")} onValueChange={(v) => setValue("seller", v)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={sellers.loading ? "Loading…" : "Select seller"} />
              </SelectTrigger>
              <SelectContent>
                {(sellers.data ?? []).map((s) => (
                  <SelectItem key={idOf(s)} value={idOf(s)}>
                    {String(pick(s, ["name", "fullName"], "Unnamed"))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Customer">
            <Select value={watch("customer")} onValueChange={(v) => setValue("customer", v)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={customers.loading ? "Loading…" : "Select customer"} />
              </SelectTrigger>
              <SelectContent>
                {(customers.data ?? []).map((c) => (
                  <SelectItem key={idOf(c)} value={idOf(c)}>
                    {String(pick(c, ["name", "fullName"], "Unnamed"))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" rows={3} className="rounded-xl" placeholder="Anything worth remembering…" {...register("notes")} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title="Images" description="Attach photos of the device">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-10 text-center transition-colors hover:bg-accent/40">
          <PhotoIcon className="h-8 w-8 text-muted-foreground" />
          <span className="mt-2 text-sm font-medium">Click to upload images</span>
          <span className="text-xs text-muted-foreground">PNG or JPG, multiple allowed</span>
          <input type="file" accept="image/*" multiple className="sr-only"
            onChange={(e) => onPickImages(e.target.files)} />
        </label>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((image, index) => (
              <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                <button type="button" aria-label="Remove image"
                  onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-background/90 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate({ to: "/inventory" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-xl gradient-brand shadow-glow">
          {isSubmitting ? "Saving…" : phoneId ? "Save changes" : "Save phone"}
        </Button>
      </div>
    </form>
  );
}
