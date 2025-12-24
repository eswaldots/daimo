import { vi } from 'vitest'

/**
 * Helper class for testing Convex functions
 * Provides mock implementations of common Convex patterns
 */
export class ConvexTestingHelper {
  createMockDb() {
    return {
      query: vi.fn(),
      insert: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      get: vi.fn(),
    }
  }

  createMockContext(overrides = {}) {
    return {
      db: this.createMockDb(),
      auth: {
        getUserIdentity: vi.fn(),
      },
      runQuery: vi.fn(),
      runMutation: vi.fn(),
      runAction: vi.fn(),
      ...overrides,
    }
  }

  createMockQuery(returnValue: any) {
    return {
      withIndex: vi.fn(() => ({
        eq: vi.fn(() => ({
          unique: vi.fn(async () => returnValue),
          first: vi.fn(async () => returnValue),
          collect: vi.fn(async () => Array.isArray(returnValue) ? returnValue : [returnValue]),
        })),
      })),
      withSearchIndex: vi.fn(() => ({
        search: vi.fn(() => ({
          collect: vi.fn(async () => Array.isArray(returnValue) ? returnValue : [returnValue]),
        })),
      })),
      collect: vi.fn(async () => Array.isArray(returnValue) ? returnValue : [returnValue]),
      take: vi.fn(async () => Array.isArray(returnValue) ? returnValue : [returnValue]),
      unique: vi.fn(async () => returnValue),
      first: vi.fn(async () => returnValue),
    }
  }
}

export const mockConvexId = (table: string, id: string = '1'): any => {
  return `${table}|${id}` as any
}

export const createMockCharacter = (overrides = {}) => ({
  _id: mockConvexId('characters', '1'),
  _creationTime: Date.now(),
  name: 'Test Character',
  description: 'A test character for unit testing',
  shortDescription: 'Test character',
  prompt: 'You are a test character',
  firstMessagePrompt: 'Hello! I am a test character.',
  ttsProvider: 'elevenlabs',
  ttsVoiceId: 'test-voice-id',
  storageId: 'test-storage-id',
  userId: mockConvexId('users', '1'),
  isPremium: false,
  ...overrides,
})

export const createMockTag = (overrides = {}) => ({
  _id: mockConvexId('tags', '1'),
  _creationTime: Date.now(),
  name: 'test-tag',
  slug: 'test-tag',
  ...overrides,
})

export const createMockCharacterTag = (overrides = {}) => ({
  _id: mockConvexId('characterTags', '1'),
  _creationTime: Date.now(),
  tagId: mockConvexId('tags', '1'),
  characterId: mockConvexId('characters', '1'),
  ...overrides,
})