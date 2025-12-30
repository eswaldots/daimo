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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";
import posthog from "posthog-js";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
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
    const { error } = await authClient.signUp.email({
      ...data,
      callbackURL: "/",
    });

    if (error) {
      Sentry.captureException(error);

      setError("root", {
        message:
          error.message ||
          "Hubo un error desconocido. Intente de nuevo mas tarde",
      });
      posthog.capture("user_signup_failed", {
        error_message: error.message,
        signup_method: "email",
      });
      return;
    }

    // Identify user and capture signup event
    posthog.identify(data.email, {
      email: data.email,
      name: data.name,
    });
    posthog.capture("user_signed_up", {
      signup_method: "email",
    });

    router.push("/");
  };

  return (
    <main className="h-screen p-6 md:flex-row flex-col flex items-center">
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
        <DaimoIcon className="z-10 size-16 my-12 text-foreground" />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto grid gap-12 max-w-md"
      >
        <div className="text-center space-y-3">
          <h1 className="tracking-tight text-3xl font-semibold">
            Crea tu cuenta
          </h1>
          <p className="text-base text-muted-foreground leading-[1.2]">
            Ingresa tus detalles abajo para acceder a IA por voz ilimitada por
            un periodo gratuito
          </p>
        </div>

        <div className="space-y-6">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-full text-base shadow-none"
            type="button"
            onClick={async () => {
              setIsSocialLoading(true);
              posthog.capture("user_signed_up", {
                signup_method: "google",
              });
              const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              });

              if (error) {
                Sentry.captureException(error);

                setIsSocialLoading(false);

                setError("root", {
                  message:
                    error.message ||
                    "Hubo un error desconocido. Intente de nuevo mas tarde",
                });
              }
            }}
          >
            {isSocialLoading ? <Spinner className="size-4" /> : <GoogleIcon />}
            Continuar con google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground">O</span>
            <Separator className="flex-1" />
          </div>

          <Field>
            <FieldLabel>Nombre completo</FieldLabel>
            <Input
              placeholder="Ingresa tu nombre completo"
              type="text"
              className="h-9 rounded-xl text-base md:text-base py-5 bg-secondary border-secondary"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              placeholder="Ingresa tu email"
              type="email"
              className="h-9 rounded-xl text-base md:text-base py-5 bg-secondary border-secondary"
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
              className="h-9 rounded-xl text-base md:text-base py-5 bg-secondary border-secondary"
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
