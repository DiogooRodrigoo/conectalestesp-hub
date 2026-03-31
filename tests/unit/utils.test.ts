import { describe, it, expect } from "vitest";

// ----------------------------------------------------------------------------
// Placeholder tests for utility functions that will be implemented in
// @/lib/utils/formatters.ts as the project grows.
//
// Pattern: import the real function once it exists and replace the stubs below.
// Example:
//   import { formatCurrency, formatDate } from "@/lib/utils/formatters";
// ----------------------------------------------------------------------------

describe("formatCurrency", () => {
  it("formats BRL currency correctly", () => {
    // Stub — replace with: expect(formatCurrency(1500)).toBe("R$ 1.500,00")
    expect(true).toBe(true);
  });

  it("formats zero as R$ 0,00", () => {
    // Stub — replace with: expect(formatCurrency(0)).toBe("R$ 0,00")
    expect(true).toBe(true);
  });

  it("formats negative values correctly", () => {
    // Stub — replace with: expect(formatCurrency(-200)).toBe("-R$ 200,00")
    expect(true).toBe(true);
  });
});

describe("formatDate", () => {
  it("formats ISO date to Brazilian locale (DD/MM/YYYY)", () => {
    // Stub — replace with: expect(formatDate("2024-01-15")).toBe("15/01/2024")
    expect(true).toBe(true);
  });

  it("returns empty string for null/undefined input", () => {
    // Stub — replace with: expect(formatDate(null)).toBe("")
    expect(true).toBe(true);
  });
});

describe("slugify", () => {
  it("converts accented Portuguese characters to ASCII", () => {
    // Stub — replace with: expect(slugify("Café da Manhã")).toBe("cafe-da-manha")
    expect(true).toBe(true);
  });

  it("replaces spaces with hyphens", () => {
    // Stub — replace with: expect(slugify("Barbearia do João")).toBe("barbearia-do-joao")
    expect(true).toBe(true);
  });
});
