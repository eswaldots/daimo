"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as Sentry from "@sentry/nextjs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronLeft, PlusIcon, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api, Doc } from "@daimo/backend";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Voice } from "@/lib/voices";
import { SelectableVoiceItem } from "../layout/admin/voice-item";
import { ItemGroup } from "../ui/item";
import { cn } from "@/lib/utils";
import posthog from "posthog-js";
import { Switch } from "../ui/switch";

const characterSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  shortDescription: z
    .string()
    .min(10, {
      message: "La descripción corta debe tener al menos 10 caracteres",
    })
    .max(120, {
      message: "La descripción corta no puede tener mas de 120 caracteres",
    }),
  description: z
    .string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(800, {
      message: "La descripción no puede tener mas de 800 caracteres",
    }),
  prompt: z
    .string()
    .min(10, { message: "El prompt debe tener al menos 10 caracteres" }),
  firstMessagePrompt: z
    .string()
    .min(5, { message: "El saludo debe tener al menos 5 caracteres" }),
  ttsProvider: z.string().min(1, { message: "Seleccione un proveedor de voz" }),
});

type CharacterFormValues = z.infer<typeof characterSchema>;

/**
 * Render a form for creating or editing a character, including fields for name, descriptions, prompts, voice selection, and optional image upload.
 *
 * @param voices - List of available voices used to populate the voice/provider selector.
 * @param defaultValues - Existing character document (with optional `storageUrl`) when editing; omit to create a new character.
 * @returns The rendered React component containing the character creation/edit form.
 */
