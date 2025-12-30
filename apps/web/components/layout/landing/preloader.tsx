import { AnimatedDaimo } from "@/components/icons/animated-daimo";
import { motion } from "motion/react";

export function Preloader() {
  return (
    <motion.div
      className="bg-neutral-950 w-screen fixed left-0 top-0 z-20 grid place-content-center overflow-y-hidden"
      exit={{ height: "0vh" }}
      initial={{ height: "100vh" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <AnimatedDaimo />
    </motion.div>
  );
}
