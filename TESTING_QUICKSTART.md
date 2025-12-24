# Testing Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
bun install
```

### 2. Run All Tests
```bash
# From root directory
turbo test

# Or run individually
cd apps/web && bun test
cd packages/backend && bun test
```

### 3. Run Tests with Coverage
```bash
bun test:coverage
```

### 4. Run Tests with UI
```bash
bun test:ui
```

## 📊 What's Been Tested

### Frontend (apps/web)
- ✅ **useClickOutside** hook - 85+ tests
- ✅ **useQueryWithStatus** hook - 20+ tests  
- ✅ **TagInput** component - 60+ tests
- ✅ **Integration workflows** - 25+ scenarios

### Backend (packages/backend)
- ✅ **Tag queries** (list, search) - 30+ tests
- ✅ **Tag operations** (create, relate) - 50+ tests
- ✅ **AI tag generation** - 35+ tests

## 📁 Test File Locations