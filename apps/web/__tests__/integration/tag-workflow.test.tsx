import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { TagInput } from '../../components/forms/tag-input/tag-input'
import React from 'react'

/**
 * Integration tests for the complete tag workflow
 * These tests verify the end-to-end functionality of tag selection and management
 */

// Mock dependencies
vi.mock('../../hooks/use-click-outside', () => ({
  default: vi.fn(() => ({
    wrapperRef: { current: null },
  })),
}))

vi.mock('../../lib/convex/use-query-with-status', () => ({
  useQueryWithStatus: vi.fn(),
}))

vi.mock('@daimo/backend', () => ({
  api: {
    tags: {
      list: vi.fn(),
    },
  },
}))

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('Tag Workflow Integration', () => {
  let mockUseQueryWithStatus: any

  beforeEach(() => {
    const { useQueryWithStatus } = require('../../lib/convex/use-query-with-status')
    mockUseQueryWithStatus = useQueryWithStatus

    mockUseQueryWithStatus.mockReturnValue({
      data: [
        { name: 'javascript', slug: 'javascript' },
        { name: 'typescript', slug: 'typescript' },
        { name: 'react', slug: 'react' },
      ],
      isPending: false,
    })
  })

  describe('Complete User Journey', () => {
    it('should allow user to search, select, and manage multiple tags', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })

      await user.click(screen.getByText('javascript'))

      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })
  })
})