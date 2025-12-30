import { Button } from "@/components/ui/button";
import { OnboardingTagForm } from "../components/onboarding-tag-form";

export const OnboardingView = () => {
  return (
    <main className="flex flex-col">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <div className="my-8 flex w-full justify-between items-center">
        <div className=" gap-0.5 grid">
          <span className="text-xl font-medium">Onboarding tags</span>
          <p className="text-sm text-muted-foreground">
            Estas son los gustos que los padres pueden elegir para sus hijos en
            el onboarding
          </p>
        </div>

        <OnboardingTagForm>
          <Button>Agregar tag</Button>
        </OnboardingTagForm>
      </div>
    </main>
  );
};
