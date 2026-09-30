import { getAdminSession } from "@/lib/session";
import { PatientsManager } from "@/components/admin/registries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getAdminSession();
  return <PatientsManager canWrite={session?.role !== "VIEWER"} />;
}
