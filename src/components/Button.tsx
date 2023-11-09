import Link from "next/link";
import React, { FunctionComponent } from "react";

interface ButtonProps {
  text?: string;
  icon?: string;
  href: string;
}

const Button: FunctionComponent<ButtonProps> = ({
  text = "Saber más",
  icon = "→",
  href,
}) => {
  return (
    <div className="mt-6 mb-4 lg:hover:opacity-75 flex ">
      <Link
        href={href}
        className="shadow-sm rounded-full bg-violet-700 py-4 px-8 text-md text-white uppercase lg:hover:scale-105 transition-all active:opacity-75"
      >
        {text} <span className="leading-6 text-lg ">{icon}</span>
      </Link>
    </div>
  );
};

export default Button;
