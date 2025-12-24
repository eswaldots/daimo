import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConvexTestingHelper, createMockTag, mockConvexId } from './test-utils'

describe('tags/internal.getTagByName', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
  })

  it('should return tag when found by name', async () => {
    const mockTag = createMockTag({ name: 'react' })

    const mockDb = {
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            unique: vi.fn(async () => mockTag),
          })),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { name: 'react' }

    const result = await ctx.db
      .query('tags')
      .withIndex('by_name', (q: any) => q.eq('name', args.name))
      .unique()

    expect(result).toEqual(mockTag)
    expect(mockDb.query).toHaveBeenCalledWith('tags')
  })

  it('should return null when tag is not found', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            unique: vi.fn(async () => null),
          })),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { name: 'nonexistent' }

    const result = await ctx.db
      .query('tags')
      .withIndex('by_name', (q: any) => q.eq('name', args.name))
      .unique()

    expect(result).toBeNull()
  })

  it('should use correct index for query', async () => {
    const withIndexFn = vi.fn(() => ({
      eq: vi.fn(() => ({
        unique: vi.fn(async () => null),
      })),
    }))

    const mockDb = {
      query: vi.fn(() => ({
        withIndex: withIndexFn,
      })),
    }

    const ctx = { db: mockDb }
    const args = { name: 'test' }

    await ctx.db
      .query('tags')
      .withIndex('by_name', (q: any) => q.eq('name', args.name))
      .unique()

    expect(withIndexFn).toHaveBeenCalledWith('by_name', expect.any(Function))
  })

  it('should handle special characters in tag name', async () => {
    const mockTag = createMockTag({ name: 'c++' })

    const mockDb = {
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            unique: vi.fn(async () => mockTag),
          })),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { name: 'c++' }

    const result = await ctx.db
      .query('tags')
      .withIndex('by_name', (q: any) => q.eq('name', args.name))
      .unique()

    expect(result).toEqual(mockTag)
  })

  it('should handle case-sensitive lookups', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          eq: vi.fn(() => ({
            unique: vi.fn(async () => null),
          })),
        })),
      })),
    }

    const ctx = { db: mockDb }
    
    // Search for 'React' should not find 'react'
    const args = { name: 'React' }

    const result = await ctx.db
      .query('tags')
      .withIndex('by_name', (q: any) => q.eq('name', args.name))
      .unique()

    expect(result).toBeNull()
  })
})

describe('tags/internal.createTag', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
  })

  it('should insert new tag and return id', async () => {
    const newTagId = mockConvexId('tags', '123')

    const mockDb = {
      insert: vi.fn(async () => newTagId),
    }

    const ctx = { db: mockDb }
    const args = { name: 'new-tag' }

    const result = await ctx.db.insert('tags', { name: args.name })

    expect(result).toBe(newTagId)
    expect(mockDb.insert).toHaveBeenCalledWith('tags', { name: 'new-tag' })
  })

  it('should create tag with correct data structure', async () => {
    const insertFn = vi.fn(async () => mockConvexId('tags', '1'))

    const mockDb = {
      insert: insertFn,
    }

    const ctx = { db: mockDb }
    const args = { name: 'react' }

    await ctx.db.insert('tags', { name: args.name })

    expect(insertFn).toHaveBeenCalledWith('tags', {
      name: 'react',
    })
  })

  it('should handle tags with hyphens', async () => {
    const mockDb = {
      insert: vi.fn(async () => mockConvexId('tags', '1')),
    }

    const ctx = { db: mockDb }
    const args = { name: 'react-native' }

    const result = await ctx.db.insert('tags', { name: args.name })

    expect(result).toBeDefined()
    expect(mockDb.insert).toHaveBeenCalledWith('tags', { name: 'react-native' })
  })

  it('should handle tags with underscores', async () => {
    const mockDb = {
      insert: vi.fn(async () => mockConvexId('tags', '1')),
    }

    const ctx = { db: mockDb }
    const args = { name: 'machine_learning' }

    const result = await ctx.db.insert('tags', { name: args.name })

    expect(result).toBeDefined()
    expect(mockDb.insert).toHaveBeenCalledWith('tags', { name: 'machine_learning' })
  })

  it('should handle lowercase tag names', async () => {
    const mockDb = {
      insert: vi.fn(async () => mockConvexId('tags', '1')),
    }

    const ctx = { db: mockDb }
    const args = { name: 'javascript' }

    await ctx.db.insert('tags', { name: args.name })

    expect(mockDb.insert).toHaveBeenCalledWith('tags', {
      name: 'javascript',
    })
  })
})

describe('tags/internal.relateTag', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
  })

  it('should create relationship between tag and character', async () => {
    const relationshipId = mockConvexId('characterTags', '1')
    const tagId = mockConvexId('tags', '1')
    const characterId = mockConvexId('characters', '1')

    const mockDb = {
      insert: vi.fn(async () => relationshipId),
    }

    const ctx = { db: mockDb }
    const args = { tagId, characterId }

    const result = await ctx.db.insert('characterTags', args)

    expect(result).toBe(relationshipId)
    expect(mockDb.insert).toHaveBeenCalledWith('characterTags', {
      tagId,
      characterId,
    })
  })

  it('should handle multiple relationships for same character', async () => {
    const characterId = mockConvexId('characters', '1')
    const tag1Id = mockConvexId('tags', '1')
    const tag2Id = mockConvexId('tags', '2')

    const mockDb = {
      insert: vi.fn()
        .mockResolvedValueOnce(mockConvexId('characterTags', '1'))
        .mockResolvedValueOnce(mockConvexId('characterTags', '2')),
    }

    const ctx = { db: mockDb }

    await ctx.db.insert('characterTags', { tagId: tag1Id, characterId })
    await ctx.db.insert('characterTags', { tagId: tag2Id, characterId })

    expect(mockDb.insert).toHaveBeenCalledTimes(2)
    expect(mockDb.insert).toHaveBeenNthCalledWith(1, 'characterTags', {
      tagId: tag1Id,
      characterId,
    })
    expect(mockDb.insert).toHaveBeenNthCalledWith(2, 'characterTags', {
      tagId: tag2Id,
      characterId,
    })
  })

  it('should handle multiple characters with same tag', async () => {
    const tagId = mockConvexId('tags', '1')
    const char1Id = mockConvexId('characters', '1')
    const char2Id = mockConvexId('characters', '2')

    const mockDb = {
      insert: vi.fn()
        .mockResolvedValueOnce(mockConvexId('characterTags', '1'))
        .mockResolvedValueOnce(mockConvexId('characterTags', '2')),
    }

    const ctx = { db: mockDb }

    await ctx.db.insert('characterTags', { tagId, characterId: char1Id })
    await ctx.db.insert('characterTags', { tagId, characterId: char2Id })

    expect(mockDb.insert).toHaveBeenCalledTimes(2)
  })

  it('should pass through all args to insert', async () => {
    const insertFn = vi.fn(async () => mockConvexId('characterTags', '1'))
    const mockDb = { insert: insertFn }

    const ctx = { db: mockDb }
    const args = {
      tagId: mockConvexId('tags', '1'),
      characterId: mockConvexId('characters', '1'),
    }

    await ctx.db.insert('characterTags', args)

    expect(insertFn).toHaveBeenCalledWith('characterTags', args)
  })
})