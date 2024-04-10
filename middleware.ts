import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/clerk", "/api/uploadthing", "/api/clerk"],
  ignoredRoutes: ["/api/webhooks/clerk", "/api/uploadthing", "/api/clerk"],
});

export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
