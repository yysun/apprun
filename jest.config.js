/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "node_modules/(?!(lit|@lit|lit-html|@lit-labs))"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", {
      useESM: true,
      tsconfig: "tsconfig.jest.json",
      isolatedModules: true,
      diagnostics: {
        warnOnly: true, // Convert type-check errors to warnings during tests
        ignoreCodes: [
          "TS7006", // Parameter implicitly has an 'any' type
          "TS7015", // Element implicitly has an 'any' type because index expression is not of type 'number'
          "TS7031", // Binding element implicitly has an 'any' type
          "TS7053", // Element implicitly has an 'any' type because expression of type can't be used to index type
          "TS2683", // 'this' implicitly has type 'any' because it does not have a type annotation
          "TS2345", // Argument of type is not assignable to parameter of type
          "TS2322", // Type is not assignable to type
          "TS18047", // Object is possibly 'null'
          "TS18048" // Property is possibly 'undefined'
        ]
      }
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
