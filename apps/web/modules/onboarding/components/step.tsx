import { motion } from "motion/react";
import { ReactNode } from "react";

export const StepTitle = ({children}:{ children: ReactNode}) => {
		return (
				<motion.h1
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.3,  ease: "backOut", type: "spring", damping: 20 }}
				className="text-3xl md:text-4xl font-medium tracking-tight">
				{children}
				</motion.h1>
		)

}

export const StepDescription = ({children}:{ children: ReactNode}) => {
		return (
				<motion.p
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.4,  ease: "backOut", type: "spring", damping: 20 }}
				className="text-base text-foreground/80">
				{children}
				</motion.p>
		)

}
