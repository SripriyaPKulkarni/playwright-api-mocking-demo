/**
 * Add the file in your test suite to run tests on TestMu AI.
 * Import `test` object from this file in the tests.
 */

import * as base from "@playwright/test";
import path from "path";
import { chromium } from "@playwright/test"
import dotenv from 'dotenv';
dotenv.config();

// TestMu AI capabilities
// These are base configurations.
// But to run with different browser and OS please use projects mentioned in the playwright.config.ts
const capabilities = {
  browserName: "MicrosoftEdge", 
  browserVersion: "latest",
  "LT:Options": {
    platform: "Windows 11",
    build: "Playwright TestMUAI",
    name: "Playwright TestMUAI",
    user: process.env.LT_USERNAME,
    accessKey: process.env.LT_ACCESS_KEY,
    network: true,
    video: true,
    console: true,
    tunnel: false, // Add tunnel configuration if testing locally hosted webpage
    tunnelName: "", // Optional
 },
};

// Patching the capabilities dynamically according to the project name.
const modifyCapabilities = (configName, testName) => {
  let config = configName.split("@TestMu AI")[0];
  let [browserName, browserVersion, platform] = config.split(":");
  capabilities.browserName = browserName
    ? browserName
    : capabilities.browserName;
  capabilities.browserVersion = browserVersion
    ? browserVersion
    : capabilities.browserVersion;
  capabilities["LT:Options"]["platform"] = platform
    ? platform
    : capabilities["LT:Options"]["platform"];
  capabilities["LT:Options"]["name"] = testName;

};

const getErrorMessage = (obj, keys) =>
  keys.reduce(
    (obj, key) => (typeof obj == "object" ? obj[key] : undefined),
    obj
  );

const test = base.test.extend({
  page: async ({ page, playwright }, use, testInfo) => {

    // Configure TestMu AI platform for cross-browser testing
    let fileName = testInfo.file.split(path.sep).pop();
    if (testInfo.project.name.match(/TestMu AI/)) {
      modifyCapabilities(
        testInfo.project.name,
        `${testInfo.title} - ${fileName}`
      );

      const browser = await chromium.connect({
        wsEndpoint: `wss://cdp.TestMu AI.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
        timeout: 60000 // Timeout in milliseconds (e.g., 60000ms = 60 seconds)
      });

      const ltPage = await browser.newPage(testInfo.project.use);
      await ltPage.waitForLoadState('domcontentloaded');
      await ltPage.setViewportSize({ width: 1920, height: 1080 }); // Set a default viewport size
      await ltPage.waitForTimeout(2000); // Wait for a short period to ensure the window is maximized
      await use(ltPage);

      const testStatus = {
        action: "setTestStatus",
        arguments: {
          status: testInfo.status,
          remark: getErrorMessage(testInfo, ["error", "message"]),
        },
      };
      await ltPage.evaluate(() => { },
        `TestMu AI_action: ${JSON.stringify(testStatus)}`);
      await ltPage.close();
      await browser.close();
    } else {
      // Run tests in local in case of local config provided
      await use(page);
    }
  },
});

export default test;