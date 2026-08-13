import { describe, expect, it } from "vitest";
import { cn, formatDateTime, formatUsd } from "@/lib/utils";

describe("formatUsd", () => {
  it("shows zero with two decimals", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("shows six decimals for sub-cent amounts", () => {
    expect(formatUsd(0.000007)).toBe("$0.000007");
    expect(formatUsd(0.005)).toBe("$0.005000");
  });

  it("shows four decimals for cent-and-up amounts", () => {
    expect(formatUsd(0.01)).toBe("$0.0100");
    expect(formatUsd(1.5)).toBe("$1.5000");
  });
});

describe("formatDateTime", () => {
  it("returns a hyphen for null or undefined", () => {
    expect(formatDateTime(null)).toBe("-");
    expect(formatDateTime(undefined)).toBe("-");
  });

  it("formats a valid ISO string without throwing", () => {
    const out = formatDateTime("2026-08-13T12:30:00Z");
    expect(out).not.toBe("-");
    expect(out.length).toBeGreaterThan(0);
  });
});

describe("cn", () => {
  it("resolves conflicting tailwind classes to the last one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
