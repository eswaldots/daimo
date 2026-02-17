"use client";

import { authClient } from "@/lib/auth/auth-client";
import { motion } from "motion/react";

export default function Page() {
  const { data } = authClient.useSession();

  return (
    <div className="">
      <div className="space-y-2">
        <motion.h1
          className="text-xl tracking-tighter text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Hola,{" "}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {data?.user.name.split(" ")[0]}
          </motion.span>
        </motion.h1>
        <motion.h1
          className="text-4xl font-medium tracking-tighter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Bienvenido de vuelta
        </motion.h1>
      </div>
    </div>
  );
}
