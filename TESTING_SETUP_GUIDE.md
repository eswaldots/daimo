# Testing Setup Guide

## Installation Steps

### Step 1: Install Testing Dependencies for apps/web

```bash
cd apps/web
npm install --save-dev \
  vitest@^2.1.8 \
  @vitejs/plugin-react@^4.3.4 \
  @testing-library/react@^16.1.0 \
  @testing-library/jest-dom@^6.6.3 \
  @testing-library/user-event@^14.5.2 \
  @vitest/coverage-v8@^2.1.8
```

### Step 2: Install Testing Dependencies for packages/backend

```bash
cd ../../packages/backend
npm install --save-dev vitest@^2.1.8
```

### Step 3: Add Test Scripts

#### For apps/web/package.json

Add these scripts to the "scripts" section:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

#### For packages/backend/package.json

Add these scripts to the "scripts" section:

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  }
}
```

#### For root package.json

Add a test script that runs all tests:

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:coverage": "turbo run test:coverage"
  }
}
```

### Step 4: Verify Setup

```bash
# From repository root
cd /home/jailuser/git

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

## File Structure Created