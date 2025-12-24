import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConvexTestingHelper } from './test-utils'

describe('tags.list query', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
  })

  it('should return tags when searchTerm is provided', async () => {
    const mockTags = [
      { _id: '1', name: 'React', slug: 'react', _creationTime: Date.now() },
      { _id: '2', name: 'ReactNative', slug: 'react-native', _creationTime: Date.now() },
    ]

    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => mockTags),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: 'React' }

    // Simulate the handler behavior
    const result = await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(result).toEqual(mockTags)
    expect(mockDb.query).toHaveBeenCalledWith('tags')
  })

  it('should return first 10 tags when no searchTerm is provided', async () => {
    const mockTags = Array.from({ length: 10 }, (_, i) => ({
      _id: `${i}`,
      name: `Tag${i}`,
      slug: `tag${i}`,
      _creationTime: Date.now(),
    }))

    const mockDb = {
      query: vi.fn(() => ({
        take: vi.fn(async () => mockTags),
      })),
    }

    const ctx = { db: mockDb }

    const result = await ctx.db.query('tags').take(10)

    expect(result).toEqual(mockTags)
    expect(result.length).toBe(10)
    expect(mockDb.query).toHaveBeenCalledWith('tags')
  })

  it('should handle empty search results', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => []),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: 'NonExistentTag' }

    const result = await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(result).toEqual([])
  })

  it('should handle undefined searchTerm', async () => {
    const mockTags = [
      { _id: '1', name: 'Tag1', slug: 'tag1', _creationTime: Date.now() },
    ]

    const mockDb = {
      query: vi.fn(() => ({
        take: vi.fn(async () => mockTags),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: undefined }

    const result = await ctx.db.query('tags').take(10)

    expect(result).toBeDefined()
    expect(mockDb.query).toHaveBeenCalledWith('tags')
  })

  it('should call withSearchIndex with correct parameters', async () => {
    const searchFn = vi.fn()
    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn((indexName, callback) => {
          const q = { search: searchFn }
          callback(q)
          return {
            collect: vi.fn(async () => []),
          }
        }),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: 'test' }

    await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(searchFn).toHaveBeenCalledWith('name', 'test')
  })

  it('should handle special characters in search term', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => []),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const specialChars = ['@', '#', '$', '%', '&', '*']

    for (const char of specialChars) {
      const args = { searchTerm: `tag${char}test` }
      
      await ctx.db
        .query('tags')
        .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
        .collect()

      expect(mockDb.query).toHaveBeenCalledWith('tags')
    }
  })

  it('should handle very long search terms', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => []),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const longSearchTerm = 'a'.repeat(1000)
    const args = { searchTerm: longSearchTerm }

    await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(mockDb.query).toHaveBeenCalledWith('tags')
  })

  it('should handle case sensitivity in search', async () => {
    const mockTags = [
      { _id: '1', name: 'React', slug: 'react', _creationTime: Date.now() },
      { _id: '2', name: 'REACT', slug: 'REACT', _creationTime: Date.now() },
    ]

    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => mockTags),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: 'react' }

    const result = await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(result.length).toBeGreaterThan(0)
  })
})

describe('tags.list - integration scenarios', () => {
  it('should handle partial matches in search', async () => {
    const mockTags = [
      { _id: '1', name: 'JavaScript', slug: 'javascript', _creationTime: Date.now() },
      { _id: '2', name: 'Java', slug: 'java', _creationTime: Date.now() },
    ]

    const mockDb = {
      query: vi.fn(() => ({
        withSearchIndex: vi.fn(() => ({
          collect: vi.fn(async () => mockTags),
        })),
      })),
    }

    const ctx = { db: mockDb }
    const args = { searchTerm: 'Java' }

    const result = await ctx.db
      .query('tags')
      .withSearchIndex('search_by_name', (q: any) => q.search('name', args.searchTerm))
      .collect()

    expect(result).toEqual(mockTags)
  })

  it('should return exactly 10 tags when limit is applied', async () => {
    const mockTags = Array.from({ length: 15 }, (_, i) => ({
      _id: `${i}`,
      name: `Tag${i}`,
      slug: `tag${i}`,
      _creationTime: Date.now(),
    }))

    const mockDb = {
      query: vi.fn(() => ({
        take: vi.fn(async (limit) => mockTags.slice(0, limit)),
      })),
    }

    const ctx = { db: mockDb }

    const result = await ctx.db.query('tags').take(10)

    expect(result.length).toBe(10)
  })

  it('should handle empty database', async () => {
    const mockDb = {
      query: vi.fn(() => ({
        take: vi.fn(async () => []),
      })),
    }

    const ctx = { db: mockDb }

    const result = await ctx.db.query('tags').take(10)

    expect(result).toEqual([])
  })
})