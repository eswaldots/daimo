"use client";

import { ReactNode, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createCustomVoice } from "@/lib/voices";
import { Spinner } from "@/components/ui/spinner";
import AudioTrimmer from "./audio-trimmer";
import posthog from "posthog-js";

interface CreateVoiceFormProps {
  children: ReactNode;
  supportedProviders: string[];
}

/**
 * Renders a dialog form to create a custom voice with provider selection, metadata fields, audio upload, optional trimming, and submission handling.
 *
 * @param children - Trigger element rendered as the dialog opener.
 * @param supportedProviders - Array of voice provider identifiers used to populate the provider selector and determine the default provider.
 * @returns A React element that renders the dialog-based create-voice form UI.
 */
export default function CreateVoiceForm({
  children,
  supportedProviders,
}: CreateVoiceFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [provider, setProvider] = useState<string>(
    supportedProviders[0] || "inworld",
  );
  const [name, setName] = useState<string>("Custom Voice");
  const [description, setDescription] = useState<string>("");
  const [language, setLanguage] = useState<string>("en-US");
  const hasProviders = supportedProviders.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasProviders) {
      toast.error("No hay proveedores de voz configurados");
      return;
    }
    if (!file) {
      toast.error("Por favor, selecciona un archivo de audio");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("provider", provider);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("language", language);
        formData.append("audio", file);

        await createCustomVoice(formData);
        posthog.capture("voice_created", {
          voice_name: name,
          voice_provider: provider,
          language: language,
          has_description: description.length > 0,
        });
        toast.success("Voz creada exitosamente");
        setOpen(false);
        // Reset form
        setFile(null);
        setOriginalFile(null);
        setIsTrimming(false);
        setProvider(supportedProviders[0] || "inworld");
        setName("Custom Voice");
        setDescription("");
        setLanguage("en-US");
      } catch (error) {
        console.error(error);
        posthog.captureException(error);
        toast.error(
          error instanceof Error ? error.message : "Error al crear la voz",
        );
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setOriginalFile(selectedFile);
      setIsTrimming(true);
    }
  };

  const handleTrim = (trimmedFile: File) => {
    setFile(trimmedFile);
    setIsTrimming(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-medium text-xl">Crear voz</DialogTitle>
        </DialogHeader>

        {isTrimming && originalFile ? (
          <AudioTrimmer
            file={originalFile}
            onTrim={handleTrim}
            onCancel={() => setIsTrimming(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {hasProviders ? (
              <>
                {/* Provider Selection */}
                <div className="space-y-2">
                  <Label htmlFor="provider">Proveedor de voz</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedProviders.map((providerId) => (
                        <SelectItem key={providerId} value={providerId}>
                          {providerId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la voz</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Custom Voice"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción de la voz"
                    rows={2}
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <Label htmlFor="language">Código de idioma</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="en-US"
                  />
                  <p className="text-xs text-muted-foreground">
                    Código de idioma según el proveedor (ej. en-US, es-ES, etc.)
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Archivo de audio</Label>
                  <div className="w-full py-8 bg-secondary transition-colors hover:bg-border rounded-lg cursor-pointer relative">
                    <input
                      className="opacity-0 absolute inset-0 cursor-pointer"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center text-center justify-center">
                      <EmptyMedia variant="icon" className="bg-transparent">
                        <AudioLines />
                      </EmptyMedia>
                      <div>
                        <EmptyTitle className="text-lg">
                          {file ? file.name : "Sube un audio"}
                        </EmptyTitle>
                        <EmptyDescription className="text-sm">
                          {file
                            ? "Archivo seleccionado (haz clic para cambiar)"
                            : "Arrastra o selecciona un archivo"}
                        </EmptyDescription>
                      </div>
                    </div>
                  </div>
                  {file && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => setIsTrimming(true)}
                    >
                      Volver a recortar
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Asegúrate de que los audios tengan una calidad aceptable.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Spinner className="mr-2" />}
                    Crear voz
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No hay proveedores de voz configurados para crear voces
                  personalizadas.
                </p>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}