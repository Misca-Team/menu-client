"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
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
      className="
        w-full
        max-w-[419px]
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
        <p className="text-[20px] sm:text-[24.5px] text-brand font-extrabold">
          میسکا
        </p>
      </div>

      {/* Title */}
      <div className="flex items-center mt-6 sm:mt-8 gap-1 text-body text-[15px] sm:text-[20px]">
        <FaUserAstronaut className="me-2 font-bold" />
        <p className="font-bold">ورود به حساب کاربری</p>
      </div>

      {/* Username */}
      <div className="flex flex-col mt-5 sm:mt-6 gap-2">
        <label
          className="ps-1 text-[14px] sm:text-[15.04px] text-body"
          htmlFor="username"
        >
          نام کاربری
        </label>
        <Input
          {...register("username")}
          id="username"
          type="text"
          placeholder="شماره همراه یا ایمیل"
          className="
            bg-white
            h-9
            text-right
            sm:h-[33.03px]
            px-3
            text-[14px]
            sm:text-[15px]
            placeholder:text-[14px]
            sm:placeholder:text-[15px]
            placeholder:text-right
            border-none
            focus-visible:ring-1
            focus-visible:ring-brand
          "
          style={{ direction: "ltr" }}
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col mt-5 sm:mt-6 gap-2">
        <label
          className="ps-1 text-[14px] sm:text-[15.04px] text-body"
          htmlFor="password"
        >
          رمز عبور
        </label>
        <Input
          {...register("password")}
          id="password"
          type="password"
          className="
            bg-white
            h-9
            sm:h-[33.03px]
            px-3
            text-[14px]
            sm:text-[15px]
            text-right
            placeholder:text-right
            border-none
            focus-visible:ring-1
            focus-visible:ring-brand
          "
          style={{ direction: "ltr" }}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <div className="flex items-center mt-5 sm:mt-6 gap-2">
        <input
          {...register("rememberMe")}
          type="checkbox"
          className="w-4 h-4 rounded-md accent-brand"
          id="remember-me"
        />
        <label
          className="text-[14px] sm:text-[15.04px] text-body cursor-pointer"
          htmlFor="remember-me"
        >
          مرا به خاطر بسپار
        </label>
      </div>

      {/* Button */}
      <div className="flex items-center justify-end mt-6">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-[60.22px] h-[45.67px] bg-brand hover:bg-brand-600 text-white"
        >
          {loading ? <BeatLoader size={8} color="#ffffff" /> : "ورود"}
        </Button>
      </div>
    </form>
  );
}
