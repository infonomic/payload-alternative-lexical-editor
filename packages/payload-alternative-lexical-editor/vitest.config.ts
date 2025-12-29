// NOTE: Important! Allows process.env.SOME_ENV_VAR to accessed in tests
// without using import { loadEnv } from 'vite
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  // Fallback to vitest default suffix  '**/*.test.ts' for jsdom mode.
  const testFiles = mode === 'node' ? '**/*.test.node.ts' : '**/*.test.ts'

  return {
    plugins: [react()],
    test: {
      environment: mode === 'node' ? 'node' : 'jsdom',
      include: [testFiles],
      reporter: 'verbose',
      globals: true,
    },
  }
})
