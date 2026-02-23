"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQueryWithStatus } from "@/lib/convex/use-query-with-status";
import { parseMillisecondsUsage, parseToLocaleString } from "@/lib/date";
import { api, Doc, Id } from "@daimo/backend";
import { motion } from "motion/react";
import { useParams } from "next/navigation";
import { CartesianGrid, Bar, BarChart, XAxis } from "recharts";
import { ProfileMedia } from "@/components/profile/profile-media";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, TriangleAlertIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RiskCategory } from "../../../../../../packages/lib";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const useOverview = () => {
  const { profileId } = useParams();
  const methods = useQueryWithStatus(api.parental.dashboard.getOverviewInfo, {
    profileId: profileId as Id<"profile">,
  });

  return methods;
};

export const OverviewView = () => {
  const { data, isPending } = useOverview();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  if (!data && !isPending) {
    throw new Error("data not found");
  }

  const { profile, lastConversation } = data;

  return (
    <main className="grid gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-6 my-6"
      >
        <div className="relative">
          <ProfileMedia
            size="xl"
            profileId={profile._id}
            src={profile.media}
            fallback={profile.name}
          />

          {lastConversation.isLive && (
            <div className="animate-pulse rounded-full bg-chart-2 size-6 ring-3 ring-background absolute right-0 bottom-0" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Aaron Avila</h1>

          <div
            className={cn(
              "rounded-full px-3 w-fit py-0.5 text-sm",
              lastConversation?.isLive
                ? "bg-chart-2/5 text-chart-2"
                : "bg-foreground/5 text-muted-foreground",
            )}
          >
            <span>
              {lastConversation?.isLive
                ? `Conversando con ${lastConversation.character?.name}`
                : "Inactivo"}
            </span>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <CardsRow />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <UsageChart />
      </motion.div>
    </main>
  );
};

const CardsRow = () => {
  const { data, isPending } = useOverview();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  if (!data && !isPending) {
    throw new Error("data not found");
  }

  const alertNum = data.warnings.length;

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <div
            className={cn(
              "border bg-background transition-colors rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center",
              alertNum >= 1 && "text-chart-4 cursor-pointer",
              alertNum >= 3 && "text-destructive",
            )}
          >
            <CardDescription
              className={cn(
                "text-sm transition-colors flex items-center justify-between w-full text-muted-foreground relative",
              )}
            >
              Número de alertas
              {alertNum >= 1 && (
                <div className="-top-1 absolute right-0 rounded-full p-1.5 bg-chart-4/10 text-chart-4">
                  <TriangleAlertIcon className="size-4" />
                </div>
              )}
            </CardDescription>
            <CardTitle className="text-4xl tracking-tighter tabular-nums font-medium mx-auto flex items-center gap-3">
              {alertNum} {alertNum === 1 ? "alerta" : "alertas"}
            </CardTitle>
          </div>
        </DialogTrigger>
        <DialogContent
          showCloseButton={false}
          className="md:h-[80vh] [&::-webkit-scrollbar-thumb]:bg-black overflow-y-auto"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DialogClose asChild>
                  <Button variant="secondary" size="icon-sm">
                    <XIcon className="text-muted-foreground" />
                  </Button>
                </DialogClose>
                <span className="font-semibold tracking-tight">
                  Alertas de {data.profile.name}
                </span>
              </div>

              <DialogClose asChild>
                <Button size="sm">Listo</Button>
              </DialogClose>
            </div>
            <Separator className="w-full my-2 bg-secondary" />
            <div className="grid gap-3">
              <AlertTriangle className="text-chart-4 size-8 text-background" />
              <DialogTitle className="font-semibold text-2xl">
                {alertNum}{" "}
                {alertNum === 1
                  ? "alerta fue encontrada"
                  : "alertas fueron encontradas"}
              </DialogTitle>
            </div>
            <Accordion
              type="single"
              collapsible
              defaultValue={data.warnings[0] ? data.warnings[0]._id : ""}
            >
              {data.warnings.map(
                (
                  warning: Doc<"interactionFlags"> & {
                    message: Doc<"messages"> | null;
                  },
                ) => {
                  return (
                    <AccordionItem value={warning._id} key={warning._id}>
                      <AccordionTrigger className="last:border-b-none border-b border-border/50 py-4 flex items-center cursor-pointer gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-destructive rounded-lg text-white p-1.5">
                            {warning.severity >= 4 && (
                              <AlertTriangle className="size-5" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h1 className="tracking-tight">
                              {warning.category === RiskCategory.SELF_HARM &&
                                "Mención de auto lesión detectada"}
                              {warning.category === RiskCategory.ABUSE &&
                                "Mención de abuso detectada"}
                              {warning.category === RiskCategory.SEXUAL &&
                                "Lenguaje sexual detectado"}
                              {warning.category === RiskCategory.GROOMING &&
                                "Intento de conversación sexual detectado"}
                              {warning.category === RiskCategory.DRUGS &&
                                "Mención de drogas detectado"}
                              {warning.category ===
                                RiskCategory.EMOTIONAL_DISTRESS &&
                                "Detección de baja salud mental"}
                              {warning.category === RiskCategory.VIOLENCE &&
                                "Tono violento detectado"}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                              Detectada el{" "}
                              {parseToLocaleString(warning._creationTime)}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="py-3">
                        <ul>
                          <motion.li
                            className="rounded-md bg-secondary p-3 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                              className="ml-auto bg-background py-1 text-base px-4 rounded-full w-fit"
                            >
                              {warning?.message?.content}
                            </motion.div>
                          </motion.li>
                          <li className="space-y-2 mb-4">
                            <motion.h1
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-xl font-medium tracking-tight"
                            >
                              Explicación de la advertencia
                            </motion.h1>

                            <motion.p
                              className="leading-relaxed"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              {warning.explanation}
                            </motion.p>
                          </li>

                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <strong>Tipo:</strong>{" "}
                            <span>{warning.category}</span>
                          </motion.li>
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <strong>Detectado:</strong>{" "}
                            <span>
                              {parseToLocaleString(warning._creationTime)}
                            </span>
                          </motion.li>

                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 flex w-full items-center justify-end gap-2"
                          >
                            <Button variant="secondary" disabled>
                              Ver conversación completa
                            </Button>
                            <Button>Marcar como leído</Button>
                          </motion.li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  );
                },
              )}
            </Accordion>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <KPICard
        label="Tiempo de uso semanal"
        value={parseMillisecondsUsage(data.weeklyUsageTime)}
      />

      <KPICard
        label="Número de conversaciones"
        value={data.weeklyConversationCount}
      />

      <KPICard
        label="Promedio por conversación"
        value={parseMillisecondsUsage(data.weeklyAverageDuration)}
      />
    </>
  );
};

const chartConfig = {
  milliseconds: {
    label: "Uso total",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const UsageChart = () => {
  const { data, isPending } = useOverview();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  return (
    <div className="border bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">Uso semanal</CardDescription>
      <ChartContainer config={chartConfig} className="w-full max-h-[300px]">
        <BarChart accessibilityLayer data={data?.usage}>
          <CartesianGrid vertical={false} />
          <Bar dataKey="milliseconds" fill="var(--accent)" radius={4} />
          <XAxis
            dataKey="day"
            tickLine={false}
            className="capitalize"
            tickMargin={10}
            tickFormatter={(tick) => {
              // TODO: refactor this to date.ts
              return format(new Date(tick), "EEEE", { locale: es });
            }}
            axisLine={false}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(tick) => (
                  <span>
                    <strong>Uso total</strong>:{" "}
                    {parseMillisecondsUsage(parseInt(tick.toString()))}
                  </span>
                )}
              />
            }
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

const KPICard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <div className="border bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">{label}</CardDescription>
      <CardTitle className="text-4xl tracking-tighter tabular-nums font-medium mx-auto">
        {value}
      </CardTitle>
    </div>
  );
};
