"use client";

import { motion } from "motion/react"
import * as Sentry from "@sentry/nextjs";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepDescription, StepTitle } from "../components/step";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mars, Venus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogClose, DialogContent,  DialogFooter,  DialogTitle,  DialogTrigger  } from "@/components/ui/dialog";
import Markdown from "react-markdown";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "convex/react";
import { api } from "@daimo/backend";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const schema = z.object({
		name: z.string().min(1, { error: "El nombre es requerido"}),
		age: z.number({ error: "La edad tiene que ser un número"}).min(1, { error: "La edad es requerida"}),
		gender: z.union([z.literal("niño", { "error": "El genero es requerido"}), z.literal("niña")])
})

type ChildrenValues = z.infer<typeof schema>;

export const ProfileSetupView = () => {
		const [gender, setGender] = useState<null | "niño" | "niña">()
		const {handleSubmit, register, formState: { errors, isSubmitting }, setValue } = useForm<ChildrenValues>({
				resolver: zodResolver(schema),
		});
		const router = useRouter();

		const createChildren = useMutation(api.parental.children.createChildren);

		const onSubmit = async (data: ChildrenValues) => {
				try {
				await createChildren({ ...data })

				router.push("/onboarding/profile-tags")
				}
				catch (e) {
						Sentry.captureException(e);

						toast.error("Hubo un error guardando al niño, intente más tarde")
				}
		}

		return (
				<form onSubmit={handleSubmit(onSubmit)}>
				<motion.section className="flex flex-col gap-10 items-center"
				exit={{ opacity: 0 }}
				>
				<div className="gap-4 grid text-center">
				<StepTitle
				>
				Háblanos sobre tu hijo/a
				</StepTitle>
				<StepDescription
				>
				Ayúdanos a personalizar su experiencia dándonos detalles básicos de tu hijo/a
				</StepDescription>
				</div>
				<motion.div
                  initial={{ opacity: 0,  y: -20  }}
                  animate={{ opacity: 1,  y: 0 }}
                  transition={{ delay: 0.6,  ease: "backOut", type: "spring", damping: 20 }}
				  className="w-full"
				>
				<FieldGroup className="gap-1 w-full">
				<Field>
						<FormInput placeholder="Nombre" {...register("name")} />
            <FieldError errors={[errors.name]} />
				</Field>

				<Field>
						<FormInput placeholder="Edad" {...register("age", { valueAsNumber: true})} />

            <FieldError errors={[errors.age]} />

				</Field>

						<Label className="mt-3 font-normal text-muted-foreground">Selecciona su genero</Label>

						<div className="mb-1 mt-2 flex flex-row justify-center gap-4 w-full">
						<div
						onClick={() => {
								setValue("gender", "niño")
								setGender("niño")
						}}
						className={cn("cursor-pointer hover:bg-secondary/80 transition-colors peer-data-[state='checked']:bg-black flex flex-col items-center relative justify-center gap-3 rounded-xl py-6 flex-1 bg-secondary",
										   gender === "niño" && "bg-accent/5 hover:bg-accent/10"
										  )}>
						<Mars className={cn("size-12 transition-colors",
										   gender === "niño" && "text-accent/90"
										   )} />

						<Label className="text-sm pointer-events-none">
						Niño
						</Label>
						</div>
						<div
						onClick={() => {
								setValue("gender", "niña")
								setGender("niña")
						}}
						className={cn("cursor-pointer hover:bg-secondary/80 transition-colors peer-data-[state='checked']:bg-black flex flex-col items-center relative justify-center gap-3 rounded-xl py-6 flex-1 bg-secondary",
										   gender === "niña" && "bg-accent/5 hover:bg-accent/10"
										  )}>
						<Venus className={cn("size-12 transition-colors",
										   gender === "niña" && "text-accent/90"
										   )} />

						<Label className="text-sm pointer-events-none">
						Niña
						</Label>
						</div>

						</div>

            <FieldError errors={[errors.gender]} />


				</FieldGroup>


				<div className=" my-8">
				<DataPrivacy>
				<FieldDescription className="my-4 text-sm hover:underline cursor-pointer">¿Por que recolectamos estos datos?</FieldDescription>
				</DataPrivacy>
				<Button className="py-6 text-base rounded-xl w-full" size="lg">
				{isSubmitting ? <Spinner /> : "Listo"}
				</Button>

				</div>



				</motion.div>
				</motion.section>

				</form>
		)
}

