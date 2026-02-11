/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native-web|@moneylife|react-i18next|i18next)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': 'react-native-web',
    '^@moneylife/ui-kit$': '<rootDir>/../../packages/ui-kit/src',
    '^@moneylife/shared-types$': '<rootDir>/../../packages/shared-types/src',
  },
  testPathPattern: 'src/__tests__/.*\\.test\\.tsx?$',
};
