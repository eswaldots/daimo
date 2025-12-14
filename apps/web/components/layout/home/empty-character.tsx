import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { User2Icon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function EmptyCharacter() {
  return (
    <motion.div
      key="empty"
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: "spring" }}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="dark:bg-border">
            <User2Icon />
          </EmptyMedia>
          <EmptyTitle className="text-2xl">Crea un personaje</EmptyTitle>
          <EmptyDescription>
            No has creado ningun personaje, empieza a conversar creando a tu
            primer personaje.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/admin/characters/create">
                <PlusIcon />
                Crear personaje
              </Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </motion.div>
  );
}
