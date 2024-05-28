"use client";

import AppFrame from "@/components/AppFrame/AppFrame";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import { LogoLockup } from "@/components/LogoLockup/LogoLockup";
import Textfield from "@/components/Textfield/Textfield";
import { useUserInfo } from "@/components/UserInfoProvider/UserInfoProvider";
import { useRouter } from "next/navigation";

import { useVideoUpload } from "@/components/VideoUploadProvider/VideoUploadProvider";
import BottomBanner from "@/components/Banner/BottomBanner";
import TermsAndCondition from "@/components/TermsAndCondition/TermsAndCondition";

import { AnimWrap } from "@/components/AnimWrap";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { useReCaptcha } from "next-recaptcha-v3";
import { zodResolver } from "@hookform/resolvers/zod";
import { RecaptchaResponse } from "./RecaptchaResponse";
import { useEffect } from "react";

const TERMS_HASH = "#terms-and-conditions";

const UserInfoSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, { message: "Name is required" }),
  email: z.string({ required_error: "Email is required" }).trim().email({
    message: "Invalid email address",
  }),
  terms: z.literal(true, {
    errorMap: () => ({ message: "Accepting is required" }),
  }),
  recaptcha: z.boolean().optional(),
});
type FormData = z.output<typeof UserInfoSchema>;

export default function UserInfoPage() {
  const {
    setEmail,
    email,
    setName,
    name,
    videoBlob,
    inputLanguage,
    outputLanguage,
  } = useUserInfo();
  const { upload } = useVideoUpload();
  const router = useRouter();

  const { executeRecaptcha } = useReCaptcha();

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      terms: undefined,
    },
    resolver: zodResolver(UserInfoSchema),
  });

  useEffect(() => setValue("email", email), [email, setValue]);
  useEffect(() => setValue("name", name), [name, setValue]);

  const handleFormValid = async (data: FormData) => {
    if (inputLanguage === "" || outputLanguage === "") {
      console.log(
        "Input or output language is empty, redirecting to language page",
      );
      router.push("/language");
      return;
    }
    if (!videoBlob) {
      console.log("Video not recorded, redirecting to record page");
      router.push("/record");
      return;
    }

    const token = await executeRecaptcha("form_submit");

    try {
      const response = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data: RecaptchaResponse = await response.json();
      console.log(data);

      if (!data.success) {
        throw data.message;
      }
    } catch (error) {
      console.warn(`Error verifying reCAPTCHA: ${error}`);
      setError("recaptcha", {
        message: "Error verifying reCAPTCHA, please refresh your browser.",
      });
    }

    router.push("/uploading");
    upload(videoBlob, {
      name: data.name,
      email: data.email,
      inputLanguage,
      outputLanguage,
    });
  };

  return (
    <AppFrame>
      <div className="mb-auto mt-8">
        <LogoLockup noWordmark />
      </div>

      <form
        onSubmit={handleSubmit(handleFormValid)}
        className="relative my-8 mb-auto flex flex-col items-center text-center"
      >
        <h1 className="font-serif-xl mb-4 text-center">
          Who&apos;s grandma&apos;s
          <br /> favourite? It&apos;s you!
        </h1>
        <div className="font-serif-sm max-w-[26ch]">
          Enter your information to ensure that the video makes it your way.
        </div>
        <div className="my-10 flex w-full max-w-[22rem] flex-col gap-2 px-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Textfield
                label={"Your full name"}
                placeholder={"First Last"}
                onChange={(v) => {
                  field.onChange(v);
                  setName(v);
                }}
                value={field.value}
                name={"name"}
                error={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Textfield
                label={"Personal email address"}
                placeholder={"example@gmail.com"}
                onChange={(v) => {
                  field.onChange(v);
                  setEmail(v);
                }}
                value={field.value}
                name={"email"}
                error={errors.email?.message}
              />
            )}
          />
          <Controller
            name="terms"
            control={control}
            render={({ field }) => (
              <Checkbox
                name={"terms"}
                className="mt-12 self-center"
                onChange={field.onChange}
                value={field.value}
                error={errors.terms?.message}
              >
                <span>
                  I accept the{" "}
                  <a href={`${TERMS_HASH}`} className="font-sans-sm font-bold">
                    Terms & Conditions
                  </a>
                </span>
              </Checkbox>
            )}
          />
        </div>

        <Button submit disabled={isSubmitting}>
          {"Submit"}
        </Button>
        {errors.recaptcha && (
          <p className="font-sans-sm py-4 text-red-900">
            {errors.recaptcha.message}
          </p>
        )}
      </form>
      {/* <AnimatePresence>
        {hash === TERMS_HASH && (
          <motion.div
            className="z-50"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div className="fixed inset-0 bg-dark bg-opacity-60" />
            <TermsAndCondition />
          </motion.div>
        )}
      </AnimatePresence> */}
      <BottomBanner>
        <span className="block max-w-[48ch] text-center">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="https://policies.google.com/privacy" className="font-bold">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://policies.google.com/terms" className="font-bold">
            Terms of Service
          </a>{" "}
          apply.
        </span>
      </BottomBanner>
    </AppFrame>
  );
}
