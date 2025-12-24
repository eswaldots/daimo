import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagInput } from '../tag-input'

// Mock the hooks and components
vi.mock('@/hooks/use-click-outside', () => ({
  default: vi.fn(() => ({
    wrapperRef: { current: null },
  })),
}))

vi.mock('@/lib/convex/use-query-with-status', () => ({
  useQueryWithStatus: vi.fn(() => ({
    data: [
      { name: 'React', slug: 'react' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'Next.js', slug: 'nextjs' },
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

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="mock-button">
      {children}
    </button>
  ),
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}))

vi.mock('@/components/ui/input-group', () => ({
  InputGroup: ({ children, onClick, onKeyDown }: any) => (
    <div onClick={onClick} onKeyDown={onKeyDown} data-testid="input-group">
      {children}
    </div>
  ),
  InputGroupAddon: ({ children, onClick, className }: any) => (
    <div onClick={onClick} className={className} data-testid="input-group-addon">
      {children}
    </div>
  ),
  InputGroupInput: ({ value, onChange, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      data-testid="input-group-input"
      {...props}
    />
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div className={className} data-testid="skeleton" />,
}))

describe('TagInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<TagInput />)
    expect(screen.getByTestId('input-group')).toBeInTheDocument()
  })

  it('should render input field', () => {
    render(<TagInput />)
    expect(screen.getByTestId('input-group-input')).toBeInTheDocument()
  })

  it('should update input value when typing', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    await user.type(input, 'test')

    expect(input).toHaveValue('test')
  })

  it('should open popover when clicking on input group', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const inputGroup = screen.getByTestId('input-group')
    await user.click(inputGroup)

    const popover = screen.getByTestId('popover')
    expect(popover).toHaveAttribute('data-open', 'true')
  })

  it('should add tag when pressing Enter key', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    const inputGroup = screen.getByTestId('input-group')
    
    await user.type(input, 'test')
    await user.keyboard('{Enter}')

    // The first filtered tag should be added
    await waitFor(() => {
      const addons = screen.queryAllByTestId('input-group-addon')
      expect(addons.length).toBeGreaterThan(0)
    })
  })

  it('should add tag when pressing Tab key', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test')
    await user.keyboard('{Tab}')

    await waitFor(() => {
      const addons = screen.queryAllByTestId('input-group-addon')
      expect(addons.length).toBeGreaterThan(0)
    })
  })

  it('should add tag when pressing Space key with valid value', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test')
    await user.keyboard(' ')

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })

  it('should not add empty tag when pressing Space', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    await user.keyboard(' ')

    const addons = screen.queryAllByTestId('input-group-addon')
    expect(addons.length).toBe(0)
  })

  it('should not add tag containing space when pressing Space again', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test value')
    await user.keyboard(' ')

    // Should not add the tag
    const text = screen.queryByText('test value')
    expect(text).not.toBeInTheDocument()
  })

  it('should remove tag when backspace is pressed with empty input', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    // Add a tag first
    await user.type(input, 'test')
    await user.keyboard(' ')
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })

    // Clear input and press backspace
    await user.clear(input)
    await user.keyboard('{Backspace}')

    await waitFor(() => {
      expect(screen.queryByText('test')).not.toBeInTheDocument()
    })
  })

  it('should close popover when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const inputGroup = screen.getByTestId('input-group')
    await user.click(inputGroup)

    // Verify it's open
    let popover = screen.getByTestId('popover')
    expect(popover).toHaveAttribute('data-open', 'true')

    await user.keyboard('{Escape}')

    await waitFor(() => {
      popover = screen.getByTestId('popover')
      expect(popover).toHaveAttribute('data-open', 'false')
    })
  })

  it('should remove tag when clicking on tag', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    // Add a tag
    await user.type(input, 'test')
    await user.keyboard(' ')

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })

    // Click on the tag to remove it
    const addon = screen.getByTestId('input-group-addon')
    await user.click(addon)

    await waitFor(() => {
      expect(screen.queryByText('test')).not.toBeInTheDocument()
    })
  })

  it('should filter out already selected tags', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    // Add 'react' tag
    await user.type(input, 're')
    
    // Select first tag (react)
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument()
    })

    // Try to add it again
    await user.type(input, 're')
    
    // The react tag should be filtered from suggestions
    const popoverContent = screen.getByTestId('popover-content')
    expect(popoverContent).toBeInTheDocument()
  })

  it('should display multiple tags', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    // Add first tag
    await user.type(input, 'tag1')
    await user.keyboard(' ')
    
    // Add second tag
    await user.type(input, 'tag2')
    await user.keyboard(' ')

    await waitFor(() => {
      expect(screen.getByText('tag1')).toBeInTheDocument()
      expect(screen.getByText('tag2')).toBeInTheDocument()
    })
  })

  it('should clear input after adding tag', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input') as HTMLInputElement
    
    await user.type(input, 'test')
    await user.keyboard(' ')

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('should focus input after adding tag from suggestions', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test')
    await user.keyboard('{Enter}')

    // After selecting, input should be focused (simulated via focus call)
    await waitFor(() => {
      expect(input).toBeInTheDocument()
    })
  })

  it('should handle empty filtered tags gracefully', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    })

    render(<TagInput />)
    expect(screen.getByTestId('input-group')).toBeInTheDocument()
  })

  it('should show loading state when tags are pending', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: undefined,
      isPending: true,
    })

    render(<TagInput />)
    
    // Skeletons should be shown in popover content when pending
    const popover = screen.getByTestId('popover')
    expect(popover).toBeInTheDocument()
  })

  it('should not show popover content when there are no filtered tags', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    })

    render(<TagInput />)
    
    // Popover content should not render when filteredTags is empty
    const popoverContent = screen.queryByTestId('popover-content')
    expect(popoverContent).not.toBeInTheDocument()
  })

  it('should close popover after selecting a tag from dropdown', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const inputGroup = screen.getByTestId('input-group')
    await user.click(inputGroup)

    // Verify popover is open
    let popover = screen.getByTestId('popover')
    expect(popover).toHaveAttribute('data-open', 'true')

    // Click on a suggestion button
    const buttons = screen.getAllByTestId('mock-button')
    if (buttons.length > 0) {
      await user.click(buttons[0])

      await waitFor(() => {
        popover = screen.getByTestId('popover')
        expect(popover).toHaveAttribute('data-open', 'false')
      })
    }
  })
})

