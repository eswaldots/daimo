# Testing Guide

This document describes the testing infrastructure and practices for the Daimo project.

## Overview

We use Vitest as our testing framework across both the web application and backend. The tests cover:

- React components and hooks
- Convex backend queries, mutations, and actions
- Integration between frontend and backend
- Edge cases and error handling

## Setup

### Installation

Tests are automatically set up when you install dependencies:

```bash
bun install
```

### Running Tests

#### Web Application

```bash
# Run all tests
cd apps/web
bun test

# Run tests in watch mode
bun test:watch

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

#### Backend

```bash
# Run all tests
cd packages/backend
bun test

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage
```

#### Run All Tests

From the root directory:

```bash
turbo test
```

## Test Structure

### Frontend Tests

Located in `apps/web/__tests__/`:

- `hooks/` - Custom React hooks
  - `use-click-outside.test.ts` - Outside click detection hook
  
- `components/` - React components
  - `forms/tag-input/tag-input.test.tsx` - Tag input component
  
- `lib/` - Utility functions and helpers
  - `convex/use-query-with-status.test.ts` - Query hook with status

### Backend Tests

Located in `packages/backend/convex/__tests__/`:

- `tags/` - Tag-related functionality
  - `tags.test.ts` - Tag listing and searching
  - `internal.test.ts` - Internal tag operations
  
- `characters/` - Character-related functionality
  - `internal.test.ts` - AI-powered tag generation

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(0)
  })

  it('should update value', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.setValue(42)
    })
    
    expect(result.current.value).toBe(42)
  })
})
```

### Backend Tests

```typescript
import { describe, it, expect } from 'vitest'
import { ConvexTestingHelper } from '../test-utils/convex-testing-helper'

describe('myQuery', () => {
  let testHelper: ConvexTestingHelper

  beforeEach(() => {
    testHelper = new ConvexTestingHelper()
  })

  it('should return data', async () => {
    testHelper.mockQuery('myTable', [{ id: 1, name: 'Test' }])
    
    const result = await testHelper.runQuery('myQuery', {})
    
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Test')
  })
})
```

## Test Coverage

### Current Coverage

Run `bun test:coverage` to see detailed coverage reports.

### Coverage Goals

- Unit tests: >80% coverage
- Integration tests: Cover all critical paths
- E2E tests: Cover main user flows (future work)

## Mocking

### Frontend Mocks

- Next.js Router: Mocked in `vitest.setup.ts`
- Convex React: Mocked in `vitest.setup.ts`
- PostHog: Mocked in `vitest.setup.ts`

### Backend Mocks

- Convex Runtime: Mocked in `vitest.setup.ts`
- AI SDK: Mocked in `vitest.setup.ts`
- Groq Provider: Mocked in `vitest.setup.ts`

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component/function does, not how it does it
   
2. **Use Descriptive Test Names**
   - Test names should clearly describe what they test
   
3. **Arrange-Act-Assert Pattern**
   - Structure tests with clear setup, execution, and verification phases
   
4. **Test Edge Cases**
   - Include tests for error conditions, empty states, and boundary values
   
5. **Keep Tests Independent**
   - Each test should be able to run in isolation
   
6. **Use Test Helpers**
   - Create reusable test utilities for common patterns

## Continuous Integration

Tests run automatically on:
- Every push to a branch
- Every pull request
- Before deployment

## Troubleshooting

### Tests Failing Locally

1. Ensure dependencies are up to date: `bun install`
2. Clear test cache: `bun test --clearCache`
3. Check for environment-specific issues

### Slow Tests

1. Use `test.concurrent` for independent tests
2. Mock external dependencies
3. Avoid unnecessary waiting/delays

### Flaky Tests

1. Avoid time-dependent assertions
2. Use proper async/await patterns
3. Mock time when testing time-sensitive code

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Convex Testing Guide](https://docs.convex.dev/testing)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Document any special testing considerations