import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { FunctionComponent } from "react";

interface ContactLinkProps {
  primaryIcon: IconDefinition;
  secondaryIcon?: IconDefinition;
  href: string;
}

const ContactLink: FunctionComponent<ContactLinkProps> = ({
  primaryIcon,
  secondaryIcon = faArrowUpRightFromSquare,
  href,
}) => {
  return (
    <Link href={href}>
      <div className="shadow-md dark:bg-black dark:text-violet-700 flex justify-center items-center rounded-2xl w-24 h-24 cursor-pointer overflow-hidden relative lg:hover:bg-slate-300 active:bg-slate-300 lg:hover:scale-105 active:scale-105 lg:hover:opacity-75 active:opacity-75 transition-all">
        <div className="w-16 h-16 flex justify-center items-center opacity-100 lg:hover:opacity-0 active:opacity-0 transition-all absolute">
          <FontAwesomeIcon
            className="w-full h-full"
            size="5x"
            icon={primaryIcon}
          />
        </div>
        <div className="w-full h-full flex justify-center items-center opacity-0 bg-slate-300 lg:hover:opacity-100 active:opacity-100 transition-all absolute">
          <FontAwesomeIcon
            size="5x"
            className="w-16 h-16 active:text-violet-700 lg:hover:text-violet-700 transition-all"
            icon={secondaryIcon}
          />
        </div>
      </div>
    </Link>
  );
};

export default ContactLink;
