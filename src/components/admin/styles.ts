// Shared Tailwind class strings for the admin UI, matching the public site's
// card/input look (see ContactForm.tsx / Button.tsx).
export const cardClass =
  "w-full bg-white dark:bg-violet-950 p-4 sm:p-6 rounded-3xl shadow-md mb-4";

export const inputClass =
  "rounded-lg border border-slate-300 dark:border-slate-700 p-3 w-full bg-slate-100 dark:bg-slate-900 dark:text-slate-100 disabled:opacity-60";

export const labelClass = "flex flex-col gap-1 text-sm dark:text-slate-200";

export const primaryButtonClass =
  "shadow-sm rounded-full bg-violet-700 py-3 px-6 text-white uppercase text-sm font-semibold lg:hover:scale-105 transition-all active:opacity-75 disabled:opacity-60 disabled:hover:scale-100";

export const secondaryButtonClass =
  "rounded-full border border-slate-400 dark:border-slate-600 py-2 px-4 text-sm dark:text-slate-200 lg:hover:border-violet-700 lg:hover:text-violet-700 transition-all disabled:opacity-60";

export const dangerButtonClass =
  "rounded-full border border-red-600 text-red-700 dark:text-red-400 py-2 px-4 text-sm lg:hover:bg-red-600 lg:hover:text-white transition-all disabled:opacity-60";

export const errorTextClass = "text-red-600 dark:text-red-400 text-sm";
