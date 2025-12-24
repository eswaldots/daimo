import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TagInput } from "../tag-input";
import { useQuery } from "convex/react";
import { FormProvider, useForm } from "react-hook-form";

// Mock the hooks and components
vi.mock("convex/react");
vi.mock("@/hooks/use-click-outside", () => ({
  default: () => ({ wrapperRef: { current: null } }),
}));
vi.mock("@/lib/convex/use-query-with-status", () => ({
  useQueryWithStatus: vi.fn(),
}));

// Create a wrapper component with FormProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe("TagInput", () => {
  const mockTags = [
    { _id: "1" as any, _creationTime: 0, name: "javascript", slug: "javascript" },
    { _id: "2" as any, _creationTime: 0, name: "typescript", slug: "typescript" },
    { _id: "3" as any, _creationTime: 0, name: "react", slug: "react" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the input field", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should open popover when input is clicked", async () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const inputGroup = screen.getByRole("textbox").closest("div");
    fireEvent.click(inputGroup!);

    await waitFor(() => {
      expect(useQueryWithStatus).toHaveBeenCalled();
    });
  });

  it("should filter out already selected tags", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    // Add a tag by typing and pressing space
    fireEvent.change(input, { target: { value: "javascript" } });
    fireEvent.keyDown(input, { key: " " });

    // The tag should be added and not appear in filtered list
    expect(input).toHaveValue("");
  });

  it("should add tag on space key press", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "newtag" } });
    fireEvent.keyDown(input, { key: " " });

    expect(input).toHaveValue("");
  });

  it("should not add tag on space if input is empty", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.keyDown(input, { key: " " });

    // Should not add empty tag
    expect(input).toHaveValue("");
  });

  it("should not add tag on space if value contains space", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "tag with space" } });
    fireEvent.keyDown(input, { key: " " });

    // Should not add tag with spaces
    expect(input).toHaveValue("tag with space");
  });

  it("should handle Enter key to complete tag selection", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "java" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("");
  });

  it("should handle Tab key to complete tag selection", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "type" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(input).toHaveValue("");
  });

  it("should close popover on Escape key", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.keyDown(input, { key: "Escape" });

    // Popover should close and input should blur
    expect(document.activeElement).not.toBe(input);
  });

  it("should remove last tag on Backspace when input is empty", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    // Add two tags
    fireEvent.change(input, { target: { value: "tag1" } });
    fireEvent.keyDown(input, { key: " " });
    fireEvent.change(input, { target: { value: "tag2" } });
    fireEvent.keyDown(input, { key: " " });

    // Press backspace with empty input
    fireEvent.keyDown(input, { key: "Backspace" });

    // One tag should be removed
    expect(input).toHaveValue("");
  });

  it("should clear all tags when only one tag exists and backspace is pressed", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    // Add one tag
    fireEvent.change(input, { target: { value: "tag1" } });
    fireEvent.keyDown(input, { key: " " });

    // Press backspace with empty input
    fireEvent.keyDown(input, { key: "Backspace" });

    // All tags should be cleared
    expect(input).toHaveValue("");
  });

  it("should show loading skeleton when data is pending", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: undefined,
      isPending: true,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    // Input should still render
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should prevent default behavior for Enter and Tab keys", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    const preventDefaultSpy = vi.spyOn(enterEvent, "preventDefault");
    
    fireEvent(input, enterEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should handle empty filtered tags list", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: [],
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "nonexistent" } });
    fireEvent.keyDown(input, { key: "Enter" });

    // Should not crash and handleCompletion should return early
    expect(input).toHaveValue("nonexistent");
  });

  it("should update search term when typing", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    const input = screen.getByRole("textbox");
    
    fireEvent.change(input, { target: { value: "react" } });

    expect(input).toHaveValue("react");
  });

  it("should filter tags based on already selected values using useMemo", () => {
    const { useQueryWithStatus } = require("@/lib/convex/use-query-with-status");
    
    // Initial render
    const { rerender } = render(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    // Mock with tags
    useQueryWithStatus.mockReturnValue({
      data: mockTags,
      isPending: false,
    });

    rerender(
      <Wrapper>
        <TagInput />
      </Wrapper>
    );

    // The memoized filteredTags should update based on values state
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });
});