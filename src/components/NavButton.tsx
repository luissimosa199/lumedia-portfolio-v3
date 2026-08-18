"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaBars } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavButton = () => {
  const [menuVisibility, setMenuVisibility] = useState<boolean>(false);
  const navButtonRef = useRef<HTMLDivElement | null>(null);
  const pathName = usePathname();

  // Close the menu when the route changes. Adjusting state during render
  // (rather than in an effect) avoids an extra commit-then-cascading-render
  // pass: https://react.dev/learn/you-might-not-need-an-effect
  const [prevPathName, setPrevPathName] = useState(pathName);
  if (pathName !== prevPathName) {
    setPrevPathName(pathName);
    setMenuVisibility(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navButtonRef.current &&
        !navButtonRef.current.contains(event.target as Node)
      ) {
        setMenuVisibility(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={navButtonRef}
      className="relative md:hidden"
    >
      <button
        className="w-8 h-8 cursor-pointer md:hover:scale-105 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all"
        onClick={() => {
          setMenuVisibility(!menuVisibility);
        }}
      >
        <FaBars
          className="w-full h-full"
        />
      </button>
      {menuVisibility && (
        <ul className="absolute z-20 text-4xl flex flex-col gap-4 rounded-lg shadow-lg bg-white dark:bg-black dark:text-slate-200 p-4">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/about">Sobre mi</Link>
          </li>
          <li>
            <Link href="/contact">Contacto</Link>
          </li>
          <li>
            <Link href="/projects">Proyectos</Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default NavButton;
