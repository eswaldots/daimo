"use server";

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
      Authorization: `Basic ${process.env.INWORLD_API_KEY}`,
    },
  };

  const res = await fetch(
    `https://api.inworld.ai/voices/v1/workspaces/${process.env.INWORLD_WORKSPACE_ID}/voices`,
    options,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch voices: ${res.status} ${res.statusText}`);
  }

  const data: { voices: Voice[] } = await res.json();
  return data;
};

export const getVoicesFromGoogle = async (opts: Options) => {
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
      Authorization: `Basic ${process.env.INWORLD_API_KEY}`,
    },
  };

  const res = await fetch(
    `https://api.inworld.ai/voices/v1/workspaces/${process.env.INWORLD_WORKSPACE_ID}/voices`,
    options,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch voices: ${res.status} ${res.statusText}`);
  }

  const data: { voices: Voice[] } = await res.json();
  return data;
};

export const playVoice = async (voiceId: string, sound?: string) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${process.env.INWORLD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: sound ?? "Hola amigo, espero que estes teniendo un buen día",
      voiceId,
      modelId: "inworld-tts-1-max",
      timestampType: "WORD",
    }),
  };

  const res = await fetch("https://api.inworld.ai/tts/v1/voice", options);

  if (!res.ok) {
    throw new Error(`Failed to play voice: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  console.log(data);
  return data.audioContent as string;
};
