module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/upload-release-asset.js"
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  transform: {
    "^.+\\.js?$": "babel-jest"
  },
  transformIgnorePatterns: ['node_modules/(?!@actions/github)']
};
