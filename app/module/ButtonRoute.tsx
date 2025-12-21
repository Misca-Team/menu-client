import Link from "next/link";
import { GoPlus } from "react-icons/go";

function ButtonRoute() {
  return (
    <section className="flex items-center justify-end mt-3 gap-5">
      <Link
        className="bg-red-400 p-3 rounded-md text-white"
        href={"/menu/buna_cafe"}
      >
        تست صفحه محصولات
      </Link>
      <Link
        href={"/workspace/business/create"}
        className="text-[15.4px] flex items-center p-3 text-white rounded-md bg-[#8F8DF4] w-fit"
      >
        <GoPlus color="white" />
        افزودن جدید
      </Link>
    </section>
  );
}

export default ButtonRoute;
