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
      <section className="flex flex-col gap-10 items-center">
        <AnimatedText text="daimo" />

        <motion.div
          className="flex items-center gap-4 z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 2.5,
            type: "spring",
            ease: [0.33, 1, 0.68, 1],
            damping: 20,
          }}
        >
          <Button
            className="tracking-normal text-base rounded-full"
            variant="accent"
            size="lg"
            asChild
          >
            <Link href="/sign-up">Probar beta</Link>
          </Button>
          <Button
            className="tracking-normal text-base rounded-full bg-transparent border-accent border text-accent hover:text-neutral-50 shadow-none"
            size="lg"
            variant="accent"
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
              "inline-block text-8xl font-medium text-neutral-950 tracking-tight leading-[0.8]",
              (word === "a" || word === "i") && "text-accent",
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
              duration: 0.5,
              ease: [0.33, 1, 0.68, 1],
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

