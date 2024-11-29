export default {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!jest.config.mjs",
    "!**/server.js",
  ],
  transform: {
    "^.+\\.[tj]sx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  testMatch: ["**/tests/**/*.test.mjs"], // Include .mjs files
};
