import { playVoice } from "@/lib/voices";
import { useState } from "react";
import { toast } from "sonner";

export const useVoicePreview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async (voiceId: string, sound?: string) => {
    setIsLoading(true);
    try {
      const base64Audio = await playVoice(voiceId, sound);
      setIsLoading(false);

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      const audioCtx = new AudioContext();
      const source = audioCtx.createBufferSource();

      audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
      });

      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
      };
    } catch {
      setIsLoading(false);

      toast.error("Error al reproducir la voz");
    }
  };

  return {
    handlePlay,
    isLoading,
    isPlaying,
    actions: { setIsLoading, setIsPlaying },
  };
};
