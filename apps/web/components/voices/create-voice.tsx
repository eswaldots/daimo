"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { AlertTriangleIcon, AudioLines } from "lucide-react";
import { useState } from "react";

export default function CreateVoiceForm({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<File | null>(null);
  const [dialog1, setDialog1] = useState(false);
  const [dialog2, setDialog2] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-medium text-xl">Crear voz</DialogTitle>
        </DialogHeader>

        <div className="my-2">
          <div className="w-full py-12 bg-secondary transition-colors hover:bg-border rounded-lg  cursor-pointer relative">
            <input
              className="opacity-0 absolute inset-0"
              type="file"
              name="myImage"
              // Event handler to capture file selection and update the state
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
            />
            <div className="flex flex-col items-center text-center justify-center">
              <EmptyMedia variant="icon" className="bg-transparent">
                <AudioLines />
              </EmptyMedia>
              <div>
                <EmptyTitle className="text-lg">Sube un audio</EmptyTitle>
                <EmptyDescription className="text-sm">
                  Arrastra o selecciona un archivo
                </EmptyDescription>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <h1 className="text-muted-foreground text-sm">
              Asegurate de que los audios tengan una calidad aceptable.
            </h1>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
