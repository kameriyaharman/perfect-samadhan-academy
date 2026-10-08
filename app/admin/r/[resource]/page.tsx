import { notFound } from "next/navigation";
import { getResource } from "@/lib/resources";
import ResourceManager from "@/components/admin/ResourceManager";

export default function ResourcePage({ params, searchParams }: { params: { resource: string }; searchParams: Record<string, string> }) {
  const r = getResource(params.resource);
  if (!r) notFound();
  return <ResourceManager resource={r} initialFilter={searchParams} />;
}
