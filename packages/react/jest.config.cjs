module.exports = {
  preset: '@flatfile/jest-preset-platform-sdk',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|sass|scss|otf)$': '<rootDir>/src/test/styleMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.env.js'],
}
