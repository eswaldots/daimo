import { ReactNode, useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { useHasPin } from "@/hooks/use-has-pin";

export const ParentalLink = ({
  children,
}: {
  children: ReactNode;
  href: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: hasPin } = useHasPin();
  const handleClick = () => {
    if (!hasPin) {
      setIsOpen(true);

      return;
    }
  };

  return (
    <>
      <div onClick={handleClick}>{children}</div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          Para realizar esta accion necesitaras configurar un PIN parental
        </DialogContent>
      </Dialog>
    </>
  );
};
