import { describe, expect, it } from "vitest";
import { assessReferralFraudRisk } from "./referralFraudSignal";

describe("assessReferralFraudRisk", () => {
  it("is LOW risk when neither signal matches at all", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: "1.1.1.1", userAgent: "Chrome/A" },
      { ipAddress: "2.2.2.2", userAgent: "Firefox/B" },
    );
    expect(result.riskLevel).toBe("LOW");
    expect(result.reasons).toEqual([]);
  });

  it("is ELEVATED, not HIGH, when only the IP matches - a shared household/office IP is common and unremarkable alone", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: "1.1.1.1", userAgent: "Chrome/A" },
      { ipAddress: "1.1.1.1", userAgent: "Firefox/B" },
    );
    expect(result.riskLevel).toBe("ELEVATED");
  });

  it("is ELEVATED, not HIGH, when only the User-Agent matches", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: "1.1.1.1", userAgent: "Chrome/A" },
      { ipAddress: "2.2.2.2", userAgent: "Chrome/A" },
    );
    expect(result.riskLevel).toBe("ELEVATED");
  });

  it("is HIGH only when both signals match together - the stronger, still-honest combined signal", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: "1.1.1.1", userAgent: "Chrome/A" },
      { ipAddress: "1.1.1.1", userAgent: "Chrome/A" },
    );
    expect(result.riskLevel).toBe("HIGH");
    expect(result.reasons).toHaveLength(2);
  });

  it("never claims a match when either signal is null - missing data is not evidence of anything", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: null, userAgent: "Chrome/A" },
      { ipAddress: null, userAgent: "Chrome/A" },
    );
    // Both ipAddress values are null, but null !== null is deliberately
    // treated as "not a real match" here - two unknowns are not evidence
    // of a real, observed coincidence, unlike two matching real values.
    expect(result.riskLevel).toBe("ELEVATED"); // only userAgent genuinely matched
  });

  it("is LOW when both signals are entirely unknown on both sides", () => {
    const result = assessReferralFraudRisk(
      { ipAddress: null, userAgent: null },
      { ipAddress: null, userAgent: null },
    );
    expect(result.riskLevel).toBe("LOW");
  });
});
