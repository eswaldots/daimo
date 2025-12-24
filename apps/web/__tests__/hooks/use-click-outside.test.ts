import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import useClickOutside from '../../hooks/use-click-outside'

describe('useClickOutside', () => {
  let mockCallback: ReturnType<typeof vi.fn>
  
  beforeEach(() => {
    mockCallback = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should return a ref object', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      expect(result.current).toHaveProperty('wrapperRef')
      expect(result.current.wrapperRef).toBeDefined()
      expect(result.current.wrapperRef.current).toBeNull()
    })

    it('should not call callback on initial render', () => {
      renderHook(() => useClickOutside({ clickOutsideFn: mockCallback }))

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('click outside detection', () => {
    it('should call callback when clicking outside the ref element', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      // Create and attach a mock element
      const mockElement = document.createElement('div')
      document.body.appendChild(mockElement)
      
      // Assign the mock element to the ref
      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore - Setting ref for test
          result.current.wrapperRef.current = mockElement
        }
      })

      // Simulate a click outside
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: outsideElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith(expect.any(MouseEvent))

      // Cleanup
      document.body.removeChild(mockElement)
      document.body.removeChild(outsideElement)
    })

    it('should not call callback when clicking inside the ref element', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const mockElement = document.createElement('div')
      const childElement = document.createElement('span')
      mockElement.appendChild(childElement)
      document.body.appendChild(mockElement)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = mockElement
        }
      })

      // Click inside (on child element)
      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: childElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).not.toHaveBeenCalled()

      document.body.removeChild(mockElement)
    })

    it('should not call callback when clicking on the ref element itself', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const mockElement = document.createElement('div')
      document.body.appendChild(mockElement)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = mockElement
        }
      })

      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: mockElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).not.toHaveBeenCalled()

      document.body.removeChild(mockElement)
    })
  })

  describe('callback updates', () => {
    it('should use updated callback function', () => {
      const firstCallback = vi.fn()
      const secondCallback = vi.fn()

      const { result, rerender } = renderHook(
        ({ callback }) => useClickOutside({ clickOutsideFn: callback }),
        {
          initialProps: { callback: firstCallback },
        }
      )

      const mockElement = document.createElement('div')
      document.body.appendChild(mockElement)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = mockElement
        }
      })

      // Update callback
      rerender({ callback: secondCallback })

      // Click outside
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: outsideElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(firstCallback).not.toHaveBeenCalled()
      expect(secondCallback).toHaveBeenCalledTimes(1)

      document.body.removeChild(mockElement)
      document.body.removeChild(outsideElement)
    })
  })

  describe('event listener cleanup', () => {
    it('should remove event listener on unmount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      )

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should not call callback after unmount', () => {
      const { result, unmount } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const mockElement = document.createElement('div')
      document.body.appendChild(mockElement)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = mockElement
        }
      })

      unmount()

      // Try to trigger click outside after unmount
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: outsideElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).not.toHaveBeenCalled()

      document.body.removeChild(mockElement)
      document.body.removeChild(outsideElement)
    })
  })

  describe('edge cases', () => {
    it('should handle null ref element', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      // Don't assign anything to the ref, leaving it null

      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: outsideElement,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      // Should call callback when ref is null
      expect(mockCallback).toHaveBeenCalledTimes(1)

      document.body.removeChild(outsideElement)
    })

    it('should handle callback that is not a function gracefully', () => {
      // @ts-ignore - Testing runtime behavior
      const { result } = renderHook(() => useClickOutside({ clickOutsideFn: null }))

      expect(result.current).toHaveProperty('wrapperRef')
      expect(() => {
        const outsideElement = document.createElement('div')
        document.body.appendChild(outsideElement)

        act(() => {
          const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
          })
          Object.defineProperty(event, 'target', {
            value: outsideElement,
            enumerable: true,
          })
          window.dispatchEvent(event)
        })

        document.body.removeChild(outsideElement)
      }).not.toThrow()
    })

    it('should handle multiple rapid clicks', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const mockElement = document.createElement('div')
      document.body.appendChild(mockElement)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = mockElement
        }
      })

      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)

      // Simulate multiple rapid clicks
      act(() => {
        for (let i = 0; i < 5; i++) {
          const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
          })
          Object.defineProperty(event, 'target', {
            value: outsideElement,
            enumerable: true,
          })
          window.dispatchEvent(event)
        }
      })

      expect(mockCallback).toHaveBeenCalledTimes(5)

      document.body.removeChild(mockElement)
      document.body.removeChild(outsideElement)
    })
  })

  describe('complex DOM structures', () => {
    it('should handle deeply nested child elements', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const container = document.createElement('div')
      const level1 = document.createElement('div')
      const level2 = document.createElement('div')
      const level3 = document.createElement('span')

      container.appendChild(level1)
      level1.appendChild(level2)
      level2.appendChild(level3)
      document.body.appendChild(container)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = container
        }
      })

      // Click on deeply nested child
      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: level3,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).not.toHaveBeenCalled()

      document.body.removeChild(container)
    })

    it('should handle sibling elements', () => {
      const { result } = renderHook(() =>
        useClickOutside({ clickOutsideFn: mockCallback })
      )

      const container = document.createElement('div')
      const sibling1 = document.createElement('div')
      const sibling2 = document.createElement('div')

      document.body.appendChild(container)
      document.body.appendChild(sibling1)
      document.body.appendChild(sibling2)

      act(() => {
        if (result.current.wrapperRef) {
          // @ts-ignore
          result.current.wrapperRef.current = container
        }
      })

      // Click on sibling
      act(() => {
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
        })
        Object.defineProperty(event, 'target', {
          value: sibling1,
          enumerable: true,
        })
        window.dispatchEvent(event)
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)

      document.body.removeChild(container)
      document.body.removeChild(sibling1)
      document.body.removeChild(sibling2)
    })
  })
})