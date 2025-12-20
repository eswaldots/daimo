export interface Voice {
  id: string; // Unique identifier including provider prefix: "provider:voice-id"
  provider: string; // Provider ID: "gemini", "cartesia", "deepgram", "inworld"
  name: string;
  langCode?: string; // BCP-47 language code: "en-US", "es-ES"
  displayName: string;
  description: string;
  tags: string[];
  metadata?: Record<string, any>; // Provider-specific metadata
}

export interface SynthesizeRequest {
  voiceId: string; // Format: "provider:voice-id"
  text: string;
  options?: {
    speed?: number; // 0.25 to 4.0
    pitch?: number; // -20 to 20 semitones
    volume?: number; // 0.0 to 1.0
    [key: string]: any; // Provider-specific options
  };
}

export interface SynthesizeResponse {
  audioContent: string; // Base64 encoded audio
  mimeType: string; // "audio/mpeg", "audio/wav", "audio/ogg"
  durationMs?: number;
  metadata?: Record<string, any>;
}

export interface VoiceOptions {
  q?: string;
  limit?: number;
  provider?: string; // Filter by provider
}

export interface TTSProvider {
  id: string;
  name: string;

  // Check if provider is configured
  isConfigured(): boolean;

  // Get available voices
  getVoices(options?: VoiceOptions): Promise<Voice[]>;

  // Synthesize speech
  synthesizeSpeech(request: SynthesizeRequest): Promise<SynthesizeResponse>;

  // Optional: Create custom voice from audio
  createVoice?(audioFile: File, options: any): Promise<Voice>;

  // Optional: Delete custom voice
  deleteVoice?(voiceId: string): Promise<void>;
}
