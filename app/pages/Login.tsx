"use client";

import Button from "../ui/Button";
import { LoginForm } from "../types/interfaces";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LoginMessages } from "../types/enums";
import { useRouter } from "next/navigation";
import { useLogin } from "../hooks/useLogin";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import { FaUserAstronaut } from "react-icons/fa"

function Login() {
  const { login, loading, error } = useLogin();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    const success = await login(data.username, data.password);
    if (success) {
      toast.success(LoginMessages.SUCCESS);
      router.replace("/workspace/business");
    } else {
      toast.error(error || LoginMessages.INVALID_CREDENTIALS);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          w-full
          max-w-104.75
          p-4
          sm:p-3.5
          rounded-lg
          bg-[#DDDDDD]
          shadow-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            width={40}
            height={40}
            src="/images/logo.png"
            alt="فرم ورود میسکا"
          />
          <p className="text-[20px] sm:text-[24.5px] text-brand font-extrabold ">
            میسکا
          </p>
        </div>

        {/* Title */}
        <div className="flex items-center mt-6 sm:mt-8 gap-1 text-body text-[15px] sm:text-[20px]">
          <FaUserAstronaut className="me-2 font-bold" />
          <p className="font-bold">
            ورود به حساب کاربری
          </p>
        </div>

        {/* Username */}
        <div className="flex flex-col mt-5 sm:mt-6 gap-2">
          <label className="ps-1 text-[14px] sm:text-[15.04px] text-body" htmlFor="username">
            نام کاربری
          </label>
          <input
            {...register("username", { required: "نام کاربری الزامی است" })}
            id="username"
            type="text"
            placeholder="شماره همراه یا ایمیل"
            className="
              bg-white
              h-9
              sm:h-[33.03px]
              px-3
              text-[14px]
              sm:text-[15px]
              placeholder:text-[14px]
              sm:placeholder:text-[15px]
              outline-none
              rounded-md
              text-left
              placeholder:text-right"
            style={{ direction: 'ltr' }}
          />
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col mt-5 sm:mt-6 gap-2">
          <label className="ps-1 text-[14px] sm:text-[15.04px] text-body" htmlFor="password">
            رمز عبور
          </label>
          <input
            {...register("password", { required: "رمز عبور الزامی است" })}
            id="password"
            type="password"
            className="
              bg-white
              h-9
              sm:h-[33.03px]
              px-3
              text-[14px]
              sm:text-[15px]
              outline-none
              rounded-md
              text-left
              placeholder:text-right"
            style={{ direction: 'ltr' }}
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center mt-5 sm:mt-6 gap-2">
          <input type="checkbox" className="w-4 h-4 rounded-md" id="remember-me" />
          <label className="text-[14px] sm:text-[15.04px] text-body" htmlFor="remember-me">
            مرا به خاطر بسپار
          </label>
        </div>

        {/* Button */}
        <div className="flex items-center justify-end mt-6">
          <Button
            disabled={loading}
            className="w-full sm:w-[60.22px] h-[45.67px]"
          >
            {loading ? <BeatLoader size={8} /> : "ورود"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Login;
