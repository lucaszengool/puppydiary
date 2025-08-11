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
    "/api/generate",
    "/api/generate-video",
    "/api/uploadthing",
    "/api/webhooks(.*)",
    "/api/share"
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};