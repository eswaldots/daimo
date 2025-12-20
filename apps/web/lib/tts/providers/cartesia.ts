import { BaseTTSProvider } from "./base";
import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
} from "../types";

interface CartesiaVoice {
  id: string;
  is_owner: true;
  is_public: true;
  name: string;
  description: string;
  created_at: string;
  language: string;
  gender: "masculine" | "femenine";
  is_starred: boolean;
}

export class CartesiaTTSProvider extends BaseTTSProvider {
  id = "cartesia";
  name = "Cartesia AI";

  protected requiredEnvVars = ["CARTESIA_API_KEY"];

  async getVoices(options?: VoiceOptions): Promise<Voice[]> {
    this.validateConfig();

    const queryParams = new URLSearchParams();
    if (options?.limit) {
      queryParams.set("limit", options.limit.toString());
    } else {
      queryParams.set("limit", "100");
    }
    queryParams.set("is_owner", "true");

    if (options?.q) {
      queryParams.set("q", options.q);
    }

    const apiKey = process.env.CARTESIA_API_KEY!;
    const response = await fetch(
      `https://api.cartesia.ai/voices?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Cartesia-Version": "2025-04-16",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Cartesia API error: ${response.status} ${await response.text()}`,
      );
    }

    const data: { data: CartesiaVoice[] } = await response.json();

    return data.data.map((voice) => ({
      id: this.formatVoiceId(voice.id),
      provider: this.id,
      name: voice.name,
      langCode: voice.language,
      displayName: voice.name,
      description: voice.description,
      tags: [voice.gender, voice.language],
      metadata: {
        is_owner: voice.is_owner,
        is_public: voice.is_public,
        created_at: voice.created_at,
        is_starred: voice.is_starred,
      },
    }));
  }

  async createVoice(audioFile: File, options: any): Promise<Voice> {
    this.validateConfig();

    const apiKey = process.env.CARTESIA_API_KEY!;
    const formData = new FormData();
    formData.append("clip", audioFile);
    formData.append("name", options.name || "Custom Voice");
    formData.append("description", options.description || "");

    const response = await fetch("https://api.cartesia.ai/voices/clone/clip", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cartesia voice cloning error: ${response.status} ${errorText}`,
      );
    }

    const voiceData = await response.json();

    return {
      id: this.formatVoiceId(voiceData.id),
      provider: this.id,
      name: voiceData.name,
      langCode: options.language || "en",
      displayName: voiceData.name,
      description: voiceData.description || "",
      tags: ["custom"],
      metadata: {
        created_at: new Date().toISOString(),
      },
    };
  }

  async synthesizeSpeech(
    request: SynthesizeRequest,
  ): Promise<SynthesizeResponse> {
    this.validateConfig();

    const voiceId = this.extractVoiceId(request.voiceId);
    const apiKey = process.env.CARTESIA_API_KEY!;

    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Cartesia-Version": "2025-04-16",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "cartesia-tts",
        voice: {
          mode: "id",
          id: voiceId,
        },
        text: request.text,
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 24000,
        },
        ...(request.options || {}),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Cartesia TTS API error: ${response.status} ${await response.text()}`,
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return {
      audioContent: base64Audio,
      mimeType: "audio/pcm",
      durationMs: undefined, // Cartesia doesn't return duration in response
      metadata: {
        provider: this.id,
        voiceId,
      },
    };
  }
}
