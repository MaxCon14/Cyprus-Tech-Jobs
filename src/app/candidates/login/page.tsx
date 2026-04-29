import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function CandidateLoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;
  redirect(`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
}
