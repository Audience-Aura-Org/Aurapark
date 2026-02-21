/**
 * Jest Test Setup File
 * Global configuration for all tests
 */

import mongoose from 'mongoose';

declare const beforeAll: any;
declare const afterAll: any;
declare const jest: any;

// Setup test database connection (in-memory for unit tests)
beforeAll(async () => {
    // Connect to test database if needed
    if (process.env.MONGODB_TEST_URI) {
        await mongoose.connect(process.env.MONGODB_TEST_URI);
    }
});

// Cleanup after all tests
afterAll(async () => {
    // Disconnect from database
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Warning: useLayoutEffect')) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
