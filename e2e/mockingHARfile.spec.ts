import { expect, request } from "@playwright/test";
import test from "../testMuAI-setup";
import dotenv from "dotenv";
let apiresponse: string;
dotenv.config();

test("API tests Request Mocking from HAR", async ({ page }) => {
  await page.routeFromHAR("./hars/fruits.har", {
    url: "*/**/api/v1/fruits",
    update: false,
  });

  // Go to the page
  await page.goto("https://demo.playwright.dev/api-mocking");

  // Assert that the fruit is visible
  await expect(page.getByText("Test Mu AI")).toBeVisible();
});
