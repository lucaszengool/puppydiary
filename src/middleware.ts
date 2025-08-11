import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/create",
    "/gallery",
    "/share/(.*)",
    "/sign-in",
    "/sign-up",
    "/public-mockup-test",
    "/fabric-mockup-test",
    "/clothing-test",
    "/secret-orders-dashboard",
    "/api/generate",
    "/api/generate-video",
    "/api/uploadthing",
    "/api/webhooks(.*)",
    "/api/share",
    "/api/secret-orders",
    "/api/preorder",
    "/api/enhanced-preorder",
    "/api/test",
    "/api/test-db",
    "/api/test-order",
    "/test-order"
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};