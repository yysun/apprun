/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(lit-html|@lit|lit|@lit-labs)/.*)"
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
    "^lit-html$": "<rootDir>/node_modules/lit-html/development/lit-html.js",
    "^lit-html/directive.js$": "<rootDir>/node_modules/lit-html/development/directive.js",
    "^lit-html/directives/(.*)$": "<rootDir>/node_modules/lit-html/development/directives/$1"
  }
};
