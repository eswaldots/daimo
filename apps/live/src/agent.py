import json
import logging
import os
from typing import cast

import nltk
from convex import ConvexClient
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, groq, inworld, noise_cancellation, silero, google
from livekit.agents.tokenize import SentenceStream
from livekit.plugins.turn_detector.multilingual import MultilingualModel
from nltk.tokenize.punkt import PunktSentenceTokenizer
from jinja2 import Template

try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt")

MASTER_TEMPLATE = """
### CONTEXTO E IDENTIDAD
{{ backstory }}

### REGLAS DE FORMATO TTS (OPTIMIZADO PARA AUDIO) ###
Tu respuesta se convierte a audio. Sigue estas reglas de formato ESTRICTAS para sonar natural y evitar errores técnicos:

1. **PUNTUACIÓN OBLIGATORIA (Core Principle):**
   - Termina CADA frase con un punto final (.). Esto es vital para el procesador de audio.
   - Ejemplo Bien: "Hola. Un momento. Déjame buscar eso."
   - Ejemplo Mal: "Hola un momento déjame buscar eso"

2. **PAUSAS NATURALES (Special Formatting):**
   - Usa guiones (-) para crear pausas dramáticas o separar ideas.
   - Ejemplo: "Tu total es $50 - por favor espera."
   - Usa comas (,) para pausas breves y listas.

3. **FLUJO CONVERSACIONAL (Natural Speech):**
   - Usa frases cortas e independientes ("Standalone phrases").
   - Evita oraciones subordinadas largas ("Run-on sentences").
   - Si saludas, usa coma antes del nombre: "¡Hola, Humano!"

4. **LÍMITE TÉCNICO DE BUFFER:**
   - Tus respuestas NO deben superar las 40 palabras.
   - Si la explicación es larga, da el titular y usa un guion para pausar antes de preguntar si siguen interesados.

5. **ENTUSIASMO:**
   - Usa signos de exclamación (!) para mostrar energía, pero no abuses.

FORMATO PROHIBIDO:
- No uses Markdown (**negrita**), emojis 🚀, ni listas con viñetas. Solo texto plano y puntuación.
"""


class SpanishNLTKStream(tokenize.SentenceStream):
    def __init__(self, tokenizer_impl):
        super().__init__()
        self._tokenizer_impl = tokenizer_impl
        self._buffer = ""

    def push_text(self, text: str) -> None:
        self._buffer += text
        try:
            # Ahora VS Code sabe que _tokenizer_impl tiene este método
            sentences = self._tokenizer_impl.tokenize(self._buffer)
            if len(sentences) > 1:
                for sentence in sentences[:-1]:
                    self._event_ch.send_nowait(tokenize.TokenData(token=sentence))
                self._buffer = sentences[-1]
        except Exception:
            pass

    def flush(self) -> None:
        # Si queda algo en el buffer al final, lo enviamos
        if self._buffer.strip():
            self._event_ch.send_nowait(tokenize.TokenData(token=self._buffer))
            self._buffer = ""

    def end_input(self) -> None:
        self.flush()
        self._event_ch.close()

    async def aclose(self) -> None:
        self._event_ch.close()


class SpanishTokenizer(tokenize.SentenceTokenizer):
    def __init__(self):
        try:
            # Intentamos cargar, si falla algo, descargamos todo
            nltk.data.find("tokenizers/punkt")
            nltk.data.find("tokenizers/punkt_tab")  # <--- ESTO FALTABA
            loaded = nltk.data.load("tokenizers/punkt/spanish.pickle")
        except LookupError:
            logger.info("Descargando recursos NLTK (punkt y punkt_tab)...")
            nltk.download("punkt")
            nltk.download("punkt_tab")  # <--- OBLIGATORIO AHORA
            loaded = nltk.data.load("tokenizers/punkt/spanish.pickle")
        self._nltk_tokenizer = cast(PunktSentenceTokenizer, loaded)

    def tokenize(self, text: str, *, language: str | None = None) -> list[str]:
        # Implementación del método estático
        return self._nltk_tokenizer.tokenize(text)

    def stream(self, *, language: str | None = None) -> SentenceStream:
        # Implementación del método de streaming (EL QUE FALTABA)
        return SpanishNLTKStream(self._nltk_tokenizer)


logger = logging.getLogger("agent")

load_dotenv(".env")

CONVEX_URL = os.getenv("CONVEX_URL")

client = ConvexClient(CONVEX_URL or "http://127.0.0.1:8000")


def get_character(character_id: str) -> dict:
    return client.query("characters:getById", dict(characterId=character_id))


class Assistant(Agent):
    def __init__(self, instructions) -> None:
        super().__init__(
            instructions=instructions,
        )

    # To add tools, use the @function_tool decorator.
    # Here's an example that adds a simple weather tool.
    # You also have to add `from livekit.agents import function_tool, RunContext` to the top of this file
    # @function_tool
    # async def lookup_weather(self, context: RunContext, location: str):
    #     """Use this tool to look up current weather information in the given location.
    #
    #     If the location is not supported by the weather service, the tool will indicate this. You must tell the user the location's weather is unavailable.
    #
    #     Args:
    #         location: The location to look up weather information for (e.g. city name)
    #     """
    #
    #     logger.info(f"Looking up weather for {location}")
    #
    #     return "sunny with a temperature of 70 degrees."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()
    try:
        nltk.download("punkt")
        nltk.download("punkt_tab")  # <--- AÑADIDO AQUÍ TAMBIÉN
    except Exception as e:
        logger.error(f"Error descargando NLTK: {e}")


server.setup_fnc = prewarm


@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    metadata = json.loads(ctx.job.room.metadata)

    my_tokenizer = SpanishTokenizer()

    character_id = metadata["characterId"]
    character = get_character(character_id)

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3-general"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        llm=groq.LLM(
            model="openai/gpt-oss-120b",
        ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=deepgram.TTS(model="aura-2-celeste-es"),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
        resume_false_interruption=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=google.realtime.RealtimeModel(
    #         voice="Despina",
    #         temperature=0.8,
    #         instructions=Template(MASTER_TEMPLATE).render(
    #             backstory=character["prompt"], name=character["name"]
    #         ),
    #         model="gemini-2.0-flash-exp",
    #     )
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(
            instructions=Template(MASTER_TEMPLATE).render(
                backstory=character["prompt"], name=character["name"]
            )
        ),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony()
                if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                else noise_cancellation.BVC(),
            ),
        ),
    )

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
