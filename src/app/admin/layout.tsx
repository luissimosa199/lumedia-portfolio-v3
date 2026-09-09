import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import DarkModeToggle from "@/components/DarkModeToggle";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Lumedia admin",
  robots: { index: false, follow: false },
};

// Always rendered per request: it depends on the session cookie.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAdminAuthenticated();

  return (
    <div className="min-h-screen">
      <header className="w-full flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-violet-950 p-4 rounded-full shadow-md mb-4">
        <Link
          href="/admin"
          className="font-semibold dark:text-slate-200 md:hover:text-violet-700 transition-all"
        >
          Lumedia admin
        </Link>
        <nav className="flex items-center gap-4 text-sm dark:text-slate-200">
          {authenticated ? (
            <>
              <Link href="/admin" className="md:hover:text-violet-700">
                Projects
              </Link>
              <Link href="/" className="md:hover:text-violet-700">
                View site
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="md:hover:text-violet-700 transition-all"
                >
                  Log out
                </button>
              </form>
            </>
          ) : null}
          <DarkModeToggle />
        </nav>
      </header>
      {children}
    </div>
  );
}
