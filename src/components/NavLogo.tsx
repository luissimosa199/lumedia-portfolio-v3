import Image from "next/image";
import Link from "next/link";
import React from "react";

const NavLogo = () => {
  return (
    <div className="w-10 h-10 dark:border-violet-700 dark:border-2 dark:rounded-full ">
      <Link href="/">
        <Image
          className="cursor-pointer transition-all dark:invert"
          src="/lumedia-logo.png"
          alt="logo"
          width={40}
          height={40}
        />
      </Link>
    </div>
  );
};

export default NavLogo;
