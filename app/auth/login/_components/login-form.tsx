"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaUserAstronaut } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginMessages } from "@/app/types/enums";
import { useLogin } from "@/app/hooks/useLogin";
import { loginSchema, LoginFormValues } from "../schema";

export function LoginForm() {
  const router = useRouter();
  const { login, loading, error: loginError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login({
      username: data.username,
      password: data.password,
    });

    if (success) {
      toast.success(LoginMessages.SUCCESS);
      router.replace("/workspace/business");
    } else {
      toast.error(loginError || LoginMessages.INVALID_CREDENTIALS);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md p-6 rounded-lg bg-brand-50 shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          width={40}
          height={40}
          src="/images/logo.png"
          alt="فرم ورود میسکا"
        />
        <p className="text-2xl text-brand font-extrabold">میسکا</p>
      </div>

      {/* Title */}
      <div className="flex items-center mt-8 gap-2 text-gray-800 text-lg">
        <FaUserAstronaut className="font-bold" />
        <p className="font-bold">ورود به حساب کاربری</p>
      </div>

      {/* Username */}
      <div className="flex flex-col mt-6 gap-2">
        <label className="text-sm text-gray-700" htmlFor="username">
          نام کاربری
        </label>
        <Input
          {...register("username")}
          id="username"
          type="text"
          placeholder="شماره همراه یا ایمیل"
          className="bg-white text-left placeholder:text-right"
          dir="ltr"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col mt-4 gap-2">
        <label className="text-sm text-gray-700" htmlFor="password">
          رمز عبور
        </label>
        <Input
          placeholder="********"
          {...register("password")}
          id="password"
          type="password"
          className="bg-white text-left placeholder:text-right"
          dir="ltr"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center mt-4 gap-2">
        <input
          {...register("rememberMe")}
          type="checkbox"
          className="w-4 h-4 rounded-md accent-brand"
          id="remember-me"
        />
        <label
          className="text-sm text-gray-700 cursor-pointer"
          htmlFor="remember-me"
        >
          مرا به خاطر بسپار
        </label>
      </div>

      {/* Button */}
      <div className="mt-8">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-600 text-white h-11"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "ورود"
          )}
        </Button>
      </div>
    </form>
  );
}
