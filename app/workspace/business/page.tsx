import GetWorks from "@/app/components/GetWorks";
import { getAuthToken } from "@/app/utility/getAuthToken";
import Link from "next/link";

async function fetchBusinesses(token: string, page = 1, pageSize = 10) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/workspace/businesses?Page=${page}&PageSize=${pageSize}&Sort=name`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 5 },
    }
  );

  if (!res.ok) {
    throw new Error("خطا در دریافت کسب‌وکارها");
  }

  return res.json();
}

export async function generateStaticParams() {
  return Array.from({ length: 5 }, (_, i) => ({
    page: [(i + 1).toString()],
  }));
}

interface PageProps {
  searchParams?: Promise<{ page?: string }>;
}

async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = params?.page ? parseInt(params.page) : 1;

  const token = await getAuthToken();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">لطفا ابتدا وارد شوید.</p>
        <Link href={"/"}></Link>
      </div>
    );
  }

  const data = await fetchBusinesses(token, currentPage, 10);

  return (
    <main className="max-w-375 mx-auto p-4">
      <GetWorks initialData={data} currentPage={currentPage} token={token} />
    </main>
  );
}

export default Page;
