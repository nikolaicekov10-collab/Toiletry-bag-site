import { notFound } from "next/navigation";
import { slugs, type PolicySlug } from "../content";
import { LegalDocument } from "../legal-document";

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugs.includes(slug as PolicySlug)) notFound();
  return <LegalDocument slug={slug as PolicySlug} />;
}
