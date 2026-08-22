import { describe, expect, it } from "vitest";
import { assertAdminRole, assertSuperAdminRole } from "./authorization";

describe("admin authorization", () => {
  it("allows administrators and super administrators", () => {
    expect(() => assertAdminRole("ADMIN")).not.toThrow();
    expect(() => assertAdminRole("SUPER_ADMIN")).not.toThrow();
  });

  it("rejects ordinary users and designers", () => {
    expect(() => assertAdminRole("USER")).toThrow(
      "Administrator access required",
    );
    expect(() => assertAdminRole("DESIGNER")).toThrow(
      "Administrator access required",
    );
  });

  it("restricts super-admin operations to SUPER_ADMIN", () => {
    expect(() => assertSuperAdminRole("SUPER_ADMIN")).not.toThrow();
    expect(() => assertSuperAdminRole("ADMIN")).toThrow(
      "Super administrator access required",
    );
    expect(() => assertSuperAdminRole("USER")).toThrow(
      "Super administrator access required",
    );
  });
});
