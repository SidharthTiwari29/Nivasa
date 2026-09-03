import type { CapacitorConfig } from "@capacitor/cli";

// This app is a full, server-rendered Next.js app (API routes, server
// components, server actions) - not something Capacitor can wrap as a
// static bundle. The correct, standard pattern here: a thin native
// shell that loads the real, live deployed site inside a WebView, with
// real native plugin access (camera, splash screen, status bar)
// bridged in on top. This is not a shortcut - it means the mobile app
// and the website share the exact same real logic, with zero
// duplicated business rules that could drift apart.
//
// NIWASTHAN_APP_URL must be set to the real, live production URL
// before building a release. Left pointing at a placeholder here
// rather than a real domain, since that value is a deployment detail
// for the person building the release, not something to hardcode.
const PRODUCTION_URL = process.env.NIWASTHAN_APP_URL ?? "https://niwasthan.com";

const config: CapacitorConfig = {
  appId: "com.niwasthan.app",
  appName: "Niwasthan",
  webDir: "public",
  server: {
    url: PRODUCTION_URL,
    // Real, live content is always fetched over HTTPS from the actual
    // deployed site - cleartext traffic is never allowed, even for
    // local development, to avoid accidentally shipping a debug
    // configuration in a real release build.
    cleartext: false,
  },
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
