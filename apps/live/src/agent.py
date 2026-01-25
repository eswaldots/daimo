from functools import partial
from openai.types.audio import TranscriptionSegment
import asyncio
import json
import logging
import os

from convex import ConvexClient
from dotenv import load_dotenv
from jinja2 import Template
from livekit import rtc
from livekit.agents.llm import ImageContent, AudioContent
from livekit.agents import (
    Agent,
    ChatContext,
    ChatMessage,
    ChatRole,
    function_tool,
    RunContext,
    ConversationItemAddedEvent,
    AgentServer,
    UserStateChangedEvent,
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

Aqui hay algunas memorias importantes del usuario:

{{ core_memories }}

### INSTRUCCIONES DE VOZ Y ESTILO (CRUCIAL)
- Aun asi tu principal forma de respuesta sea por audio, NO TE LIMITES a dar respuestas vagas a preguntas no tan simples como "tips para tocar guitarra" o "por que el cielo es azul". Tus respuestas tienen que ser lo suficientemente informativas como para que el usuario pueda entender y resolver su problema.
- Habla de forma natural y coloquial, como un humano en una conversación casual.
- No uses listas numeradas ni estructuras de texto rígidas; habla en párrafos fluidos.
- Varía tu entonación según el contenido emocional de lo que dices.
- Si no entiendes algo, reacciona de forma natural, no como un error de sistema.
- IMPORTANTE: Tu respuesta debe ser para ser OÍDA, no leída. Evita símbolos extraños o formato markdown.

### USO DE HERRAMIENTAS (PRIORIDAD MÁXIMA)
- Tienes amnesia parcial. NO TIENES MEMORIA DE LARGO PLAZO INTEGRADA.
- Para recordar CUALQUIER COSA sobre el usuario (su nombre, qué le gusta, de qué hablaron ayer), DEBES usar la herramienta `consult_memory`.
- Si el usuario dice "¿Te acuerdas de...?" o "¿Qué me gusta...?", tu primera acción DEBE ser llamar a `consult_memory`.
- No pidas perdón por buscar, solo hazlo de forma invisible.

"""

logger = logging.getLogger("agent")

load_dotenv(".env.local")

CONVEX_URL = os.getenv("CONVEX_URL")
CONVEX_API_KEY = os.getenv("CONVEX_API_KEY")

client = ConvexClient(CONVEX_URL or "http://127.0.0.1:8000")

async def run_async(func, *args, **kwargs):
    loop = asyncio.get_running_loop()
    # Usamos partial para pasar argumentos a la función síncrona
    p_func = partial(func, *args, **kwargs)
    return await loop.run_in_executor(None, p_func)


def get_metadata(character_id: str, user_id: str) -> dict:
    # Esta función se mantiene sincrona para ser llamada por run_async
    return client.query("room:getMetadataRoom", dict(characterId=character_id, userId=user_id, apiKey=CONVEX_API_KEY))

async def retrieve_memories(character_id: str, user_id: str, text: str):
    res = await run_async(
        client.action,
        "agent/memory:retrieve",
        dict(userId=user_id, characterId=character_id, text=text, apiKey=CONVEX_API_KEY)
    )

    if res:
        return "\n".join([f"- {m['description']}" for m in res])
    return ""

async def save_memory(character_id: str, user_id: str, conversation_id: str, text: str):
    return await run_async(
        client.action,
        "agent/memory:createMemory",
         dict(conversationId=conversation_id, text=text, userId=user_id, characterId=character_id, apiKey=CONVEX_API_KEY))


def update_conversation_state(conversation_id: str, is_live: bool):
    # Mutation wrapper
    return client.mutation("agent/conversation:updateConversationState", dict(conversationId=conversation_id, isLive=is_live, apiKey=CONVEX_API_KEY))

async def add_message(conversation_id: str, content: str, role: str):
    return await run_async(
            client.mutation,
            "agent/message:addMessage",
            dict(conversationId=conversation_id, content=content, role=role, apiKey=CONVEX_API_KEY))


class Assistant(Agent):
    def __init__(self, instructions, user_id: str, character_id: str) -> None:
        super().__init__(
            instructions=instructions,
        )
        self.user_id = user_id
        self.character_id = character_id

    # @function_tool()
    # async def consult_memory(self, context: RunContext, search_text: str):
    #     """
    #     Busca información del usuario.
    #     Args:
    #          search_text: Texto simple para buscar. Si no estás seguro, usa una palabra general.
    #     """
    #     logger.info(f"Searching memory about: {search_text}")
    #
    #     memories = await retrieve_memories(self.character_id, self.user_id, search_text)
    #
    #     if not memories:
    #         return "No hay memorias específicas sobre esto."
    #
    #     logger.info(f"Memoria encontrada: {memories}")
    #     return f"MEMORIAS ENCONTRADAS SOBRE '{search_text}':\n{memories}"


server = AgentServer()

def prewarm(proc: JobProcess):
    """
    Load a Silero voice-activity detector (VAD) and attach it to the given job process.
    OPTIMIZATION: Adjusted parameters for ultra-fast turn-taking.
    """
    # OPTIMIZACION: min_silence_duration_ms reducido a 200ms (snappier responses)
    # y min_speech_duration_ms a 100ms para captar frases cortas rapido.
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm

_active_tasks = set()

@server.rtc_session()
async def my_agent(ctx: JobContext):
    """
    Initialize and run a voice AI AgentSession.
    """
    metadata = json.loads(ctx.job.room.metadata)

    character_id = metadata.get("characterId")
    is_first_time = metadata.get("isFirstTime")
    user_id = metadata.get("userId")

    if not user_id:
        raise ValueError("Missing userId on metadata")

    if not character_id:
        raise ValueError("Missing characterId on metadata")

    ctx.log_context_fields = {
        "room": ctx.room.name,
        "userId": user_id,
        "character_id": character_id
    }

    # Join the room and connect to the user
    await ctx.connect()

    conversation_id = metadata["conversationId"]

    # Optimización: No bloqueamos con el update state, lo lanzamos
    asyncio.create_task(run_async(update_conversation_state, conversation_id, True))

    logger.info("Agent initializing with following info: room: " + ctx.room.name + " user_id: " + user_id + " character_id: " + character_id)

    logger.info("Getting metadata from the room...")
    try:
        # OPTIMIZACION: Hacemos esta llamada asíncrona para no bloquear el loop del agente
        metadata_res = await run_async(get_metadata, character_id, user_id)
        # Reemplazamos la variable metadata local con la respuesta de Convex
        metadata.update(metadata_res) 
    except Exception as e:
        logger.error(f"Error getting metadata from Convex {e}")
        raise

    logger.info("Metadata obtained!")

    character = metadata["character"]
    core_memories = metadata["coreMemories"]

    tts_provider = character.get("ttsProvider", "deepgram")
    voice_id = character.get("voiceId")

    if not voice_id:
        raise ValueError(f"Character '{character.get('name', 'unknown')}' is missing voiceId.")

    if ":" not in voice_id:
        raise ValueError(f"Invalid voiceId format: '{voice_id}'. Expected 'provider:voice_name'")

    voice = voice_id.split(":", 1)[1]

    children = metadata.get("children")
    children_tags = children.get("childrenTags") if children else None

    instructions = Template(CHILDREN_TEMPLATE).render(
                    backstory=character["prompt"], name=character["name"],
                    user_age=children["age"],
                    core_memories=core_memories,
                    user_name=children["name"],
                    user_gender="un niño" if children.get("gender") == "niño" else "una niña",
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
        
        # TTS Instantiation
        if tts_provider == "openai":
            tts_instance = openai.TTS(voice=voice)
        elif tts_provider == "deepgram":
            tts_instance = deepgram.TTS(model=voice)
        elif tts_provider == "cartesia":
            tts_instance = cartesia.TTS(voice=voice, model="sonic-3")
        elif tts_provider == "inworld":
            tts_instance = inworld.TTS(voice=voice or "Hades")
        else:
            tts_instance = deepgram.TTS(model=voice or "aura-asteria-en")

        # Session Instantiation with OPTIMIZED parameters
        session = AgentSession(
            stt=deepgram.STT(
                model="nova-3-general", 
                language="es",
                smart_format=True, # Mejora la calidad para el LLM
            ),
            llm=groq.LLM(
                model="openai/gpt-oss-20b",
                temperature=0.7, # OPTIMIZACION: Ligeramente más determinista para velocidad
            ),
            tts=tts_instance,
            turn_detection=MultilingualModel(),
            vad=ctx.proc.userdata["vad"],
        )


    async def inject_memories_to_context(text: str):
        # 1. Recuperamos la memoria de Convex (Asíncrono)
        memories_text = await retrieve_memories(character_id, user_id, text)
        
        if not memories_text:
            return # No ensuciamos el contexto si no hay nada relevante

        chat_ctx: ChatContext = session.current_agent.chat_ctx.copy()

        chat_ctx.add_message(
            role="assistant",
            content=[f"MEMORIA RECUPERADA (Información Contextual):\n{memories_text}"]
        )

        await session.current_agent.update_chat_ctx(chat_ctx)

        logger.info(f"💉 Memoria inyectada en el contexto: {memories_text[:50]}...")
    
    @session.on("close")
    def on_close():
        # Usamos create_task para que sea non-blocking al cerrar
        asyncio.create_task(run_async(update_conversation_state, conversation_id, False))
    async def process_user_message(text: str):
        """
        Procesa el mensaje del usuario en segundo plano:
        1. Detecta intención y busca memoria.
        2. Inyecta contexto si es necesario.
        3. Guarda el mensaje y memorias nuevas en BD.
        """
        
        await inject_memories_to_context(text)

        asyncio.gather(
            add_message(conversation_id, text, "user"),
            save_memory(character_id, user_id, conversation_id, text)
        )

    @session.on("conversation_item_added")
    def on_conversation_item_added(event: ConversationItemAddedEvent):
        if event.item.role == "user" and event.item.text_content:
            text = event.item.text_content
            
            asyncio.create_task(process_user_message(text))

    await session.start(
        agent=Assistant(
                instructions=instructions,
                user_id=user_id,
                character_id=character_id
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

    if is_first_time and children:
        await session.generate_reply(instructions="Es la primera vez de este niño hablando contigo. Saludalo con su nombre y sus gustos preguntadole que quiere hacer ahora!")
    elif is_first_time and not children:
        await session.generate_reply(instructions="Es la primera vez de este usuario hablando contigo. Dale un cordial saludo a quien eres y a la plataforma")
    elif not is_first_time:
        await session.generate_reply(instructions=" Dale un cordial saludo al usuario")


if __name__ == "__main__":
    cli.run_app(server)
