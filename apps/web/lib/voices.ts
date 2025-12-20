"use server";

import { tts } from "./tts";
import type { Voice as NewVoice } from "./tts";

// Keep original interface for backward compatibility
export interface Voice {
  name: string;
  langCode: string;
  displayName: string;
  description: string;
  tags: string[];
  voiceId: string;
  source: string;
}

type Options = {
  q?: string;
  limit?: string;
};

// Convert new voice format to legacy format
function toLegacyVoice(voice: NewVoice): Voice {
  return {
    name: voice.name,
    langCode: voice.languageCode,
    displayName: voice.displayName,
    description: voice.description,
    tags: voice.tags,
    voiceId: voice.id,
    source: voice.provider,
  };
}

// Convert legacy voice format to new format (if needed)
function fromLegacyVoice(legacyVoice: Voice): NewVoice {
  return {
    id: legacyVoice.voiceId,
    provider: legacyVoice.source,
    name: legacyVoice.name,
    languageCode: legacyVoice.langCode,
    displayName: legacyVoice.displayName,
    description: legacyVoice.description,
    tags: legacyVoice.tags,
    metadata: { source: "legacy" },
  };
}

export const getVoices = async (opts: Options) => {
  const limit = opts.limit ? parseInt(opts.limit) : undefined;

  const voices = await tts.getVoices({
    q: opts.q,
    limit,
  });

  // Convert to legacy format
  const legacyVoices = voices.map(toLegacyVoice);

  return { voices: legacyVoices };
};

export const getVoicesFromGoogle = async (opts: Options) => {
  const limit = opts.limit ? parseInt(opts.limit) : undefined;

  const voices = await tts.getVoices({
    q: opts.q,
    limit,
    provider: "gemini", // Google/Gemini voices
  });

  // Convert to legacy format
  const legacyVoices = voices.map(toLegacyVoice);

  return { voices: legacyVoices };
};

export const playVoice = async (voiceId: string, sound?: string) => {
  // Use the new TTS system to synthesize speech
  const response = await tts.synthesize({
    voiceId,
    text: sound ?? "Hola amigo, espero que estes teniendo un buen día",
  });

  return response.audioContent;
};

// Create a custom voice using the specified provider
export async function createCustomVoice(formData: FormData): Promise<Voice> {
  const providerId = (formData.get("provider") as string) || "inworld";
  const name = (formData.get("name") as string) || "Custom Voice";
  const description = (formData.get("description") as string) || "";
  const language = (formData.get("language") as string) || "en-US";
  const audioFile = formData.get("audio") as File;

  if (!audioFile) {
    throw new Error("Audio file is required");
  }

  const provider = tts.getProvider(providerId);
  if (!provider) {
    throw new Error(`Provider ${providerId} not found or not configured`);
  }

  // Check if provider supports voice creation
  if (!provider.createVoice) {
    throw new Error(
      `Provider ${providerId} does not support custom voice creation`,
    );
  }

  // Create voice using provider
  const newVoice = await provider.createVoice(audioFile, {
    name,
    description,
    language,
  });

  // Convert to legacy format for compatibility
  return toLegacyVoice(newVoice);
}

// Get list of providers that support custom voice creation
export async function getSupportedProviders(): Promise<string[]> {
  const providers = tts.getProviders();
  return providers
    .filter((provider) => provider.createVoice !== undefined)
    .map((provider) => provider.id);
}
