export const PLAN_FEATURES = {
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
  plus: {
    id: "premium",
    name: "Premium",
    features: {
      memory: true,
      // 15 hours
      msLimit: 15 * 60 * 60 * 1000,
      voiceCloning: true,
      characters: "premium",
    },
  },
};
