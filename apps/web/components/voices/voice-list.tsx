"use client";

import { Voice } from "@/lib/voices";
import { ItemGroup } from "../ui/item";
import { VoiceItem } from "../layout/admin/voice-item";
import { motion } from "motion/react";

export default function VoiceList({ voices }: { voices: Voice[] }) {
  return (
    <div className="text">
      <ItemGroup className="space-y-4">
        {voices?.map((voice, index) => (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            key={voice.name}
            transition={{
              delay: index * 0.01,
            }}
          >
            <VoiceItem {...voice} key={voice.name} />
          </motion.div>
        ))}
      </ItemGroup>
    </div>
  );
}
