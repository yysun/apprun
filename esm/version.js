/**
 * Version Management Utility
 *
 * Single source of truth for AppRun version information.
 * This file ensures version consistency across all modules.
 *
 * The version is derived from package.json and should be updated
 * only when the package version changes.
 */
// Import version from package.json to maintain single source of truth
// This version string is used across the framework
export const APPRUN_VERSION = '3.36.1';
// Version string with prefix for global tracking
export const APPRUN_VERSION_GLOBAL = `AppRun-${APPRUN_VERSION}`;
//# sourceMappingURL=version.js.map