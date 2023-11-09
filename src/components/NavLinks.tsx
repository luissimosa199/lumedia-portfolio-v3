import Link from "next/link";
import React from "react";

const NavLinks = () => {
  return (
    <div className="hidden md:block w-8">
      <ul className="flex gap-4 p-4">
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link
            href="/about"
            className="truncate"
          >
            Sobre mi
          </Link>
        </li>
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link href="/contact">Contacto</Link>
        </li>
        <li className="md:hover:scale-105 dark:text-slate-200 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all">
          <Link href="/projects">Proyectos</Link>
        </li>
      </ul>
    </div>
  );
};

export default NavLinks;
