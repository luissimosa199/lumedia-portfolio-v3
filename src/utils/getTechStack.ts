import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export async function getTechStack() {
  await dbConnect();

  const tags = await ProjectModel.distinct("tags");

  const serializedTags = JSON.stringify(tags);

  if (!serializedTags) {
    throw new Error("Failed to fetch tags");
  }

  return serializedTags;
}
