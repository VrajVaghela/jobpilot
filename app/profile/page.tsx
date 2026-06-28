import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        <ProfileClient userEmail={user.email} />
      </main>
      <Footer />
    </>
  );
}
