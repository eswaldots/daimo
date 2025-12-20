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

      try {
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        source.onended = () => {
          setIsPlaying(false);
          audioCtx.close();
        };

        source.start();
        setIsPlaying(true);
      } catch {
        audioCtx.close(); // Clean up AudioContext on error
        setIsPlaying(false);
        toast.error("Error al intentar decodificar la voz");
      }
    } catch {
      setIsLoading(false);
      toast.error("Error al intentar reproducir la voz");
    }
  };
  return {
    handlePlay,
    isLoading,
    isPlaying,
    actions: { setIsLoading, setIsPlaying },
  };
};
