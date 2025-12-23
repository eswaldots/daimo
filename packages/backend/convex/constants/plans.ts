type PlanFeatures = {
  memory: boolean;
  msLimit: number;
  characters: "free" | "premium";
  voiceCloning: boolean;
};

type Plan = {
  id: string;
  name: string;
  features: PlanFeatures;
};

type Plans = {
  free: Plan;
  pro: Plan;
};

export const PLAN_FEATURES: Plans = {
  free: {
    id: "free",
    name: "Gratuito",
    features: {
      memory: false,
      // 30 minutes
      msLimit: 30 * 60 * 1000,
      characters: "free",
      voiceCloning: false,
    },
  },
  pro: {
    id: "pro",
    name: "pro",
    features: {
      memory: true,
      // 15 hours
      msLimit: 15 * 60 * 60 * 1000,
      voiceCloning: true,
      characters: "pro",
    },
  },
};