export default function CreateCharacterPage({
  voices,
  defaultValues,
}: {
  voices: Voice[];
  defaultValues?: Doc<"characters"> & { storageUrl?: string | null };
}) {
  const [image, setImage] = useState<File | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] || null);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CharacterFormValues>({
    resolver: zodResolver(characterSchema),
    defaultValues: defaultValues
      ? {
          ...defaultValues,
          ttsProvider: defaultValues.ttsProvider || "inworld",
        }
      : {
          ttsProvider: "inworld",
        },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [voice, setVoice] = useState<Voice | null>(
    defaultValues
      ? voices.find((v) => v.voiceId === defaultValues.voiceId) || null
      : null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremium, setIsPremium] = useState(
    defaultValues?.accessType === "premium",
  );
  const activeProvider = watch("ttsProvider");

  const router = useRouter();

  const create = useMutation(api.characters.create);
  const edit = useMutation(api.characters.editCharacter);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const providers = Array.from(new Set(voices.map((v) => v.source)));
  const providerDisplayNames: Record<string, string> = {
    inworld: "Inworld",
    gemini: "Google Gemini",
    cartesia: "Cartesia",
    deepgram: "Deepgram",
  };

  const filteredVoices = voices.filter(
    (v) =>
      v.source === activeProvider &&
      (v.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const onSubmit = async (data: CharacterFormValues) => {
    console.log("Form data:", data);
    const accessType = isPremium ? "premium" : "free";
    const voiceId = voice?.voiceId;

    if (!voiceId) {
      toast.error("Seleccione una voz");

      return;
    }

    const ttsProvider = voice?.source;

    if (!ttsProvider) {
      toast.error("Hubo un error obteniendo el provider de la voz");

      return;
    }

    if (image) {
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": image.type },
        body: image,
      });
      const { storageId } = await result.json();

      try {
        if (defaultValues) {
          await edit({
            ...data,
            voiceId,
            ttsProvider,
            storageId,
            characterId: defaultValues._id,
            accessType,
          });
          posthog.capture("character_edited", {
            character_name: data.name,
            tts_provider: ttsProvider,
            has_image: true,
          });
        } else {
          await create({
            storageId,
            ...data,
            voiceId,
            ttsProvider,
            accessType,
          });
          posthog.capture("character_created", {
            character_name: data.name,
            tts_provider: ttsProvider,
            has_image: true,
          });
        }

        toast.success(
          `Personaje ${defaultValues ? "editado" : "creado"} exitosamente`,
        );

        router.push("/admin/characters");

        return;
      } catch (error) {
        console.error(error);
        Sentry.captureException(error);
        toast.error("Failed to create character");

        return;
      }
    }

    try {
      if (defaultValues) {
        await edit({
          ...data,
          voiceId,
          accessType,
          ttsProvider,
          characterId: defaultValues._id,
        });
        posthog.capture("character_edited", {
          character_name: data.name,
          tts_provider: ttsProvider,
          has_image: false,
        });
      } else {
        await create({ ...data, voiceId, ttsProvider, accessType });
        posthog.capture("character_created", {
          character_name: data.name,
          tts_provider: ttsProvider,
          has_image: false,
        });
      }

      toast.success(
        `Personaje ${defaultValues ? "editado" : "creado"} exitosamente`,
      );

      router.push("/admin/characters");
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      toast.error("Failed to create character");
    }
  };

  const title = watch("name");

  return (
    <>
      <div className="absolute left-8 top-8 md:block hidden">
        <Button
          variant="ghost"
          size="icon"
          className="dark:hover:bg-border rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="size-5" />
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="max-w-2xl mx-auto gap-8 mt-8">
          <div className="w-full flex items-center gap-6">
            <div className="relative w-fit">
              <Avatar className="size-24 transition-colors cursor-pointer">
                <AvatarImage
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : defaultValues && (defaultValues.storageUrl ?? "")
                  }
                  className="object-cover object-center"
                ></AvatarImage>
                {!image && (
                  <AvatarFallback className="text-4xl dark:bg-border z-10">
                    {title?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                type="button"
                className="absolute bottom-0 right-0 z-40 rounded-full dark:bg-accent"
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  console.log("hi");
                  inputRef.current?.click();
                }}
              >
                <PlusIcon />
              </Button>

              <input
                className="w-full h-full opacity-0 cursor-pointer absolute inset-0"
                ref={inputRef}
                type="file"
                // Event handler to capture file selection and update the state
                onChange={handleImage}
              />
            </div>
            <h1 className="tracking-tight text-4xl font-medium">{title}</h1>
          </div>

          <Field>
            <FieldLabel className="text-foreground">Nombre</FieldLabel>
            <Input
              placeholder="eg: John Doe"
              className="rounded-lg bg-secondary dark:bg-border border-border/20 hover:bg-input transition-colors"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field>
            <FieldLabel className="text-foreground">
              Descripción corta
            </FieldLabel>
            <Textarea
              placeholder="Agrega una corta descripción del personaje, esta se usara en la presentación del mismo"
              className="rounded-lg bg-secondary dark:bg-border border-border/20 hover:bg-input transition-colors resize-none h-27"
              {...register("shortDescription")}
              aria-invalid={!!errors.shortDescription}
            />
            <FieldError errors={[errors.shortDescription]} />
          </Field>

          <Field>
            <FieldLabel className="text-foreground">Descripción</FieldLabel>
            <Textarea
              placeholder="Agrega una descripción del personaje"
              className="rounded-lg bg-secondary dark:bg-border border-border/20 hover:bg-input transition-colors resize-none h-27"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Field>
            <FieldLabel className="text-foreground">Prompt</FieldLabel>
            <Textarea
              placeholder="Escribe un prompt para el personaje"
              className="rounded-lg bg-secondary dark:bg-border border-border/20 hover:bg-input transition-colors resize-none h-27"
              {...register("prompt")}
              aria-invalid={!!errors.prompt}
            />
            <FieldError errors={[errors.prompt]} />
          </Field>

          <Field>
            <FieldLabel className="text-foreground">Saludo</FieldLabel>
            <Textarea
              placeholder="Escribe un saludo para el personaje, funcionara como un mensaje de bienvenida"
              className="rounded-lg bg-secondary dark:bg-border border-border/20 hover:bg-input transition-colors resize-none h-27"
              {...register("firstMessagePrompt")}
              aria-invalid={!!errors.firstMessagePrompt}
            />
            <FieldError errors={[errors.firstMessagePrompt]} />
          </Field>

          <Field>
            <FieldLabel className="text-foreground">Voz</FieldLabel>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent showCloseButton={false} className="transition-all">
                <DialogTitle>Voces</DialogTitle>
                <div className="my-2 space-y-4">
                  {providers.length > 1 && (
                    <div className="flex gap-2">
                      {providers.map((provider) => (
                        <Button
                          key={provider}
                          type="button"
                          variant={
                            activeProvider === provider ? "default" : "ghost"
                          }
                          size="sm"
                          className={cn(
                            activeProvider !== provider
                              ? "border-foreground/10"
                              : "border-primary",
                            "rounded-full border",
                          )}
                          onClick={() => {
                            setValue("ttsProvider", provider);
                            setVoice(null);
                          }}
                        >
                          {providerDisplayNames[provider] || provider}
                        </Button>
                      ))}
                    </div>
                  )}
                  <InputGroup className="border-0 shadow-none bg-transparent">
                    <InputGroupAddon align="inline-start">
                      <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Busca una voz"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>

                  <ItemGroup className="max-h-[40vh] overflow-y-scroll gap-2">
                    {filteredVoices.map((voice) => (
                      <div
                        key={voice.voiceId}
                        onClick={() => {
                          setVoice(voice);
                          setValue("ttsProvider", voice.source);
                          setIsOpen(false);
                        }}
                      >
                        <SelectableVoiceItem {...voice} />
                      </div>
                    ))}
                  </ItemGroup>
                </div>
              </DialogContent>
              <DialogTrigger>
                <InputGroup className="rounded-lg bg-secondary dark:bg-border border-border/20  hover:bg-input transition-colors cursor-default">
                  {voice?.source && (
                    <InputGroupAddon align="inline-start">
                      <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {providerDisplayNames[voice.source] || voice.source}
                      </span>
                    </InputGroupAddon>
                  )}
                  <InputGroupInput
                    placeholder="Seleccione una voz"
                    readOnly
                    value={voice?.displayName}
                    className="cursor-default"
                  />
                  <InputGroupAddon align="inline-end">
                    <ChevronDown className="size-4" />
                  </InputGroupAddon>
                </InputGroup>
              </DialogTrigger>
            </Dialog>
          </Field>

          <div className="flex my-6 justify-between items-center">
            <section className="space-y-1">
              <h1 className="text-sm font-medium">Premium</h1>
              <p className="text-sm text-muted-foreground md:max-w-xs max-w-64">
                Al activar esta opción solo los usuarios Premium podran usar el
                personaje
              </p>
            </section>

            <Switch
              className="scale-125"
              onCheckedChange={setIsPremium}
              checked={isPremium}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            className="rounded-full w-fit ml-auto shadow-none mt-8"
          >
            {isSubmitting && <Spinner />}{" "}
            {defaultValues ? "Guardar cambios" : "Crear personaje"}
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}
