"use client";

import DaimoIcon from "@/components/icons/daimo";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const OnboardingView = () => {
  return (
    <motion.section
      className="flex flex-col gap-10 items-center w-full"
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="p-6 dark:bg-background  bg-foreground rounded-3xl w-fit mx-auto flex items-center justify-center"
        initial={{ opacity: 0, scale: 2, y: 200 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: 0.1,
          ease: "backOut",
          type: "spring",
          damping: 20,
        }}
      >
        <DaimoIcon className="text-background dark:text-foreground md:size-18 size-16" />
      </motion.div>

      <div className="gap-5 grid text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.5,
            ease: "backOut",
            type: "spring",
            damping: 20,
          }}
          className="text-4xl md:text-5xl font-semibold tracking-tight"
        >
          Bienvenido a Daimo
        </motion.h1>

        <motion.p
          className="md:text-lg md:max-w-xl text-base text-muted-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            ease: "backOut",
            type: "spring",
            damping: 20,
          }}
        >
          Aprendizaje infantil impulsado por modelos de lenguaje avanzados. Sin
          pantallas. Privacidad por diseño.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.7,
          ease: "backOut",
          type: "spring",
          damping: 20,
        }}
        className="md:w-fit w-full"
      >
        <Button
          className="h-12 w-full rounded-full md:w-md text-base"
          size="lg"
          variant="accent"
          asChild
        >
          <Link href="/onboarding/user-type">Empezar</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
};
