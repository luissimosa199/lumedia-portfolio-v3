import React from "react";
import NavButton from "./NavButton";
import DarkModeToggle from "./DarkModeToggle";
import NavLogo from "./NavLogo";
import NavLinks from "./NavLinks";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  return (
    <nav className="w-full flex justify-between items-center bg-white dark:bg-violet-950 dark:text-violet-700 p-4 rounded-full shadow-md mb-4">
      <NavButton />
      <NavLinks />
      <NavLogo />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
