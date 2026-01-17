import { useEffect } from "react";
import { useAgent, useSessionContext } from "@livekit/components-react";
import * as Sentry from "@sentry/nextjs";
import { toast } from "sonner";
import posthog from "posthog-js";
import { useRouter } from "next/navigation";

export function useAgentErrors() {
  const agent = useAgent();
  const router = useRouter();
  const { isConnected, end } = useSessionContext();

  useEffect(() => {
    if (isConnected && agent.state === "failed") {
      const reasons = agent.failureReasons;

      // Track agent error in PostHog
      posthog.capture("agent_error_occurred", {
        failure_reasons: reasons,
        failure_count: reasons.length,
      });

      // Also capture as an exception for error tracking
      const errorMessage = reasons.join("; ");
      Sentry.captureException(new Error(`Agent failed: ${errorMessage}`));

      toast.warning("Session finalizada", {
        description: (
          <>
            {reasons.length > 1 && (
              <ul className="list-inside list-disc">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {reasons.length === 1 && <p className="w-full">{reasons[0]}</p>}
            <p className="w-full">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.livekit.io/agents/start/voice-ai/"
                className="whitespace-nowrap underline"
              >
                Contacte con soporte
              </a>
              .
            </p>
          </>
        ),
      });

      end();

      router.back();
    }
  }, [agent, isConnected, end]);
}
