"use client";

import {
  DialogContent,
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import * as Sentry from "@sentry/nextjs";
import { Input } from "@/components/ui/input";
import { AnimatedIcon } from "@/lib/animated-icons";
import { createElement, ReactNode, useState } from "react";
import { AnimatedIconsList } from "./animated-icon-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ICON_LIST } from "@/components/animated-icons";
import z from "zod";
import { TagInput } from "@/components/forms/tag-input";
import { useForm } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@daimo/backend";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const ICON_MAP = new Map(ICON_LIST.map((item) => [item.name, item.icon]));

const schema = z.object({
  name: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

export const OnboardingTagForm = ({ children }: { children: ReactNode }) => {
  const icons = ICON_LIST.map(({ name, keywords }) => ({
    name,
    keywords,
  }));
  const [animatedIcon, setAnimatedIcon] = useState<AnimatedIcon | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createOnboardingTag = useMutation(
    api.auth.onboarding.createOnboardingTag,
  );

  const {
    register,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>();
  console.log(errors);

  const onSubmit = async (data: FormValues) => {
    if (!animatedIcon) {
      toast.error("Debes seleccionar un icono");

      return;
    }

    try {
      await createOnboardingTag({
        name: data.name,
        tags: data.tags,
        icon: animatedIcon.name,
      });

      setIsModalOpen(false);

      toast.success("Tag creada correctamente");
    } catch (e) {
      Sentry.captureException(e);

      toast.error("Algo salio mal en la creación de la tag");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent showCloseButton={false} className="rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-medium">
              Agregar onboaring tag
            </DialogTitle>
            <DialogDescription className="tracking-normal">
              Un onboarding tag representa un posible gusto que podria tener un
              niño
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Icono y nombre</FieldLabel>
                <div className="flex items-center gap-2">
                  <Popover modal={true}>
                    <PopoverContent align="start" side="top">
                      <AnimatedIconsList
                        setAnimatedIcon={setAnimatedIcon}
                        icons={icons}
                      />
                    </PopoverContent>
                    <PopoverTrigger>
                      <Button
                        size="icon"
                        type="button"
                        variant="secondary"
                        className="rounded-full "
                      >
                        {createElement(ICON_MAP.get(animatedIcon?.name) ?? "D")}
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                  <Input
                    {...register("name")}
                    placeholder="Ingresa el nombre de la tag"
                    className="dark:bg-secondary"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel>Tags</FieldLabel>
                <TagInput setTags={(tags) => setValue("tags", tags)} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Spinner /> : "Crear tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <DialogTrigger asChild>{children}</DialogTrigger>
    </Dialog>
  );
};
