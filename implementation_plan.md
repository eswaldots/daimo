# IMPL PLAN: TTS Provider Routing

The goal is to implement internal routing in `apps/live/src/agent.py` to select the correct TTS provider based on the character's configuration. This requires persisting the provider information from the frontend to the backend.

## User Review Required
> [!IMPORTANT]
> - I will add a `ttsProvider` field to the `characters` table in the Convex schema.
> - I will populate this field from `voice.source` in the frontend (`create-character.tsx`).
> - In `agent.py`, if `ttsProvider` is 'gemini', I will use the `google.realtime` model (STT/LLM/TTS).
> - For other providers (e.g., 'openai', 'deepgram'), I will use the "Standard Stack": Deepgram STT + Groq LLM + [Variable] TTS.
> - **Assumption**: Supported providers for TTS in "Standard Stack" are `openai`, `deepgram`. If 'inworld' or others are returned, I will default to `deepgram` or need clarification internally (handled via default case).

## Proposed Changes

### Backend (Convex)
#### [MODIFY] [schema.ts](file:///home/ezwal/Documents/daimo/packages/backend/convex/schema.ts)
- Add `ttsProvider: v.optional(v.string())` to `characters` table.

#### [MODIFY] [characters.ts](file:///home/ezwal/Documents/daimo/packages/backend/convex/characters.ts)
- Update `create` and `editCharacter` mutations to accept and store `ttsProvider`.

### Frontend (Web)
#### [MODIFY] [create-character.tsx](file:///home/ezwal/Documents/daimo/apps/web/components/characters/create-character.tsx)
- Extract `voice.source` (or identify provider from voice) and pass it as `ttsProvider` to the mutation.

### Agent (Live)
#### [MODIFY] [agent.py](file:///home/ezwal/Documents/daimo/apps/live/src/agent.py)
- Import `openai` plugin (if not already imported) to support OpenAI TTS.
- Implement routing logic:
  ```python
  provider = character.get("ttsProvider", "deepgram")
  if provider == "gemini":
      session = AgentSession(llm=google.realtime.RealtimeModel(...))
  else:
      # Standard Stack
      stt = deepgram.STT(...)
      llm = groq.LLM(...)
      if provider == "openai":
          tts = openai.TTS(...)
      else:
          tts = deepgram.TTS(...) # Default to Deepgram or handle specific cases
      session = AgentSession(stt=stt, llm=llm, tts=tts, ...)
  ```

## Verification Plan

### Automated Tests
- I will run `pytest apps/live/tests/test_agent.py` (if applicable) to ensure no regressions, although this is mainly logic verification.
- Since this involves DB schema and Realtime API, full automated testing is difficult without a live environment.

### Manual Verification
1.  **Schema**: Verify `npx convex dev` (or equivalent) applies schema without error.
2.  **Frontend**: Create a character with a Gemini voice (if available in Inworld list?) or simulate it. Create another with OpenAI voice.
3.  **DB Check**: Inspect Convex dashboard (or `convex.query`) to see if `ttsProvider` is saved.
4.  **Agent**: Run the agent and connect. Check logs to see "Using Gemini Realtime" vs "Using Standard Stack with [Provider]".
