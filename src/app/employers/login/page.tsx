import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ callbackUrl?: string; error?: string }> };

export default async function EmployerLoginPage({ searchParams }: Props) {
  const { callbackUrl, error } = await searchParams;
  const params = new URLSearchParams();
  if (callbackUrl) params.set("callbackUrl", callbackUrl);
  if (error)       params.set("error", error);
  const qs = params.toString();
  redirect(`/login${qs ? `?${qs}` : ""}`);
}
