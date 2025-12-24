# Test Documentation

This document provides comprehensive information about the test suite for the Daimo project.

## Overview

The project now includes extensive unit tests for the key features added in the current branch:

- Custom React hooks (`use-click-outside`)
- React components (`TagInput`)
- Backend Convex queries and mutations (`tags`, `characters/internal`)

## Test Framework

We use **Vitest** as our testing framework, along with **React Testing Library** for component testing.

### Why Vitest?

- Fast execution with native ESM support
- Great DX with watch mode and UI
- Compatible with Jest API
- Excellent TypeScript support
- Built-in code coverage

## Running Tests

### Frontend Tests (apps/web)

```bash
cd apps/web

# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Backend Tests (packages/backend)

```bash
cd packages/backend

# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Run All Tests

```bash
# From project root
npm test --workspaces
```

## Test Structure

### Frontend Tests

#### `apps/web/hooks/__tests__/use-click-outside.test.ts`

**Coverage:**
- ✅ Ref creation and management
- ✅ Click outside detection
- ✅ Click inside handling (no callback trigger)
- ✅ Callback reference updates
- ✅ Event listener cleanup on unmount
- ✅ Null ref handling
- ✅ MouseEvent propagation
- ✅ Nested element support
- ✅ Multiple rapid clicks
- ✅ Edge cases and error conditions

**Test Count:** 10 tests

#### `apps/web/components/forms/tag-input/__tests__/tag-input.test.tsx`

**Coverage:**
- ✅ Component rendering
- ✅ Tag addition via Space key
- ✅ Tag addition via Enter/Tab (autocomplete)
- ✅ Tag removal via click
- ✅ Tag removal via Backspace
- ✅ Input validation (empty, with spaces)
- ✅ Popover open/close behavior
- ✅ Escape key handling
- ✅ Tag filtering (already selected)
- ✅ Loading states
- ✅ Empty data handling
- ✅ Search functionality
- ✅ Focus management
- ✅ Edge cases

**Test Count:** 20+ tests

### Backend Tests

#### `packages/backend/convex/tags/__tests__/internal.test.ts`

**Coverage:**
- ✅ `getTagByName`: Exact match, null handling, special characters, case sensitivity
- ✅ `createTag`: Valid creation, validation, special characters, length limits
- ✅ `relateTag`: Relationship creation, multiple tags per character, validation
- ✅ Edge cases: Concurrent operations, long names, special database characters

**Test Count:** 25+ tests

#### `packages/backend/convex/__tests__/tags.test.ts`

**Coverage:**
- ✅ `list` query with search term: Partial matches, case insensitivity, special characters
- ✅ `list` query without search: Default limit (10), empty results, ordering
- ✅ Performance considerations: Result limiting, index usage
- ✅ Data integrity: Required fields, deleted tags
- ✅ Optional parameter handling

**Test Count:** 30+ tests

#### `packages/backend/convex/characters/__tests__/internal.test.ts`

**Coverage:**
- ✅ Tag generation: Count (10), relevance, format validation
- ✅ AI integration: Model usage, prompt configuration, schema validation
- ✅ Duplicate handling: Existing tag detection, relationship creation
- ✅ Error handling: Character not found, AI failures, network issues
- ✅ Concurrent operations
- ✅ Integration scenarios: Minimal/extensive descriptions, special characters

**Test Count:** 40+ tests

## Test Categories

### 1. Unit Tests

Test individual functions and components in isolation.

**Examples:**
- Hook behavior (`use-click-outside`)
- Pure functions
- Individual query handlers

### 2. Integration Tests

Test how components work together.

**Examples:**
- `TagInput` component with mock API
- Character tag creation flow

### 3. Edge Case Tests

Test boundary conditions and error scenarios.

**Examples:**
- Empty inputs
- Very long inputs
- Special characters
- Concurrent operations
- Network failures

## Mocking Strategy

### Frontend Mocks

```typescript
// Mock Convex queries
vi.mock('@/lib/convex/use-query-with-status', () => ({
  useQueryWithStatus: vi.fn(() => ({
    data: mockData,
    isPending: false,
  })),
}))

// Mock custom hooks
vi.mock('@/hooks/use-click-outside', () => ({
  default: vi.fn(() => ({ wrapperRef: { current: null } })),
}))
```

### Backend Mocks

For Convex functions, we use structural testing patterns that validate:
- Input/output contracts
- Error handling
- Data validation
- Edge cases

## Best Practices

### 1. Test Naming

Use descriptive names that clearly state what is being tested:

```typescript
it('should call callback when clicking outside the ref element', async () => {
  // Test implementation
})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should add tag when space key is pressed', async () => {
  // Arrange
  const { container } = render(<TagInput />)
  const input = screen.getByRole('textbox')
  
  // Act
  fireEvent.change(input, { target: { value: 'newtag' } })
  fireEvent.keyDown(input, { key: ' ' })
  
  // Assert
  await waitFor(() => {
    expect(screen.getByText('newtag')).toBeInTheDocument()
  })
})
```

### 3. Test Isolation

Each test should be independent and not rely on other tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

### 4. Async Testing

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(mockCallback).toHaveBeenCalled()
})
```

### 5. Coverage Goals

- **Minimum:** 80% line coverage
- **Target:** 90% line coverage
- **Focus areas:** Critical business logic, user interactions, error handling

## Continuous Integration

Tests should be run:
- ✅ On every commit (pre-commit hook)
- ✅ On pull requests
- ✅ Before deployment

### CI Configuration Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- --run --coverage
```

## Debugging Tests

### Watch Mode

```bash
npm test
```

Vitest will watch for changes and re-run relevant tests automatically.

### UI Mode

```bash
npm run test:ui
```

Opens a browser-based UI for better test visualization and debugging.

### Debug Specific Test

```bash
npm test -- --grep "should call callback when clicking outside"
```

### VSCode Integration

Install the "Vitest" extension for VSCode to run and debug tests directly in your editor.

## Common Issues and Solutions

### Issue: Tests timeout

**Solution:** Increase timeout or check for missing `await` keywords

```typescript
it('should handle async operation', async () => {
  // ...
}, { timeout: 10000 })
```

### Issue: Mock not working

**Solution:** Ensure mocks are defined before imports

```typescript
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn(() => Promise.resolve(mockData))
}))
```

### Issue: DOM cleanup warnings

**Solution:** Use `cleanup()` in `afterEach`

```typescript
afterEach(() => {
  cleanup()
})
```

## Future Improvements

1. **Add E2E tests** using Playwright
2. **Increase coverage** to 95%+
3. **Add visual regression testing**
4. **Performance benchmarking tests**
5. **Accessibility testing** with jest-axe
6. **Add mutation testing** with Stryker

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Convex Testing Guide](https://docs.convex.dev/functions/testing)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve coverage percentage
4. Document complex test scenarios
5. Follow existing test patterns

## Questions?

For questions about testing, please:
- Check this documentation first
- Review existing test examples
- Ask in the team chat
- Open an issue for test infrastructure improvements