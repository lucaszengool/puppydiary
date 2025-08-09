import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/create",
    "/gallery",
    "/sign-in",
    "/sign-up",
    "/api/generate",
    "/api/generate-video",
    "/api/uploadthing",
    "/api/webhooks(.*)"
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};