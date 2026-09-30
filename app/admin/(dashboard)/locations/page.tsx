import { getAdminSession } from "@/lib/session";
import { LocationsManager } from "@/components/admin/registries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getAdminSession();
  return <LocationsManager canWrite={session?.role !== "VIEWER"} />;
}
