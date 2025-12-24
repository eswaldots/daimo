import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useClickOutside from '../use-click-outside'

describe('useClickOutside', () => {
  let mockCallback: ReturnType<typeof vi.fn>
  let container: HTMLDivElement

  beforeEach(() => {
    mockCallback = vi.fn()
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.clearAllMocks()
  })

  it('should return a ref object', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    expect(result.current).toHaveProperty('wrapperRef')
    expect(result.current.wrapperRef).toHaveProperty('current')
  })

  it('should call callback when clicking outside the ref element', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    // Assign the ref to our container
    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    // Create a click event outside the container
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      })
      outsideElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    document.body.removeChild(outsideElement)
  })

  it('should not call callback when clicking inside the ref element', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    // Click inside the container
    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      })
      container.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  it('should update callback reference when prop changes', async () => {
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    const { result, rerender } = renderHook(
      ({ callback }) => useClickOutside({ clickOutsideFn: callback }),
      { initialProps: { callback: firstCallback } }
    )

    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    // Click outside with first callback
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(firstCallback).toHaveBeenCalledTimes(1)
    })

    // Update callback
    rerender({ callback: secondCallback })

    // Click outside again with second callback
    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(secondCallback).toHaveBeenCalledTimes(1)
      expect(firstCallback).toHaveBeenCalledTimes(1) // Should not be called again
    })

    document.body.removeChild(outsideElement)
  })

  it('should properly cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should handle null ref gracefully', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    // Don't assign anything to the ref, leave it as null

    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    document.body.removeChild(outsideElement)
  })

  it('should pass the mouse event to the callback', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true })
      outsideElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    document.body.removeChild(outsideElement)
  })

  it('should work with nested elements inside the ref', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    const nestedElement = document.createElement('div')
    container.appendChild(nestedElement)

    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    // Click on nested element
    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true })
      nestedElement.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  it('should handle multiple rapid clicks correctly', async () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: mockCallback })
    )

    act(() => {
      if (result.current.wrapperRef) {
        result.current.wrapperRef.current = container
      }
    })

    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    // Fire multiple clicks
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = new MouseEvent('mousedown', { bubbles: true })
        outsideElement.dispatchEvent(event)
      }
    })

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(5)
    })

    document.body.removeChild(outsideElement)
  })
})