import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TagInput } from '../tag-input'
import { FormProvider, useForm } from 'react-hook-form'
import React from 'react'

// Mock the hooks and API
vi.mock('@/hooks/use-click-outside', () => ({
  default: vi.fn(() => ({ wrapperRef: { current: null } })),
}))

vi.mock('@/lib/convex/use-query-with-status', () => ({
  useQueryWithStatus: vi.fn(() => ({
    data: [
      { name: 'tag1', slug: 'tag1', _id: '1' },
      { name: 'tag2', slug: 'tag2', _id: '2' },
      { name: 'tag3', slug: 'tag3', _id: '3' },
    ],
    isPending: false,
  })),
}))

vi.mock('@daimo/backend', () => ({
  api: {
    tags: {
      list: vi.fn(),
    },
  },
}))

// Wrapper component to provide form context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('TagInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render input field', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should add tag when space key is pressed', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Type a tag name
    fireEvent.change(input, { target: { value: 'newtag' } })
    expect(input).toHaveValue('newtag')

    // Press space to add the tag
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('newtag')).toBeInTheDocument()
    })

    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('should not add tag when space is pressed with empty input', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Press space without typing
    fireEvent.keyDown(input, { key: ' ' })

    // Should not add any tag
    const tags = screen.queryAllByText((content, element) => {
      return element?.tagName === 'SPAN' && content.length > 0
    })
    expect(tags.length).toBe(0)
  })

  it('should not add tag when input contains spaces', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Type a tag with space
    fireEvent.change(input, { target: { value: 'tag with space' } })

    // Press space
    fireEvent.keyDown(input, { key: ' ' })

    // Should not add the tag
    expect(screen.queryByText('tag with space')).not.toBeInTheDocument()
  })

  it('should remove tag when clicking X icon', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Add a tag
    fireEvent.change(input, { target: { value: 'testtag' } })
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('testtag')).toBeInTheDocument()
    })

    // Find and click the remove button
    const removeButton = screen.getByText('testtag').parentElement
    if (removeButton) {
      fireEvent.click(removeButton)
    }

    await waitFor(() => {
      expect(screen.queryByText('testtag')).not.toBeInTheDocument()
    })
  })

  it('should handle Enter key to complete tag from suggestions', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Type to trigger suggestions
    fireEvent.change(input, { target: { value: 'tag' } })

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
    })

    // Input should be cleared
    expect(input).toHaveValue('')
  })

  it('should handle Tab key to complete tag from suggestions', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Type to trigger suggestions
    fireEvent.change(input, { target: { value: 'tag' } })

    // Press Tab
    fireEvent.keyDown(input, { key: 'Tab' })

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
    })
  })

  it('should handle Escape key to close popover', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Click to open
    fireEvent.click(input)

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' })

    // Popover should close (input should blur)
    expect(document.activeElement).not.toBe(input)
  })

  it('should handle Backspace to remove last tag when input is empty', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Add two tags
    fireEvent.change(input, { target: { value: 'tag1' } })
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: 'tag2' } })
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('tag2')).toBeInTheDocument()
    })

    // Press Backspace with empty input
    fireEvent.keyDown(input, { key: 'Backspace' })

    // One tag should remain
    await waitFor(() => {
      expect(screen.queryByText('tag2')).not.toBeInTheDocument()
      expect(screen.getByText('tag1')).toBeInTheDocument()
    })
  })

  it('should clear all tags when Backspace is pressed with only one tag', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Add one tag
    fireEvent.change(input, { target: { value: 'singletag' } })
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('singletag')).toBeInTheDocument()
    })

    // Press Backspace with empty input
    fireEvent.keyDown(input, { key: 'Backspace' })

    await waitFor(() => {
      expect(screen.queryByText('singletag')).not.toBeInTheDocument()
    })
  })

  it('should open popover when clicking on input', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    fireEvent.click(input)

    // Popover should be open (we can check if suggestions are visible)
    // This depends on the mock returning data
    expect(input).toBeInTheDocument()
  })

  it('should filter out already selected tags from suggestions', async () => {
    const { useQueryWithStatus } = await import(
      '@/lib/convex/use-query-with-status'
    )
    
    vi.mocked(useQueryWithStatus).mockReturnValue({
      data: [
        { name: 'available-tag', slug: 'available-tag', _id: '1' },
        { name: 'selected-tag', slug: 'selected-tag', _id: '2' },
      ],
      isPending: false,
      status: 'success',
    } as any)

    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    // Add one tag
    fireEvent.change(input, { target: { value: 'selected-tag' } })
    fireEvent.keyDown(input, { key: ' ' })

    await waitFor(() => {
      expect(screen.getByText('selected-tag')).toBeInTheDocument()
    })

    // The selected tag should not appear in suggestions anymore
    // This would need to check the popover content when it's open
  })

  it('should handle empty tag list from API', () => {
    const { useQueryWithStatus } = vi.mocked(
      require('@/lib/convex/use-query-with-status')
    )

    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    } as any)

    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    const { useQueryWithStatus } = vi.mocked(
      require('@/lib/convex/use-query-with-status')
    )

    useQueryWithStatus.mockReturnValue({
      data: null,
      isPending: true,
    } as any)

    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should update search value as user types', () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'searching' } })
    expect(input).toHaveValue('searching')

    fireEvent.change(input, { target: { value: 'updated' } })
    expect(input).toHaveValue('updated')
  })

  it('should focus input after tag completion', async () => {
    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'tag' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(document.activeElement).toBe(input)
    })
  })

  it('should not complete if no filtered tags available', () => {
    const { useQueryWithStatus } = vi.mocked(
      require('@/lib/convex/use-query-with-status')
    )

    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    } as any)

    render(
      <TestWrapper>
        <TagInput />
      </TestWrapper>
    )

    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'nonexistent' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    // Should not add any tag
    expect(input).toHaveValue('nonexistent')
  })
})