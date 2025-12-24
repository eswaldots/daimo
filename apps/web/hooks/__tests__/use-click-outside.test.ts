import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import useClickOutside from '../use-click-outside'

describe('useClickOutside', () => {
  let callback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    callback = vi.fn()
  })

  it('should return a ref object', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    expect(result.current.wrapperRef).toBeDefined()
    expect(result.current.wrapperRef.current).toBeNull()
  })

  it('should call callback when clicking outside the element', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    // Create a mock element and attach it to the ref
    const element = document.createElement('div')
    document.body.appendChild(element)
    result.current.wrapperRef.current = element

    // Click outside
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)
    fireEvent.mouseDown(outsideElement)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(expect.any(MouseEvent))

    // Cleanup
    document.body.removeChild(element)
    document.body.removeChild(outsideElement)
  })

  it('should not call callback when clicking inside the element', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    const element = document.createElement('div')
    document.body.appendChild(element)
    result.current.wrapperRef.current = element

    // Click inside
    fireEvent.mouseDown(element)

    expect(callback).not.toHaveBeenCalled()

    document.body.removeChild(element)
  })

  it('should not call callback when clicking on a child element', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    const parentElement = document.createElement('div')
    const childElement = document.createElement('button')
    parentElement.appendChild(childElement)
    document.body.appendChild(parentElement)
    result.current.wrapperRef.current = parentElement

    // Click on child
    fireEvent.mouseDown(childElement)

    expect(callback).not.toHaveBeenCalled()

    document.body.removeChild(parentElement)
  })

  it('should update callback reference when callback changes', () => {
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    const { result, rerender } = renderHook(
      ({ clickOutsideFn }) => useClickOutside({ clickOutsideFn }),
      { initialProps: { clickOutsideFn: firstCallback } }
    )

    const element = document.createElement('div')
    document.body.appendChild(element)
    result.current.wrapperRef.current = element

    // Click outside with first callback
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)
    fireEvent.mouseDown(outsideElement)

    expect(firstCallback).toHaveBeenCalledTimes(1)
    expect(secondCallback).not.toHaveBeenCalled()

    // Update callback
    rerender({ clickOutsideFn: secondCallback })

    // Click outside with second callback
    fireEvent.mouseDown(outsideElement)

    expect(firstCallback).toHaveBeenCalledTimes(1)
    expect(secondCallback).toHaveBeenCalledTimes(1)

    document.body.removeChild(element)
    document.body.removeChild(outsideElement)
  })

  it('should handle null ref gracefully', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    // Don't set the ref, leave it as null
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)
    fireEvent.mouseDown(outsideElement)

    // Should still call callback when ref is null
    expect(callback).toHaveBeenCalledTimes(1)

    document.body.removeChild(outsideElement)
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })

  it('should not throw error if callback is not a function', () => {
    expect(() => {
      renderHook(() =>
        useClickOutside({ clickOutsideFn: null as any })
      )
    }).not.toThrow()
  })

  it('should handle rapid successive clicks', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    const element = document.createElement('div')
    document.body.appendChild(element)
    result.current.wrapperRef.current = element

    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    // Multiple rapid clicks
    fireEvent.mouseDown(outsideElement)
    fireEvent.mouseDown(outsideElement)
    fireEvent.mouseDown(outsideElement)

    expect(callback).toHaveBeenCalledTimes(3)

    document.body.removeChild(element)
    document.body.removeChild(outsideElement)
  })

  it('should work with nested elements', () => {
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    )

    const container = document.createElement('div')
    const level1 = document.createElement('div')
    const level2 = document.createElement('div')
    const level3 = document.createElement('button')

    container.appendChild(level1)
    level1.appendChild(level2)
    level2.appendChild(level3)
    document.body.appendChild(container)
    result.current.wrapperRef.current = container

    // Click on deeply nested child
    fireEvent.mouseDown(level3)
    expect(callback).not.toHaveBeenCalled()

    // Click outside
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    fireEvent.mouseDown(outside)
    expect(callback).toHaveBeenCalledTimes(1)

    document.body.removeChild(container)
    document.body.removeChild(outside)
  })
})