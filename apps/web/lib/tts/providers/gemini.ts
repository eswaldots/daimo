import { BaseTTSProvider } from "./base";
import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
} from "../types";

// Import static voices from existing google.ts (which is actually Gemini voices)
//

interface GeminiVoice {
  id: string;
  name: string;
  description: string;
  color: string;
  provider: string;
}

export const GEMINI_VOICES: GeminiVoice[] = [
  {
    id: "Zephyr",
    name: "Zephyr",
    description: "Bright",
    color: "bg-yellow-100",
    provider: "gemini",
  },
  {
    id: "Puck",
    name: "Puck",
    description: "Upbeat",
    color: "bg-orange-100",
    provider: "gemini",
  },
  {
    id: "Charon",
    name: "Charon",
    description: "Informative",
    color: "bg-blue-100",
    provider: "gemini",
  },
  {
    id: "Kore",
    name: "Kore",
    description: "Firm",
    color: "bg-gray-100",
    provider: "gemini",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    description: "Excitable",
    color: "bg-red-100",
    provider: "gemini",
  },
  {
    id: "Leda",
    name: "Leda",
    description: "Youthful",
    color: "bg-pink-100",
    provider: "gemini",
  },
  {
    id: "Orus",
    name: "Orus",
    description: "Firm",
    color: "bg-slate-100",
    provider: "gemini",
  },
  {
    id: "Aoede",
    name: "Aoede",
    description: "Breezy",
    color: "bg-sky-100",
    provider: "gemini",
  },
  {
    id: "Callirrhoe",
    name: "Callirrhoe",
    description: "Easy-going",
    color: "bg-green-100",
    provider: "gemini",
  },
  {
    id: "Autonoe",
    name: "Autonoe",
    description: "Bright",
    color: "bg-amber-100",
    provider: "gemini",
  },
  {
    id: "Enceladus",
    name: "Enceladus",
    description: "Breathy",
    color: "bg-cyan-100",
    provider: "gemini",
  },
  {
    id: "Iapetus",
    name: "Iapetus",
    description: "Clear",
    color: "bg-white",
    provider: "gemini",
  },
  {
    id: "Umbriel",
    name: "Umbriel",
    description: "Easy-going",
    color: "bg-emerald-100",
    provider: "gemini",
  },
  {
    id: "Algieba",
    name: "Algieba",
    description: "Smooth",
    color: "bg-violet-100",
    provider: "gemini",
  },
  {
    id: "Despina",
    name: "Despina",
    description: "Smooth",
    color: "bg-purple-100",
    provider: "gemini",
  },
  {
    id: "Erinome",
    name: "Erinome",
    description: "Clear",
    color: "bg-neutral-100",
    provider: "gemini",
  },
  {
    id: "Algenib",
    name: "Algenib",
    description: "Gravelly",
    color: "bg-stone-100",
    provider: "gemini",
  },
  {
    id: "Rasalgethi",
    name: "Rasalgethi",
    description: "Informative",
    color: "bg-indigo-100",
    provider: "gemini",
  },
  {
    id: "Laomedeia",
    name: "Laomedeia",
    description: "Upbeat",
    color: "bg-lime-100",
    provider: "gemini",
  },
  {
    id: "Achernar",
    name: "Achernar",
    description: "Soft",
    color: "bg-rose-100",
    provider: "gemini",
  },
  {
    id: "Alnilam",
    name: "Alnilam",
    description: "Firm",
    color: "bg-zinc-100",
    provider: "gemini",
  },
  {
    id: "Schedar",
    name: "Schedar",
    description: "Even",
    color: "bg-teal-100",
    provider: "gemini",
  },
  {
    id: "Gacrux",
    name: "Gacrux",
    description: "Mature",
    color: "bg-brown-100",
    provider: "gemini",
  },
  {
    id: "Pulcherrima",
    name: "Pulcherrima",
    description: "Forward",
    color: "bg-fuchsia-100",
    provider: "gemini",
  },
  {
    id: "Achird",
    name: "Achird",
    description: "Friendly",
    color: "bg-yellow-100",
    provider: "gemini",
  },
  {
    id: "Zubenelgenubi",
    name: "Zubenelgenubi",
    description: "Casual",
    color: "bg-orange-100",
    provider: "gemini",
  },
  {
    id: "Vindemiatrix",
    name: "Vindemiatrix",
    description: "Gentle",
    color: "bg-green-100",
    provider: "gemini",
  },
  {
    id: "Sadachbia",
    name: "Sadachbia",
    description: "Lively",
    color: "bg-red-100",
    provider: "gemini",
  },
  {
    id: "Sadaltager",
    name: "Sadaltager",
    description: "Knowledgeable",
    color: "bg-blue-100",
    provider: "gemini",
  },
  {
    id: "Sulafat",
    name: "Sulafat",
    description: "Warm",
    color: "bg-orange-100",
    provider: "gemini",
  },
];

export class GeminiTTSProvider extends BaseTTSProvider {
  id = "gemini";
  name = "Google Gemini";

  protected requiredEnvVars: string[] = [];

  async getVoices(options?: VoiceOptions): Promise<Voice[]> {
    // Gemini voices are static, no API key needed for listing

    let voices = GEMINI_VOICES;

    // Apply search filter if provided
    if (options?.q) {
      const query = options.q.toLowerCase();
      voices = voices.filter(
        (voice: GeminiVoice) =>
          voice.name.toLowerCase().includes(query) ||
          voice.description.toLowerCase().includes(query) ||
          voice.provider.toLowerCase().includes(query),
      );
    }

    // Convert to Voice format
    return voices.map((voice: GeminiVoice) => ({
      id: this.formatVoiceId(voice.id),
      provider: this.id,
      name: voice.name,
      displayName: voice.name,
      description: voice.description,
      tags: [voice.description, voice.provider],
      metadata: {
        color: voice.color,
        provider: voice.provider,
      },
    }));
  }

  async synthesizeSpeech(
    request: SynthesizeRequest,
  ): Promise<SynthesizeResponse> {
    const voiceId = this.extractVoiceId(request.voiceId);
    const voice = GEMINI_VOICES.find((v: GeminiVoice) => v.id === voiceId);

    if (!voice) {
      throw new Error(`Voice ${voiceId} not found for Gemini provider`);
    }

    const apiKey = process.env.GEMINI_API_KEY!;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
      {
        headers: {
          "x-goog-api-key": apiKey,
        },
        method: "POST",
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.text || "Say cheerfully: Have a wonderful day!",
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: request.voiceId,
                },
              },
            },
          },
          model: "gemini-2.5-flash-preview-tts",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Gemini TTS API error: ${response.status} ${await response.text()}`,
      );
    }

    const data = await response.json();
    const base64Audio = data.candidates[0].content.parts[0].inlineData.data;
    const mimeType =
      data.candidates[0].content.parts[0].inlineData.mimeType || "audio/wav";

    return {
      audioContent: `data:audio/wav;base64,${base64Audio}`,
      mimeType,
      durationMs: undefined, // Gemini doesn't return duration in response
      metadata: {
        provider: this.id,
        voiceId,
      },
    };
  }

  // Note: Gemini doesn't support custom voice creation via this API
}
