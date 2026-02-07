import { create } from "zustand";

interface AdminTriggerStore {
  title: string;
  actions: {
    setTitle: (title: string) => void;
  };
}

const useTrigger = create<AdminTriggerStore>((set) => ({
  title: "",
  actions: {
    setTitle: (title: string) => {
      return set({ title });
    },
  },
}));

export { useTrigger };
