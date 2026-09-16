import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTags } from "../src/lib/tags.js";

test("normalizes multiple tags and removes case-insensitive duplicates", () => {
  assert.deepEqual(
    normalizeTags([
      { name: "  Push Day  ", color: "blue" },
      { name: "push   day", color: "rose" },
      "Morning",
    ]),
    [
      { name: "Push Day", normalizedName: "push day", color: "blue" },
      { name: "Morning", normalizedName: "morning", color: "emerald" },
    ]
  );
});

test("falls back to an allowed color", () => {
  assert.equal(normalizeTags([{ name: "Heavy", color: "chartreuse" }])[0].color, "emerald");
});

test("rejects more than five unique tags", () => {
  assert.throws(
    () => normalizeTags(["One", "Two", "Three", "Four", "Five", "Six"]),
    /no more than 5 tags/i
  );
});

test("rejects long tag names", () => {
  assert.throws(() => normalizeTags(["x".repeat(25)]), /24 characters or fewer/i);
});
