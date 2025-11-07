/**
 * Copyright (c) 2025 Capital One
*/

import type { Config } from '@jest/types';

// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  verbose: false,
  testTimeout: 20000,
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  collectCoverageFrom: ['**/*.ts', '**/*.tsx'],

  coverageThreshold: {
    global: {
      branches: 89,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/scripts/*',
    '<rootDir>/src/__tests__/.*',
    '<rootDir>/jest.config.ts',
  ],
  moduleNameMapper: {
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
  moduleDirectories: ['node_modules'],

  reporters: ['default'],

  // setupFiles: ['jest-canvas-mock', './src/__tests__/unit/defaultHooks.ts'],

  setupFilesAfterEnv: ['./src/__tests__/setupTests.ts'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/(?!dlms-server)', '/node_modules/(?!@tsoa)/','/node_modules/(?!mongodb)/'],

  testPathIgnorePatterns: ['<rootDir>/src/__tests__/test-utils'],

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  globals: {
    IS_REACT_ACT_ENVIRONMENT: true,
  },
};

export default config;