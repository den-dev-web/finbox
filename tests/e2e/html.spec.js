import { HtmlValidate } from "html-validate";
import { test, expect } from "@playwright/test";
import { PAGES } from "./pages.js";

// "standard" = HTML-spec errors only; "recommended" adds style rules
const validator = new HtmlValidate({ extends: ["html-validate:standard"] });

for (const [name, path] of Object.entries(PAGES)) {
  test(`html: ${name}`, async ({ request, baseURL }) => {
    const response = await request.get(new URL(path, baseURL).href);
    const report = await validator.validateString(
      await response.text(),
      `${name}.html`,
    );
    const messages = report.results.flatMap((result) =>
      result.messages.map(
        (m) => `${m.line}:${m.column} ${m.ruleId} ${m.message}`,
      ),
    );
    expect(messages).toEqual([]);
  });
}
