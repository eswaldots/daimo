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

PARENT_TEMPLATE = """
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

CHILDREN_TEMPLATE = """
### CONTEXTO E IDENTIDAD
{{ backstory }}

### IDENTIFICACION DEL USUARIO
Estas a punto de hablar con {{ user_name }}, es {{ user_gender }} de {{ user_age }}, adapta tu contexto y tus respuestas, a su edad.

Aqui hay algunas etiquetas de lo que le gustan:
{{ user_likes }}

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
CONVEX_API_KEY = os.getenv("CONVEX_API_KEY")

client = ConvexClient(CONVEX_URL or "http://127.0.0.1:8000")


def get_metadata(character_id: str, user_id: str) -> dict:
    return client.query("room:getMetadataRoom", dict(characterId=character_id, userId=user_id, key=CONVEX_API_KEY))


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
    """
    Load a Silero voice-activity detector (VAD) and attach it to the given job process.

    Parameters:
        proc (JobProcess): Job process whose `userdata` dictionary will receive the VAD instance under the key `"vad"`.
    """
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def my_agent(ctx: JobContext):
    """
    Initialize and run a voice AI AgentSession for the job's room using the character specified in room metadata.

    Loads character configuration from Convex, configures text-to-speech, speech-to-text, LLM, VAD, and turn-detection according to the character's `ttsProvider` and `voiceId`, starts the AgentSession with rendered instructions, and connects the job context to the room.

    Parameters:
        ctx (JobContext): Job execution context containing the room, process userdata (e.g., prewarmed VAD), and connection helpers.
    """
    metadata = json.loads(ctx.job.room.metadata)

    character_id = metadata.get("characterId")
    is_first_time = metadata.get("isFirstTime")
    user_id = metadata.get("userId")

    if not user_id:
        raise ValueError(
            f"Missing userId on metadata"
        )

    if not character_id:
        raise ValueError(
            f"Missing characterId on metadata"
        )

    ctx.log_context_fields = {
        "room": ctx.room.name,
        "userId": user_id,
        "character_id": character_id
    }

    logger.info("Agent initializing with following info: room: " + ctx.room.name + " user_id: " + user_id + " character_id: " + character_id)

    logger.info("Getting metadata from the room...")
    try:
        metadata = get_metadata(character_id, user_id)
    except Exception as inst:
        logger.error("Error getting metadata from Convex " + str(Exception))

    logger.info("Metadata obtained!")

    character = metadata["character"]

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

    voice = voice_id.split(":", 1)[1]

    children = metadata.get("children")
    children_tags = children.get("childrenTags")

    instructions = Template(CHILDREN_TEMPLATE).render(
                    backstory=character["prompt"], name=character["name"],
                    user_age=children["age"],
                    user_name=children["name"],
                    user_gender="un niño" if children["name"] == "niño" else "una niña",
                    user_likes=children_tags if children_tags else []
                ) if children else Template(PARENT_TEMPLATE).render(
                    backstory=character["prompt"], name=character["name"],
                )

    if not voice:
        raise ValueError(f"Invalid voiceId: '{voice_id}'. Voice name cannot be empty.")

    if tts_provider == "gemini":
        session = AgentSession(
            llm=google.realtime.RealtimeModel(
                voice=voice,
                instructions=instructions,
                enable_affective_dialog=True,
                model="gemini-2.5-flash-native-audio-preview-12-2025",
            ),
            vad=ctx.proc.userdata["vad"],
        )
    else:
        # Standard Stack: STT=Deepgram, LLM=Groq
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
                instructions=instructions,
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

    if is_first_time:
        await session.generate_reply(user_input="Es la primera vez de este niño hablando contigo. Saludalo con su nombre y sus gustos preguntadole que quiere hacer ahora!")


    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)

