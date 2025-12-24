import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent } from '../popover'

describe('Popover Component', () => {
  beforeEach(() => {
    // Clear any previous state
  })

  it('should render trigger button', () => {
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('should show content when trigger is clicked', async () => {
    render(
      <Popover>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )

    const trigger = screen.getByText('Open')
    fireEvent.click(trigger)

    // Content should be visible
    expect(screen.getByText('Popover Content')).toBeInTheDocument()
  })

  it('should accept custom className for PopoverContent', () => {
    const { container } = render(
      <Popover open>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent className="custom-class">
          Content
        </PopoverContent>
      </Popover>
    )

    // Check if custom class is applied
    const content = container.querySelector('.custom-class')
    expect(content).toBeInTheDocument()
  })

  it('should support align prop', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent align="start">Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should support sideOffset prop', () => {
    render(
      <Popover open>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent sideOffset={10}>Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should handle controlled open state', () => {
    const { rerender } = render(
      <Popover open={false}>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent>Hidden Content</PopoverContent>
      </Popover>
    )

    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()

    rerender(
      <Popover open={true}>
        <PopoverTrigger>
          <button>Open</button>
        </PopoverTrigger>
        <PopoverContent>Visible Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Visible Content')).toBeInTheDocument()
  })
})