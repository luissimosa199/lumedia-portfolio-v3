import { Project } from "@/lib/projectTypes";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";
import { getTranslations } from "next-intl/server";

interface ProjectDetailProps extends Omit<Project, "_id"> {}

const ProjectDetail: FunctionComponent<ProjectDetailProps> = async ({
  name,
  subtitle,
  image,
  url,
  tags,
  gallery,
  galleryCaptions,
  repo,
  text,
}) => {
  const t = await getTranslations();

  return (
    <div
      className="h-fit w-full border-b-2 flex flex-col justify-between mt-4 mb-8"
      data-testid="project-detail"
    >
      <div className="flex flex-col items-center sm:flex-row gap-2 min-h-max">
        <div
          className="w-48 h-48 rounded-lg shadow-md"
          data-testid="project-cover"
          data-source={image}
        >
          <Link href={url}>
            <div className="w-full h-full relative overflow-hidden">
              <Image
                src={image}
                fill
                className="object-contain absolute"
                alt={name}
              />
            </div>
          </Link>
        </div>
        <div className="w-full sm:w-4/5 px-4">
          <h1
            className="font-semibold text-4xl mb-2 dark:text-slate-200"
            data-testid="project-title"
          >
            <Link href={url}>{name}</Link>
          </h1>
          <p className="text-slate-800 text-md dark:text-slate-400 mb-4">
            {subtitle}
          </p>{" "}
          <p
            className="text-black text-2xl dark:text-slate-400 mb-4 text-justify"
            data-testid="project-body"
          >
            {text}
          </p>{" "}
        </div>
      </div>
      <div className="text-right flex flex-col my-4">
        <Link href={repo} className="text-2xl dark:text-white font-semibold">
          {t("projects.visitRepository")} <span className="text-2xl">→</span>
        </Link>
        <Link href={url} className="text-2xl dark:text-white font-semibold">
          {t("projects.visitPage")} <span className="text-2xl">→</span>
        </Link>
      </div>
      <h2 className="dark:text-slate-400">{t("projects.developedWith")}</h2>
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
              <figure key={idx}>
                <Image
                  src={e}
                  alt={galleryCaptions?.[idx] || t("common.photoAlt")}
                  width={850}
                  height={850}
                  data-testid="gallery-image"
                  data-source={e}
                />
              </figure>
            );
          })}
      </section>
    </div>
  );
};

export default ProjectDetail;
