import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.js'],
      exclude: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/node_modules/**',
        '**/*.config.js'
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    projects: [
      defineProject({
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.js'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup/vitest-setup.js'],
          server: {
            deps: {
              inline: [/jsdom/]
            }
          }
        }
      }),
      defineProject({
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.js'],
          environment: 'node',
          setupFiles: ['./tests/setup/vitest-setup-integration.js']
        }
      })
    ]
  }
})
