/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(lit|@lit|lit-html|@lit-labs))"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", {
      useESM: true,
      tsconfig: "tsconfig.jest.json"
    }]
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  preset: "ts-jest",
  testEnvironmentOptions: {
    url: "http://localhost"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^lit$": "<rootDir>/node_modules/lit/development/index.js",
    "^lit/directive$": "<rootDir>/node_modules/lit/development/directive.js",
    "^lit/directives/(.*)$": "<rootDir>/node_modules/lit/development/directives/$1"
  }
};
