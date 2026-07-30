import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { PhoneFormView } from "@/components/phones/PhoneFormView";

export const Route = createFileRoute("/_authenticated/inventory/add")({
  head: () => ({
    meta: [
      { title: "Add Phone — PhoneShield Pro" },
      { name: "description", content: "Add a handset to inventory with specs, pricing and images." },
      { property: "og:title", content: "Add Phone — PhoneShield Pro" },
      { property: "og:description", content: "Register a new device in your stock." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Add Phone" description="Register a new handset into your inventory." />
      <PhoneFormView />
    </>
  ),
});
