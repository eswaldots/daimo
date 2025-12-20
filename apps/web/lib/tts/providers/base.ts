import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
  TTSProvider,
} from "../types";

// Interface for legacy voice format (compatibility with existing code)
export interface LegacyVoice {
  name: string;
  langCode?: string;
  displayName: string;
  description: string;
  tags: string[];
  voiceId: string;
  source: string;
}

export abstract class BaseTTSProvider implements TTSProvider {
  abstract id: string;
  abstract name: string;

  // Environment variables required for this provider
  protected abstract requiredEnvVars: string[];

  abstract getVoices(options?: VoiceOptions): Promise<Voice[]>;
  abstract synthesizeSpeech(
    request: SynthesizeRequest,
  ): Promise<SynthesizeResponse>;

  isConfigured(): boolean {
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        return false;
      }
    }
    return true;
  }

  protected validateConfig(): void {
    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(
          `Missing required environment variable: ${envVar} for provider ${this.id}`,
        );
      }
    }
  }

  protected extractVoiceId(fullVoiceId: string): string {
    // Convert "provider:voice-id" → "voice-id"
    if (fullVoiceId.includes(":")) {
      const parts = fullVoiceId.split(":");
      // Handle case where voiceId might contain colons
      return parts.slice(1).join(":");
    }
    return fullVoiceId;
  }

  protected getProviderPrefix(): string {
    return this.id;
  }

  protected formatVoiceId(voiceId: string): string {
    // Convert "voice-id" → "provider:voice-id"
    return `${this.id}:${voiceId}`;
  }

  protected parseVoiceId(fullVoiceId: string): {
    provider: string;
    voiceId: string;
  } {
    if (fullVoiceId.includes(":")) {
      const parts = fullVoiceId.split(":");
      const provider = parts[0]!.trim() || this.id; // Use non-null assertion, trim empty strings
      const voiceId = parts.slice(1).join(":") || fullVoiceId;
      return { provider, voiceId };
    }
    // Default to current provider if no prefix
    return { provider: this.id, voiceId: fullVoiceId };
  }

  // Helper to convert Voice to legacy format (for compatibility with existing code)
  toLegacyVoice(voice: Voice): LegacyVoice {
    return {
      name: voice.name,
      langCode: voice.langCode,
      displayName: voice.displayName,
      description: voice.description,
      tags: voice.tags,
      voiceId: voice.id, // Already includes provider prefix
      source: voice.provider,
    };
  }

  // Helper to create Voice from legacy format
  fromLegacyVoice(legacyVoice: LegacyVoice): Voice {
    const name = legacyVoice.name;
    const voiceId = legacyVoice.voiceId || `${this.id}:${name}`;

    return {
      id: voiceId,
      provider: this.id,
      name,
      langCode: legacyVoice.langCode,
      displayName: legacyVoice.displayName,
      description: legacyVoice.description,
      tags: legacyVoice.tags,
      metadata: { source: "legacy" },
    };
  }
}
