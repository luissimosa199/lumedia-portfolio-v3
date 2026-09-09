"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { inputClass, primaryButtonClass } from "./styles";

const initialState: LoginState = {};

const LoginForm = () => {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm dark:text-slate-200">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          className={inputClass}
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-red-600 dark:text-red-400 text-sm">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
};

export default LoginForm;
