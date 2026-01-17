"use client";

import Image from "next/image";
import * as Sentry from "@sentry/nextjs";
import DaimoIcon from "@/components/icons/daimo";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/icons/google";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle } from "lucide-react";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import posthog from "posthog-js";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedInput } from "@/components/animated-ui/animated-input";

const signUpSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignIn() {
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [isEmailView, setIsEmailView] = useState(false);

  return (
    <main className="grid place-content-center w-screen h-screen">
      <motion.div
        className="flex flex-col items-center gap-6 h-70"
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
      >
        <div className="flex items-center flex-col gap-8">
          <DaimoIcon className="size-12" />
        </div>
        <div className="relative w-70">
          <AnimatePresence initial={false}>
            {isEmailView ? (
              <EmailForm
                onBack={() => {
                  setIsEmailView(false);
                }}
              />
            ) : (
              <motion.div
                key="overview"
                className="grid gap-3 w-70 absolute left-0 top-0"
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 350,
                  duration: 0.0001,
                }}
              >
                <h2 className="mx-auto my-2 text-xl font-medium tracking-tight">
                  Iniciar sesion
                </h2>

                <Button
                  size="lg"
                  className="w-full rounded-xl h-12"
                  disabled={isSocialLoading}
                  onClick={async () => {
                    setIsSocialLoading(true);
                    posthog.capture("user_signed_in", {
                      signin_method: "google",
                    });
                    await authClient.signIn.social({
                      provider: "google",
                      callbackURL: "/",
                    });
                  }}
                >
                  <GoogleIcon />
                  Continuar con Google
                  {isSocialLoading && <Spinner />}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    setIsEmailView(true);
                  }}
                  className="w-full rounded-xl h-12"
                >
                  Continuar con email
                </Button>

                <FieldDescription className="my-2 mx-auto">
                  No tienes cuenta?{" "}
                  <span>
                    <Link
                      href="/sign-up"
                      className="text-foreground font-medium hover:underline no-underline"
                    >
                      Crea una
                    </Link>
                  </span>
                </FieldDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}

export const EmailForm = ({ onBack }: { onBack: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { error } = await authClient.signIn.email({
      ...data,
      callbackURL: "/",
    });

    if (error) {
      setError("root", {
        message:
          error.message ||
          "Hubo un error desconocido. Intente de nuevo mas tarde",
      });
      Sentry.captureException(error);
      posthog.capture("user_signin_failed", {
        error_message: error.message,
        signin_method: "email",
      });
      return;
    }

    // Identify user and capture signin event
    posthog.identify(data.email, {
      email: data.email,
    });
    posthog.capture("user_signed_in", {
      signin_method: "email",
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      key="email-form"
      className="grid gap-3 w-70 absolute left-0 top-0"
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 350,
        duration: 0.0001,
      }}
    >
      <h2 className="mx-auto my-2 text-xl font-medium tracking-tight">
        Iniciar sesion con email
      </h2>

      <div className="space-y-1">
        <Field>
          <AnimatedInput
            placeholder="Email"
            type="email"
            className="h-12"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <AnimatedInput
            placeholder="Clave"
            type="password"
            className="h-12"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </div>

      {errors.root && (
        <div className="bg-destructive/10 rounded-xl px-4 py-3 flex items-center gap-3 text-sm h-12">
          <AlertTriangle className="text-destructive size-4.5" />
          <span className="text-destructive">{errors.root?.message}</span>
        </div>
      )}

      <Button
        size="lg"
        variant="default"
        className="w-full rounded-xl h-12"
        type="submit"
        disabled={isSubmitting}
      >
        Continuar con email
        {isSubmitting && <Spinner />}
      </Button>
      <span
        className="font-medium hover:underline mx-auto text-sm my-2 cursor-pointer"
        onClick={() => {
          onBack();
        }}
      >
        Retroceder
      </span>
    </motion.form>
  );
};

function LegaceySignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const onSubmit = async (data: SignUpFormValues) => {
    const { error } = await authClient.signIn.email({
      ...data,
      callbackURL: "/",
    });

    if (error) {
      setError("root", {
        message:
          error.message ||
          "Hubo un error desconocido. Intente de nuevo mas tarde",
      });
      Sentry.captureException(error);
      posthog.capture("user_signin_failed", {
        error_message: error.message,
        signin_method: "email",
      });
      return;
    }

    // Identify user and capture signin event
    posthog.identify(data.email, {
      email: data.email,
    });
    posthog.capture("user_signed_in", {
      signin_method: "email",
    });
  };

  return (
    <main className="h-screen p-6 md:flex-row flex-col flex items-center dark:bg-secondary/50">
      <div className="rounded-3xl bg-secondary md:flex hidden w-[40vw] h-full text-center gap-6 relative items-center flex-col justify-center">
        <Image
          src="/bg-glass.webp"
          fill
          alt="bg-glass"
          className="object-cover absolute inset-0 rounded-3xl"
        />
        <DaimoIcon className="z-10 size-24 text-white" />
        <p className="z-10 tracking-tight font-medium text-6xl text-white">
          daimo
        </p>
      </div>
      <div className="md:hidden block">
        <DaimoIcon className="z-10 size-16 my-12 text-white" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto grid gap-12 max-w-md w-full"
      >
        <div className="text-center space-y-3">
          <h1 className="tracking-tight text-3xl font-semibold">
            Bienvenido de vuelta
          </h1>
        </div>

        <div className="space-y-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-full text-base shadow-none"
            type="button"
            onClick={async () => {
              setIsSocialLoading(true);
              posthog.capture("user_signed_in", {
                signin_method: "google",
              });
              await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });
            }}
          >
            {isSocialLoading ? (
              <Spinner className="size-[20px]" />
            ) : (
              <GoogleIcon />
            )}
            Continuar con google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">O</span>
            <Separator className="flex-1" />
          </div>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              placeholder="Ingresa tu email"
              type="email"
              className="h-9 rounded-2xl text-base md:text-base py-5 bg-secondary border-transparent"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel>Contraseña</FieldLabel>
            <Input
              placeholder="Ingresa tu contraseña"
              type="password"
              className="h-9 rounded-2xl text-base md:text-base py-5 bg-secondary border-secondary"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          {errors.root && (
            <div className="bg-destructive/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="text-destructive size-5" />
              <span className="text-destructive">{errors.root?.message}</span>
            </div>
          )}

          <Button
            variant="default"
            size="lg"
            disabled={isSubmitting}
            className="rounded-full w-full text-base shadow-none"
            type="submit"
          >
            {isSubmitting ? <Spinner /> : "Continuar"}
          </Button>
        </div>
      </form>
    </main>
  );
}
