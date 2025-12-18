"use client";

import { AnimatePresence } from "motion/react";
import { Hero } from "./hero";
import { Preloader } from "./preloader";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  return (
    <main>
      <AnimatePresence mode="wait">
        {isLoading && <Preloader />}
      </AnimatePresence>
      <Hero />
    </main>
  )
}
