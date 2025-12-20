"use server";

import { tts } from "./tts";
import type { Voice as NewVoice } from "./tts";

// Keep original interface for backward compatibility
export interface Voice {
  name: string;
  langCode?: string;
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

/**
 * Convert a voice from the new TTS format to the legacy Voice shape.
 *
 * @param voice - The voice object in the new `NewVoice` format to convert
 * @returns A legacy `Voice` object with `voiceId` mapped from `id` and `source` from `provider`
 */
function toLegacyVoice(voice: NewVoice): Voice {
  return {
    name: voice.name,
    langCode: voice.langCode,
    displayName: voice.displayName,
    description: voice.description,
    tags: voice.tags,
    voiceId: voice.id,
    source: voice.provider,
  };
}

/**
 * Convert a legacy Voice object into the new NewVoice format.
 *
 * @param legacyVoice - The legacy voice to convert.
 * @returns A NewVoice with fields mapped from the legacy voice; `id` is populated from `voiceId`, `provider` from `source`, and `metadata.source` set to `"legacy"`.
 */
function fromLegacyVoice(legacyVoice: Voice): NewVoice {
  return {
    id: legacyVoice.voiceId,
    provider: legacyVoice.source,
    name: legacyVoice.name,
    langCode: legacyVoice.langCode,
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

/**
 * Creates a custom TTS voice from uploaded audio using the specified provider.
 *
 * Expects `formData` to include the following keys:
 * - `provider` (optional): provider ID to use (defaults to "inworld")
 * - `name` (optional): display name for the custom voice (defaults to "Custom Voice")
 * - `description` (optional): descriptive text for the voice
 * - `language` (optional): BCP-47 language tag (defaults to "en-US")
 * - `audio` (required): audio File containing the voice sample
 *
 * @param formData - FormData containing provider, name, description, language and the audio file
 * @returns The newly created voice converted to the legacy Voice format
 * @throws Error if the `audio` file is missing
 * @throws Error if the specified provider is not found or not configured
 * @throws Error if the specified provider does not support custom voice creation
 */
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

/**
 * List provider IDs that support creating custom voices.
 *
 * @returns An array of provider IDs that expose a `createVoice` function
 */
export async function getSupportedProviders(): Promise<string[]> {
  const providers = tts.getProviders();
  return providers
    .filter((provider) => provider.createVoice !== undefined)
    .map((provider) => provider.id);
}