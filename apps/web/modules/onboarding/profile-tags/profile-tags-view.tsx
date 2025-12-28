"use client";

import { motion } from "motion/react"
import { StepDescription, StepTitle } from "../components/step";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";


export const ProfileTagsView = () => {
		return (
				<motion.section className="flex flex-col gap-10 items-center"
				exit={{ opacity: 0 }}
				>
				<div className="gap-4 grid text-center">
				<StepTitle
				>
				Que le gusta a tu hijo/a
				</StepTitle>
				<StepDescription
				>
				Ayúdanos a personalizar su experiencia dándonos detalles básicos de tu hijo/a
				</StepDescription>

				<motion.div className="w-full  my-4 grid grid-cols-2 gap-x-4 gap-y-4"
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.6,  ease: "backOut", type: "spring", damping: 20 }}
				>
				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>

				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>

				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>

				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>

				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>

				<div className="border border-border w-full h-24 rounded-lg flex items-end justify-start p-3">
				<h1 className="font-medium">Moda y belleza</h1>
				</div>


				</motion.div>

				<motion.div className="w-full space-y-4"
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.7,  ease: "backOut", type: "spring", damping: 20 }}
				>
				<Separator />


				<Button size="lg" className="rounded-xl w-full text-base h-12">Siguiente</Button>
				</motion.div>
				</div>
				</motion.section>
		)
}

