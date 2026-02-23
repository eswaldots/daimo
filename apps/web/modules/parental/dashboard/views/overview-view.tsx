"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import * as Sentry from "@sentry/nextjs";
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
import { AnimatePresence, motion } from "motion/react";
import { useParams } from "next/navigation";
import { CartesianGrid, Bar, BarChart, XAxis } from "recharts";
import { ProfileMedia } from "@/components/profile/profile-media";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, TriangleAlertIcon, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RiskCategory } from "@daimo/lib";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { sileo } from "sileo";
import { ConvexError } from "convex/values";
import { Skeleton } from "@/components/ui/skeleton";

const useOverview = () => {
  const now = useMemo(() => new Date().setHours(0, 0, 0, 0), []);

  const { profileId } = useParams();
  const methods = useQueryWithStatus(api.parental.dashboard.getOverviewInfo, {
    profileId: profileId as Id<"profile">,
    clientTimestamp: now,
  });

  return { ...methods, now };
};

export const OverviewView = () => {
  const { data, isPending, isError, error } = useOverview();

  if (isPending) {
    return <OverviewSkeleton />;
  }

  if (isError) {
    Sentry.captureException(error);

    // TODO: handle error
    throw error;
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

          <AnimatePresence>
            {lastConversation?.isLive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="animate-pulse rounded-full bg-chart-2 size-6 ring-3 ring-background absolute right-0 bottom-0"
              />
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            {profile.name}
          </h1>

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
        className="grid md:grid-cols-4 gap-4"
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

const OverviewSkeleton = () => {
  return (
    <main className="grid gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-6 my-6"
      >
        <div className="relative">
          <Skeleton className="rounded-full size-28" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-24" />

          <Skeleton
            className={cn("rounded-full px-3 w-fit py-0.5 w-12 h-2 text-sm")}
          />
        </div>
      </motion.div>
      <motion.div
        className="grid md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <KPICardSkeleton label="Tiempo de uso semanal" />
        <KPICardSkeleton label="Número de conversaciones" />
        <KPICardSkeleton label="Promedio por conversación" />
        <KPICardSkeleton label="Número de alertas" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <UsageChartSkeleton />
      </motion.div>
    </main>
  );
};

const CardsRow = () => {
  const { data, isPending, isError, error } = useOverview();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  if (isError) {
    Sentry.captureException(error);

    // TODO: handle error
    throw error;
  }

  const alertNum = data.warnings.length;
  const { lastConversation } = data;

  return (
    <>
      <AlertDialog>
        <div
          className={cn(
            "border dark:bg-secondary/30 bg-background cursor-pointer hover:bg-secondary/50 transition-colors rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center",
            alertNum >= 1 && "text-chart-4",
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
      </AlertDialog>

      <WeeklyUsageCard
        value={data.weeklyUsageTime}
        isLive={lastConversation.isLive}
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

const WeeklyUsageCard = ({
  value,
  isLive,
}: {
  value: number;
  isLive: boolean;
}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isLive) {
      interval = setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLive]);

  return (
    <div className="border dark:bg-secondary/30 bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">
        Tiempo de uso semanal
      </CardDescription>
      <div className="text-4xl tracking-tighter font-medium mx-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {parseMillisecondsUsage(value + time)
            .split("")
            .map((v, i) => (
              <motion.span
                className={cn("inline-block tabular-nums", v === " " && "mx-1")}
                key={i}
              >
                <motion.span
                  className="inline-block tabular-nums"
                  key={v}
                  initial={{ y: -12, filter: "blur(5px)", opacity: 0 }}
                  animate={{ y: 0, filter: "blur(0px)", opacity: 1 }}
                  exit={{
                    y: 12,
                    filter: "blur(5px)",
                    position: "absolute",
                    opacity: 0,
                  }}
                  transition={{
                    type: "spring",
                    bounce: 0.25,
                    damping: 20,
                    stiffness: 400,
                    duration: 0.8,
                  }}
                >
                  {v}
                </motion.span>
              </motion.span>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AnimatedAccordionItem = motion.create(AccordionItem);

const AlertDialog = ({ children, ...props }: ComponentProps<typeof Dialog>) => {
  const [isOpen, setIsOpen] = useState(false);
  const { profileId } = useParams<{ profileId: Id<"profile"> }>();

  const { data, isPending, isError, error, now } = useOverview();
  const resolveIssue = useMutation(
    api.parental.dashboard.resolveIssue,
  ).withOptimisticUpdate((localStore, args) => {
    const { interactionFlagId } = args;
    const currentValue = localStore.getQuery(
      api.parental.dashboard.getOverviewInfo,
      { profileId: profileId, clientTimestamp: now },
    );

    if (currentValue !== undefined) {
      const warning = currentValue.warnings.findIndex(
        (w) => w._id === interactionFlagId,
      );

      const newWarnings = currentValue.warnings.filter(
        (w) => w._id !== interactionFlagId,
      );

      localStore.setQuery(
        api.parental.dashboard.getOverviewInfo,
        { profileId, clientTimestamp: now },
        { ...currentValue, warnings: newWarnings },
      );
    }
  });
  if (isPending) {
    return <h1>cargando</h1>;
  }

  if (isError) {
    Sentry.captureException(error);

    // TODO: handle error
    throw error;
  }

  const alertNum = data.warnings.length;

  return (
    <Dialog {...props} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="h-[80vh] md:h-[80vh] [&::-webkit-scrollbar-thumb]:bg-black overflow-y-auto no-scrollbar overflow-x-hidden"
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
            <AlertTriangle
              className={cn(
                "text-muted-foreground/50 size-16 md:size-8 transition-colors mx-auto md:mx-none",
                alertNum >= 1 && "text-chart-4",
              )}
            />
            <AnimatePresence mode="wait">
              {alertNum >= 1 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DialogTitle className="font-semibold text-2xl">
                    {alertNum}{" "}
                    {alertNum === 1
                      ? "alerta fue encontrada"
                      : "alertas fueron encontradas"}
                  </DialogTitle>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DialogTitle className="font-semibold text-2xl">
                      No hay alertas
                    </DialogTitle>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DialogDescription className="text-lg leading-[1.25] -mt-1">
                      Este perfil ha tenido una conducta adecuada
                    </DialogDescription>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <Accordion type="single" collapsible>
            <AnimatePresence mode="wait">
              {data.warnings.map(
                (
                  warning: Doc<"interactionFlags"> & {
                    message: Doc<"messages"> | null;
                  },
                  index,
                ) => {
                  return (
                    <AnimatedAccordionItem
                      value={warning._id}
                      key={warning._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { delay: 0.3 * index },
                      }}
                      exit={{ opacity: 0 }}
                    >
                      <AccordionTrigger className="last:border-b-none border-b border-border/50 py-4 flex items-center cursor-pointer gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "rounded-lg text-white p-1.5 bg-muted-foreground",
                              warning.severity >= 4 && "bg-destructive",
                              warning.severity >= 2 && "bg-chart-4",
                            )}
                          >
                            <AlertTriangle className="size-5" />
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
                      <AccordionContent className="py-3 max-w-[80vw] text-left">
                        <ul className="max-w-full">
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
                            <Button
                              onClick={async () => {
                                try {
                                  sileo.success({
                                    title: "Advertencia leída",
                                    fill: "#171717",
                                    description:
                                      "La advertencia ha sido marcada como leída",
                                  });

                                  await resolveIssue({
                                    interactionFlagId: warning._id,
                                  });
                                } catch (error) {
                                  Sentry.captureException(error);

                                  const errorMessage =
                                    error instanceof ConvexError
                                      ? (error.data as { message: string })
                                          .message
                                      : "Un error inesperado occurrió";

                                  sileo.error({
                                    title: "Error",
                                    description: errorMessage,
                                  });
                                }
                              }}
                            >
                              Marcar como leído
                            </Button>
                          </motion.li>
                        </ul>
                      </AccordionContent>
                    </AnimatedAccordionItem>
                  );
                },
              )}
            </AnimatePresence>
          </Accordion>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const chartConfig = {
  milliseconds: {
    label: "Uso total",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const UsageChart = () => {
  const { data, isPending, isError, error } = useOverview();

  if (isPending) {
    return <h1>cargando</h1>;
  }

  if (isError) {
    Sentry.captureException(error);

    // TODO: handle error
    throw error;
  }

  return (
    <div className="border dark:bg-secondary/30  bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">Uso semanal</CardDescription>
      <ChartContainer config={chartConfig} className="w-full max-h-[300px]">
        <BarChart accessibilityLayer data={data?.usage}>
          <CartesianGrid vertical={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="day"
                className="w-fit"
                formatter={(value) => {
                  return (
                    <span className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-accent size-2.5 rounded-xs" />
                        <span className="text-muted-foreground">
                          Tiempo de uso:
                        </span>
                      </div>
                      <strong className="font-mono">
                        {parseMillisecondsUsage(value as number)}
                      </strong>
                    </span>
                  );
                }}
                labelClassName="capitalize"
                labelFormatter={(_, payload) => {
                  return format(
                    new Date(payload[0] ? payload[0].payload.day : 0),
                    "EEEE",
                    {
                      locale: es,
                    },
                  );
                }}
              />
            }
          />
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

          <Bar dataKey="milliseconds" fill="var(--accent)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

const UsageChartSkeleton = () => {
  return (
    <div className="border dark:bg-secondary/30 bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">Uso semanal</CardDescription>
      <Skeleton className="w-full min-h-[300px] w-full" />
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
    <div className="border dark:bg-secondary/30 bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">{label}</CardDescription>
      <CardTitle className="text-4xl tracking-tighter tabular-nums font-medium mx-auto">
        {value}
      </CardTitle>
    </div>
  );
};

const KPICardSkeleton = ({ label }: { label: string }) => {
  return (
    <div className="border dark:bg-secondary/30 bg-background rounded-md space-y-6 h-fit border-border py-4 pb-8 px-4 flex flex-col items-start justify-center">
      <CardDescription className="text-sm">{label}</CardDescription>
      <CardTitle className="text-4xl tracking-tighter tabular-nums font-medium mx-auto">
        <Skeleton className="h-10 w-12" />
      </CardTitle>
    </div>
  );
};
