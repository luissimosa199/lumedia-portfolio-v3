import { isAdminConfigured } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="w-full max-w-md mx-auto bg-white dark:bg-violet-950 p-8 rounded-3xl shadow-md">
      <h1 className="text-slate-500 text-sm">Admin</h1>
      <h2 className="text-2xl font-semibold my-4 dark:text-slate-200">
        Sign in
      </h2>
      {isAdminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="dark:text-slate-300">
          Set <code>ADMIN_PASSWORD_HASH</code> (run{" "}
          <code>npm run admin:hash-password</code>) or <code>ADMIN_PASSWORD</code>{" "}
          in the environment to enable the admin panel.
        </p>
      )}
    </main>
  );
}
