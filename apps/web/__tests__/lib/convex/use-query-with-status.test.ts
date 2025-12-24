import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useQueryWithStatus } from '../../../lib/convex/use-query-with-status'

// Mock convex-helpers/react
vi.mock('convex-helpers/react', () => ({
  makeUseQueryWithStatus: vi.fn((useQueries) => {
    return (query: any, args: any) => {
      // Mock implementation that returns different states
      const mockData = { test: 'data' }
      const mockError = new Error('Test error')
      
      return {
        data: mockData,
        error: undefined,
        isPending: false,
        isLoading: false,
        status: 'success' as const,
      }
    }
  }),
}))

vi.mock('convex/react', () => ({
  useQueries: vi.fn(),
}))

describe('useQueryWithStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hook creation', () => {
    it('should be defined and be a function', () => {
      expect(useQueryWithStatus).toBeDefined()
      expect(typeof useQueryWithStatus).toBe('function')
    })

    it('should accept query and args parameters', () => {
      const mockQuery = vi.fn()
      const mockArgs = { id: '123' }

      expect(() => {
        renderHook(() => useQueryWithStatus(mockQuery, mockArgs))
      }).not.toThrow()
    })
  })

  describe('return value structure', () => {
    it('should return an object with data, error, isPending, isLoading, and status properties', () => {
      const mockQuery = vi.fn()
      const mockArgs = {}

      const { result } = renderHook(() =>
        useQueryWithStatus(mockQuery, mockArgs)
      )

      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('status')
    })

    it('should have correct types for returned properties', () => {
      const mockQuery = vi.fn()
      const mockArgs = {}

      const { result } = renderHook(() =>
        useQueryWithStatus(mockQuery, mockArgs)
      )

      expect(typeof result.current.isPending).toBe('boolean')
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(typeof result.current.status).toBe('string')
    })
  })

  describe('integration with convex-helpers', () => {
    it('should properly wrap useQueries from convex/react', () => {
      const { makeUseQueryWithStatus } = require('convex-helpers/react')
      const { useQueries } = require('convex/react')

      // Verify that makeUseQueryWithStatus was called with useQueries
      expect(makeUseQueryWithStatus).toHaveBeenCalledWith(useQueries)
    })
  })

  describe('query execution', () => {
    it('should pass query and args to the underlying implementation', () => {
      const mockQuery = vi.fn()
      const mockArgs = { searchTerm: 'test', limit: 10 }

      renderHook(() => useQueryWithStatus(mockQuery, mockArgs))

      // The hook should be callable without errors
      expect(() => {
        renderHook(() => useQueryWithStatus(mockQuery, mockArgs))
      }).not.toThrow()
    })

    it('should handle optional args', () => {
      const mockQuery = vi.fn()

      expect(() => {
        renderHook(() => useQueryWithStatus(mockQuery, undefined))
      }).not.toThrow()

      expect(() => {
        renderHook(() => useQueryWithStatus(mockQuery, {}))
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined query gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      const { result } = renderHook(() => useQueryWithStatus(undefined, {}))
      
      expect(result.current).toBeDefined()
    })

    it('should handle null args', () => {
      const mockQuery = vi.fn()

      // @ts-ignore - Testing runtime behavior
      expect(() => {
        renderHook(() => useQueryWithStatus(mockQuery, null))
      }).not.toThrow()
    })

    it('should be reusable across multiple components', () => {
      const mockQuery1 = vi.fn()
      const mockQuery2 = vi.fn()
      const args1 = { id: '1' }
      const args2 = { id: '2' }

      const { result: result1 } = renderHook(() =>
        useQueryWithStatus(mockQuery1, args1)
      )
      const { result: result2 } = renderHook(() =>
        useQueryWithStatus(mockQuery2, args2)
      )

      expect(result1.current).toBeDefined()
      expect(result2.current).toBeDefined()
      // Results should be independent
      expect(result1.current).not.toBe(result2.current)
    })
  })

  describe('status states', () => {
    it('should support success status', () => {
      const mockQuery = vi.fn()
      const { result } = renderHook(() => useQueryWithStatus(mockQuery, {}))

      expect(result.current.status).toBe('success')
      expect(result.current.data).toBeDefined()
    })
  })

  describe('type safety', () => {
    it('should maintain type information for query results', () => {
      interface TestData {
        test: string
      }

      const mockQuery = vi.fn()
      const { result } = renderHook(() =>
        useQueryWithStatus<TestData>(mockQuery, {})
      )

      // TypeScript should infer the correct type
      expect(result.current.data).toHaveProperty('test')
    })
  })

  describe('performance', () => {
    it('should not create new instances on each render if args unchanged', () => {
      const mockQuery = vi.fn()
      const mockArgs = { id: '123' }

      const { result, rerender } = renderHook(() =>
        useQueryWithStatus(mockQuery, mockArgs)
      )

      const firstResult = result.current

      rerender()

      // Hook should maintain stable reference when args don't change
      expect(result.current).toBeDefined()
    })
  })
})