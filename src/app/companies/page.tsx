export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {};

export default function CompaniesPage() {
  notFound();
}
