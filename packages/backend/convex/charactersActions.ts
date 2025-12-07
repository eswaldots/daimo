"use node";

import { ConvexError, v } from "convex/values";
import { createWorkersAI } from "workers-ai-provider"; // <--- Tu librería deseada
import { z } from "zod/v3";
import { action, internalMutation } from "./_generated/server";
import {
  generateObject,
  experimental_generateImage as generateImage,
  generateText,
  Output,
} from "ai";
import { google } from "@ai-sdk/google";

import { createOpenAI } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import { internal } from "./_generated/api";

const createCloudflareBinding = () => {
  return {
    run: async (model: string, args: any) => {
      const accountId = "71541f18bf5b3e35c74426b314382f21"; // Tu Account ID
      const apiToken = "XkxGrCUHSQwhqV-AyxXtqyhgPcV4x_KzLx5PQuk6"; // Tu Token

      // Mapeamos los argumentos al formato REST de Cloudflare
      // La librería suele enviar { messages, ... }, la API REST lo acepta igual.
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(args),
        },
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        console.error("Cloudflare Error:", json);
        throw new Error(JSON.stringify(json.errors || "Unknown Error"));
      }

      // La librería espera el resultado directo, la API devuelve { result: ... }
      return json.result;
    },
  };
};

const workersai = createWorkersAI({
  // @ts-ignore - Ignoramos el tipado estricto de Cloudflare Workers
  binding: createCloudflareBinding(),
});

const cloudflare = createOpenAI({
  // Esta es la URL mágica para que funcione como OpenAI
  baseURL: `https://api.cloudflare.com/client/v4/accounts/71541f18bf5b3e35c74426b314382f21/ai/v1`,
  apiKey: "XkxGrCUHSQwhqV-AyxXtqyhgPcV4x_KzLx5PQuk6",
});

export const create = action({
  args: {
    description: v.string(),
  },
  handler: async (ctx, { description }): Promise<void> => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unautorizado. Inicie sesión primero");
    }

    const { text } = await generateText({
      model: workersai("@cf/meta/llama-3.1-8b-instruct"),
      prompt: `
      You are an API that generates JSON.
      Generate a character based on this description: "${description}".
      
      Respond ONLY with a valid JSON object. Do not write markdown, do not write "Here is the JSON".

      WRITE ALL THE DATA ON SPANISH LANGUAGE.
      
      JSON Format:
      {
        "name": "Character Name",
        "description": "Short visual description",
        "voicePrompt": "Voice tone description",
        "firstMessagePrompt": "First thing they say"
      }
      `,
    });

    // Limpiamos el resultado por si Llama 3 se pone creativo con los bloques de código
    const jsonStr = text.replace(/```json|```/g, "").trim();
    let character;

    try {
      character = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parseando JSON de Llama:", text);
      throw new ConvexError("La IA falló al generar el formato JSON.");
    }

    const imageResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/71541f18bf5b3e35c74426b314382f21/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer XkxGrCUHSQwhqV-AyxXtqyhgPcV4x_KzLx5PQuk6`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Portrait of ${character.name}, ${character.description}, transparent background`,
          num_steps: 4,
          width: 1024,
          height: 1024,
        }),
      },
    );

    const imageBlob = await imageResponse.blob();
    const storageId = await ctx.storage.store(imageBlob);

    await ctx.runMutation(internal.internalCharacters.internalCreate, {
      ...character,
      storageId,
      creatorId: user.subject,
    });
  },
});
