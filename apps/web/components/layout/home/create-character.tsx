import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@daimo/backend";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

export function CreateCharacter({ children }: { children: ReactNode }) {
  const createCharacter = useAction(api.charactersActions.create);
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await createCharacter({ description });
      setDescription("");
      toast.success("El personaje ha sido creado correctamente");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create character:", error);
      if (error instanceof ConvexError) {
        toast.error(error.stack);
      } else {
        toast.error(
          "Hubo un error intentando crear el personaje, intente de nuevo más tarde.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="md:max-w-2xl w-full py-8 gap-6">
        <motion.header
          className="w-fit mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <DialogTitle className="mx-auto font-normal text-3xl my-auto">
            Crea tu personaje
          </DialogTitle>
        </motion.header>

        <motion.div
          className="my-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Field>
            <InputGroup className="md:text-base rounded-2xl resize-none h-24 focus-visible:outline-0 focus-visible:ring-0  dark:border-border hover:bg-input transition-colors border-none bg-secondary">
              <InputGroupTextarea
                placeholder="Describe al personaje que quisieras crear"
                className="md:text-base h-24 focus-visible:outline-0 ring-0 focus-visible:ring-0"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting}
              />
              <InputGroupAddon align="block-end">
                <InputGroupButton
                  variant="default"
                  className="rounded-full ml-auto"
                  size="icon-sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !description.trim()}
                >
                  {isSubmitting ? <Spinner /> : <ArrowUp />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
