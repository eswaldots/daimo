import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useClickOutside from "../use-click-outside";

describe("useClickOutside", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should call callback when clicking outside the element", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    );

    // Create a ref element and attach it
    const element = document.createElement("div");
    container.appendChild(element);
    
    // Manually set the ref
    if (result.current.wrapperRef.current) {
      result.current.wrapperRef.current = element as any;
    }

    // Click outside
    act(() => {
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outsideElement, enumerable: true });
      window.dispatchEvent(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not call callback when clicking inside the element", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    );

    const element = document.createElement("div");
    container.appendChild(element);
    
    // Set the wrapper ref
    Object.defineProperty(result.current.wrapperRef, "current", {
      value: element,
      writable: true,
    });

    // Click inside
    act(() => {
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: element, enumerable: true });
      element.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("should update callback when it changes", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ fn }) => useClickOutside({ clickOutsideFn: fn }),
      { initialProps: { fn: callback1 } }
    );

    // Update callback
    rerender({ fn: callback2 });

    const element = document.createElement("div");
    Object.defineProperty(result.current.wrapperRef, "current", {
      value: element,
      writable: true,
    });

    // Click outside
    act(() => {
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outsideElement, enumerable: true });
      window.dispatchEvent(event);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should cleanup event listener on unmount", () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });

  it("should handle null ref gracefully", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    );

    // Click when ref is null
    act(() => {
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: document.body, enumerable: true });
      window.dispatchEvent(event);
    });

    // Should call callback when ref is null (everything is "outside")
    expect(callback).toHaveBeenCalled();
  });

  it("should handle callback that is not a function", () => {
    // This tests the type guard in the hook
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: null as any })
    );

    expect(result.current.wrapperRef).toBeDefined();
    expect(result.current.wrapperRef.current).toBeNull();

    // Should not throw when clicking
    act(() => {
      const event = new MouseEvent("mousedown", { bubbles: true });
      window.dispatchEvent(event);
    });
  });

  it("should handle multiple rapid clicks", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside({ clickOutsideFn: callback })
    );

    const element = document.createElement("div");
    Object.defineProperty(result.current.wrapperRef, "current", {
      value: element,
      writable: true,
    });

    // Multiple clicks outside
    act(() => {
      for (let i = 0; i < 5; i++) {
        const event = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(event, "target", { value: document.body, enumerable: true });
        window.dispatchEvent(event);
      }
    });

    expect(callback).toHaveBeenCalledTimes(5);
  });
});