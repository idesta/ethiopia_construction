import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TenantPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*, contacts(*)")
    .eq("slug", slug)
    .single();

  // Helpful during development — shows the actual error
  if (error) {
    return (
      <main style={{ padding: "2rem", fontFamily: "monospace" }}>
        <h2>Supabase error</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <p>
          Slug received: <strong>{slug}</strong>
        </p>
      </main>
    );
  }

  if (!tenant) return notFound();

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1 style={{ color: tenant.primary_color }}>{tenant.name}</h1>
      <p>{tenant.tagline}</p>
      <hr />
      <p>City: {tenant.contacts?.[0]?.city}</p>
      <p>Email: {tenant.contacts?.[0]?.email}</p>
      <p>Phone: {tenant.contacts?.[0]?.phone}</p>
      <p style={{ marginTop: "2rem", color: "#888", fontSize: "12px" }}>
        slug: <code>{slug}</code>
      </p>
    </main>
  );
}
