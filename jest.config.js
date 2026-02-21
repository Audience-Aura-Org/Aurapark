/**
 * Jest Configuration for Busapp Transport Platform
 * Handles TypeScript, React, and Next.js testing
 */

module.exports = {
    displayName: 'web',
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/apps/web'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    collectCoverageFrom: [
        'apps/web/lib/**/*.ts',
        'apps/web/app/api/**/*.ts',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/*.test.ts'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/web/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/apps/web/__tests__/setup.ts'],
    testTimeout: 30000,
    verbose: true,
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true
            }
        }
    }
};
