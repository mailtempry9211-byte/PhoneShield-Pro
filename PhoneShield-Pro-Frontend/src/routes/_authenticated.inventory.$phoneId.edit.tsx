import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { PhoneFormView } from "@/components/phones/PhoneFormView";
import { useResource } from "@/hooks/useResource";
import { phonesService } from "@/services/resources";
import { ErrorState } from "@/components/common/States";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/inventory/$phoneId/edit")({
  head: () => ({
    meta: [
      { title: "Edit Phone — PhoneShield Pro" },
      { name: "description", content: "Update specifications, pricing and status for this handset." },
      { property: "og:title", content: "Edit Phone — PhoneShield Pro" },
      { property: "og:description", content: "Keep device records accurate." },
    ],
  }),
  component: EditPhonePage,
});

function EditPhonePage() {
  const { phoneId } = Route.useParams();
  const { data, loading, error, refetch } = useResource(() => phonesService.get(phoneId), [phoneId]);

  return (
    <>
      <PageHeader title="Edit Phone" description="Update this device's record." />
      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <PhoneFormView initial={data} phoneId={phoneId} />
      )}
    </>
  );
}
