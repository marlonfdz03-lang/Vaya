import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "es"],
  defaultLocale: "es",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|admin|.*\\..*).*)"],
};
