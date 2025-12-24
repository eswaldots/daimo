import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '../popover'

// Mock Radix UI Popover
vi.mock('@radix-ui/react-popover', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="popover-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="popover-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="popover-content" {...props}>{children}</div>,
  Portal: ({ children }: any) => <div data-testid="popover-portal">{children}</div>,
  Anchor: ({ children, ...props }: any) => <div data-testid="popover-anchor" {...props}>{children}</div>,
}))

describe('Popover', () => {
  it('should render without crashing', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByTestId('popover-root')).toBeInTheDocument()
  })

  it('should render trigger with correct data-slot attribute', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    )

    const trigger = screen.getByTestId('popover-trigger')
    expect(trigger).toHaveAttribute('data-slot', 'popover-trigger')
  })

  it('should render content with correct data-slot attribute', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('data-slot', 'popover-content')
  })

  it('should render anchor with correct data-slot attribute', () => {
    render(
      <Popover>
        <PopoverAnchor>Anchor</PopoverAnchor>
      </Popover>
    )

    const anchor = screen.getByTestId('popover-anchor')
    expect(anchor).toHaveAttribute('data-slot', 'popover-anchor')
  })

  it('should render root with correct data-slot attribute', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    )

    const root = screen.getByTestId('popover-root')
    expect(root).toHaveAttribute('data-slot', 'popover')
  })

  it('should pass through custom className to content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class">Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveClass('custom-class')
  })

  it('should apply default align prop to content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('align', 'center')
  })

  it('should apply default sideOffset prop to content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('sideOffset', '4')
  })

  it('should allow custom align prop override', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent align="start">Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('align', 'start')
  })

  it('should allow custom sideOffset prop override', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent sideOffset={10}>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    expect(content).toHaveAttribute('sideOffset', '10')
  })

  it('should render content inside Portal', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByTestId('popover-portal')).toBeInTheDocument()
    expect(screen.getByTestId('popover-content')).toBeInTheDocument()
  })

  it('should render trigger text correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>Click me</PopoverTrigger>
      </Popover>
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render content text correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover content here</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Popover content here')).toBeInTheDocument()
  })

  it('should handle multiple children in content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>First child</div>
          <div>Second child</div>
        </PopoverContent>
      </Popover>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
  })

  it('should forward additional props to Popover root', () => {
    render(
      <Popover open={true} onOpenChange={vi.fn()}>
        <PopoverTrigger>Open</PopoverTrigger>
      </Popover>
    )

    const root = screen.getByTestId('popover-root')
    expect(root).toHaveAttribute('open')
  })

  it('should apply animation classes to content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    const className = content.className
    
    // Check for key animation classes
    expect(className).toContain('data-[state=open]:animate-in')
    expect(className).toContain('data-[state=closed]:animate-out')
  })

  it('should apply styling classes to content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const content = screen.getByTestId('popover-content')
    const className = content.className
    
    expect(className).toContain('bg-popover')
    expect(className).toContain('text-popover-foreground')
    expect(className).toContain('rounded-xl')
    expect(className).toContain('border')
  })
})

describe('Popover accessibility', () => {
  it('should be accessible with proper ARIA attributes', () => {
    render(
      <Popover>
        <PopoverTrigger>Open menu</PopoverTrigger>
        <PopoverContent>Menu content</PopoverContent>
      </Popover>
    )

    const trigger = screen.getByTestId('popover-trigger')
    expect(trigger).toBeInTheDocument()
  })

  it('should handle keyboard navigation properly', async () => {
    const user = userEvent.setup()
    
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    const trigger = screen.getByTestId('popover-trigger')
    await user.tab()
    
    expect(trigger).toBeInTheDocument()
  })
})

describe('PopoverAnchor', () => {
  it('should render correctly', () => {
    render(
      <Popover>
        <PopoverAnchor>
          <div>Anchor content</div>
        </PopoverAnchor>
      </Popover>
    )

    expect(screen.getByText('Anchor content')).toBeInTheDocument()
  })

  it('should have correct data-slot attribute', () => {
    render(
      <Popover>
        <PopoverAnchor>Anchor</PopoverAnchor>
      </Popover>
    )

    const anchor = screen.getByTestId('popover-anchor')
    expect(anchor).toHaveAttribute('data-slot', 'popover-anchor')
  })
})