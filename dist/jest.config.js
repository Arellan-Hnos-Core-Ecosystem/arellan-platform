"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    moduleFileExtensions: ["js", "json", "ts"],
    rootDir: "src",
    testRegex: ".*\\.spec\\.ts$",
    transform: { "^.+\\.(t|j)s$": "ts-jest" },
    collectCoverageFrom: ["**/*.(t|j)s", "!**/*.d.ts", "!main.ts"],
    coverageDirectory: "../coverage",
    testEnvironment: "node",
    moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
    coverageThreshold: {
        global: { lines: 80, functions: 80, branches: 80 },
        "./modules/finance/": { lines: 90, functions: 90, branches: 90 },
        "./modules/auth/": { lines: 95, functions: 95, branches: 95 },
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map