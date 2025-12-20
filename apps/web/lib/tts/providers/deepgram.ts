import { BaseTTSProvider } from "./base";
import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
} from "../types";

interface DeepgramVoice {
  name: string;
  language: string;
  gender: "male" | "female";
  model: string;
  description?: string;
}

export class DeepgramTTSProvider extends BaseTTSProvider {
  id = "deepgram";
  name = "Deepgram Nova";

  protected requiredEnvVars = ["DEEPGRAM_API_KEY"];

  // Deepgram's available voices (static list as their API doesn't have a voices endpoint)
  private readonly availableVoices: DeepgramVoice[] = [
    {
      name: "asteria",
      language: "en-US",
      gender: "female",
      model: "aura-2",
      description: "Warm and clear",
    },
    {
      name: "luna",
      language: "en-US",
      gender: "female",
      model: "aura-2",
      description: "Bright and friendly",
    },
    {
      name: "stellara",
      language: "en-US",
      gender: "female",
      model: "aura-2",
      description: "Professional and articulate",
    },
    {
      name: "athena",
      language: "en-US",
      gender: "female",
      model: "aura-2",
      description: "Confident and authoritative",
    },
    {
      name: "hera",
      language: "en-US",
      gender: "female",
      model: "aura-2",
      description: "Calm and reassuring",
    },
    {
      name: "orion",
      language: "en-US",
      gender: "male",
      model: "aura-2",
      description: "Deep and resonant",
    },
    {
      name: "archer",
      language: "en-US",
      gender: "male",
      model: "aura-2",
      description: "Clear and professional",
    },
    {
      name: "sage",
      language: "en-US",
      gender: "male",
      model: "aura-2",
      description: "Warm and knowledgeable",
    },
    {
      name: "nova",
      language: "en-US",
      gender: "female",
      model: "nova-2",
      description: "Default voice",
    },
    {
      name: "apollo",
      language: "en-US",
      gender: "male",
      model: "aura-2",
      description: "Strong and commanding",
    },
  ];

  async getVoices(options?: VoiceOptions): Promise<Voice[]> {
    this.validateConfig();

    let voices = this.availableVoices;

    // Apply search filter if provided
    if (options?.q) {
      const query = options.q.toLowerCase();
      voices = voices.filter(
        (voice) =>
          voice.name.toLowerCase().includes(query) ||
          voice.language.toLowerCase().includes(query) ||
          voice.gender.toLowerCase().includes(query) ||
          (voice.description &&
            voice.description.toLowerCase().includes(query)),
      );
    }

    // Apply limit if provided
    if (options?.limit) {
      voices = voices.slice(0, options.limit);
    }

    return voices.map((voice) => ({
      id: this.formatVoiceId(voice.name),
      provider: this.id,
      name: voice.name,
      languageCode: voice.language,
      displayName: `${voice.name} (${voice.gender})`,
      description:
        voice.description || `${voice.gender} voice for ${voice.language}`,
      tags: [voice.gender, voice.language, voice.model],
      metadata: {
        model: voice.model,
        gender: voice.gender,
      },
    }));
  }

  async synthesizeSpeech(
    request: SynthesizeRequest,
  ): Promise<SynthesizeResponse> {
    this.validateConfig();

    const voiceId = this.extractVoiceId(request.voiceId);
    const apiKey = process.env.DEEPGRAM_API_KEY!;

    // Find the voice in our available voices
    const voice = this.availableVoices.find((v) => v.name === voiceId);
    if (!voice) {
      throw new Error(`Voice ${voiceId} not found for Deepgram provider`);
    }

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${voice.model}-${voice.name}-${voice.language.split("-")[0]}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: request.text,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Deepgram TTS API error: ${response.status} ${await response.text()}`,
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      audioContent: base64Audio,
      mimeType: "audio/wav",
      durationMs: undefined, // Deepgram doesn't return duration in response
      metadata: {
        provider: this.id,
        voice: voice.name,
        model: voice.model,
      },
    };
  }
}
