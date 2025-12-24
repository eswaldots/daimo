# Test Documentation

This document describes the testing setup and test coverage for the Daimo web application.

## Testing Stack

- **Test Framework**: Vitest
- **React Testing**: @testing-library/react
- **DOM Assertions**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event

## Test Structure

### Frontend Tests (`apps/web`)

#### 1. Hooks Tests (`hooks/__tests__/`)

**use-click-outside.test.ts**
- Tests the custom hook for detecting clicks outside of elements
- Coverage:
  - ✓ Basic ref functionality
  - ✓ Click outside detection
  - ✓ Click inside behavior (should not trigger)
  - ✓ Child element clicks (should not trigger)
  - ✓ Callback reference updates
  - ✓ Null ref handling
  - ✓ Event listener cleanup on unmount
  - ✓ Invalid callback handling
  - ✓ Rapid successive clicks
  - ✓ Nested element support

#### 2. Component Tests (`components/`)

**components/ui/__tests__/popover.test.tsx**
- Tests the Popover UI component wrapper
- Coverage:
  - ✓ Component rendering
  - ✓ Data-slot attributes
  - ✓ Custom className support
  - ✓ Default prop values
  - ✓ Prop overrides
  - ✓ Portal rendering
  - ✓ Content and trigger text rendering
  - ✓ Multiple children support
  - ✓ Animation classes
  - ✓ Styling classes
  - ✓ Accessibility attributes
  - ✓ Keyboard navigation

**components/forms/tag-input/__tests__/tag-input.test.tsx**
- Tests the TagInput component with complex state management
- Coverage:
  - ✓ Basic rendering
  - ✓ Input value updates
  - ✓ Popover open/close behavior
  - ✓ Tag addition (Enter, Tab, Space keys)
  - ✓ Tag removal (Backspace, click)
  - ✓ Empty input validation
  - ✓ Space character handling
  - ✓ Escape key handling
  - ✓ Tag filtering (exclude selected)
  - ✓ Multiple tag display
  - ✓ Input clearing after add
  - ✓ Focus management
  - ✓ Loading states
  - ✓ Empty suggestions handling
  - ✓ Dropdown interaction
  - ✓ Rapid key presses
  - ✓ Special characters in tags
  - ✓ Long tag names
  - ✓ Duplicate prevention
  - ✓ filteredTags memoization
  - ✓ handleCompletion edge cases

#### 3. Library Tests (`lib/convex/__tests__/`)

**use-query-with-status.test.ts**
- Tests the Convex query wrapper utility
- Coverage:
  - ✓ Function definition
  - ✓ Parameter acceptance
  - ✓ Integration with convex-helpers
  - ✓ Integration with convex/react
  - ✓ Undefined args handling
  - ✓ Empty args handling
  - ✓ Complex nested args

### Backend Tests (`packages/backend/convex/__tests__/`)

#### 1. Tags Module Tests

**tags.test.ts**
- Tests the public tags query functions
- Coverage:
  - ✓ Search functionality with searchTerm
  - ✓ Default query (10 results)
  - ✓ Empty search results
  - ✓ Undefined searchTerm handling
  - ✓ withSearchIndex parameter validation
  - ✓ Special characters in search
  - ✓ Long search terms
  - ✓ Case sensitivity
  - ✓ Partial matches
  - ✓ Exact limit application
  - ✓ Empty database handling

**tags.internal.test.ts**
- Tests internal tag management functions
- Coverage:
  - ✓ getTagByName - found cases
  - ✓ getTagByName - not found cases
  - ✓ getTagByName - index usage
  - ✓ getTagByName - special characters
  - ✓ getTagByName - case sensitivity
  - ✓ createTag - insertion and ID return
  - ✓ createTag - data structure validation
  - ✓ createTag - hyphenated names
  - ✓ createTag - underscored names
  - ✓ createTag - lowercase enforcement
  - ✓ relateTag - relationship creation
  - ✓ relateTag - multiple relationships per character
  - ✓ relateTag - multiple characters per tag
  - ✓ relateTag - args pass-through

#### 2. Characters Module Tests

**characters.internal.test.ts**
- Tests internal character-related actions including AI tag generation
- Coverage:
  - ✓ Error when character not found
  - ✓ Tag generation for existing character
  - ✓ Skip creation if tag exists
  - ✓ Create and relate new tags
  - ✓ AI generation returning 10 tags
  - ✓ Lowercase tag enforcement
  - ✓ Special character removal
  - ✓ Prompt includes character details
  - ✓ Groq model usage
  - ✓ Promise.all processing
  - ✓ AI generation error handling
  - ✓ Database query error handling
  - ✓ Database mutation error handling
  - ✓ Full integration flow

#### 3. Test Utilities

**test-utils.ts**
- Provides reusable testing utilities
- Features:
  - ConvexTestingHelper class
  - Mock database creator
  - Mock context creator
  - Mock query builder
  - Mock ID generator
  - Mock entity factories (Character, Tag, CharacterTag)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- use-click-outside.test.ts

# Run tests for specific workspace
npm test --workspace=@daimo/web
```

## Coverage Goals

- **Target**: 80%+ coverage for new code
- **Focus Areas**:
  - All pure functions: 100% coverage
  - React hooks: 90%+ coverage
  - UI components: 80%+ coverage
  - Backend queries/mutations: 90%+ coverage
  - Backend actions with external deps: 70%+ coverage

## Best Practices

1. **Test Naming**: Use descriptive names starting with "should"
2. **Arrange-Act-Assert**: Follow AAA pattern in tests
3. **Mocking**: Mock external dependencies and UI components
4. **Isolation**: Each test should be independent
5. **Edge Cases**: Always test boundary conditions
6. **Error Cases**: Test error handling paths
7. **Async**: Use proper async/await patterns
8. **Cleanup**: Always clean up after tests

## Future Improvements

- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 90%+
- [ ] Add visual regression tests
- [ ] Add performance benchmarks
- [ ] Add mutation testing
- [ ] Add contract tests for API endpoints

## CI/CD Integration

Tests are automatically run:
- On every pull request
- Before merging to main
- In pre-commit hooks (optional)

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module"
**Solution**: Ensure all dependencies are installed and path aliases are configured in vitest.config.ts

**Issue**: React component tests throw errors
**Solution**: Check that vitest.setup.ts is properly configured with jsdom environment

**Issue**: Async tests timeout
**Solution**: Increase timeout in test or use `await waitFor()` for async operations

**Issue**: Mocks not working
**Solution**: Ensure mocks are defined before importing the module being tested