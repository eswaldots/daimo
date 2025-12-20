"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <section className="flex flex-col gap-12 items-center">
        <AnimatedText text="daimo" />

        <motion.div
          className="flex items-center gap-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 2.4,
            ease: "easeOut",
            damping: 20,
            type: "spring",
          }}
        >
          <Button
            className="tracking-normal text-base rounded-full bg-neutral-950 hover:bg-neutral-900 text-neutral-50"
            size="lg"
            asChild
          >
            <Link href="/sign-up">Probar beta</Link>
          </Button>
          <Button
            className="tracking-normal text-base rounded-full bg-transparent border-neutral-950 dark:border hover:text-neutral-50 hover:bg-neutral-950 text-neutral-950 shadow-none"
            size="lg"
            variant="secondary"
            asChild
          >
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

function AnimatedText({ text }: { text: string }) {
  const words = text.split("");

  return (
    <div className="overflow-hidden z-20">
      {words.map((word, idx) => {
        return (
          <motion.span
            key={`${word}-${idx}`}
            className={cn(
              "inline-block text-8xl font-medium text-neutral-950 tracking-tight",
              (word === "a" || word === "i") && "",
            )}
            initial={{
              translateY: 120,
              rotate: 40,
              opacity: 0,
            }}
            animate={{
              translateY: 0,
              rotate: 0,
              opacity: 1,
            }}
            transition={{
              delay: 1.8 + idx * 0.05,
              ease: "easeOut",
              damping: 20,
              type: "spring",
              duration: 1,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
