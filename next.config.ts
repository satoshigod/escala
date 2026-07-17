import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/index.html' },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
};

export default withSentryConfig(nextConfig, {
  org: "plaza-black",
  project: "escala-production",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  telemetry: false,
});
