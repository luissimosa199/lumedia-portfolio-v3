import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";

interface ProjectCardProps {
  name: string;
  subtitle: string;
  image: string;
  url: string;
  slug: string;
  tags: string[];
}

const ProjectCard: FunctionComponent<ProjectCardProps> = ({
  name,
  subtitle,
  image,
  url,
  slug,
  tags,
}) => {
  return (
    <div className="h-fit w-full border-b-2 flex flex-col justify-between mt-4 mb-8">
      <div className="flex items-center gap-2 min-h-max">
        <div className="w-24 h-24 rounded-lg shadow-md">
          <Link href={url}>
            <div className="w-full h-full relative overflow-hidden">
              <Image
                src={image}
                fill
                className="object-contain absolute"
                alt=""
              />
            </div>
          </Link>
        </div>
        <div className="w-4/5">
          <h3 className="font-semibold text-lg mb-2 dark:text-slate-200">
            <Link href={url}>{name}</Link>
          </h3>
          <p className="text-slate-800 dark:text-slate-400">{subtitle}</p>{" "}
          <Link
            href={`/projects/${slug}`}
            className="font-semibold dark:text-slate-200"
          >
            Saber más<span className="leading-6 text-lg ml-2">→</span>
          </Link>
        </div>
      </div>
      <ul className="flex flex-wrap gap-2 py-4">
        {tags.map((e, idx) => {
          return (
            <li
              key={idx}
              className="rounded-full dark:bg-slate-950 dark:text-slate-300 bg-slate-200 text-sm px-4 py-1"
            >
              <span className="capitalize">{e}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectCard;
