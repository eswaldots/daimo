import React, { useState, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@daimo/backend";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const LOADING_STEPS = [
  "Iniciando Daimo Core...", // 0% -> 25%
  "Analizando patrones de voz...", // 25% -> 50%
  "Personalizando experiencia...", // 50% -> 75%
  "Sincronizando...", // 75% -> 95%
  "Todo listo", // 100% (Final)
];

const CleanLoader = () => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1); // Controla la velocidad de la animación actual
  const [isLoaded, setIsLoaded] = useState(false);
  const data = useQuery(api.characters.searchCharacters, { search: "Daimo" });
  const router = useRouter();

  useEffect(() => {
    // Si llegamos al último paso, forzamos el 100% y terminamos
    if (index >= LOADING_STEPS.length - 1) {
      setProgress(100);
      setTimeout(() => {
        if (data && data?.length > 0) {
          setIsLoaded(true);

          startTransition(() => {
            router.push(`/playground/${data[0]?._id}?isFirstTime=true`);
          });
        } else if (data !== undefined) {
          toast.error(
            "Parece que Daimo esta descansando, intenta de nuevo más tarde",
          );
        }
      }, 800); // Pequeña pausa al 100% antes de cambiar pantalla
      return;
    }

    // 1. Calculamos el tiempo aleatorio PARA ESTE PASO (entre 1s y 3s)
    const stepDuration = Math.random() * (3000 - 1000) + 1000;

    // 2. Convertimos a segundos para Framer Motion
    setDuration(stepDuration / 1000);

    // 3. Definimos el siguiente porcentaje objetivo
    // Distribuimos los pasos equitativamente (ej: 0, 25, 50, 75, 100)
    const nextProgress = ((index + 1) / (LOADING_STEPS.length - 1)) * 100;
    setProgress(nextProgress);

    // 4. Programamos el cambio de texto para que ocurra JUSTO cuando la barra llegue
    const timer = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-white text-black font-sans px-4">
      <motion.div
        className="w-full max-w-7xl flex flex-col items-center"
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Texto de Estado */}
        <div className="h-12 flex items-center justify-center mb-6 w-full relative overflow-y-hidden">
          <AnimatePresence mode="wait">
            <motion.h2
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{
                duration: 0.3,
                type: "spring",
                damping: 20,
                stiffness: 150,
              }} // Texto rápido, barra lenta
              className="text-xl md:text-2xl font-medium tracking-tight text-center absolute leading-[0.8]"
            >
              {LOADING_STEPS[index]}
            </motion.h2>
          </AnimatePresence>
        </div>

        {/* Barra de Progreso */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative w-xs">
          <motion.div
            className="h-full bg-accent"
            // Animamos hacia el nuevo porcentaje
            initial={{ width: `0%` }}
            animate={{ width: `${progress}%` }}
            // LA CLAVE TÉCNICA:
            // La duración de la animación visual coincide EXACTAMENTE con el setTimeout del useEffect.
            // Usamos 'linear' para que no frene al final, dando sensación de flujo continuo entre pasos.
            transition={{
              duration: duration,
              ease: "linear",
              type: "spring",
              damping: 20,
            }}
          />
        </div>

        {/* Metadatos técnicos */}
        <div className="mt-3 flex justify-between items-center w-full text-[10px] text-gray-400 font-mono uppercase tracking-widest">
          <AnimatePresence>
            {!isLoaded ? (
              <span>ESTIMATING_TIME</span>
            ) : (
              <span>LOADING_FINISHED</span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!isLoaded && (
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex gap-1"
              >
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CleanLoader;
