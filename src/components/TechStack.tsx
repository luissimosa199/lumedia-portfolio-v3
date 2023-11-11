import { getTechStack } from "@/utils/getTechStack";
import React from "react";

const TechStack = async () => {
  const data = await getTechStack();
  const techStack = JSON.parse(data) as string[];

  console.log("@TechStackComp>", techStack);

  return (
    <ul className="flex flex-wrap gap-2 py-4">
      {techStack.map((e, idx) => {
        return (
          <li
            key={`${idx}-${e}`}
            className="rounded-full dark:bg-slate-950 dark:text-slate-300 bg-slate-200 text-sm px-4 py-1"
          >
            <span className="capitalize">{e}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default TechStack;
