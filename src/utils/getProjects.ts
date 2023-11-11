"use server";
import dbConnect from "@/lib/dbConnect";
import { Project, ProjectModel } from "@/lib/projectModel";

export async function getProjects() {
  await dbConnect();

  const response = (await ProjectModel.find().lean()) as Project[];

  const serializedResponse = JSON.parse(JSON.stringify(response)).map(
    (e: Project) => ({
      ...e,
      _id: e._id.toString(),
    })
  );

  if (!serializedResponse) {
    throw new Error("Failed to fetch data");
  }

  return serializedResponse;
}
