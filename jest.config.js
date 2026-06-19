/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(lit|@lit|lit-html|@lit-labs|property-information))"
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
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  testEnvironmentOptions: {
    url: "http://localhost"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^lit$": "<rootDir>/node_modules/lit/development/index.js",
    "^lit/directive$": "<rootDir>/node_modules/lit/development/directive.js",
    "^lit/directives/(.*)$": "<rootDir>/node_modules/lit/development/directives/$1",
    "^property-information$": "<rootDir>/node_modules/property-information/index.js",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^(\\.{1,2}/.*)\\.jsx?$": "$1",
    "^(\\.{1,2}/.*)\\.tsx?$": "$1"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
    "/esm/"
  ]
};