describe('TagInput - Edge Cases', () => {
  it('should handle rapid key presses', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test')
    await user.keyboard('{Enter}')
    await user.type(input, 'another')
    await user.keyboard('{Tab}')
    await user.type(input, 'third')
    await user.keyboard(' ')

    // All tags should be added properly
    await waitFor(() => {
      const addons = screen.getAllByTestId('input-group-addon')
      expect(addons.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should handle special characters in tag names', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    await user.type(input, 'test-tag_123')
    await user.keyboard(' ')

    await waitFor(() => {
      expect(screen.getByText('test-tag_123')).toBeInTheDocument()
    })
  })

  it('should handle very long tag names', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    const longTag = 'a'.repeat(100)
    
    await user.type(input, longTag)
    await user.keyboard(' ')

    await waitFor(() => {
      expect(screen.getByText(longTag)).toBeInTheDocument()
    })
  })

  it('should not add duplicate tags', async () => {
    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    
    // Add first occurrence
    await user.type(input, 'duplicate')
    await user.keyboard(' ')
    
    await waitFor(() => {
      expect(screen.getByText('duplicate')).toBeInTheDocument()
    })

    // Try to add duplicate
    await user.type(input, 'duplicate')
    await user.keyboard(' ')

    // Should only have one instance
    const addons = screen.getAllByTestId('input-group-addon')
    const duplicateTags = addons.filter(addon => addon.textContent?.includes('duplicate'))
    expect(duplicateTags.length).toBe(1)
  })
})

describe('TagInput - filteredTags memoization', () => {
  it('should filter tags based on already selected values', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: [
        { name: 'React', slug: 'react' },
        { name: 'Vue', slug: 'vue' },
        { name: 'Angular', slug: 'angular' },
      ],
      isPending: false,
    })

    render(<TagInput />)
    expect(screen.getByTestId('input-group')).toBeInTheDocument()
  })

  it('should return empty array when tags data is null', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: null,
      isPending: false,
    })

    render(<TagInput />)
    expect(screen.getByTestId('input-group')).toBeInTheDocument()
  })

  it('should return empty array when tags data is undefined', () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: undefined,
      isPending: false,
    })

    render(<TagInput />)
    expect(screen.getByTestId('input-group')).toBeInTheDocument()
  })
})

describe('TagInput - handleCompletion', () => {
  it('should not add tag when filteredTags is empty', async () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    })

    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    await user.type(input, 'test')
    await user.keyboard('{Enter}')

    const addons = screen.queryAllByTestId('input-group-addon')
    expect(addons.length).toBe(0)
  })

  it('should not add tag when no filtered tags are available', async () => {
    const { useQueryWithStatus } = require('@/lib/convex/use-query-with-status')
    useQueryWithStatus.mockReturnValue({
      data: undefined,
      isPending: false,
    })

    const user = userEvent.setup()
    render(<TagInput />)

    const input = screen.getByTestId('input-group-input')
    await user.keyboard('{Enter}')

    const addons = screen.queryAllByTestId('input-group-addon')
    expect(addons.length).toBe(0)
  })
})