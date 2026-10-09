import { test as base, expect } from "@playwright/test";

// Browsers also log failed requests to the console; those are tracked via responses below.
const RESOURCE_ERROR_PREFIX = "Failed to load resource";
const HTTP_ERROR_MIN = 400;

// Every test fails on uncaught exceptions, console errors or failed subresources (CSS/JS/images/XHR).
// The main document's status is asserted by the tests themselves (e.g. the 404 page).
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !message.text().startsWith(RESOURCE_ERROR_PREFIX)
      ) {
        errors.push(message.text());
      }
    });
    page.on("response", (response) => {
      if (
        response.status() >= HTTP_ERROR_MIN &&
        !response.request().isNavigationRequest()
      ) {
        errors.push(`HTTP ${response.status()} ${response.url()}`);
      }
    });
    await use(page);
    expect(errors, "JS errors / failed resources on the page").toEqual([]);
  },
});

export { expect };
