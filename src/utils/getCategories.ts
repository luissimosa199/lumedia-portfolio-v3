"use server";
import dbConnect from "@/lib/dbConnect";
import { ProjectModel } from "@/lib/projectModel";

export async function getCategories() {
  await dbConnect();

  const response = await ProjectModel.distinct("category");

  if (!response) {
    throw new Error("Failed to fetch data");
  }

  return response;
}
