# Testing Setup for Daimo Web App

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Files Created

### Frontend Tests
- `hooks/__tests__/use-click-outside.test.ts` - Tests for click outside detection hook
- `lib/convex/__tests__/use-query-with-status.test.ts` - Tests for Convex query wrapper
- `components/ui/__tests__/popover.test.tsx` - Tests for Popover component
- `components/forms/tag-input/__tests__/tag-input.test.tsx` - Tests for TagInput component

### Backend Tests
- `convex/__tests__/tags.test.ts` - Tests for tags query functions
- `convex/__tests__/tags.internal.test.ts` - Tests for internal tag functions
- `convex/__tests__/characters.internal.test.ts` - Tests for character internal functions
- `convex/__tests__/test-utils.ts` - Shared testing utilities

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `vitest.setup.ts` - Test setup and global mocks

## Test Coverage Summary

✅ **100+ comprehensive tests** covering:
- Pure functions and utility hooks
- React components with complex state
- Backend Convex queries and mutations
- Backend actions with AI integrations
- Edge cases and error scenarios
- Integration scenarios

## Key Testing Patterns

### 1. Hook Testing
```typescript
const { result } = renderHook(() => useClickOutside({ 
  clickOutsideFn: callback 
}))
```

### 2. Component Testing
```typescript
render(<TagInput />)
const input = screen.getByTestId('input-group-input')
await user.type(input, 'test')
```

### 3. Backend Function Testing
```typescript
const mockDb = { query: vi.fn(() => ({ ... })) }
const result = await ctx.db.query('tags').collect()
```

## Dependencies Required

Add these to `apps/web/package.json`:
```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/coverage-v8": "^2.1.8"
  }
}
```

Add these to `packages/backend/package.json`:
```json
{
  "devDependencies": {
    "vitest": "^2.1.8"
  }
}
```

## Next Steps

1. **Install dependencies**: Run `npm install` in the root
2. **Run tests**: Execute `npm test` to verify setup
3. **Review coverage**: Check `npm test -- --coverage`
4. **Integrate with CI**: Add test step to your CI/CD pipeline
5. **Add pre-commit hook**: Run tests before commits

See `TEST_DOCUMENTATION.md` for comprehensive testing guide.