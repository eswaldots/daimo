"use client"

import { ReactNode } from "react"

export const OnboardingLayout = ({ children }: { children: ReactNode }) => {
		return (
				<div className="bg-background flex items-center justify-center h-screen w-screen font-sans md:px-0 px-4">
						{children}
				</div>

		)
}
