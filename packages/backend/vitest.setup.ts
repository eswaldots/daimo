import { expect, vi } from 'vitest'

// Mock Convex runtime
vi.mock('./convex/_generated/server', () => ({
  query: vi.fn((handler) => handler),
  mutation: vi.fn((handler) => handler),
  action: vi.fn((handler) => handler),
  internalQuery: vi.fn((handler) => handler),
  internalMutation: vi.fn((handler) => handler),
  internalAction: vi.fn((handler) => handler),
}))

// Mock Convex values
vi.mock('convex/values', () => ({
  v: {
    string: () => 'string',
    number: () => 'number',
    boolean: () => 'boolean',
    optional: (type: any) => ({ optional: type }),
    id: (table: string) => `id<${table}>`,
    object: (schema: any) => schema,
    array: (type: any) => [type],
  },
  ConvexError: class ConvexError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ConvexError'
    }
  },
}))

// Mock AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    array: vi.fn((config) => config),
  },
}))

// Mock Groq provider
vi.mock('@ai-sdk/groq', () => ({
  groq: vi.fn((model) => model),
}))