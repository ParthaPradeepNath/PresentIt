import { createMiddleware } from "@tanstack/react-start";

import { redirect } from "@tanstack/react-router";

import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "#/lib/auth";
import { AUTH_LOGIN_PATH, isLoginPath, isPublicPath } from "#/lib/auth-paths";

// Function level middleware
export const authFnMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) throw redirect({ to: AUTH_LOGIN_PATH });

    return next({
      context: { session },
    });
  }
);

export const authMiddleware = createMiddleware({
  type: "request",
}).server(async ({ request, next }) => {
  const { pathname } = new URL(request.url);
  const headers = getRequestHeaders();

  const session = await auth.api.getSession({ headers });

  if (isLoginPath(pathname)) {
    if (session) throw redirect({ to: "/" });
    return next();
  }

  if (isPublicPath(pathname)) return next();

  if (!session) throw redirect({ to: AUTH_LOGIN_PATH });

  return next({
    context: { session },
  });
});
