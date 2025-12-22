"use client";
import { useEffect, useState } from "react";
import { getCategories } from "../services/request";

export default function CategoryPage() {
  const [data, setData] = useState<any>(null);

  console.log("first");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getCategories();
      console.log(res);
      setData(res);
    };
    fetchData();
  }, []);

  if (!data) return <div>در حال دریافت...</div>;

  return (
    <div>
      <h1>دسته‌بندی‌ها</h1>
      <ul>
        {data.items?.map((item: any) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
