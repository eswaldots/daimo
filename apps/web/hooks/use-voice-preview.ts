import { playVoice } from "@/lib/voices";
import { useState } from "react";

export const useVoicePreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (voiceId: string, sound?: string) => {
    setIsLoading(true);
    const blob = await playVoice(voiceId, sound);
    setIsLoading(false);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    setIsPlaying(true);

    audio.onended = () => {
      setIsPlaying(false);
    };

    await audio.play();
  };

  return { handlePlay, isLoading, isPlaying };
};
