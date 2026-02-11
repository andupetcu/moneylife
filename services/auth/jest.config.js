/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json', diagnostics: { ignoreCodes: [151002] } }] },
  moduleNameMapper: {
    '^@moneylife/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
