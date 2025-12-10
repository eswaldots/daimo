import { NextResponse } from "next/server";
import {
  AccessToken,
  RoomServiceClient, // <--- 1. IMPORTANTE: Importar esto
  type AccessTokenOptions,
  type VideoGrant,
} from "livekit-server-sdk";
import { RoomConfiguration } from "@livekit/protocol";

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const revalidate = 0;

export async function POST(req: Request) {
  try {
    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      throw new Error("Missing LiveKit environment variables");
    }

    const body = await req.json();
    const agentName: string = body?.room_config?.agents?.[0]?.agent_name;

    // 1. Obtenemos el ID que manda el frontend
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId");

    const participantName = "user";
    const participantIdentity = `user_${Math.floor(Math.random() * 10_000)}`;
    const roomName = `room_${Math.floor(Math.random() * 10_000)}`;

    // ---------------------------------------------------------
    // 2. NUEVO: Inyectar la Metadata en la Sala usando RoomServiceClient
    // ---------------------------------------------------------
    if (characterId) {
      const roomService = new RoomServiceClient(
        LIVEKIT_URL,
        API_KEY,
        API_SECRET,
      );

      // Creamos la sala explícitamente para pegarle la metadata
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60, // La sala se cierra si nadie entra en 60s
        metadata: JSON.stringify({
          characterId, // <--- AQUÍ VA TU METADATA PARA EL AGENTE
        }),
      });
    }
    // ---------------------------------------------------------

    // 3. Generar el token (Esto sigue igual)
    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName,
      agentName,
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName,
    };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

// ... La función createParticipantToken se queda igual ...
function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string,
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: "15m",
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ agentName }],
    });
  }

  return at.toJwt();
}
