import { createFileRoute, Link, redirect } from "@tanstack/react-router";

import LoginForm from "#/components/auth/login-form";
import { getSession } from "#/lib/auth.functions";
import { IconPresentation } from "@tabler/icons-react";
import { z } from "zod";

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (session) {
      throw redirect({
        to: "/",
        search: { redirect: location.href },
      });
    }
  },
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass space-y-6 rounded-3xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <Link to="/" className="no-underline">
              <div className="bg-primary flex size-14 items-center justify-center rounded-2xl">
                <IconPresentation className="text-primary-foreground size-8" />
              </div>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold">
                Welcome to <span className="text-primary">Present.It</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Sign in to create beautiful presentations
              </p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm redirectTo={redirect} />
        </div>
      </div>
    </div>
  );
}
