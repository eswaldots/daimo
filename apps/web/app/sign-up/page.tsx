import Image from "next/image";
import DaimoIcon from "../../components/icons/daimo";
import { Button } from "@/components/ui/button";
import GoogleIcon from "../../components/icons/google";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export default function Page() {
  return (
    <main className="h-screen p-6 md:flex-row flex-col flex items-center">
      <div className="rounded-3xl bg-secondary md:flex hidden w-[40vw] h-full text-center gap-6 relative items-center flex-col justify-center">
        <Image
          src="/bg-glass.webp"
          fill
          alt="bg-glass"
          className="object-cover absolute inset-0 rounded-3xl"
        />
        <DaimoIcon className="z-10 size-24 text-primary-foreground" />
        <p className="z-10 tracking-tight font-medium text-6xl text-primary-foreground">
          daimo
        </p>
      </div>
      <div className="md:hidden block">
        <DaimoIcon className="z-10 size-12 my-12 text-foreground" />
      </div>

      <form className="mx-auto grid gap-12 max-w-md">
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
          >
            <GoogleIcon />
            Continuar con google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground">O</span>
            <Separator className="flex-1" />
          </div>

          <Input
            placeholder="Ingresa tu email"
            type="email"
            className="h-9 rounded-2xl text-base md:text-base py-5 bg-secondary border-secondary"
          />

          <Input
            placeholder="Ingresa tu contraseña"
            type="password"
            className="h-9 rounded-2xl text-base md:text-base py-5 bg-secondary border-secondary"
          />

          <Button
            variant="default"
            size="lg"
            className="rounded-full w-full text-base shadow-none"
          >
            Continuar
          </Button>
        </div>
      </form>
    </main>
  );
}
