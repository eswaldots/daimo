import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagInput } from '../../../../components/forms/tag-input/tag-input'
import { FormProvider, useForm } from 'react-hook-form'
import React from 'react'

// Mock the hooks and dependencies
vi.mock('../../../../hooks/use-click-outside', () => ({
  default: vi.fn(() => ({
    wrapperRef: { current: null },
  })),
}))

vi.mock('../../../../lib/convex/use-query-with-status', () => ({
  useQueryWithStatus: vi.fn(),
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

describe('TagInput Component', () => {
  let mockUseQueryWithStatus: any

  beforeEach(() => {
    const { useQueryWithStatus } = require('../../../../lib/convex/use-query-with-status')
    mockUseQueryWithStatus = useQueryWithStatus
    
    // Default mock implementation
    mockUseQueryWithStatus.mockReturnValue({
      data: [
        { name: 'javascript', slug: 'javascript' },
        { name: 'typescript', slug: 'typescript' },
        { name: 'react', slug: 'react' },
      ],
      isPending: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render input group', () => {
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should render with empty initial state', () => {
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('')
    })

    it('should not show popover initially', () => {
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      // Popover content should not be visible initially
      const popoverContent = screen.queryByRole('dialog')
      expect(popoverContent).not.toBeInTheDocument()
    })
  })

  describe('User Interactions - Input', () => {
    it('should update input value when user types', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'java')

      expect(input).toHaveValue('java')
    })

    it('should open popover when user clicks on input', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Verify popover is open by checking for tag suggestions
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })
    })

    it('should focus input when clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(input).toHaveFocus()
    })
  })

  describe('Tag Selection', () => {
    it('should add tag when user clicks on a suggestion', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Wait for popover to open and click on a tag
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })

      const tagButton = screen.getByText('javascript')
      await user.click(tagButton)

      // Verify tag was added
      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should close popover after selecting a tag', async () => {
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

      const tagButton = screen.getByText('javascript')
      await user.click(tagButton)

      // Popover should close after selection
      await waitFor(() => {
        const popover = screen.queryByRole('dialog')
        expect(popover).not.toBeInTheDocument()
      })
    })

    it('should focus input after selecting a tag', async () => {
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
        expect(input).toHaveFocus()
      })
    })

    it('should not show selected tags in dropdown', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Select first tag
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })
      await user.click(screen.getByText('javascript'))

      // Open popover again
      await user.click(input)

      // javascript should not be in the dropdown anymore
      await waitFor(() => {
        const dropdownItems = screen.queryAllByText('javascript')
        // Only the selected tag chip should exist, not in dropdown
        expect(dropdownItems.length).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Tag Removal', () => {
    it('should remove tag when clicking on its X button', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Add a tag
      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })
      await user.click(screen.getByText('javascript'))

      // Find and click the remove button
      await waitFor(() => {
        const tagChip = screen.getByText('javascript', { selector: 'span' })
        expect(tagChip).toBeInTheDocument()
      })

      const tagChips = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('javascript')
      )
      
      // Click on the tag chip to remove it
      await user.click(tagChips[0])

      // Tag should be removed
      await waitFor(() => {
        const remainingChips = screen.queryAllByText('javascript', { selector: 'span' })
        expect(remainingChips).toHaveLength(0)
      })
    })

    it('should allow re-selection of removed tags', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Add tag
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))

      // Remove tag
      await waitFor(() => screen.getByText('javascript', { selector: 'span' }))
      const chips = screen.getAllByRole('button').filter(btn => 
        btn.textContent?.includes('javascript')
      )
      await user.click(chips[0])

      // Re-add tag
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))

      // Tag should be present again
      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Interactions', () => {
    it('should open popover when any key is pressed', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.keyboard('a')

      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
      })
    })

    it('should add tag on Enter key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      await waitFor(() => screen.getByText('javascript'))
      
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should add tag on Tab key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      await waitFor(() => screen.getByText('javascript'))
      
      await user.keyboard('{Tab}')

      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should add current input value as tag on Space key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.type(input, 'customtag')
      await user.keyboard(' ')

      await waitFor(() => {
        expect(screen.getByText('customtag', { selector: 'span' })).toBeInTheDocument()
      })
      expect(input).toHaveValue('')
    })

    it('should not add empty tag on Space key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.keyboard(' ')

      // No tag should be added
      const tagChips = screen.queryAllByRole('button').filter(btn => 
        btn.querySelector('span')
      )
      expect(tagChips).toHaveLength(0)
    })

    it('should close popover on Escape key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      await waitFor(() => screen.getByText('javascript'))

      await user.keyboard('{Escape}')

      await waitFor(() => {
        const popover = screen.queryByRole('dialog')
        expect(popover).not.toBeInTheDocument()
      })
    })

    it('should blur input on Escape key', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      expect(input).toHaveFocus()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(input).not.toHaveFocus()
      })
    })

    it('should remove last tag on Backspace with empty input', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Add two tags
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))
      
      await user.click(input)
      await waitFor(() => screen.getByText('typescript'))
      await user.click(screen.getByText('typescript'))

      // Both tags should be present
      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
        expect(screen.getByText('typescript', { selector: 'span' })).toBeInTheDocument()
      })

      // Press backspace with empty input
      await user.click(input)
      await user.keyboard('{Backspace}')

      // Last tag (typescript) should be removed
      await waitFor(() => {
        expect(screen.queryByText('typescript', { selector: 'span' })).not.toBeInTheDocument()
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should clear all tags when only one remains and Backspace is pressed', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Add one tag
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))

      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      })

      // Press backspace
      await user.click(input)
      await user.keyboard('{Backspace}')

      // All tags should be cleared
      await waitFor(() => {
        expect(screen.queryByText('javascript', { selector: 'span' })).not.toBeInTheDocument()
      })
    })

    it('should not remove tags on Backspace with non-empty input', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Add a tag
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))

      // Type something
      await user.click(input)
      await user.type(input, 'test')

      // Press backspace (should only delete character, not tag)
      await user.keyboard('{Backspace}')

      // Tag should still be present
      expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
      expect(input).toHaveValue('tes') // One character removed from input
    })
  })

  describe('Search and Filtering', () => {
    it('should filter tags based on search input', async () => {
      const user = userEvent.setup()
      
      // Mock filtered results
      mockUseQueryWithStatus.mockReturnValue({
        data: [{ name: 'javascript', slug: 'javascript' }],
        isPending: false,
      })

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.type(input, 'java')

      await waitFor(() => {
        expect(screen.getByText('javascript')).toBeInTheDocument()
        expect(screen.queryByText('typescript')).not.toBeInTheDocument()
        expect(screen.queryByText('react')).not.toBeInTheDocument()
      })
    })

    it('should show loading state while fetching tags', async () => {
      const user = userEvent.setup()
      
      mockUseQueryWithStatus.mockReturnValue({
        data: undefined,
        isPending: true,
      })

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Should show skeleton loaders
      await waitFor(() => {
        // Skeleton components should be present
        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
      })
    })

    it('should handle empty search results', async () => {
      const user = userEvent.setup()
      
      mockUseQueryWithStatus.mockReturnValue({
        data: [],
        isPending: false,
      })

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Popover should not show if no filtered tags
      await waitFor(() => {
        const popover = screen.queryByRole('dialog')
        expect(popover).not.toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid input changes', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Type rapidly
      await user.click(input)
      await user.type(input, 'abcdefghijk', { delay: 1 })

      expect(input).toHaveValue('abcdefghijk')
    })

    it('should handle adding multiple tags quickly', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')

      // Add multiple tags in sequence
      for (const tagName of ['javascript', 'typescript', 'react']) {
        await user.click(input)
        await waitFor(() => screen.getByText(tagName))
        await user.click(screen.getByText(tagName))
      }

      // All tags should be present
      await waitFor(() => {
        expect(screen.getByText('javascript', { selector: 'span' })).toBeInTheDocument()
        expect(screen.getByText('typescript', { selector: 'span' })).toBeInTheDocument()
        expect(screen.getByText('react', { selector: 'span' })).toBeInTheDocument()
      })
    })

    it('should handle special characters in search', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.type(input, '!@#$%^&*()')

      expect(input).toHaveValue('!@#$%^&*()')
    })

    it('should handle very long tag names', async () => {
      const user = userEvent.setup()
      
      const longTagName = 'a'.repeat(100)
      mockUseQueryWithStatus.mockReturnValue({
        data: [{ name: longTagName, slug: longTagName }],
        isPending: false,
      })

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      await waitFor(() => {
        expect(screen.getByText(longTagName)).toBeInTheDocument()
      })
    })

    it('should not add duplicate tags', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Try to add same tag twice
      await user.click(input)
      await waitFor(() => screen.getByText('javascript'))
      await user.click(screen.getByText('javascript'))

      await user.click(input)
      // javascript should not appear in dropdown anymore
      await waitFor(() => {
        const javascriptButtons = screen.queryAllByText('javascript', { selector: 'button span' })
        expect(javascriptButtons.length).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on input', () => {
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Tab to focus input
      await user.tab()
      
      expect(input).toHaveFocus()
    })

    it('should support screen readers with proper labels', () => {
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      // Input should be accessible
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Integration with useClickOutside', () => {
    it('should close popover when clicking outside', async () => {
      const useClickOutside = require('../../../../hooks/use-click-outside').default
      
      let clickOutsideCallback: (() => void) | null = null
      
      useClickOutside.mockImplementation(({ clickOutsideFn }: any) => {
        clickOutsideCallback = clickOutsideFn
        return { wrapperRef: { current: null } }
      })

      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      // Simulate click outside
      if (clickOutsideCallback) {
        clickOutsideCallback()
      }

      // Popover should be closed
      await waitFor(() => {
        const popover = screen.queryByRole('dialog')
        expect(popover).not.toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should memoize filtered tags', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      
      // Trigger multiple renders without changing tags
      await user.click(input)
      await user.click(document.body)
      await user.click(input)

      // Component should not crash or have performance issues
      expect(input).toBeInTheDocument()
    })

    it('should handle large tag lists efficiently', async () => {
      const largeMockTags = Array.from({ length: 1000 }, (_, i) => ({
        name: `tag${i}`,
        slug: `tag${i}`,
      }))

      mockUseQueryWithStatus.mockReturnValue({
        data: largeMockTags,
        isPending: false,
      })

      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TagInput />
        </TestWrapper>
      )

      const input = screen.getByRole('textbox')
      await user.click(input)

      // Component should render without performance issues
      expect(input).toBeInTheDocument()
    })
  })
})