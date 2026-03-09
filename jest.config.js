{
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.js"],
  "collectCoverageFrom": [
    "app/api/**/*.js",
    "lib/**/*.js",
    "!**/*.d.ts"
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/"
  ]
}
