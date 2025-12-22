"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BusinessesResponse } from "../types/interfaces";

interface GetWorksProps {
  initialData: BusinessesResponse;
  currentPage: number;
  token?: string;
}

export default function GetWorks({ initialData, currentPage }: GetWorksProps) {
  const router = useRouter();

  // محاسبه تعداد صفحات از داده‌های دریافتی
  const totalPages = initialData.totalPages;
  const totalCount = initialData.totalCount;

  const refreshPage = () => {
    router.refresh();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // فرمت تاریخ
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("fa-IR");
  };

  return (
    <div className="space-y-6">
      {/* اطلاعات صفحه */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">کسب‌وکارها</h2>
            <p className="text-gray-600 text-sm mt-1">
              نمایش {initialData.items.length} از {totalCount} کسب‌وکار
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded border">
              <span className="text-sm font-medium text-gray-700">
                صفحه {currentPage} از {totalPages}
              </span>
            </div>
            <button
              onClick={refreshPage}
              className="px-4 py-1.5 text-sm bg-white text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              بروزرسانی
            </button>
          </div>
        </div>
      </div>

      {/* لیست کسب‌وکارها */}
      {initialData.items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">هیچ کسب‌وکاری یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialData.items.map((business) => (
            <div
              key={business.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {business.logoUrl ? (
                  <div className="shrink-0">
                    <img
                      src={business.logoUrl}
                      alt={`لوگوی ${business.name}`}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                  </div>
                ) : (
                  <div className="shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border">
                    <span className="text-2xl text-gray-400">
                      {business.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {business.name}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {business.slug}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>تاریخ ایجاد: {formatDate(business.createdOn)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>مالیات: {business.vatPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    ID: {business.id.substring(0, 8)}...
                  </span>
                  <Link
                    href={`/businesspanel/${business.slug}/category`}
                    className="text-sm text-white  bg-[#8F8DF4] cursor-pointer p-2 rounded-sm  transition-colors"
                  >
                    مدیریت
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span>
                صفحه {currentPage} از {totalPages}
              </span>
              <span className="mr-4"> | </span>
              <span>مجموع: {totalCount} کسب‌وکار</span>
            </div>

            <div className="flex items-center gap-2">
              {/* دکمه صفحه اول */}
              {currentPage > 1 && (
                <Link
                  href="/workspace/business?page=1"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  onClick={refreshPage}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                  اول
                </Link>
              )}

              {/* دکمه صفحه قبلی */}
              {currentPage > 1 && (
                <Link
                  href={`/workspace/business?page=${currentPage - 1}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  onClick={refreshPage}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  قبلی
                </Link>
              )}

              {/* شماره صفحات */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/workspace/business?page=${pageNum}`}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={refreshPage}
                  >
                    {pageNum}
                  </Link>
                ))}
              </div>

              {/* دکمه صفحه بعدی */}
              {currentPage < totalPages && (
                <Link
                  href={`/workspace/business?page=${currentPage + 1}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  onClick={refreshPage}
                >
                  بعدی
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}

              {/* دکمه صفحه آخر */}
              {currentPage < totalPages && (
                <Link
                  href={`/workspace/business?page=${totalPages}`}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                  onClick={refreshPage}
                >
                  آخر
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
