"use node";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { RoomServiceClient } from "livekit-server-sdk";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_SECRET_KEY!,
);

export const cleanDeadConversations = internalAction({
  handler: async (ctx) => {
    const liveRooms = await ctx.runQuery(
      internal.agent.conversation.getLiveConversations,
    );

    const rooms = await roomService.listRooms(
      liveRooms.map((room) => room._id),
    );

    await Promise.all(
      liveRooms.map(async (liveRoom) => {
        const isReallyActive = rooms.find((room) => room.name === liveRoom._id);

        if (!isReallyActive) {
          await ctx.runMutation(
            internal.agent.conversation.internalUpdateConversationState,
            { conversationId: liveRoom._id, isLive: false },
          );
        }
      }),
    );
  },
});
