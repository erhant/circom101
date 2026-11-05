import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { Glob } from "bun";
import { describe, it, expect } from "bun:test";

// The book pulls code from the circuits with `{{#include path:anchor}}`, and mdbook silently
// renders an empty code block if the file or the anchor is missing, so we check them here.
describe("book", () => {
  const pages = [...new Glob("book/src/**/*.md").scanSync(".")];

  it("should only include existing files & anchors", () => {
    let includes = 0;
    for (const page of pages) {
      for (const [, path, anchor] of readFileSync(page, "utf8").matchAll(/\{\{#include ([^:}]+)(?::([^}]+))?\}\}/g)) {
        includes++;
        const file = join(dirname(page), path);
        expect(existsSync(file), `${page}: missing file ${path}`).toBe(true);
        if (anchor && !/^\d/.test(anchor)) {
          const source = readFileSync(file, "utf8");
          expect(source, `${page}: missing anchor ${anchor} in ${path}`).toContain(`// ANCHOR: ${anchor}\n`);
          expect(source, `${page}: missing anchor end ${anchor} in ${path}`).toContain(`// ANCHOR_END: ${anchor}\n`);
        }
      }
    }
    expect(includes).toBeGreaterThan(0);
  });
});
