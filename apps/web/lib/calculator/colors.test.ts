import { describe, it, expect } from "vitest";
import { EQUIPMENT_COLOR_PALETTE, defaultEquipmentColor } from "./colors";

describe("EQUIPMENT_COLOR_PALETTE", () => {
  it("has no duplicate colors", () => {
    expect(new Set(EQUIPMENT_COLOR_PALETTE).size).toBe(EQUIPMENT_COLOR_PALETTE.length);
  });

  it("is entirely lowercase 7-character hex, valid for <input type=\"color\">", () => {
    for (const color of EQUIPMENT_COLOR_PALETTE) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("defaultEquipmentColor", () => {
  it("returns the palette entry at the given index", () => {
    expect(defaultEquipmentColor(0)).toBe(EQUIPMENT_COLOR_PALETTE[0]);
    expect(defaultEquipmentColor(1)).toBe(EQUIPMENT_COLOR_PALETTE[1]);
  });

  it("wraps around once the index reaches or exceeds the palette length", () => {
    expect(defaultEquipmentColor(EQUIPMENT_COLOR_PALETTE.length)).toBe(EQUIPMENT_COLOR_PALETTE[0]);
    expect(defaultEquipmentColor(EQUIPMENT_COLOR_PALETTE.length + 2)).toBe(EQUIPMENT_COLOR_PALETTE[2]);
  });
});
