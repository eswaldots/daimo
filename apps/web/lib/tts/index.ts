import {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
  TTSProvider,
} from "./types";

// Import providers from the index file
import {
  GeminiTTSProvider,
  CartesiaTTSProvider,
  DeepgramTTSProvider,
  InworldTTSProvider,
} from "./providers";

class TTSRegistry {
  private providers = new Map<string, TTSProvider>();

  constructor() {
    this.registerDefaultProviders();
  }

  private registerDefaultProviders() {
    // Register all available providers
    const availableProviders = [
      new GeminiTTSProvider(),
      new CartesiaTTSProvider(),
      new DeepgramTTSProvider(),
      new InworldTTSProvider(),
    ];

    for (const provider of availableProviders) {
      if (provider.isConfigured()) {
        this.providers.set(provider.id, provider);
      }
    }
  }

  register(provider: TTSProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): TTSProvider | undefined {
    return this.providers.get(id);
  }

  getProviders(): TTSProvider[] {
    return Array.from(this.providers.values());
  }

  getProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  // Get voices from all providers or specific provider
  async getVoices(options?: VoiceOptions): Promise<Voice[]> {
    const providerId = options?.provider;
    let providers: TTSProvider[];

    if (providerId) {
      const provider = this.getProvider(providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found or not configured`);
      }
      providers = [provider];
    } else {
      providers = this.getProviders();
    }

    const allVoices: Voice[] = [];

    // Fetch voices from each provider in parallel
    const promises = providers.map(async (provider) => {
      try {
        const voices = await provider.getVoices(options);
        return voices;
      } catch (error) {
        console.error(
          `Error fetching voices from provider ${provider.id}:`,
          error,
        );
        return [];
      }
    });

    const results = await Promise.all(promises);
    for (const voices of results) {
      allVoices.push(...voices);
    }

    // Apply search filter if provided
    if (options?.q) {
      const query = options.q.toLowerCase();
      return allVoices.filter(
        (voice) =>
          voice.name.toLowerCase().includes(query) ||
          voice.displayName.toLowerCase().includes(query) ||
          voice.description.toLowerCase().includes(query) ||
          voice?.langCode?.toLowerCase().includes(query) ||
          voice.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply limit if provided
    if (options?.limit) {
      return allVoices.slice(0, options.limit);
    }

    return allVoices;
  }

  // Synthesize speech, automatically detecting provider from voiceId
  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResponse> {
    const voiceId = request.voiceId;

    // Parse provider from voiceId
    let providerId: string;
    let actualVoiceId: string;

    if (voiceId.includes(":")) {
      const parts = voiceId.split(":");
      providerId = parts[0] || "inworld"; // Default provider if empty
      actualVoiceId = parts.slice(1).join(":") || voiceId;
    } else {
      // Default to first available provider
      const providers = this.getProviders();
      if (providers.length === 0) {
        throw new Error("No TTS providers configured");
      }
      providerId = providers[0]!.id;
      actualVoiceId = voiceId;
    }

    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(
        `Provider ${providerId} not found for voiceId ${voiceId}`,
      );
    }

    // Create new request with extracted voiceId
    const providerRequest = {
      ...request,
      voiceId: actualVoiceId,
    };

    return provider.synthesizeSpeech(providerRequest);
  }

  // Play voice (wrapper for synthesize + AudioContext)
  async playVoice(voiceId: string, text?: string): Promise<void> {
    const response = await this.synthesize({
      voiceId,
      text: text || "Hello, this is a test message.",
    });

    // Decode and play audio
    const binaryString = atob(response.audioContent);
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
  }
}

// Create singleton instance
const registry = new TTSRegistry();

// Public API
export const tts = {
  getProviders: () => registry.getProviders(),
  getProvider: (id: string) => registry.getProvider(id),
  getVoices: (options?: VoiceOptions) => registry.getVoices(options),
  synthesize: (request: SynthesizeRequest) => registry.synthesize(request),
  playVoice: (voiceId: string, text?: string) =>
    registry.playVoice(voiceId, text),
};

// Export types
export type {
  Voice,
  SynthesizeRequest,
  SynthesizeResponse,
  VoiceOptions,
  TTSProvider,
};
