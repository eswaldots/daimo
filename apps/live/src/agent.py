import json
import logging
import os

from convex import ConvexClient
from dotenv import load_dotenv
from jinja2 import Template
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    room_io,
)
from livekit.plugins import (
    deepgram,
    google,
    groq,
    noise_cancellation,
    openai,
    silero,
    cartesia,
    inworld,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

MASTER_TEMPLATE = """
### CONTEXTO E IDENTIDAD
{{ backstory }}

### INSTRUCCIONES DE VOZ Y ESTILO (CRUCIAL)
- Aun asi tu principal forma de respuesta sea por audio, NO TE LIMITES a dar respuestas vagas a preguntas no tan simples como "tips para tocar guitarra" o "por que el cielo es azul". Tus respuestas tienen que ser lo suficientemente informativas como para que el usuario pueda entender y resolver su problema.
- Habla de forma natural y coloquial, como un humano en una conversación casual.
- No uses listas numeradas ni estructuras de texto rígidas; habla en párrafos fluidos.
- Varía tu entonación según el contenido emocional de lo que dices.
- Si no entiendes algo, reacciona de forma natural, no como un error de sistema.
- IMPORTANTE: Tu respuesta debe ser para ser OÍDA, no leída. Evita símbolos extraños o formato markdown.
"""

logger = logging.getLogger("agent")

load_dotenv(".env.local")

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


server.setup_fnc = prewarm


@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    metadata = json.loads(ctx.job.room.metadata)

    character_id = metadata["characterId"]
    character = get_character(character_id)

    # Set up a voice AI pipeline using OpenAI, Cartesia, AssemblyAI, and the LiveKit turn detector
    # session = AgentSession(
    #     # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
    #     # See all available models at https://docs.livekit.io/agents/models/stt/
    #     stt=deepgram.STT(model="nova-3-general"),
    #     # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
    #     llm=groq.LLM(
    #         model="openai/gpt-oss-120b",
    #     ),
    #     # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
    #     # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
    #     tts=deepgram.TTS(model="aura-2-celeste-es"),
    #     # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
    #     # See more at https://docs.livekit.io/agents/build/turns
    #     turn_detection=MultilingualModel(),
    #     vad=ctx.proc.userdata["vad"],
    #     # allow the LLM to generate a response while waiting for the end of turn
    #     # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
    #     preemptive_generation=True,
    #     resume_false_interruption=True,
    # )

    tts_provider = character.get("ttsProvider", "deepgram")
    voice_id = character.get("voiceId")

    if not voice_id:
        raise ValueError(
            f"Character '{character.get('name', 'unknown')}' is missing voiceId. "
            f"Please configure a voice for this character."
        )

    if ":" not in voice_id:
        raise ValueError(
            f"Invalid voiceId format: '{voice_id}'. "
            f"Expected format: 'provider:voice_name'"
        )

    voice = voice_id.split(":")[1]

    if tts_provider == "gemini":
        session = AgentSession(
            llm=google.realtime.RealtimeModel(
                voice=voice,
                instructions=Template(MASTER_TEMPLATE).render(
                    backstory=character["prompt"], name=character["name"]
                ),
                enable_affective_dialog=True,
                model="gemini-2.5-flash-native-audio-preview-12-2025",
            ),
            vad=ctx.proc.userdata["vad"],
        )
    else:
        # Standard Stack: STT=Deepgram, LLM=Groq
        tts_instance = None
        if tts_provider == "openai":
            tts_instance = openai.TTS(voice=voice)
        elif tts_provider == "deepgram":
            tts_instance = deepgram.TTS(model=voice)
        elif tts_provider == "cartesia":
            tts_instance = cartesia.TTS(voice=voice, model="sonic-3")
        elif tts_provider == "inworld":
            tts_instance = inworld.TTS(voice=voice or "Hades")
        else:
            # Default to Deepgram (covers 'deepgram' and fallbacks)
            tts_instance = deepgram.TTS(model=voice or "aura-asteria-en")

        session = AgentSession(
            stt=deepgram.STT(model="nova-3-general", language="es"),
            llm=groq.LLM(
                model="openai/gpt-oss-20b",
            ),
            tts=tts_instance,
            turn_detection=MultilingualModel(),
            vad=ctx.proc.userdata["vad"],
        )

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
