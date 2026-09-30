import { getAdminSession } from "@/lib/session";
import { CustomersManager } from "@/components/admin/registries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getAdminSession();
  return <CustomersManager canWrite={session?.role !== "VIEWER"} />;
}
