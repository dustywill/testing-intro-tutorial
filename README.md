# Testing Best Practices Tutorial

An interactive, self-paced tutorial that teaches automated testing best practices through hands-on exercises. Learn to diagnose bugs using unit tests, integration tests, and E2E tests, then practice Test-Driven Development (TDD) with real code.

## What You'll Learn

- **Bug Diagnosis** - Use different test layers (unit, integration, E2E) to locate and understand bugs
- **Test-Driven Development** - Practice the Red-Green-Refactor cycle with guided exercises
- **Testing Pyramid** - Understand when to use each type of test
- **Practical Skills** - Write real test assertions using Vitest and Playwright

## Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org)
- **Git** - For cloning the repository
- **Code Editor** - VS Code recommended
- **Basic JavaScript** - Variables, functions, async/await

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dustywill/testing-intro-tutorial.git
cd testing-intro-tutorial

# Install dependencies
npm install

# Open the tutorial in your browser
npm run tutorial
```

## Tutorial Structure

| Page | Topic | Time |
|------|-------|------|
| 1 | Introduction & Learning Objectives | 5 min |
| 2 | Environment Setup | 10 min |
| 3 | Exercise 1: Priority Filter Bug (Unit Tests) | 15 min |
| 4 | Exercise 2: Validation Bug (Integration Tests) | 15 min |
| 5 | Exercise 3: Drag-Drop Bug (E2E Tests) | 20 min |
| 6 | Exercise 4: TDD Demonstration | 25 min |
| 7 | Conclusion & Next Steps | 5 min |

**Total time: ~90 minutes**

## Available Commands

```bash
# Tutorial
npm run tutorial                  # Open tutorial in browser
npm run tutorial:setup-exercise-5 # Set up TDD exercise scaffolding

# Demo scenarios
npm run demo:setup-broken         # Apply all 4 bugs for exercises
npm run demo:reset                # Reset to clean state
npm run demo:bug-01               # Toggle Priority Filter bug
npm run demo:bug-03               # Toggle Validation bug
npm run demo:bug-04               # Toggle Drag-Drop bug

# Testing
npm test                          # Run all tests
npm run test:unit                 # Run unit tests only
npm run test:integration          # Run integration tests only
npm run test:e2e                  # Run E2E tests (headed)
npm run test:e2e:headless         # Run E2E tests (headless)

# Development
npm run dev                       # Start development server
npm run build                     # Build for production
```

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS, AG Grid
- **Backend**: Express.js (in-memory data store)
- **Unit/Integration Tests**: Vitest
- **E2E Tests**: Playwright
- **Tutorial**: Static HTML with Prism.js syntax highlighting

## Project Structure

```
├── tutorial/              # Tutorial pages and styles
│   ├── index.html         # Tutorial landing page
│   ├── pages/             # Tutorial content pages
│   └── styles/            # Tutorial CSS
├── src/
│   ├── client/            # Frontend code
│   └── server/            # Backend API
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── helpers/           # Test utilities
├── e2e/                   # Playwright E2E tests
├── scripts/               # Demo and utility scripts
└── package.json           # Dependencies and scripts
```

## Troubleshooting

### "npm not found"
Install Node.js from [nodejs.org](https://nodejs.org). Restart your terminal after installation.

### Tests fail on first run
Run `npm run demo:reset` to ensure a clean state, then try again.

### E2E tests hang
Ensure no other processes are using port 3000. Run `npm run demo:reset` and try again.

### Tutorial doesn't open
Try opening `tutorial/index.html` directly in your browser.

## License

MIT

## Contributing

This tutorial was built to demonstrate testing best practices. Feel free to fork and adapt for your own training needs.
