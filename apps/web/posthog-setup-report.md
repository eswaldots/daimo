# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into your Daimo project. This integration includes client-side analytics via `posthog-js`, server-side tracking capability via `posthog-node`, automatic pageview and session tracking, exception capturing, and a reverse proxy configuration to improve tracking reliability.

## Integration Summary

The following changes were made to integrate PostHog:

1. **Client-side initialization** (`instrumentation-client.ts`): Added PostHog JS SDK initialization with exception capturing and debug mode for development.

2. **Server-side client** (`lib/posthog-server.ts`): Created a server-side PostHog client for capturing events from API routes and server components.

3. **Reverse proxy** (`next.config.ts`): Configured Next.js rewrites to proxy PostHog requests through `/ingest/*`, reducing the chance of ad blockers intercepting analytics.

4. **Environment variables** (`.env`): Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` for configuration.

## Events Instrumented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `user_signed_up` | User completes account registration via email or Google OAuth | `app/(auth)/sign-up/page.tsx` |
| `user_signup_failed` | User signup attempt fails with error | `app/(auth)/sign-up/page.tsx` |
| `user_signed_in` | User successfully logs into their account | `app/(auth)/sign-in/page.tsx` |
| `user_signin_failed` | User login attempt fails with error | `app/(auth)/sign-in/page.tsx` |
| `user_signed_out` | User logs out of their account | `components/layout/home/nav-user.tsx` |
| `upgrade_to_pro_clicked` | User clicks upgrade to pro option | `components/layout/home/nav-user.tsx` |
| `character_created` | User creates a new AI character | `components/characters/create-character.tsx` |
| `character_edited` | User edits an existing AI character | `components/characters/create-character.tsx` |
| `character_conversation_started` | User initiates voice conversation with a character | `components/characters/character-card.tsx` |
| `character_voice_preview_played` | User plays voice preview from character card | `components/characters/character-card.tsx` |
| `voice_created` | User creates a custom voice using audio upload | `components/voices/create-voice.tsx` |
| `chat_message_sent` | User sends a text message in playground chat | `components/playground/agent-control-bar/chat-input.tsx` |
| `session_ended` | User ends the voice conversation session | `components/playground/session-view.tsx` |
| `agent_error_occurred` | An error occurs during AI agent voice session | `hooks/use-agent-errors.tsx` |

## User Identification

User identification is implemented on:
- **Sign up**: Users are identified by email with their name as a property
- **Sign in**: Users are identified by email
- **Sign out**: PostHog session is reset via `posthog.reset()`

## Error Tracking

Exception capturing is enabled via:
- Global `capture_exceptions: true` in PostHog initialization
- Manual `posthog.captureException()` calls for:
  - Character creation/edit failures
  - Voice creation failures
  - Chat message send failures
  - Agent session failures

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/270009/dashboard/926274) - Main dashboard with all key metrics

### Insights
- [User Signups & Logins Over Time](https://us.posthog.com/project/270009/insights/wAJ0Tqat) - Daily trends of user acquisition and engagement
- [Sign Up to Conversation Funnel](https://us.posthog.com/project/270009/insights/oRDMnVR9) - Conversion funnel tracking signup to first conversation
- [Character Engagement](https://us.posthog.com/project/270009/insights/QGNGHWTr) - Character creation, voice previews, and conversation starts
- [Session Activity](https://us.posthog.com/project/270009/insights/ZeBIYL5P) - Chat messages and session completion tracking
- [Agent Errors](https://us.posthog.com/project/270009/insights/4ABpr5yd) - System health monitoring for agent failures

## Files Modified

- `instrumentation-client.ts` - Added PostHog client initialization
- `lib/posthog-server.ts` - Created server-side PostHog client (new file)
- `next.config.ts` - Added reverse proxy rewrites
- `app/(auth)/sign-up/page.tsx` - Added signup tracking and user identification
- `app/(auth)/sign-in/page.tsx` - Added signin tracking and user identification
- `components/layout/home/nav-user.tsx` - Added logout and upgrade tracking
- `components/characters/create-character.tsx` - Added character creation/edit tracking
- `components/characters/character-card.tsx` - Added conversation and voice preview tracking
- `components/voices/create-voice.tsx` - Added voice creation tracking
- `components/playground/agent-control-bar/chat-input.tsx` - Added chat message tracking
- `components/playground/session-view.tsx` - Added session end tracking
- `hooks/use-agent-errors.tsx` - Added agent error tracking

## Packages Added

- `posthog-js` - Client-side analytics SDK
- `posthog-node` - Server-side analytics SDK
