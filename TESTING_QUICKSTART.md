# Testing Quickstart Guide

## 🚀 Quick Start

### Prerequisites

Make sure you have dependencies installed:

```bash
# Install all dependencies
npm install

# Or using bun
bun install
```

### Running Tests

#### Run All Tests

```bash
# From project root - runs all tests in all workspaces
npm test --workspaces
```

#### Run Frontend Tests Only

```bash
cd apps/web
npm test
```

#### Run Backend Tests Only

```bash
cd packages/backend
npm test
```

### Interactive Test UI

For a better testing experience with a visual interface:

```bash
# Frontend
cd apps/web
npm run test:ui

# Backend
cd packages/backend
npm run test:ui
```

### Code Coverage

Generate coverage reports:

```bash
# Frontend
cd apps/web
npm run test:coverage

# Backend
cd packages/backend
npm run test:coverage
```

## 📁 Test Structure