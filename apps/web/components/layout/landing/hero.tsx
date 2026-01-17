"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";

/**
 * Renders the full-screen hero section containing an animated title and two action buttons.
 *
 * @returns A React element representing the hero section with per-letter animated text and a button group that fades in.
 */
export function Hero() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <section className="flex flex-col gap-6 items-center">
        <div className="text-center space-y-4">
          <AnimatedText text="daimo" />
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 2.25,
              type: "spring",
              damping: 15,
              duration: 0.1,
              stiffness: 150,
            }}
            className="text-2xl md:max-w-full max-w-78"
          >
            Agentes conversacionales para niños
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2.5,
            type: "spring",
            damping: 15,
            duration: 0.1,
            stiffness: 150,
          }}
        >
          <Button
            className="tracking-wide text-base rounded-full font-normal"
            variant="default"
            size="lg"
            asChild
          >
            <Link href="/sign-up">Probar beta</Link>
          </Button>
          <Button
            className="tracking-wide text-base rounded-full dark:hover:text-primary hover:bg-primary dark:text-primary bg-transparent border-primary border text-primary hover:text-background shadow-none font-normal"
            size="lg"
            variant="default"
            asChild
          >
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

/**
 * Renders the given string with a per-character staggered entrance animation.
 *
 * Each character is wrapped in an animated span that moves up, rotates to neutral, and fades in with a staggered delay.
 *
 * @param text - The string whose characters will be rendered and animated individually
 * @returns A React element containing the animated characters as inline spans
 */
function AnimatedText({ text }: { text: string }) {
  const words = text.split("");

  return (
    <div className="overflow-hidden z-20">
      {words.map((word, idx) => {
        return (
          <motion.span
            key={`${word}-${idx}`}
            className={cn(
              "inline-block text-7xl font-medium text-neutral-950 tracking-tight leading-[0.8]",
              (word === "a" || word === "i") && "",
            )}
            initial={{
              translateY: 120,
              opacity: 0,
            }}
            animate={{
              translateY: 0,
              opacity: 1,
            }}
            transition={{
              delay: 1.8,
              duration: 0.1,
              type: "spring",
              damping: 15,
              stiffness: 150,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
