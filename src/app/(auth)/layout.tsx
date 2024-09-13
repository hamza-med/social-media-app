import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  //*Validate if we are logged In if so we redirect to home page and it applies to login and signUp page at once
  const { user } = await validateRequest();

  if (user) redirect("/");

  return <>{children}</>;
}
