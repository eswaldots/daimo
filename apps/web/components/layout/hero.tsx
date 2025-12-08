"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import Link from "next/link";
import { AnimatedDaimo } from "@/components/icons/animated-daimo";

export function Hero() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background font-sans">
      <section className="flex flex-col gap-16 items-center">
        <AnimatedDaimo />
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            className="text-base rounded-full"
            size="lg"
            variant="secondary"
            asChild
          >
            <Link href="/sign-in">Iniciar sesión</Link>
          </Button>
          <Button className="text-base rounded-full" size="lg">
            <Link href="/sign-up">Probar beta</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
