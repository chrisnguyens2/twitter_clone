import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    afterAuth(auth, req, evt) {
        console.log("middleware running");
    }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};