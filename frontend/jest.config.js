module.exports = {
  testEnvironment: "jsdom", // Simulates browser environment
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest", // Use Babel to transpile JS
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy", // Mock CSS imports
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"], // Extend Jest matchers
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/index.js", // Ignore main entry points
    "!src/reportWebVitals.js", // Ignore generated files
    "!**/node_modules/**",
  ],
};
