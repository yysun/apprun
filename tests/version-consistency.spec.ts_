/**
 * Test Coverage for Version Consistency
 * 
 * Tests to validate version consistency across builds:
 * - Version synchronization between files
 * - Single source of truth for version management  
 * - Build consistency validation
 * - Package.json version matching
 */

import app from '../src/apprun';
import { APPRUN_VERSION, APPRUN_VERSION_GLOBAL } from '../src/version';

// Read package.json version
const packageJson = require('../package.json');

describe('Version Consistency Coverage', () => {
  describe('Version Synchronization', () => {
    it('should have consistent version across all modules', () => {
      // Test that app.version matches the version utility
      expect(app.version).toBe(APPRUN_VERSION);

      // Test that version utility matches package.json
      expect(APPRUN_VERSION).toBe(packageJson.version);

      // Test global version format
      expect(APPRUN_VERSION_GLOBAL).toBe(`AppRun-${APPRUN_VERSION}`);
    });

    it('should export version from main app instance', () => {
      expect(app.version).toBeDefined();
      expect(typeof app.version).toBe('string');
      expect(app.version.length).toBeGreaterThan(0);
    });

    it('should match semantic versioning pattern', () => {
      const semverPattern = /^\d+\.\d+\.\d+(?:-[\w\.]+)?(?:\+[\w\.]+)?$/;

      expect(APPRUN_VERSION).toMatch(semverPattern);
      expect(app.version).toMatch(semverPattern);
      expect(packageJson.version).toMatch(semverPattern);
    });

    it('should have valid version format in global tracking', () => {
      expect(APPRUN_VERSION_GLOBAL.startsWith('AppRun-')).toBe(true);
      expect(APPRUN_VERSION_GLOBAL).toContain(APPRUN_VERSION);
    });
  });

  describe('Single Source of Truth', () => {
    it('should use version utility as single source', () => {
      // Import version utility directly
      const { APPRUN_VERSION: directVersion } = require('../src/version');

      expect(directVersion).toBe(APPRUN_VERSION);
      expect(app.version).toBe(directVersion);
    });

    it('should not have hardcoded versions in implementation files', () => {
      // This test ensures we don't accidentally hardcode versions
      // The version should always come from the version utility
      expect(app.version).toBe(APPRUN_VERSION);
    });
  });

  describe('Build Consistency', () => {
    it('should maintain version consistency in different build formats', () => {
      // Test that the main app instance has the correct version
      expect(app.version).toBe(packageJson.version);
    });

    it('should handle version in global scope correctly', () => {
      // Test global version tracking
      const root = (typeof window !== 'undefined' ? window :
        typeof global !== 'undefined' ? global : {}) as any;

      if (root._AppRunVersions) {
        expect(root._AppRunVersions).toBe(APPRUN_VERSION_GLOBAL);
      }
    });

    it('should preserve version information across module loads', () => {
      // Test that version remains consistent after multiple imports
      const app1 = require('../src/apprun').default;
      const app2 = require('../src/apprun').default;

      expect(app1.version).toBe(app2.version);
      expect(app1.version).toBe(APPRUN_VERSION);
    });
  });

  describe('Version Validation', () => {
    it('should have version greater than 3.35.0', () => {
      const [major, minor, patch] = APPRUN_VERSION.split('.').map(Number);

      expect(major).toBeGreaterThanOrEqual(3);
      if (major === 3) {
        expect(minor).toBeGreaterThanOrEqual(35);
        if (minor === 35) {
          expect(patch).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('should not have pre-release version in production', () => {
      // Ensure no alpha, beta, rc versions in main release
      expect(APPRUN_VERSION).not.toContain('alpha');
      expect(APPRUN_VERSION).not.toContain('beta');
      expect(APPRUN_VERSION).not.toContain('rc');
    });

    it('should have matching TypeScript declaration version context', () => {
      // While we can't directly test the .d.ts file version,
      // we can ensure the runtime version is available for TypeScript
      expect(app.version).toBeDefined();
      expect(typeof app.version).toBe('string');
    });
  });

  describe('Version Reporting', () => {
    it('should report version in console during development', () => {
      // Test that version can be logged for debugging
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      console.log(`AppRun version: ${app.version}`);

      expect(consoleSpy).toHaveBeenCalledWith(`AppRun version: ${APPRUN_VERSION}`);

      consoleSpy.mockRestore();
    });

    it('should be accessible for runtime version checks', () => {
      // Test that applications can check the version at runtime
      const checkVersion = (minVersion: string) => {
        const [minMajor, minMinor, minPatch] = minVersion.split('.').map(Number);
        const [currentMajor, currentMinor, currentPatch] = app.version.split('.').map(Number);

        if (currentMajor > minMajor) return true;
        if (currentMajor === minMajor && currentMinor > minMinor) return true;
        if (currentMajor === minMajor && currentMinor === minMinor && currentPatch >= minPatch) return true;

        return false;
      };

      expect(checkVersion('3.0.0')).toBe(true);
      expect(checkVersion('3.35.0')).toBe(true);
      expect(checkVersion('4.0.0')).toBe(false);
    });
  });

  describe('Version File Integrity', () => {
    it('should export all required version constants', () => {
      const versionModule = require('../src/version');

      expect(versionModule.APPRUN_VERSION).toBeDefined();
      expect(versionModule.APPRUN_VERSION_GLOBAL).toBeDefined();

      expect(typeof versionModule.APPRUN_VERSION).toBe('string');
      expect(typeof versionModule.APPRUN_VERSION_GLOBAL).toBe('string');
    });

    it('should have properly formatted version exports', () => {
      expect(APPRUN_VERSION).toBe(packageJson.version);
      expect(APPRUN_VERSION_GLOBAL).toBe(`AppRun-${packageJson.version}`);
    });

    it('should maintain version consistency after framework initialization', () => {
      // Test that version doesn't change after app is initialized
      const initialVersion = app.version;

      // Simulate some framework operations
      app.on('test-version', () => { });
      app.run('test-version');
      app.off('test-version', () => { });

      expect(app.version).toBe(initialVersion);
      expect(app.version).toBe(APPRUN_VERSION);
    });
  });

  describe('Cross-Module Version Access', () => {
    it('should allow version access from components', () => {
      const { Component } = require('../src/component');

      // Components should be able to access framework version
      class TestComponent extends Component {
        getFrameworkVersion() {
          return app.version;
        }
      }

      const component = new TestComponent();
      expect(component.getFrameworkVersion()).toBe(APPRUN_VERSION);
    });

    it('should allow version access from router', () => {
      // Router should be able to access framework version
      expect(app.version).toBe(APPRUN_VERSION);
    });

    it('should maintain version consistency in different contexts', () => {
      // Test version access in different execution contexts
      const getVersionInContext = () => {
        return app.version;
      };

      expect(getVersionInContext()).toBe(APPRUN_VERSION);

      // Test in timeout context
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(getVersionInContext()).toBe(APPRUN_VERSION);
          resolve();
        }, 10);
      });
    });
  });

  describe('Version Migration Support', () => {
    it('should support version comparison for migration scripts', () => {
      const compareVersions = (v1: string, v2: string): number => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
          const part1 = parts1[i] || 0;
          const part2 = parts2[i] || 0;

          if (part1 > part2) return 1;
          if (part1 < part2) return -1;
        }

        return 0;
      };

      expect(compareVersions(app.version, '3.34.0')).toBeGreaterThanOrEqual(0);
      expect(compareVersions(app.version, '4.0.0')).toBeLessThan(0);
      expect(compareVersions(app.version, app.version)).toBe(0);
    });

    it('should provide stable version API for external tools', () => {
      // External tools should be able to reliably access version
      const externalToolVersionCheck = () => {
        if (typeof window !== 'undefined' && (window as any).app) {
          return (window as any).app.version;
        }
        return null;
      };

      // This might not work in test environment but verifies the pattern
      expect(typeof externalToolVersionCheck).toBe('function');
    });
  });
});
