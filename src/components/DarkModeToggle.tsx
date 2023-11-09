"use client";
import useDarkMode from "@/hooks/useDarkMode";
import { faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DarkModeToggle = () => {
  const [theme, toggleTheme] = useDarkMode();

  return (
    <button
      onClick={toggleTheme}
      className="border-2 w-8 h-8 border-black dark:border-violet-700 rounded-full flex justify-center items-center cursor-pointer  md:hover:scale-105 md:hover:opacity-75 md:hover:text-violet-700 md:hover:border-violet-700 active:border-violet-700 active:text-violet-700 active:opacity-75 active:scale-105 transition-all"
    >
      <FontAwesomeIcon icon={faMoon} />
    </button>
  );
};

export default DarkModeToggle;
