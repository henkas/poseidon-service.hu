import { defineMiddleware } from "astro:middleware";
import {
  getLocaleCookie,
  localeCookieValue,
  resolveLocaleRequest
} from "./lib/locale-routing";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  const userAgent = context.request.headers.get("user-agent");
  const country = context.request.headers.get("cf-ipcountry");
  const cookieLocale = getLocaleCookie(context.request.headers);
  const { locale, redirectTo } = resolveLocaleRequest({
    pathname,
    country,
    cookieLocale,
    userAgent
  });

  if (redirectTo) {
    return context.redirect(redirectTo, 302);
  }

  const response = await next();

  if (pathname === "/" || pathname === "/en/" || pathname === "/en") {
    response.headers.append("set-cookie", localeCookieValue(locale));
  }

  return response;
});
