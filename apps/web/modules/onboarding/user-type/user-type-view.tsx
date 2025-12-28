"use client";

import { motion } from "motion/react"
import { ToyBrickIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { StepTitle } from "../components/step";

export const UserTypeView = () => {
		return (
				<motion.section className="flex flex-col gap-10 items-center"
				exit={{ opacity: 0 }}
				>
				<div className="gap-2 grid text-center">
<StepTitle>
¿Quién usará Daimo?
</StepTitle>
				</div>
				<motion.div
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.5,  ease: "backOut", type: "spring", damping: 20 }}
				  className="flex md:flex-row flex-col items-center gap-4"
				>
				<UserCard title="Mi hijo/a" description="Configuración parental" icon={<ToyBrickIcon strokeWidth={1.5}  />} href={"/onboarding/profile-setup"}/>
				<UserCard title="Yo" description="Para curiosos/experimentadores" icon={<UserIcon  strokeWidth={1.5}/>} href={"/onboarding/user-type"} />
				</motion.div>
				</motion.section>
		)
}

function UserCard({ title, icon, description, href }: { title: string, description: string, icon: ReactNode, href: string }) {
		return (
				<Link href={href}>
				<div className="rounded-lg gap-6 transition-colors cursor-pointer w-64 h-50 md:h-56 border border-border shadow-xs flex hover:bg-secondary items-center justify-center flex-col">
				<div className="[&_svg]:size-16">
				{icon}
				</div>
				<div className="text-center">
				<h1 className="font-medium text-lg">{title}</h1>
				<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				</div>
				</Link>
		)
}
