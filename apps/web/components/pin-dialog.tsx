import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { ComponentProps, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Field, FieldDescription } from "./ui/field";
import { AnimatePresence, motion } from "motion/react";
import { useAction } from "convex/react";
import { api } from "@daimo/backend";

export const PinDialog = ({
  onSuccess,
  children,
  ...props
}: ComponentProps<typeof Dialog> & { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState("");
  const verifyPin = useAction(api.parental.security.verify);
  const [error, setError] = useState<null | string>(null);
  const [isSucess, setIsSuccess] = useState(false);

  const verify = async () => {
    setIsLoading(true);
    try {
      const tokenId = await verifyPin({ pin: value });

      sessionStorage.setItem("parentalToken", tokenId);

      setIsSuccess(true);
      onSuccess();
    } catch {
      setError("El PIN no es correcto");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSucess) {
      if (value.length >= 4) {
        verify();
      } else if (value.length === 0) {
        setError(null);
      }
    }
  }, [value]);

  return (
    <Dialog {...props}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent
        className={cn(
          "p-6 md:p-8",
          isLoading && "pointer-events-none cursor-not-allowed",
        )}
      >
        <DialogHeader
          className={cn(isLoading && "opacity-50", "transition-opacity")}
        >
          <DialogTitle className="text-xl tracking-tight font-medium">
            Ingresa el PIN parental
          </DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            "my-4 mx-auto transition-opacity",
            isLoading && "opacity-50 pointer-events-none cursor-default",
          )}
        >
          <Field className="items-center gap-3">
            <InputOTP
              containerClassName="flex flex-col items-center"
              maxLength={4}
              value={value
                .split("")
                .map(() => "●")
                .join("")}
              onChange={(e) => {
                setValue(e);
              }}
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
            </InputOTP>
            <FieldDescription
              className={cn(
                "text-center transition-colors delay-300",
                error && "text-destructive",
              )}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={error ?? ""}
                  initial={{ opacity: 0 }}
                  transition={{ stiffness: 200, duration: 0.3 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error ? error : "Ingresa tu PIN parental"}
                </motion.span>
              </AnimatePresence>
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter
          className={cn(
            "opacity-0 duration-300 transition-opacity -my-3",
            isLoading && "opacity-50 pointer-events-none",
          )}
        ></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
