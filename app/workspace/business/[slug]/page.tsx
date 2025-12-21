import { notFound } from "next/navigation";
import { getAuthToken } from "@/app/utility/getAuthToken";
import BusinessDashboard from "@/app/pages/BusinessDashboard";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchBusinessBySlug(id: string, token: string) {
  console.log(" Fetching business for slug:", id);
  console.log(" Token exists:", !!token);

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/workspace/businesses/${id}`;
    console.log(" API URL:", apiUrl);

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 5,
      },
    });

    console.log(" Response status:", res.status, res.statusText);

    if (!res.ok) {
      console.error(" API Error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    console.log("✅ Business data received:", data);
    return data;
  } catch (error) {
    console.error("🔥 Fetch error:", error);
    return null;
  }
}

export default async function Page({ params }: PageProps) {
  console.log(" Dynamic route page loading...");

  try {
    const resolvedParams = await params;
    const slug = resolvedParams.id;

    const token = await getAuthToken();
    console.log(" Token retrieved:", !!token);

    if (!token) {
      console.warn(" No auth token found");
      notFound();
    }

    const business = await fetchBusinessBySlug(slug, token);
    console.log("📦 Business fetched:", !!business);

    if (!business) {
      console.warn(" Business not found for slug:", slug);
      notFound();
    }

    console.log(" Rendering BusinessDashboard...");
    return (
      <main className="max-w-7xl mx-auto p-4">
        <BusinessDashboard business={business} />
      </main>
    );
  } catch (error) {
    console.error("Page rendering error:", error);
    notFound();
  }
}
