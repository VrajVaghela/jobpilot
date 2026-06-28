import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient({ cookies: cookieStore });
};
