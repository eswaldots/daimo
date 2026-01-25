"use server";

import {
  AccessToken,
  RoomServiceClient,
  type AccessTokenOptions,
  type VideoGrant,
} from "livekit-server-sdk";
import * as Sentry from "@sentry/nextjs";
import { fetchQuery } from "convex/nextjs";
import { api, Id } from "@daimo/backend";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth/auth-server";
import { getServerSession } from "@/lib/auth/session-server";

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const createToken = async ({
  characterId,
  isFirstTime,
}: {
  characterId: Id<"characters">;
  isFirstTime: boolean;
}) => {
  try {
    if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
      throw new Error("Missing LiveKit environment variables");
    }

    const session = await getServerSession();

    if (!session) {
      throw new Error("El usuario no esta autenticado");
    }

    const subscription = await fetchAuthQuery(
      api.subscriptions.getCurrentSubscription,
    );

    if (!characterId) {
      throw new Error("characterId es requerido");
    }

    const character = await fetchQuery(api.characters.getById, {
      characterId: characterId as Id<"characters">,
    });

    if (!character) {
      throw new Error("Personaje no encontrado");
    }

    if (
      character.accessType === "premium" &&
      (!subscription || subscription?.planId !== "premium")
    ) {
      throw new Error(
        "No posees el nivel suficiente para acceder a este personaje",
      );
    }

    const conversationId = await fetchAuthMutation(
      api.agent.conversation.createConversation,
      {
        characterId: character._id,
      },
    );

    const participantName = "user";
    // TODO: el padre puede entrar a la misma sala que el usuario en futuras versiones de daimo, asi que arreglar esto
    const participantIdentity = `user_${session.user.id}`;
    // TODO: usar id de conversacion
    const roomName = `${conversationId}`;

    const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);

    // Creamos la sala explícitamente para pegarle la metadata
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60, // La sala se cierra si nadie entra en 60s
      metadata: JSON.stringify({
        characterId, // <--- AQUÍ VA TU METADATA PARA EL AGENTE
        userId: session.user.id,
        conversationId,
        isFirstTime,
      }),
    });

    // 3. Generar el token (Esto sigue igual)
    const participantToken = await createParticipantToken(
      { identity: participantIdentity, name: participantName },
      roomName,
    );

    const data: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken,
      participantName,
    };

    return data;
  } catch (error) {
    Sentry.captureException(error);

    throw new Error("Error interno en el servidor");
  }
};

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
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

  return at.toJwt();
}
