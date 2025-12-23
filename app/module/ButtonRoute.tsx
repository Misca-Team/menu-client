import Link from "next/link";
import { GoPlus } from "react-icons/go";

function ButtonRoute() {
  return (
    <section className="flex items-center justify-end mt-3 gap-5 p-3">
      <Link
        href={"/workspace/business/create"}
        className="text-[13px] flex items-center p-3 text-white rounded-md bg-[#8F8DF4] w-fit"
      >
        <GoPlus color="white" />
        کسب و کار جدید
      </Link>
    </section>
  );
}

export default ButtonRoute;
