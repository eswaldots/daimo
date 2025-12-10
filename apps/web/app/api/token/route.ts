import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const roomName = "sala-prueba-1";
  const participantName = "Usuario-" + Math.floor(Math.random() * 1000);

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: participantName,
    },
  );

  at.addGrant({ roomJoin: true, room: roomName });

  return NextResponse.json({
    token: at.toJwt(),
    url: process.env.NEXT_PUBLIC_LIVEKIT_URL, // Asegúrate de tener esta variable
  });
}