const copyText = `
Daimo procesa información básica bajo protocolos de "Privacidad por Diseño" con el único fin de optimizar la interacción técnica y pedagógica:

*   Adaptación Cognitiva (Edad): Este parámetro es crítico para que nuestros modelos de lenguaje (LLM) ajusten la complejidad del vocabulario, los temas educativos y activen los filtros de seguridad específicos para cada etapa del desarrollo.
*   Concordancia Gramatical (Género): Al ser una interfaz 100% basada en voz, este dato garantiza una síntesis de voz natural y una concordancia gramatical precisa en tiempo real durante la conversación.
*   Identificación en Tiempo Real (Nombre): Se utiliza exclusivamente para personalizar el flujo de diálogo, permitiendo que la inteligencia artificial reconozca y se dirija al usuario de manera directa, mejorando la eficacia del procesamiento del lenguaje natural.

Los datos se almacenan de forma encriptada y se utilizan únicamente para mejorar la lógica de respuesta del personaje. **Daimo no comercializa ni comparte información personal con terceros.** Usted mantiene el control total sobre la información, pudiendo solicitar su eliminación definitiva en cualquier momento desde la configuración parental.
`

export const DataPrivacy = ({ children}: { children: ReactNode}) => {
		return (
				<Dialog>
				<DialogTrigger>
				{children}
				</DialogTrigger>
				<DialogContent className="md:max-w-2xl w-full p-10 md:p-16 overflow-y-scroll max-h-[80vh]">
				<DialogTitle className="md:leading-[1.1] mb-2 text-4xl md:text-6xl font-medium">Privacidad</DialogTitle>
				<h1 className="text-lg md:text-xl">Transparencia y Seguridad de Datos</h1>
				<div className="prose prose-neutral text-foreground font-normal md:text-lg leading-relaxed">
				<Markdown>
				{copyText}
				</Markdown>
				</div>
				<DialogFooter>
				<DialogClose asChild>
				<Button size="lg" className="ml-auto w-fit text-base rounded-full mt-8">Entendido</Button>
				</DialogClose>
				</DialogFooter>
				</DialogContent>
				</Dialog>
		)
}


const MotionInputGroup = motion.create(InputGroup);

const FormInput = ({ placeholder, ...props}:  ComponentProps<"input">) => {
		const [isFocus, setIsFocus] = useState(false);
		// only track the length of the input 
		const [value, setValue] = useState("");

		return (
				<MotionInputGroup className="px-1 h-fit bg-secondary group shadow-none rounded-xl"
				onFocus={() => {
						setIsFocus(true)
				}}
				onBlur={
						() => {
								if (value.length >= 1) return;

						setIsFocus(false)
						}
				}
				>
				<InputGroupInput {...props} className="mt-4.5 mb-1.5 md:text-sm" onChange={(e) => setValue(e.target.value)}/>
				<motion.span
				animate={{
						scale: isFocus ? 0.8 : 1,
						y: isFocus ? -14 : -0,
						x: isFocus ? -6 : 0
				}}
				transition={{
						ease: "backOut",
						type: "spring",
						damping: 30,
						stiffness: 350
				}}
				className="pointer-events-none text-muted-foreground font-normal md:text-sm absolute px-3">
				{placeholder}
				</motion.span>
				</MotionInputGroup>
		)
}

const FormSelect = ({ placeholder, ...props}:  ComponentProps<"input">) => {
		const [isFocus, setIsFocus] = useState(false);
		// only track the length of the input 
		const [value, setValue] = useState("");

		return (
						<Select onValueChange={setValue}>
						<SelectTrigger className="w-full py-7.5 bg-secondary relative px-3 rounded-xl"
				onBlur={
						() => {
								if (value.length >= 1) return;

						setIsFocus(false)
						}
				}
						>
						<div className="mt-3 px-0.5">
						<SelectValue 
						/>
						</div>
				<motion.span
				animate={{
						scale: isFocus ? 0.8 : 1,
						y: isFocus ? -14 : -0,
						x: isFocus ? -12 : 0
				}}
				transition={{
						ease: "backOut",
						type: "spring",
						damping: 30,
						stiffness: 350
				}}
				className="pointer-events-none text-muted-foreground font-normal md:text-sm absolute">
				{placeholder}
				</motion.span>
						</SelectTrigger>
								<SelectContent className="rounded-xl"
 onFocus={() => {
								setIsFocus(true)
						}}
								>
								<SelectItem value="varon">Varon</SelectItem>
								<SelectItem value="hembra">Hembra</SelectItem>
								<SelectItem value="unspecify">Prefiero no especificarlo</SelectItem>
								</SelectContent>

						</Select>
		)
}
