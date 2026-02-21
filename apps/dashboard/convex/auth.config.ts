import { AuthConfig } from "convex/server";

const clerkDomain =
  process.env.CLERK_JWT_ISSUER_DOMAIN ?? process.env.CLERK_FRONTEND_API_URL;

if (!clerkDomain) {
  throw new Error(
    "Missing Clerk issuer domain. Set CLERK_JWT_ISSUER_DOMAIN (or CLERK_FRONTEND_API_URL) in Convex environment variables.",
  );
}

export default {
  providers: [
    {
      domain: clerkDomain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
