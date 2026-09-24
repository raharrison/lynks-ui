import {defineConfig, mergeConfig} from 'vitest/config'
import viteConfig from './vite.config.ts'

// Workers inherit the environment, so dates format the same on every machine
process.env.TZ = 'UTC'

export default mergeConfig(viteConfig, defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        restoreMocks: true,
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/types/**'],
        },
    },
}))
