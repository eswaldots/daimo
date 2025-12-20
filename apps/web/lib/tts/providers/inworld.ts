import { BaseTTSProvider } from "./base";
import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
} from "../types";

interface InworldVoice {
  name: string;
  langCode: string;
  displayName: string;
  description: string;
  tags: string[];
  voiceId: string;
  source: string;
}

export class InworldTTSProvider extends BaseTTSProvider {
  id = "inworld";
  name = "Inworld AI";

  protected requiredEnvVars = ["INWORLD_API_KEY", "INWORLD_WORKSPACE_ID"];

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

    const apiKey = process.env.INWORLD_API_KEY!;
    const workspaceId = process.env.INWORLD_WORKSPACE_ID!;

    const response = await fetch(
      `https://api.inworld.ai/voices/v1/workspaces/${workspaceId}/voices?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Inworld API error: ${response.status} ${await response.text()}`,
      );
    }

    const data: { voices: InworldVoice[] } = await response.json();

    return data.voices.map((voice) => ({
      id: this.formatVoiceId(voice.voiceId),
      provider: this.id,
      name: voice.name,
      langCode: voice.langCode,
      displayName: voice.displayName,
      description: voice.description,
      tags: voice.tags,
      metadata: {
        source: voice.source,
      },
    }));
  }

  async synthesizeSpeech(
    request: SynthesizeRequest,
  ): Promise<SynthesizeResponse> {
    this.validateConfig();

    const voiceId = this.extractVoiceId(request.voiceId);
    const apiKey = process.env.INWORLD_API_KEY!;

    const response = await fetch("https://api.inworld.ai/tts/v1/voice", {
      method: "POST",
      headers: {
        Authorization: `Basic ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: request.text || "Hello, this is a test message.",
        voiceId,
        modelId: "inworld-tts-1-max",
        timestampType: "WORD",
        ...(request.options || {}),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Inworld TTS API error: ${response.status} ${await response.text()}`,
      );
    }

    const data = await response.json();

    // Inworld returns audio content directly in the response
    return {
      audioContent: data.audioContent,
      mimeType: "audio/mpeg", // Inworld returns MP3
      durationMs: data.durationMs,
      metadata: {
        provider: this.id,
        voiceId,
        modelId: "inworld-tts-1-max",
      },
    };
  }

  // Inworld supports custom voice creation via their API
  async createVoice(audioFile: File, options: any): Promise<Voice> {
    this.validateConfig();

    const apiKey = process.env.INWORLD_API_KEY!;
    const workspaceId = process.env.INWORLD_WORKSPACE_ID!;

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("name", options.name || "Custom Voice");
    formData.append("description", options.description || "");
    formData.append("language", options.language || "en-US");

    const response = await fetch(
      `https://api.inworld.ai/voices/v1/workspaces/${workspaceId}/voices`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${apiKey}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Inworld voice creation error: ${response.status} ${await response.text()}`,
      );
    }

    const voiceData: InworldVoice = await response.json();

    return {
      id: this.formatVoiceId(voiceData.voiceId),
      provider: this.id,
      name: voiceData.name,
      langCode: voiceData.langCode,
      displayName: voiceData.displayName,
      description: voiceData.description,
      tags: voiceData.tags,
      metadata: {
        source: voiceData.source,
      },
    };
  }
}
