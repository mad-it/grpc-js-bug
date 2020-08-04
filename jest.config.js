/* eslint-disable immutable/no-mutation */

module.exports = {
  coveragePathIgnorePatterns: ["/node_modules/", "lib/bundle.js"],
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
};
