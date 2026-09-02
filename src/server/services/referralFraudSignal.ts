export type SignupSignal = {
  ipAddress: string | null;
  userAgent: string | null;
};

export type FraudRiskLevel = "LOW" | "ELEVATED" | "HIGH";

export type FraudRiskAssessment = {
  riskLevel: FraudRiskLevel;
  reasons: string[];
};

// The honest scope of this function, stated plainly: this is NOT true
// device fingerprinting and does NOT detect VPN usage - both would
// require a paid third-party IP-intelligence service this system
// doesn't have. IP address and User-Agent are real but weak signals:
// shared home/office/mobile-carrier IPs produce real false positives,
// and a VPN or incognito window defeats this signal entirely. This is
// why the output is a graduated risk LEVEL for human review, never a
// binary "is fraud" verdict - claiming certainty from a signal this
// weak would be exactly the fabricated confidence this system's own
// discipline exists to prevent.
export function assessReferralFraudRisk(
  referrer: SignupSignal,
  referred: SignupSignal,
): FraudRiskAssessment {
  const reasons: string[] = [];

  const sameIp =
    referrer.ipAddress !== null &&
    referred.ipAddress !== null &&
    referrer.ipAddress === referred.ipAddress;
  const sameUserAgent =
    referrer.userAgent !== null &&
    referred.userAgent !== null &&
    referrer.userAgent === referred.userAgent;

  if (sameIp)
    reasons.push("Referrer and referred account share a signup IP address");
  if (sameUserAgent) {
    reasons.push(
      "Referrer and referred account share an identical signup User-Agent",
    );
  }

  // Both signals matching together is the strongest (still not certain)
  // indicator this could be the same real person operating two accounts
  // - a shared IP alone (e.g. a household) is common and unremarkable on
  // its own, but combined with an identical browser/device string on
  // both signups is a materially stronger, still honest, coincidence to
  // flag for a human to actually look at.
  if (sameIp && sameUserAgent) {
    return { riskLevel: "HIGH", reasons };
  }
  if (sameIp || sameUserAgent) {
    return { riskLevel: "ELEVATED", reasons };
  }
  return { riskLevel: "LOW", reasons: [] };
}
