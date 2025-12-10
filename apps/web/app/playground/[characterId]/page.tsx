// "use client";

// import { api } from "@daimo/backend";
// import { useQuery } from "convex/react";
// import { useParams } from "next/navigation";
// import { Id } from "../../../../../packages/backend/convex/_generated/dataModel";
// import Image from "next/image";

// export default function Page() {
//   const { characterId } = useParams();
//   const character = useQuery(api.characters.getById, {
//     characterId: characterId as Id<"characters">,
//   });

//   return (
//     <div className="h-screen flex flex-col  items-center py-48 justify-start w-screen">
//       <Image
//         src={character?.storageUrl ?? ""}
//         className="object-cover object-[50%_25%]"
//         alt="characterName"
//         fill
//       />

//       <div className="flex flex-col items-center z-20">
//         <div className="text-center space-y-2">
//           <h1 className="text-4xl text-white tracking-tight font-medium">
//             {character?.name}
//           </h1>
//           <p className="text-lg text-white/50 max-w-48">
//             {character?.shortDescription}
//           </p>
//         </div>
//       </div>

//       <div className="absolute top-1/2 -translate-y-1/2 z-20 rounded-full size-48">
//         <Image
//           src={character?.storageUrl ?? ""}
//           className="object-cover object-[50%_25%] rounded-full"
//           alt="characterName"
//           fill
//         />
//       </div>

//       <div className="absolute inset-0 backdrop-blur-[140px] z-10 bg-black/50" />
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo } from "react";
import { TokenSource } from "livekit-client";
import {
  BarVisualizer,
  ControlBar,
  RoomAudioRenderer,
  SessionProvider,
  useAgent,
  useSession,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useParams } from "next/navigation";

export default function Page() {
  const { characterId } = useParams();

  const tokenSource = useMemo(() => {
    return TokenSource.endpoint(
      `/api/connection-details?characterId=${characterId}`,
    );
  }, [characterId]);

  const session = useSession(tokenSource);

  useEffect(() => {
    session.start();
    return () => {
      session.end();
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <div data-lk-theme="default" style={{ height: "100vh" }}>
        {/* Your custom component with basic video agent functionality. */}
        <MyAgentView />
        {/* Controls for the user to start/stop audio and disconnect from the session */}
        <ControlBar
          controls={{ microphone: true, camera: false, screenShare: false }}
        />
        {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
        <RoomAudioRenderer />
      </div>
    </SessionProvider>
  );
}

function MyAgentView() {
  const agent = useAgent();
  return (
    <div style={{ height: "350px" }}>
      <p>Agent state: {agent.state}</p>
      {/* Renders a visualizer for the agent's audio track */}
      {agent.canListen && (
        <BarVisualizer
          track={agent.microphoneTrack}
          state={agent.state}
          barCount={5}
        />
      )}
    </div>
  );
}
