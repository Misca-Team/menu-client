import Link from "next/link";

function HomePage() {
  return (
    <div className="w-full flex justify-between px-2 py-3">
      <Link href="/b/buna_cafe/menu"
      className="text-sm text-white bg-brand-500 hover:bg-brand-600 cursor-pointer p-2 rounded-sm  transition-colors"
      >منوی کافه بونا</Link>
      <Link href="/auth/login"
      className="text-sm text-white bg-brand-500 hover:bg-brand-600 cursor-pointer p-2 rounded-sm  transition-colors">ورود</Link>
    </div>
  );
}

export default HomePage;