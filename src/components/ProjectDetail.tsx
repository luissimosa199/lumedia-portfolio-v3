import { Project } from "@/lib/projectModel";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";

interface ProjectDetailProps extends Omit<Project, "_id"> {}

const ProjectDetail: FunctionComponent<ProjectDetailProps> = ({
  name,
  subtitle,
  image,
  url,
  slug,
  tags,
  gallery,
  repo,
  text,
  category,
}) => {
  return (
    <div className="h-fit w-full border-b-2 flex flex-col justify-between mt-4 mb-8">
      <div className="flex  gap-2 min-h-max">
        <div className="w-48 h-48 rounded-lg shadow-md">
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
        <div className="w-4/5 px-4">
          <h3 className="font-semibold text-4xl mb-2 dark:text-slate-200">
            <Link href={url}>{name}</Link>
          </h3>
          <p className="text-slate-800 text-md dark:text-slate-400 mb-4">
            {subtitle}
          </p>{" "}
          <p className="text-black text-2xl dark:text-slate-400 mb-4 text-justify">
            {text}
          </p>{" "}
        </div>
      </div>
      <div className="text-right flex flex-col">
        <Link
          href={repo}
          className="text-2xl italic dark:text-white font-semibold"
        >
          Visitar repositorio <span className="text-2xl">→</span>
        </Link>
        <Link
          href={url}
          className="text-2xl italic dark:text-white font-semibold"
        >
          Visitar Página <span className="text-2xl">→</span>
        </Link>
      </div>
      <h2 className="dark:text-slate-400">Desarrollado con:</h2>
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

      <section>
        {gallery &&
          gallery.length > 0 &&
          gallery.map((e: string, idx: number) => {
            return (
              <div key={idx}>
                <Image
                  src={e}
                  alt="foto"
                  width={850}
                  height={850}
                />
              </div>
            );
          })}
      </section>
    </div>
  );
};

export default ProjectDetail;
