import { expect, request } from "@playwright/test";
import test from "../testMuAI-setup";
import dotenv from "dotenv";
let apiresponse: string;
dotenv.config();

test("API tests Request Mocking", async ({ page }) => {

  // Register route BEFORE navigation
  await page.route("**/api/v1/fruits", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { name: "Apple", id: 1 },
        { name: "Banana", id: 2 },
        { name: "TestMu AI", id: 100 }
      ]),
    });
  });

  // Now navigate (this triggers API call)
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assertion
  await expect(
    page.getByText("TestMu AI", { exact: true })
  ).toBeVisible();

});

test("API Response Mocking", async ({ page }) => {
  // Get the response and add to it
  await page.route("*/**/api/v1/fruits", async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.push({ name: "TestMu AI Testing", id: 100 });
    // Fulfill using the original response, while patching the response body
    // with the given JSON object.
    await route.fulfill({ response, json });
  });

  // Go to the page
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assert that the new fruit is visible
  await expect(
    page.getByText("TestMu AI Testing", { exact: true }),
  ).toBeVisible();
});
