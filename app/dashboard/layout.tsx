import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
