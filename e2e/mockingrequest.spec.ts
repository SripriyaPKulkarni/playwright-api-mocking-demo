import { expect, request } from "@playwright/test";
import test from "../testMuAI-setup";
import dotenv from "dotenv";
let apiresponse: string;
dotenv.config();

test("API tests Request Mocking", async ({ page }) => {
  await page.route("*/**/api/v1/fruits", async (route) => {
    const json = [{ name: "Test Mu AI", id: 21 }];
    await route.fulfill({ json });
  });

  // Go to the page
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assert that the Strawberry fruit is visible
  await expect(page.getByText("Test Mu AI")).toBeVisible();

  await page.route("*/**/api/v1/fruits", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ name: "Test Mu AI Testing", id: 100 });
    await route.fulfill({ response, json });
  });

  // Go to the page
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assert that the new fruit is visible
  await expect(page.getByText("Test Mu AI Testing", { exact: true })).toBeVisible();
});

test("API Response Mocking", async ({ page }) => {
  // Get the response and add to it
  await page.route("*/**/api/v1/fruits", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ name: "Test Mu AI Testing", id: 100 });
    // Fulfill using the original response, while patching the response body
    // with the given JSON object.
    await route.fulfill({ response, json });
  });

  // Go to the page
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assert that the new fruit is visible
  await expect(page.getByText("Test Mu AI Testing", { exact: true })).toBeVisible();
});
