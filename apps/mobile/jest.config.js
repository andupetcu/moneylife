/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|expo-router|expo-secure-store|@expo|react-i18next|i18next|@moneylife|zustand|@tanstack)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@moneylife/ui-kit$': '<rootDir>/../../packages/ui-kit/src',
    '^@moneylife/shared-types$': '<rootDir>/../../packages/shared-types/src',
  },
  testPathPattern: 'src/__tests__/.*\\.test\\.tsx?$',
};
