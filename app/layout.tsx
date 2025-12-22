import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
// css leafletjs
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
// import Layout from "./layout/Layout";

// font local-yekan bakh
const myFont = localFont({
  src: "./fonts/woff/YekanBakhFaNum-Regular.woff",
});

export const metadata: Metadata = {
  title: "ساخت منو آنلاین رایگان برای رستوران | طراحی و اشتراک سریع منو",
  description:
    "با ابزار رایگان ما می‌توانید منوی رستوران خود را آنلاین بسازید، طراحی کنید و به مشتریان خود نمایش دهید. مناسب برای رستوران‌ها، کافی‌شاپ‌ها و فست‌فودها.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={myFont.className}>
        {/* <Layout> */}
        {children}
        <Toaster position="top-left" />

        {/* </Layout> */}
      </body>
    </html>
  );
}
