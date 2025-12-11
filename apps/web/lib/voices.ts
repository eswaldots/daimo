"use server";

export interface Voice {
  id: string;
  mode: string;
  owner_id: string;
  is_public: boolean;
  name: string;
  description: string;
  created_at: Date;
  gender: string;
  embedding: number[];
  language: string;
  popularity: number;
}

type Options = {
  q?: string;
  limit?: string;
};

export const getVoices = async (opts: Options) => {
  const queryParams = new URLSearchParams({
    limit: opts?.limit || "10",
    is_owner: "true",
  });

  // 2. Solo agregamos 'q' si existe y no es una cadena vacía
  if (opts?.q) {
    queryParams.append("q", opts.q);
  }

  const options = {
    method: "GET",
    headers: {
      "Cartesia-Version": "2025-04-16",
      Authorization: `Bearer ${process.env.CARTESIA_API_KEY}`,
    },
    // 3. Importante: Evitar caché de Next.js para que la búsqueda sea en tiempo real
    cache: "no-store" as RequestCache,
  };

  // 4. Construimos la URL final con toString()
  const res = await fetch(
    `https://api.cartesia.ai/voices?${queryParams.toString()}`,
    options,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch voices: ${res.status} ${res.statusText}`);
  }

  const data: { data: Voice[]; has_more: boolean } = await res.json();
  return data;
};

export const playVoice = async (voiceId: string, sound?: string) => {
  const options = {
    method: "POST",
    headers: {
      "Cartesia-Version": "2025-04-16",
      Authorization: `Bearer ${process.env.CARTESIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_id: "sonic-3",
      transcript:
        sound ||
        '<emotion value="positivity">Hola amigo, espero que estes teniendo un buen día!</emotion>',
      voice: { mode: "id", id: voiceId },
      output_format: {
        container: "wav",
        encoding: "pcm_s16le",
        sample_rate: 44100,
      },
      language: "es",
      generation_config: { volume: 1, speed: 1 },
      save: false,
      speed: "normal",
    }),
  };

  const res = await fetch("https://api.cartesia.ai/tts/bytes", options);

  if (!res.ok) {
    throw new Error(`Failed to play voice: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  return blob;
};
