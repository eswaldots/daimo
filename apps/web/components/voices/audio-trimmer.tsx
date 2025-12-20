"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Button } from "@/components/ui/button";
import { Play, Pause, Scissors, RotateCcw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface AudioTrimmerProps {
  file: File;
  onTrim: (trimmedFile: File) => void;
  onCancel: () => void;
}

export default function AudioTrimmer({
  file,
  onTrim,
  onCancel,
}: AudioTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#4f46e5",
      progressColor: "#818cf8",
      cursorColor: "#ffffff",
      height: 100,
      barWidth: 2,
      barGap: 3,
    });

    const regions = ws.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    ws.on("ready", () => {
      setIsReady(true);
      const dur = ws.getDuration();
      setDuration(dur);

      // Create initial region (full duration or first 10s)
      regions.addRegion({
        start: 0,
        end: Math.min(dur, 10),
        color: "rgba(79, 70, 229, 0.2)",
        drag: true,
        resize: true,
      });
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));

    // Load file
    const url = URL.createObjectURL(file);
    ws.load(url);

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleTrim = async () => {
    if (!wavesurferRef.current || !regionsRef.current) return;

    const region = regionsRef.current.getRegions()[0];
    if (!region) return;

    const start = region.start;
    const end = region.end;

    // Use Web Audio API to trim the buffer
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const sampleRate = audioBuffer.sampleRate;
    const startOffset = Math.floor(start * sampleRate);
    const endOffset = Math.floor(end * sampleRate);
    const frameCount = endOffset - startOffset;

    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      frameCount,
      sampleRate,
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      const trimmedChannelData = trimmedBuffer.getChannelData(i);
      trimmedChannelData.set(channelData.subarray(startOffset, endOffset));
    }

    // Convert AudioBuffer to Blob/File (WAV format)
    const trimmedBlob = await bufferToWav(trimmedBuffer);
    const trimmedFile = new File([trimmedBlob], `trimmed-${file.name}`, {
      type: "audio/wav",
    });

    onTrim(trimmedFile);
  };

  // Helper to convert AudioBuffer to WAV
  const bufferToWav = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const length = buffer.length * buffer.numberOfChannels * 2 + 44;
      const view = new DataView(new ArrayBuffer(length));
      const channels = [];
      let offset = 0;
      let pos = 0;

      // RIFF identifier
      writeString(view, pos, "RIFF");
      pos += 4;
      view.setUint32(pos, length - 8, true);
      pos += 4;
      writeString(view, pos, "WAVE");
      pos += 4;
      writeString(view, pos, "fmt ");
      pos += 4;
      view.setUint32(pos, 16, true);
      pos += 4;
      view.setUint16(pos, 1, true);
      pos += 2;
      view.setUint16(pos, buffer.numberOfChannels, true);
      pos += 2;
      view.setUint32(pos, buffer.sampleRate, true);
      pos += 4;
      view.setUint32(
        pos,
        buffer.sampleRate * 2 * buffer.numberOfChannels,
        true,
      );
      pos += 4;
      view.setUint16(pos, buffer.numberOfChannels * 2, true);
      pos += 2;
      view.setUint16(pos, 16, true);
      pos += 2;
      writeString(view, pos, "data");
      pos += 4;
      view.setUint32(pos, length - pos - 4, true);
      pos += 4;

      for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
      }

      while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
          const channel = channels[i];
          if (!channel) continue;
          let sample = Math.max(-1, Math.min(1, channel[offset] || 0));
          sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }

      resolve(new Blob([view], { type: "audio/wav" }));
    });
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      const charCode = string.charCodeAt(i);
      view.setUint8(offset + i, charCode);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-background border rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Scissors className="size-4" />
          Recortar Audio
        </h3>
        <span className="text-xs text-muted-foreground">
          {duration.toFixed(2)}s total
        </span>
      </div>

      <div
        ref={containerRef}
        className="w-full bg-secondary/30 rounded-lg overflow-hidden border border-border/50"
      />

      {!isReady && (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6" />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isReady}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (wavesurferRef.current) wavesurferRef.current.seekTo(0);
            }}
            disabled={!isReady}
          >
            <RotateCcw className="size-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleTrim}
            disabled={!isReady}
          >
            Aplicar Recorte
          </Button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Arrastra los bordes para seleccionar el segmento de audio.
      </p>
    </div>
  );
}
