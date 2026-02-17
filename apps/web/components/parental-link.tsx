import { ComponentProps, ReactNode, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useHasPin } from "@/hooks/use-has-pin";
import { LockIcon } from "./animated-icons/lock";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { Field, FieldDescription } from "./ui/field";
import { AnimatePresence, motion } from "motion/react";
import { useAction } from "convex/react";
import { api } from "@daimo/backend";
import { cn } from "@/lib/utils";
import { CircleCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { PinDialog } from "./pin-dialog";

export const ParentalLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenSuccess, setIsOpenSuccess] = useState(false);
  const [isOpenPin, setIsOpenPin] = useState(false);
  const router = useRouter();

  const { data: hasPin } = useHasPin();

  const handleClick = () => {
    if (!hasPin) {
      setIsOpen(true);

      return;
    }

    setIsOpenPin(true);
  };

  return (
    <>
      <div onClick={handleClick}>{children}</div>
      <PinDialog
        open={isOpenPin}
        onOpenChange={setIsOpenPin}
        onSuccess={() => {
          router.push(href ?? "");
        }}
      />

      <CreatePin
        open={isOpenCreate}
        onOpenChange={setIsOpenCreate}
        onSuccess={() => {
          setIsOpenCreate(false);

          setTimeout(() => {
            setIsOpenSuccess(true);

            setTimeout(() => {
              setIsOpenSuccess(false);

              router.push(href ?? "");
            }, 4000);
          }, 100);
        }}
      />

      <Dialog open={isOpenSuccess} onOpenChange={setIsOpenSuccess}>
        <DialogContent>
          <DialogHeader>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <CircleCheckIcon className="size-28 text-chart-2 mx-auto" />
            </motion.div>
          </DialogHeader>
          <div className="flex flex-col items-center gap-1">
            <DialogTitle className="text-2xl tracking-tight">
              PIN creado
            </DialogTitle>
            <DialogDescription className="text-base tracking-wide max-w-xs text-center">
              Puedes usar este PIN para realizar acciones seguras
            </DialogDescription>

            <DialogFooter className="mt-6 w-full flex flex-col md:flex-col gap-4 items-center">
              <Button className="md:w-full text-base flex-1 h-12">
                Continuar
              </Button>
              <span className="text-muted-foreground text-sm">
                Cerrando en 4 segundos
              </span>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="md:p-8 p-4">
          <DialogHeader>
            <LockIcon className="[&_svg]:w-24 mx-auto [&_svg]:h-24 text-chart-3" />
          </DialogHeader>

          <div className="my-2 flex flex-col items-center text-center space-y-2">
            <DialogTitle className="mx-auto text-2xl tracking-tight font-medium">
              Configura un PIN parental
            </DialogTitle>
            <DialogDescription>
              Por seguridad, para realizar algunas acciones, necesitamos que
              uses un PIN parental para evitar malentendidos y maluso de la
              aplicación.
            </DialogDescription>
          </div>
          <DialogFooter className="flex flex-col md:flex-col gap-2 items-center w-full my-2 h-fit h-24">
            <Button
              size="lg"
              className="flex-1 h-12 w-full"
              onClick={() => {
                setIsOpen(false);

                setTimeout(() => {
                  setIsOpenCreate(true);
                }, 100);
              }}
            >
              Continuar
            </Button>
            <DialogClose asChild>
              <Button
                size="lg"
                variant="link"
                className="flex-1 w-full text-muted-foreground cursor-pointer"
              >
                Más tarde
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const CreatePin = (
  props: ComponentProps<typeof Dialog> & { onSuccess: () => void },
) => {
  const [value, setValue] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createPin = useAction(api.parental.security.createPin);

  useEffect(() => {
    if (value.length >= 4) {
      setIsConfirming(true);
    }
  }, [value]);

  const handleCreatePin = async () => {
    await createPin({ pin: confirmValue });

    setIsLoading(false);

    props.onSuccess();
  };

  useEffect(() => {
    if (confirmValue.length >= 4) {
      if (confirmValue != value) {
        setError("Los PINES no coinciden");
      } else {
        setIsLoading(true);

        handleCreatePin();
      }
    }
  }, [confirmValue]);

  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          "p-6 md:p-8",
          isLoading && "pointer-events-none cursor-not-allowed",
        )}
      >
        <DialogHeader className={cn(isLoading && "opacity-50")}>
          <AnimatePresence mode="wait">
            <motion.span
              key={String(isConfirming)}
              initial={{ opacity: 0 }}
              transition={{ stiffness: 200, duration: 0.3 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogTitle className="text-xl tracking-tight font-medium">
                {isConfirming
                  ? "Confirma tu PIN parental"
                  : "Crea tu PIN parental"}
              </DialogTitle>
            </motion.span>
          </AnimatePresence>
        </DialogHeader>
        <div
          className={cn(
            "my-4 mx-auto",
            isLoading && "opacity-50 pointer-events-none cursor-default",
          )}
        >
          <Field className="items-center gap-3">
            <InputOTP
              containerClassName="flex flex-col items-center"
              maxLength={4}
              value={
                isConfirming
                  ? confirmValue
                      .split("")
                      .map(() => "●")
                      .join("")
                  : value
                      .split("")
                      .map(() => "●")
                      .join("")
              }
              onChange={(e) => {
                if (isConfirming) {
                  setConfirmValue(e);
                } else {
                  setValue(e);
                }
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={String(isConfirming)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ stiffness: 200, duration: 0.3 }}
                >
                  <InputOTPGroup
                    data-invalid={!!error}
                    aria-invalid={!!error}
                    className={cn(isLoading && "cursor-not-allowed")}
                  >
                    <InputOTPSlot
                      data-invalid={!!error}
                      aria-invalid={!!error}
                      index={0}
                      className={cn("size-14 text-xl")}
                    />
                    <InputOTPSlot
                      data-invalid={!!error}
                      aria-invalid={!!error}
                      index={1}
                      className="size-14 text-xl"
                    />
                    <InputOTPSlot
                      data-invalid={!!error}
                      aria-invalid={!!error}
                      index={2}
                      className="size-14 text-xl"
                    />
                    <InputOTPSlot
                      data-invalid={!!error}
                      aria-invalid={!!error}
                      index={3}
                      className="size-14 text-xl"
                    />
                  </InputOTPGroup>
                </motion.div>
              </AnimatePresence>
            </InputOTP>
            <FieldDescription
              className={cn(
                "text-center transition-colors delay-300",
                error && "text-destructive",
              )}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${String(isConfirming)}-${error ?? ""}`}
                  initial={{ opacity: 0 }}
                  transition={{ stiffness: 200, duration: 0.3 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error
                    ? error
                    : isConfirming
                      ? "Ingresa de nuevo tu PIN parental"
                      : "Asegúrate de usar un PIN que recuerdes fácilmente"}
                </motion.span>
              </AnimatePresence>
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter
          className={cn(
            "opacity-0 duration-300 transition-opacity -my-3",
            isConfirming && "opacity-100",
            isLoading && "opacity-50 pointer-events-none",
          )}
        >
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="md:h-fit"
              onClick={(e) => {
                if (isConfirming) {
                  e.preventDefault();
                  e.stopPropagation();

                  setIsConfirming(false);
                  setError(null);
                  setConfirmValue("");
                  setValue("");
                }
              }}
            >
              {isConfirming ? "Atrás" : "Cancelar"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
