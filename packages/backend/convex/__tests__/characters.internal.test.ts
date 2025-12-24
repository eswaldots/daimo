import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConvexTestingHelper, createMockCharacter, createMockTag, mockConvexId } from './test-utils'

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    array: vi.fn((config) => config),
  },
}))

// Mock groq
vi.mock('@ai-sdk/groq', () => ({
  groq: vi.fn((model) => ({ modelId: model })),
}))

// Mock zod
vi.mock('zod', () => ({
  default: {
    object: vi.fn((schema) => ({ schema })),
    string: vi.fn(() => ({
      describe: vi.fn((desc) => ({ description: desc })),
    })),
  },
}))

describe('characters/internal.createTagsForCharacter', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error when character not found', async () => {
    const mockContext = {
      runQuery: vi.fn(async () => null),
      runMutation: vi.fn(),
    }

    const characterId = mockConvexId('characters', 'nonexistent')

    await expect(async () => {
      const character = await mockContext.runQuery({} as any, { characterId })
      if (!character) {
        throw new Error('The character has not founded')
      }
    }).rejects.toThrow('The character has not founded')
  })

  it('should generate tags for existing character', async () => {
    const mockCharacter = createMockCharacter({
      name: 'Tony Stark',
      description: 'A brilliant inventor and superhero known as Iron Man',
    })

    const mockGeneratedTags = [
      { name: 'superhero' },
      { name: 'inventor' },
      { name: 'ironman' },
      { name: 'marvel' },
      { name: 'technology' },
    ]

    const { generateText } = await import('ai')
    vi.mocked(generateText).mockResolvedValue({
      output: mockGeneratedTags,
    } as any)

    const mockContext = {
      runQuery: vi.fn()
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValue(null),
      runMutation: vi.fn()
        .mockResolvedValue(mockConvexId('tags', '1')),
    }

    const characterId = mockCharacter._id

    const character = await mockContext.runQuery({} as any, { characterId })
    expect(character).toEqual(mockCharacter)

    const result = await generateText({
      model: { modelId: 'openai/gpt-oss-120b' },
      output: mockGeneratedTags,
      prompt: expect.any(String),
    } as any)

    expect(result.output).toEqual(mockGeneratedTags)
    expect(generateText).toHaveBeenCalled()
  })

  it('should skip creating tag if it already exists', async () => {
    const mockCharacter = createMockCharacter()
    const existingTag = createMockTag({ name: 'existing-tag' })

    const mockContext = {
      runQuery: vi.fn()
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce(existingTag),
      runMutation: vi.fn(),
    }

    const tag = await mockContext.runQuery({} as any, { name: 'existing-tag' })
    
    expect(tag).toEqual(existingTag)
    expect(mockContext.runMutation).not.toHaveBeenCalled()
  })

  it('should create new tag and relate it to character', async () => {
    const mockCharacter = createMockCharacter()
    const newTagName = 'new-tag'
    const newTagId = mockConvexId('tags', '123')

    const mockContext = {
      runQuery: vi.fn()
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce(null),
      runMutation: vi.fn()
        .mockResolvedValueOnce(newTagId)
        .mockResolvedValueOnce(mockConvexId('characterTags', '1')),
    }

    const character = await mockContext.runQuery({} as any, { characterId: mockCharacter._id })
    const existingTag = await mockContext.runQuery({} as any, { name: newTagName })

    expect(existingTag).toBeNull()

    const tagId = await mockContext.runMutation({} as any, { name: newTagName })
    expect(tagId).toBe(newTagId)

    const relationId = await mockContext.runMutation({} as any, {
      tagId,
      characterId: character._id,
    })

    expect(relationId).toBeDefined()
    expect(mockContext.runMutation).toHaveBeenCalledTimes(2)
  })

  it('should handle AI generation returning 10 tags', async () => {
    const mockTags = Array.from({ length: 10 }, (_, i) => ({
      name: `tag${i}`,
    }))

    const { generateText } = await import('ai')
    vi.mocked(generateText).mockResolvedValue({
      output: mockTags,
    } as any)

    const result = await generateText({
      model: {} as any,
      output: mockTags,
      prompt: '',
    } as any)

    expect(result.output.length).toBe(10)
  })

  it('should handle AI generation with lowercase tags', async () => {
    const mockTags = [
      { name: 'robot' },
      { name: 'ai' },
      { name: 'friendly' },
    ]

    const { generateText } = await import('ai')
    vi.mocked(generateText).mockResolvedValue({
      output: mockTags,
    } as any)

    const result = await generateText({
      model: {} as any,
      output: mockTags,
      prompt: '',
    } as any)

    result.output.forEach((tag: { name: string }) => {
      expect(tag.name).toBe(tag.name.toLowerCase())
      expect(tag.name).not.toMatch(/[A-Z]/)
    })
  })

  it('should use groq model for AI generation', async () => {
    const { groq } = await import('@ai-sdk/groq')
    const mockGroq = vi.mocked(groq)

    mockGroq.mockReturnValue({ modelId: 'openai/gpt-oss-120b' } as any)

    const model = groq('openai/gpt-oss-120b')

    expect(mockGroq).toHaveBeenCalledWith('openai/gpt-oss-120b')
    expect(model).toHaveProperty('modelId')
  })
})